// SPEC-20 R6 (added in Phase 6) — Google and Apple sign-in, the auth paths
// the screen tests stub out. The native sheets are faked at the SDK boundary
// (expo-web-browser, expo-auth-session, expo-apple-authentication,
// expo-crypto); the logic between them and Supabase runs for real.
//
//  - Google: the OAuth redirect carries either a PKCE code or tokens in the
//    fragment; anything else is an error, and a cancelled sheet is not.
//  - Apple: Apple gets the HASHED nonce and Supabase the RAW one. Supabase
//    hashes the raw nonce and checks it against the token Apple signed — the
//    replay protection. Swapping them breaks every Apple sign-in; sending the
//    same value to both throws the protection away.

import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { signInWithApple, signInWithGoogle } from '../authService';
import { resetSupabaseFake, supabase } from '../../test/supabase';
import { makeSession, makeUser } from '../../test/factories';

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'kinderwell://auth/callback'),
}));
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));
// A readable stand-in for SHA-256, so the test can see which value went where.
jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((_algorithm: string, data: string) => Promise.resolve(`sha256(${data})`)),
  randomUUID: jest.fn(() => 'uuid'),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { HEX: 'hex' },
}));

const session = makeSession(makeUser('user-a'));
const openAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;
const appleAvailable = AppleAuthentication.isAvailableAsync as jest.Mock;
const appleSignIn = AppleAuthentication.signInAsync as jest.Mock;

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetSupabaseFake();
  openAuthSession.mockReset();
  appleAvailable.mockReset().mockResolvedValue(true);
  appleSignIn.mockReset();
  supabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://auth.example/authorize' }, error: null });
});

afterEach(() => jest.restoreAllMocks());

describe('signInWithGoogle', () => {
  it('asks Supabase for the OAuth URL with the app redirect, and opens it in an auth session', async () => {
    openAuthSession.mockResolvedValue({ type: 'cancel' });
    await signInWithGoogle();
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'kinderwell://auth/callback', skipBrowserRedirect: true },
    });
    expect(openAuthSession).toHaveBeenCalledWith(
      'https://auth.example/authorize',
      'kinderwell://auth/callback',
      { showInRecents: true },
    );
  });

  it('a PKCE code in the redirect → exchanged for the session', async () => {
    openAuthSession.mockResolvedValue({ type: 'success', url: 'kinderwell://auth/callback?code=abc123' });
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ data: { session }, error: null });
    await expect(signInWithGoogle()).resolves.toBe(session);
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc123');
  });

  it('tokens in the redirect fragment → set as the session', async () => {
    openAuthSession.mockResolvedValue({
      type: 'success',
      url: 'kinderwell://auth/callback#access_token=at&refresh_token=rt',
    });
    supabase.auth.setSession.mockResolvedValue({ data: { session }, error: null });
    await expect(signInWithGoogle()).resolves.toBe(session);
    expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'at', refresh_token: 'rt' });
  });

  it('a redirect with neither → an error, not a silent null', async () => {
    openAuthSession.mockResolvedValue({ type: 'success', url: 'kinderwell://auth/callback' });
    await expect(signInWithGoogle()).rejects.toThrow('No authorization code or tokens');
  });

  it('the code exchange fails → the error is thrown', async () => {
    openAuthSession.mockResolvedValue({ type: 'success', url: 'kinderwell://auth/callback?code=abc123' });
    supabase.auth.exchangeCodeForSession.mockResolvedValue({ data: { session: null }, error: new Error('bad code') });
    await expect(signInWithGoogle()).rejects.toThrow('bad code');
  });

  it.each(['cancel', 'dismiss'])('the sheet is closed (%s) → null, not an error', async (type) => {
    openAuthSession.mockResolvedValue({ type });
    await expect(signInWithGoogle()).resolves.toBeNull();
  });

  it('Supabase returns no URL → an error', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: null }, error: null });
    await expect(signInWithGoogle()).rejects.toThrow('No URL returned');
    expect(openAuthSession).not.toHaveBeenCalled();
  });
});

describe('signInWithApple', () => {
  it('Apple gets the hashed nonce; Supabase gets the raw one (replay protection)', async () => {
    appleSignIn.mockResolvedValue({ identityToken: 'apple.jwt' });
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: { session }, error: null });

    await expect(signInWithApple()).resolves.toBe(session);

    const sentToApple = appleSignIn.mock.calls[0][0].nonce as string;
    const sentToSupabase = supabase.auth.signInWithIdToken.mock.calls[0][0];
    expect(sentToSupabase).toEqual({ provider: 'apple', token: 'apple.jwt', nonce: expect.any(String) });
    expect(sentToApple).toBe(`sha256(${sentToSupabase.nonce})`);
    expect(sentToApple).not.toBe(sentToSupabase.nonce);
  });

  it('asks Apple for the name and email', async () => {
    appleSignIn.mockResolvedValue({ identityToken: 'apple.jwt' });
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: { session }, error: null });
    await signInWithApple();
    expect(appleSignIn.mock.calls[0][0].requestedScopes).toEqual([0, 1]);
  });

  it('the user cancels the sheet → null, not an error', async () => {
    appleSignIn.mockRejectedValue(Object.assign(new Error('canceled'), { code: 'ERR_REQUEST_CANCELED' }));
    await expect(signInWithApple()).resolves.toBeNull();
  });

  it('no identity token → an error, and Supabase is never called', async () => {
    appleSignIn.mockResolvedValue({ identityToken: null });
    await expect(signInWithApple()).rejects.toThrow('No identity token');
    expect(supabase.auth.signInWithIdToken).not.toHaveBeenCalled();
  });

  it('Supabase rejects the token → the error is thrown', async () => {
    appleSignIn.mockResolvedValue({ identityToken: 'apple.jwt' });
    supabase.auth.signInWithIdToken.mockResolvedValue({ data: { session: null }, error: new Error('invalid nonce') });
    await expect(signInWithApple()).rejects.toThrow('invalid nonce');
  });

  it('Apple sign-in unavailable on the device → a clear error', async () => {
    appleAvailable.mockResolvedValue(false);
    await expect(signInWithApple()).rejects.toThrow('not available on this device');
    expect(appleSignIn).not.toHaveBeenCalled();
  });
});
