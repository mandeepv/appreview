import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import { posthog } from '../config/posthog';
import { STORAGE_KEYS } from '../constants/storageKeys';

// isSubscribed persists to disk so we don't paywall a paying user on every
// cold launch while waiting for Superwall's onSubscriptionStatusChange to
// fire. Superwall's event is authoritative — this cached value gets
// overwritten as soon as Superwall reports ACTIVE or INACTIVE.
const IS_SUBSCRIBED_STORAGE_KEY = STORAGE_KEYS.IS_SUBSCRIBED;

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  // isSubscribed is the device-local cached mirror of Superwall's last
  // reported subscription status. Set via setIsSubscribed(), which:
  //   1. Updates the in-memory store immediately (UI updates instantly)
  //   2. Persists to AsyncStorage (survives cold launch)
  //
  // Used for BOTH UI display (hide "Subscribe" button in Settings when
  // active) AND the hard-paywall entry gate in LoadingScreen — an
  // isSubscribed === true skips the paywall.
  //
  // Trust model: this flag is only flipped by Superwall's
  // onSubscriptionStatusChange listener in App.tsx (or by a
  // just-completed purchase from LoadingScreen's paywall). It's a
  // device-local memory of a Superwall-vouched fact, not an
  // independent claim. If a subscription lapses, Superwall's next
  // event will set it back to false and the next launch will
  // paywall correctly.
  //
  // See docs/PAYWALL_MODEL.md for the full policy.
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

  setIsSubscribed: (subscribed) => {
    set({ isSubscribed: subscribed });
    // Persist to disk so cold launches don't paywall paying users while
    // waiting for Superwall's onSubscriptionStatusChange to fire.
    // Fire-and-forget; a write failure just means the next launch may
    // briefly hit the paywall before Superwall confirms — recoverable.
    AsyncStorage.setItem(IS_SUBSCRIBED_STORAGE_KEY, subscribed ? 'true' : 'false').catch((err) => {
      if (__DEV__) console.warn('[authStore] failed to persist isSubscribed:', err);
    });
  },

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
      // Clear the persisted subscription flag on sign-out. Otherwise
      // signing out and signing back in with a different (non-paying)
      // Google/Apple ID would inherit the previous user's subscription
      // status until Superwall's next event.
      try {
        await AsyncStorage.removeItem(IS_SUBSCRIBED_STORAGE_KEY);
      } catch (err) {
        if (__DEV__) console.warn('[authStore] failed to clear isSubscribed on signOut:', err);
      }
      set({
        user: null,
        session: null,
        isSubscribed: false,
        isDemoUser: false,
      });
    } catch (error) {
      if (__DEV__) console.error('Error signing out:', error);
      throw error;
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Hydrate persisted isSubscribed from disk. Superwall's
      // onSubscriptionStatusChange listener in App.tsx will overwrite
      // this as soon as it fires (typically within a few seconds of
      // launch), but the hydrated value is what LoadingScreen sees on
      // the initial render — critical for skipping the paywall for
      // paying users during Superwall's warm-up window.
      try {
        const cached = await AsyncStorage.getItem(IS_SUBSCRIBED_STORAGE_KEY);
        if (cached === 'true') {
          set({ isSubscribed: true });
          if (__DEV__) console.log('[authStore] hydrated isSubscribed=true from disk');
        }
      } catch (err) {
        // Non-fatal — falls through with isSubscribed: false (default).
        // Worst case: a paying user briefly sees the paywall on this
        // one launch before Superwall confirms.
        if (__DEV__) console.warn('[authStore] failed to hydrate isSubscribed:', err);
      }

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
        // Associate the PostHog session with the Supabase user ID so
        // events on this launch aggregate under the correct person.
        // No $set — person properties were already written at signup
        // via identifyUserWithOnboarding, and re-attaching email on
        // every launch is the exact leak the analytics.ts fix was
        // meant to close (Fable re-review 2026-07-05: this call was
        // defeating that fix for 100% of signed-in users). Email
        // still lives in Supabase auth, which is where it belongs.
        posthog.identify(session.user.id);
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
            // Session went to null — sign-out, delete-account, or session
            // expired. Clear the persisted subscription flag too so the
            // next cold launch doesn't hydrate a stale value and skip
            // the paywall for a signed-out user.
            AsyncStorage.removeItem(IS_SUBSCRIBED_STORAGE_KEY).catch((err) => {
              if (__DEV__) console.warn('[authStore] failed to clear isSubscribed on auth-change:', err);
            });
            set({
              user: null,
              session: null,
              isSubscribed: false,
              isDemoUser: false,
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
