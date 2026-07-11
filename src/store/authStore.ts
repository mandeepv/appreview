import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signOut as supabaseSignOut } from '../lib/supabase';
import { posthog } from '../config/posthog';
import { setSentryUser, reportError } from '../config/sentry';
import { SuperwallExpoModule } from 'expo-superwall';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { mergeRemoteIntoLocal } from '../lessons/progressStore';
import { mergeRemoteActivityIntoLocal } from '../lessons/streakStore';
import {
  resolveCachedEntitlement,
  type PersistedSubRecord as EntitlementRecord,
} from './entitlementCache';

// isSubscribed persists to disk so we don't paywall a paying user on every
// cold launch while waiting for Superwall's onSubscriptionStatusChange to
// fire. Superwall's event is authoritative — this cached value gets
// overwritten as soon as Superwall reports ACTIVE or INACTIVE.
const IS_SUBSCRIBED_STORAGE_KEY = STORAGE_KEYS.IS_SUBSCRIBED;

// SPEC-FIX-08 R1 — the cached flag is USER-BOUND. It is persisted as a JSON
// record { userId, subscribed }, NOT a bare 'true'/'false'. On hydrate we honor
// the cached `subscribed` ONLY when a session exists for that SAME userId;
// otherwise the flag is treated as false. This makes "a stale true can never
// grant a different-or-absent user free access" a STRUCTURAL property, not
// something that depends on a sign-out event firing and winning a race against
// the gate read (the old, fragile defense — three verified never-paid-user leak
// instances: delete-account, session-expiry, account-switch/sign-out-throw).
//
// Legacy migration: installs from before this change have a bare 'true'/'false'
// string on disk with NO userId. A bare value is "unowned" → NOT honored as a
// terminal grant. A current subscriber updating gets ONE paywall-check on their
// first post-update launch; Superwall's onSubscriptionStatusChange re-sets the
// flag (in the new owned format) within seconds. Acceptable + expected.
//
// The pure parse + ownership decision lives in ./entitlementCache so it's
// unit-testable at the kernel boundary without this store's import graph.
type PersistedSubRecord = EntitlementRecord;

