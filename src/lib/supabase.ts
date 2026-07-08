import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { projectRef, isProd as isProdRef, isDev as isDevRef } from './env';
import type { Database } from '../types/supabase';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Structural guards on the Supabase project pairing. The load-bearing
// signal for "which environment am I?" is the Supabase project ref
// (parsed from SUPABASE_URL). Bundle ID used to also be part of the
// signal — dev/preview builds used `com.kinderwell.app.dev` and the
// guards cross-checked bundle ↔ project ref. That split was reverted
// on 2026-07-05 because it prevented StoreKit product resolution in
// dev builds (ASC only has the prod bundle registered). All three EAS
// profiles now use `com.kinderwell.app`; environment separation is
// driven entirely by SUPABASE_URL. See docs/DEV_PROD_ENVIRONMENTS.md →
// "Bundle ID collapse" for the full history.
//
// The single failure mode we're still catching (Fable review 🟡 first
// item):
//
//   __DEV__ build → prod DB: someone ran `expo start` with .env.prod
//     loaded accidentally. We'd write test users into the revenue DB.
//     Still guarded below.
//
// The reverse (prod build → dev DB) is caught earlier at build time in
// app.config.js — the production EAS build refuses to compile if
// SUPABASE_URL doesn't include the prod project ref. That guard is
// build-time and hard-fails the entire pipeline before the binary
// exists, which is stronger than the runtime bundle-vs-ref check ever
// was.
//
// projectRef, isProdRef, isDevRef come from ./env — single source of
// truth (Fable review 🟡, previously duplicated in supabase.ts /
// posthog.ts / sentry.ts).

const bundleId = (
  Constants.expoConfig?.ios?.bundleIdentifier
  ?? Constants.expoConfig?.android?.package
  ?? ''
);

// Guard: DEV BUILD → PROD DB
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

if (__DEV__) {
  const env = isDevRef ? 'DEV ✅' : 'UNKNOWN';
  console.log(`[Supabase] Env: ${env} | Project: ${projectRef} | Bundle: ${bundleId}`);
}

// Initialize Supabase client with AsyncStorage for session persistence.
// Database generic wires the schema-generated types (src/types/supabase.ts)
// into every query — .from('user_profiles').update({ foo }) will error at
// compile time if foo isn't a real column. Regenerate via `npm run
// gen:supabase-types` after any schema change.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
