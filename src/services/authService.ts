import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';
import { reportError } from '../config/sentry';

// Required for web browser authentication
WebBrowser.maybeCompleteAuthSession();

/**
 * Google Sign-In
 * Using Expo's authentication proxy for better mobile support
 */
export const signInWithGoogle = async () => {
  try {
    // Use the app's custom scheme for development builds
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: 'kinderwell',
      path: 'auth/callback',
    });

    if (__DEV__) console.log('Redirect URL:', redirectUrl);

    // Start the OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No URL returned from Supabase');

    if (__DEV__) console.log('Opening auth URL...');

    // Open the OAuth URL in the browser
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      { showInRecents: true }
    );

    if (__DEV__) console.log('Auth session result type:', result.type);

    if (result.type === 'success') {
      const { url } = result;
      if (__DEV__) console.log('Success! Got redirect URL:', url);

      // Parse the URL to check for tokens or code
      const urlObj = new URL(url);

      // Check for authorization code (PKCE flow)
      const code = urlObj.searchParams.get('code');

      // Check for tokens in hash (implicit flow)
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (code) {
        if (__DEV__) console.log('Found authorization code, exchanging for session...');
        // Exchange the code for a session (PKCE flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
          if (__DEV__) console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (__DEV__) console.log('Session created successfully!');
        return sessionData?.session || null;
      } else if (accessToken) {
        if (__DEV__) console.log('Found tokens in URL, setting session...');
        // Tokens were returned directly (implicit flow)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

        if (sessionError) {
          if (__DEV__) console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (__DEV__) console.log('Session created successfully!');
        return sessionData?.session || null;
      } else {
        if (__DEV__) console.error('No code or tokens found in URL');
        throw new Error('No authorization code or tokens found in redirect URL');
      }
    } else if (result.type === 'cancel') {
      if (__DEV__) console.log('User cancelled');
      return null;
    }

    return null;
  } catch (error) {
    if (__DEV__) console.error('Error in signInWithGoogle:', error);
    throw error;
  }
};

/**
 * Generate a raw nonce + its SHA-256 hex for Apple Sign In replay protection.
 * See: https://supabase.com/docs/guides/auth/social-login/auth-apple
 *
 * - The SHA-256 is passed to AppleAuthentication.signInAsync so Apple embeds
 *   the hash inside the signed ID token.
 * - The raw nonce is passed to Supabase's signInWithIdToken, which re-hashes
 *   it internally and compares to what the token carries.
 * - If someone intercepts the ID token, they can't reuse it — they don't have
 *   the raw nonce.
 */
async function generateAppleNonce(): Promise<{ raw: string; hashed: string }> {
  const raw = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    // Use randomUUID + timestamp so nonce is unique per attempt.
    `${Crypto.randomUUID()}${Date.now()}`,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  return { raw, hashed };
}

/**
 * Apple Sign-In
 */
export const signInWithApple = async () => {
  try {
    // Check if Apple Sign-In is available on this device
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    // Generate nonce for replay hardening — see generateAppleNonce comments.
    const { raw: rawNonce, hashed: hashedNonce } = await generateAppleNonce();

    // Request Apple authentication. Apple embeds the hashed nonce in the
    // signed identity token so we can verify no one is replaying it.
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    // Verify we received an identity token
    if (!credential.identityToken) {
      throw new Error('Apple Sign-In failed: No identity token received');
    }

    // Sign in to Supabase — pass the RAW nonce; Supabase hashes it internally
    // to compare against what's in the token.
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    // Save the user's name to user_profiles.
    //
    // ⚠️ CRITICAL: Apple only provides fullName / email on the FIRST
    // authorization ever for a given (Apple ID, app) pair. If we fail this
    // upsert silently, the name is gone forever — the user could uninstall,
    // reinstall, re-authorize a hundred times, and Apple would never send
    // the name again.
    //
    // We write to the `name` column (the one that actually exists in
    // user_profiles). Previous code wrote to `full_name` and `email`, neither
    // of which exists → silent failure → every new Apple user lost their name.
    if (data.user && credential.fullName) {
      const fullName = [
        credential.fullName.givenName,
        credential.fullName.familyName,
      ]
        .filter(Boolean)
        .join(' ')
        .trim();

      if (fullName) {
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert(
            { id: data.user.id, name: fullName },
            { onConflict: 'id' },
          );

        if (upsertError) {
          // Do NOT throw — the user is signed in successfully at this point.
          // Losing the name is a soft failure. Log to Sentry so we notice
          // if it happens systematically.
          if (__DEV__) console.error('[Apple SignIn] Failed to save name:', upsertError);
          reportError(upsertError, {
            source: 'signInWithApple',
            step: 'save_name',
            user_id: data.user.id,
          });
        }
      }
    }

    return data.session;
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User cancelled the sign-in
      if (__DEV__) console.log('User cancelled Apple Sign-In');
      return null;
    }
    if (__DEV__) console.error('Error signing in with Apple:', error);
    throw error;
  }
};

/**
 * Check if user has an active session
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    if (__DEV__) console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    if (__DEV__) console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Delete user account and all associated data
 * This calls a Supabase Edge Function that uses the service role key
 * to completely delete the user account (GDPR/CCPA compliant)
 */
export const deleteAccount = async () => {
  try {
    // Force a session refresh before invoking. Historically we passed
    // `Authorization: Bearer ${session.access_token}` manually, which used the
    // CACHED access token from getSession() — if it had expired (default 1 h),
    // Supabase's Edge Function JWT verify layer would reject the request with
    // a 401 BEFORE the function ran, so no server-side logs appeared. Refresh
    // first so the Supabase client's internal Authorization header carries a
    // fresh token, and then let functions.invoke() attach it automatically —
    // don't override the header.
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !refreshData.session) {
      const err = new Error(`Session refresh failed: ${refreshError?.message ?? 'no session'}`);
      reportError(err, { context: 'delete_account_refresh' });
      throw err;
    }

    const { data, error } = await supabase.functions.invoke('delete-account');

    if (error) {
      if (__DEV__) console.error('Edge Function error:', error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'delete_account_invoke',
      });
      throw error;
    }

    if (__DEV__) console.log('Account deletion response:', data);

    // Sign out locally (auth user is already deleted on the server)
    await signOut();
  } catch (error) {
    if (__DEV__) console.error('Error deleting account:', error);
    // Reported above at the site of the specific failure; re-throw so
    // SettingsScreen can show the user-facing alert.
    throw error;
  }
};
