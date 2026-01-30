import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Initialize Supabase client with AsyncStorage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
