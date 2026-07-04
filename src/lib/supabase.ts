import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Structural guards on the bundle-ID ↔ Supabase project pairing. Every store
// build must talk to prod Supabase, every dev build must talk to dev Supabase,
// and any mismatch throws hard at startup rather than silently corrupting data.
//
// Two failure modes we're catching (Fable review 🟡 first item):
//
//   Dev build → prod DB: someone ran `expo start` with .env.prod loaded
//     accidentally. We'd write test users into the revenue DB. Existing
//     guard.
//
//   Prod build → dev DB (NEW): someone shipped an App Store binary whose
//     eas.json production profile got typo'd to point at the dev Supabase.
//     Real users of the store build would write into the dev DB, invisible
//     to us on prod dashboards, and their data would never be seen by
//     support. Silent revenue drain + support nightmare.
//
// The check runs on both by comparing the runtime bundle ID to the runtime
// Supabase project ref. Bundle ID is baked at build time (managed workflow,
// via IOS_BUNDLE_ID env in eas.json → app.config.js), so a mismatch here
// means eas.json's SUPABASE_URL and IOS_BUNDLE_ID got out of sync.

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const isProdRef = projectRef === 'zqwzdyjfxytvedghujsd';
const isDevRef = projectRef === 'xbkkjqvbsnroenqlqkmi';

const bundleId = (
  Constants.expoConfig?.ios?.bundleIdentifier
  ?? Constants.expoConfig?.android?.package
  ?? ''
);
const isProdBundle = bundleId === 'com.kinderwell.app';
const isDevBundle = bundleId === 'com.kinderwell.app.dev';

// Guard 1: DEV BUILD → PROD DB (already existed, kept)
//
// Note: the ALLOW_DEV_PROD_ACCESS env var escape hatch was removed here
// (Fable review 🟡 item — was documented in DEV_PROD_ENVIRONMENTS.md but
// only worked in dev mode because store builds strip non-EXPO_PUBLIC_
// env vars). Its existence invited hacking around the guard rather than
// fixing the mis-configured .env. If someone genuinely needs a __DEV__
// build to talk to prod (rare, e.g. reproducing a prod bug), they now
// must comment out this throw locally — much more visible in a
// PR / commit history than setting an env var.
if (__DEV__ && isProdRef) {
  throw new Error(
    '[Supabase] REFUSING to connect to PROD from a __DEV__ build.\n' +
      'This almost certainly means your `.env` was overwritten with prod values.\n' +
      'Fix: `cp .env.prod .env.dev.bak && cp .env.example .env` (then fill in dev creds), or copy back from git.',
  );
}

// Guard 2: STORE BUILD → WRONG DB (new — the reverse misconfiguration)
if (!__DEV__) {
  // In a store binary. Bundle ID and project ref MUST agree.
  if (isProdBundle && !isProdRef) {
    throw new Error(
      `[Supabase] Store bundle (com.kinderwell.app) is pointed at project ${projectRef ?? 'UNKNOWN'}, not prod.\n` +
      'This build was shipped with a misconfigured eas.json production profile — SUPABASE_URL and IOS_BUNDLE_ID must both be prod.\n' +
      'This binary cannot serve users safely. Ship a corrected build.',
    );
  }
  if (isDevBundle && !isDevRef) {
    throw new Error(
      `[Supabase] Dev bundle (com.kinderwell.app.dev) is pointed at project ${projectRef ?? 'UNKNOWN'}, not dev.\n` +
      'The eas.json development/preview profile has drifted — SUPABASE_URL and IOS_BUNDLE_ID must both be dev.\n' +
      'Rebuild after fixing eas.json.',
    );
  }
}

if (__DEV__) {
  const env = isDevRef ? 'DEV ✅' : 'UNKNOWN';
  console.log(`[Supabase] Env: ${env} | Project: ${projectRef} | Bundle: ${bundleId}`);
}

// Initialize Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage to persist sessions across app restarts
    storage: AsyncStorage,
    // Automatically refresh tokens
    autoRefreshToken: true,
    // Persist session in async storage
    persistSession: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
    // PKCE flow instead of the default implicit flow (Fable review 🟡).
    //
    // With implicit flow, live session tokens land in the OAuth redirect
    // URL fragment (kinderwell://auth/callback#access_token=...). Any
    // Android app that also registers the `kinderwell://` scheme can
    // intercept that redirect and steal the access + refresh token — full
    // account takeover. iOS Universal Links help but the app scheme
    // fallback still exists.
    //
    // PKCE keeps the tokens out of the URL: the redirect carries only a
    // code, which the SDK exchanges for tokens via the Supabase auth
    // server using a device-private secret. The intercepting app gets
    // a code it can't redeem.
    //
    // Mandatory before any Android release. Adopted early because it's
    // one line and there's no downside on iOS (Apple's Universal Links
    // + iOS's scheme-claim behavior make the practical risk lower, but
    // the PKCE flow is still safer + the SDK handles the exchange
    // transparently).
    flowType: 'pkce',
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
