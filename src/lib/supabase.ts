import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Structural guard: a __DEV__ build should never talk to prod Supabase. If it
// does, we probably ran `expo start` with the wrong .env file loaded and are
// about to wreck real user data.
//
// The console-log-only warning we used to have is easy to miss in Metro's
// output. Throwing makes the mistake impossible to ignore.
//
// Escape hatch: set ALLOW_DEV_PROD_ACCESS=true in the environment when you
// really do need dev code pointing at prod (rare — e.g., reproducing a prod
// bug locally). We still log a loud warning.
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const isProdRef = projectRef === 'zqwzdyjfxytvedghujsd';
const isDevRef = projectRef === 'xbkkjqvbsnroenqlqkmi';
const allowOverride = process.env.ALLOW_DEV_PROD_ACCESS === 'true';

if (__DEV__ && isProdRef && !allowOverride) {
  throw new Error(
    '[Supabase] REFUSING to connect to PROD from a __DEV__ build.\n' +
      'This almost certainly means your `.env` was overwritten with prod values.\n' +
      'Fix: `cp .env.prod .env.dev.bak && cp .env.example .env` (then fill in dev creds), or copy back from git.\n' +
      'To bypass ONCE for debugging: `ALLOW_DEV_PROD_ACCESS=true npx expo start`',
  );
}

if (__DEV__) {
  const env = isProdRef ? 'PROD ⚠️ (OVERRIDE ACTIVE)' : isDevRef ? 'DEV ✅' : 'UNKNOWN';
  console.log(`[Supabase] Env: ${env} | Project: ${projectRef}`);
  if (isProdRef && allowOverride) {
    console.warn('[Supabase] Dev build is talking to PROD because ALLOW_DEV_PROD_ACCESS=true. Any write is a live user impact.');
  }
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