// Persist the flag bound to the current user. Called by setIsSubscribed.
//
// If there is no current user we can't own the flag — so we do NOTHING: we
// neither write an unowned value NOR clear the existing owned record.
//
// Why not clear (SPEC-FIX-08 startup-race fix): Superwall can report ACTIVE
// before the store's `user` is populated on a cold launch. Clearing here would
// let that too-early event wipe a VALID owned record, causing a paywall flash
// on that launch. And the clear buys no security: hydrate
// (resolveCachedEntitlement) already refuses to honor ANY record that doesn't
// match the live session, structurally, on every launch. So a leftover record
// is harmless — it's only honored for its owner. Skip the write, keep the
// prior owned record; setIsSubscribed will re-persist correctly once `user` is
// set.
function persistSubscription(userId: string | undefined, subscribed: boolean): Promise<void> {
  if (!userId) {
    // No owner to bind to — don't write, don't clear. Hydrate is the guard.
    return Promise.resolve();
  }
  const record: PersistedSubRecord = { userId, subscribed };
  return AsyncStorage.setItem(IS_SUBSCRIBED_STORAGE_KEY, JSON.stringify(record)).catch((err) => {
    if (__DEV__) console.warn('[authStore] failed to persist isSubscribed:', err);
  });
}

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
    //
    // SPEC-FIX-08 R1: the flag is USER-BOUND. We persist { userId, subscribed }
    // for the current user. If there's no current user, persistSubscription
    // does NOTHING — it neither writes an unowned value nor clears the existing
    // owned record (SPEC-FIX-08 startup-race fix / SPEC-FIX-10 F4): a too-early
    // ACTIVE event before `user` is set must not wipe a valid owned record, and
    // it needn't — hydrate (resolveCachedEntitlement) refuses to honor any
    // record that doesn't match the live session, so a leftover record is never
    // read by a different-or-absent user.
    const currentUserId = get().user?.id;
    void persistSubscription(currentUserId, subscribed);
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
      // Detach from Sentry synchronously on the explicit sign-out path so a
      // subsequent error can't be attributed to the just-signed-out user even
      // if the onAuthStateChange listener hasn't fired yet (SPEC-06 R2).
      setSentryUser(null);

      // Reset Superwall identity on sign-out (SPEC-07 R4). Without this, the
      // Superwall SDK keeps the previous user's identity, so on a shared
      // device a second person signing in would inherit the first person's
      // subscription/entitlement state until Superwall's next event. Mirrors
      // the delete-account path (authService.ts). try/catch + reportError so a
      // Superwall failure never blocks sign-out.
      try {
        await SuperwallExpoModule.reset();
      } catch (e) {
        reportError(e instanceof Error ? e : new Error(String(e)), {
          context: 'sign_out_superwall_reset',
        });
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

      // Get initial session FIRST — SPEC-FIX-08 R1 requires knowing WHO is
      // signed in before we're allowed to honor the cached entitlement flag.
      // The cached flag is user-bound; it may only be honored when a session
      // exists for the SAME user id it was written under.
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        if (__DEV__) console.error('Error getting session:', error);
        set({ isLoading: false });
        return;
      }

      // Hydrate persisted isSubscribed from disk — but ONLY honor it when a
      // session exists for the same user the flag was written under. Superwall's
      // onSubscriptionStatusChange listener in App.tsx overwrites this within
      // seconds of launch; the hydrated value is what LoadingScreen sees on the
      // initial render, so it must not leak a previous user's `true` to a
      // different-or-absent user (SPEC-FIX-08 R1 — structural fix for the
      // delete-account / session-expiry / account-switch never-paid leaks).
      try {
        const raw = await AsyncStorage.getItem(IS_SUBSCRIBED_STORAGE_KEY);
        const { honor, clearStale } = resolveCachedEntitlement(raw, session?.user?.id);
        if (honor) {
          set({ isSubscribed: true });
          if (__DEV__) console.log('[authStore] hydrated isSubscribed=true (owned) from disk');
        } else {
          // No session, a different user, or a legacy/unowned/malformed value →
          // treat as false AND clear any stale record so it can't be read again.
          // A current subscriber who hit the legacy-unowned branch gets ONE
          // paywall-check now; Superwall re-sets the owned flag within seconds.
          if (clearStale) {
            AsyncStorage.removeItem(IS_SUBSCRIBED_STORAGE_KEY).catch(() => {});
          }
          if (__DEV__) console.log('[authStore] cached isSubscribed not honored (no owner match)');
        }
      } catch (err) {
        // Non-fatal — falls through with isSubscribed: false (default).
        // Worst case: a paying user briefly sees the paywall on this
        // one launch before Superwall confirms.
        if (__DEV__) console.warn('[authStore] failed to hydrate isSubscribed:', err);
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
        // Attach the same pseudonymous ID to Sentry (ID only, no PII) so
        // crashes link back to the Supabase user without copying email
        // into Sentry (SPEC-06 R2 / invariant #8).
        setSentryUser(session.user.id);
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
            // SPEC-13 R2 — on a real sign-in, reconcile lesson progress:
            // union the now-signed-in user's remote completions into local
            // AsyncStorage (non-destructive) so cross-device progress appears,
            // and push the union back so remote converges. Only on SIGNED_IN
            // (not TOKEN_REFRESHED / INITIAL_SESSION, which fire routinely).
            // Fire-and-forget: never blocks auth, never user-facing.
            if (event === 'SIGNED_IN') {
              void mergeRemoteIntoLocal();
              // SPEC-19 — same reconciliation for the daily streak: union remote
              // activity dates into local so a re-installed device restores its
              // streak. Set-union of dates is order-free, idempotent, and
              // non-destructive (null fetch → skip). Fire-and-forget.
              void mergeRemoteActivityIntoLocal(new Date());
            }
          } else {
            // Session went to null — sign-out, delete-account, or session
            // expired. Clear the persisted subscription flag too so the
            // next cold launch doesn't hydrate a stale value and skip
            // the paywall for a signed-out user.
            AsyncStorage.removeItem(IS_SUBSCRIBED_STORAGE_KEY).catch((err) => {
              if (__DEV__) console.warn('[authStore] failed to clear isSubscribed on auth-change:', err);
            });
            // Detach the user from Sentry so subsequent errors aren't
            // attributed to a signed-out user (SPEC-06 R2). Consistent with
            // the existing Sentry.setUser(null) on the delete path.
            setSentryUser(null);
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
