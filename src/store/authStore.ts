import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import { posthog } from '../config/posthog';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSubscribed: boolean;
  isDemoUser: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSubscribed: (subscribed: boolean) => void;
  setDemoUser: () => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isSubscribed: false,
  isDemoUser: false,

  setUser: (user) => set({ user }),

  setSession: (session) => set({ session }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setIsSubscribed: (subscribed) => set({ isSubscribed: subscribed }),

  setDemoUser: () => {
    const demoUser = {
      id: 'demo-reviewer-user',
      email: 'demo@kinderwell.app',
      app_metadata: {},
      user_metadata: { full_name: 'Demo Reviewer' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;

    if (__DEV__) console.log('🎭 Demo mode activated!');
    set({
      user: demoUser,
      session: null,
      isSubscribed: true,
      isDemoUser: true,
    });
  },

  signOut: async () => {
    try {
      await supabaseSignOut();
      set({ user: null, session: null, isSubscribed: false, isDemoUser: false });
    } catch (error) {
      if (__DEV__) console.error('Error signing out:', error);
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        if (__DEV__) console.error('Error getting session:', error);
        set({ isLoading: false });
        return;
      }

      if (session) {
        set({
          user: session.user,
          session: session,
          isLoading: false
        });
        posthog.identify(session.user.id, {
          $set: { email: session.user.email ?? null },
        } as Record<string, unknown> as never);
      } else {
        set({ isLoading: false });
      }

      // Listen for auth changes. onAuthStateChange returns a subscription we
      // intentionally do not surface — cleanup is handled implicitly when the
      // app exits. Return void to match the store's initialize() signature.
      supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (__DEV__) console.log('Auth state changed:', event, session?.user?.email);

          if (session) {
            set({
              user: session.user,
              session: session
            });
          } else {
            set({
              user: null,
              session: null,
              isSubscribed: false,
              isDemoUser: false
            });
          }
        }
      );

    } catch (error) {
      if (__DEV__) console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },
}));
