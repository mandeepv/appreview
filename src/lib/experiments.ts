// Onboarding A/B experiment accessor (SPEC-15).
//
// This is the ONLY place in the app that reads the 'onboarding-flow' feature
// flag. Everything else keys off the resolved OnboardingVariant. The PostHog
// client (src/config/posthog.ts) sets `preloadFeatureFlags: true` and
// `sendFeatureFlagEvent: true`; we build on that and never touch the client
// config here. NOTE: preload alone is NOT enough on a cold/fresh start — the
// SDK serves an empty cached (bootstrap) value before the first server fetch
// lands, so we explicitly await a fresh fetch (see readFlagWithTimeout).
//
// FLAG:            'onboarding-flow'          (multivariate)
// VARIANT VALUES:  'control' | 'variant_b'
// DEFAULT:         'control'                  (any failure/timeout/unknown → control)
//
// Kill / rollout semantics (dashboard-controlled, NO app build needed):
//   - The PostHog release condition controls the split for NEW assignments
//     only. Once a device has a persisted assignment it keeps that flow for
//     the whole onboarding attempt — a mid-onboarding split change must never
//     flip a user between flows.
//   - Setting variant_b to 0% in PostHog is the KILL SWITCH for all new
//     users: every fresh device resolves to control, effective immediately,
//     no build. Already-assigned devices keep their flow by design.
//
// Failure posture: onboarding must never block or crash on flag resolution.
// Everything below is wrapped; the default is always control.
//
// ASSIGNMENT RULE (SPEC-FIX-11 R4): an assignment (persist + event +
// super-property) is created in exactly ONE place — handleGetStarted, i.e. when
// a device actually ENTERS onboarding. Paths that merely need to know or warm:
//   - WelcomeScreen mount → warmOnboardingFlag() (caches the flag, no assign)
//   - AuthScreen signin / identify → peekOnboardingVariant() (reads, no assign)
// Calling resolveOnboardingVariant() from a non-onboarding path would mint a
// bogus assignment for a user who never onboarded and stamp the variant on all
// their later events — the contamination this rule prevents.

import { posthog } from '../config/posthog';
import { safeCapture } from './analytics';
import { STORAGE_KEYS } from '../constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingVariant = 'control' | 'variant_b';

const FLAG_KEY = 'onboarding-flow';

// How long we'll wait on the FRESH server fetch before falling back to control.
// The Welcome screen calls warmOnboardingFlag() on mount (R4: warm, don't
// assign), which kicks off the reloadFeatureFlagsAsync() fetch early — so by the
// time the user taps Get Started and resolveOnboardingVariant() runs, the flag
// is usually already fetched and the tap is instant. This cap only bites on a
// genuinely cold, slow-network first launch: a 2s ceiling keeps onboarding from
// stalling behind PostHog, at the cost of falling back to control on that rare
// slow launch (a deliberate trade — never hang the user on the network).
const FLAG_TIMEOUT_MS = 2000;

// Narrow an arbitrary flag value to a known variant. PostHog's getFeatureFlag
// can return string | boolean | undefined; anything that isn't the exact
// 'variant_b' string (control, undefined, false, a renamed variant, garbage)
// collapses to control. This is the single chokepoint for "unknown → control."
const toVariant = (raw: unknown): OnboardingVariant =>
  raw === 'variant_b' ? 'variant_b' : 'control';

// Read the flag, FETCHING FRESH FROM THE SERVER first.
//
// Why not just posthog.getFeatureFlag()? On a cold start (esp. a fresh install)
// the RN SDK caches flags in AsyncStorage and returns the CACHED/bootstrap value
// synchronously, THEN fetches the real value from the server a moment later.
// On a fresh install the cache is empty → getFeatureFlag returns undefined
// (bootstrap) → we'd map that to control and lock it in before the real
// 'variant_b' ever arrives. That produced events tagged `$used_bootstrap_value:
// true` and made a 100% variant_b rollout still resolve to control.
//
// PostHog's recommended fix: await a fresh fetch via reloadFeatureFlagsAsync()
// (docs: "manually trigger a refresh" / "wait for the feature flag request to
// finish"). It resolves with the freshly-fetched flag map, so we read our key
// from THAT — the true server value, not the cache. The read is still raced
// against FLAG_TIMEOUT_MS so a slow/hung network can't stall onboarding: on
// timeout we resolve `undefined`, which toVariant maps to control (fallback
// preserved exactly as before).
const readFlagWithTimeout = async (): Promise<unknown> => {
  const freshRead = (async (): Promise<unknown> => {
    try {
      const flags = await posthog.reloadFeatureFlagsAsync();
      // reloadFeatureFlagsAsync resolves with the fresh flag map (or undefined
      // if the request failed). Prefer reading our key straight from it; fall
      // back to getFeatureFlag (now backed by the just-refreshed cache).
      if (flags && Object.prototype.hasOwnProperty.call(flags, FLAG_KEY)) {
        return flags[FLAG_KEY];
      }
      return posthog.getFeatureFlag(FLAG_KEY);
    } catch (err) {
      if (__DEV__) console.warn('[experiments] reloadFeatureFlagsAsync failed:', err);
      // Network/SDK failure → let the caller default to control.
      return undefined;
    }
  })();

  return Promise.race([
    freshRead,
    new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), FLAG_TIMEOUT_MS)),
  ]);
};

/**
 * Resolve the onboarding variant for this device.
 *
 * 1. Persisted assignment wins — sticky for the whole onboarding attempt.
 * 2. Otherwise consult the server flag (timeout-guarded, default control).
 * 3. On a fresh resolution: persist it, fire `onboarding_variant_assigned`
 *    exactly once, and register `onboarding_variant` as a PostHog
 *    super-property so every downstream event (steps, auth, paywall,
 *    purchase) carries the variant without touching those call sites.
 *
 * Never throws — any failure resolves to control.
 */
export const resolveOnboardingVariant = async (): Promise<OnboardingVariant> => {
  try {
    // (1) Persisted assignment wins. A server-side split change must never
    // flip a user mid-onboarding, so once assigned we stop consulting the flag.
    const persisted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_VARIANT);
    if (persisted === 'control' || persisted === 'variant_b') {
      // Assignment already made this attempt — the super-property is
      // (re-)registered by hydrateOnboardingVariant on app start, so we don't
      // re-register or re-fire the assignment event here.
      return persisted;
    }

    // (2) No assignment yet — consult the server flag. `source` records
    // whether the flag actually delivered a value ('flag') or we fell back to
    // control because it didn't resolve ('fallback'); a spike in 'fallback' is
    // a flag-delivery problem, not a real 50/50 outcome.
    let raw: unknown;
    let source: 'flag' | 'fallback' = 'flag';
    try {
      raw = await readFlagWithTimeout();
      // undefined means the flag didn't resolve (not loaded / timed out) — the
      // resulting control assignment is a fallback, not a real flag decision.
      if (raw === undefined) source = 'fallback';
    } catch (err) {
      if (__DEV__) console.warn('[experiments] getFeatureFlag threw, defaulting control:', err);
      source = 'fallback';
    }
    const variant = toVariant(raw);

    // (3) Persist + announce the fresh assignment exactly once.
    await persistAssignment(variant, source);
    return variant;
  } catch (err) {
    // Storage failure or anything else — onboarding must not break. Default
    // control and do not persist (so a later successful call can still assign).
    if (__DEV__) console.warn('[experiments] resolveOnboardingVariant failed, defaulting control:', err);
    return 'control';
  }
};

/**
 * SPEC-FIX-11 R4 — read-only peek at the persisted assignment.
 *
 * Returns the persisted variant, or `null` if this device has none. It NEVER
 * consults the flag, NEVER persists, and NEVER fires `onboarding_variant_assigned`
 * — so paths that need to KNOW the variant without CREATING one (identify in
 * signin mode, flag-cache warming) use this instead of resolveOnboardingVariant.
 *
 * Why this exists: calling resolveOnboardingVariant from a non-onboarding path
 * (e.g. a returning user signing in on a fresh device) would mint a brand-new
 * assignment, fire the event, and stamp the super-property on every later event
 * including subscription_purchased — contaminating any non-funnel breakdown by
 * variant. An assignment must exist ONLY for devices that actually entered
 * onboarding (see handleGetStarted). Never throws.
 */
export const peekOnboardingVariant = async (): Promise<OnboardingVariant | null> => {
  try {
    const persisted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_VARIANT);
    return persisted === 'control' || persisted === 'variant_b' ? persisted : null;
  } catch (err) {
    if (__DEV__) console.warn('[experiments] peekOnboardingVariant failed:', err);
    return null;
  }
};

/**
 * SPEC-FIX-11 R4 — warm the flag cache WITHOUT assigning.
 *
 * Fire-and-forget flag read whose RESULT is discarded: it primes PostHog's local
 * flag cache so a later resolveOnboardingVariant (in handleGetStarted) is
 * instant, but it does NOT persist, fire the event, or register the
 * super-property. Safe to call from WelcomeScreen mount, where a user may bounce
 * or tap "already have an account" without ever entering onboarding.
 */
export const warmOnboardingFlag = (): void => {
  try {
    // Kick off a real SERVER fetch and discard the result. Using
    // reloadFeatureFlagsAsync (not getFeatureFlag, which only reads the sync
    // cache) means by the time handleGetStarted calls resolveOnboardingVariant
    // the fresh flags are usually already in — so the Get Started tap rarely
    // hits the 2s timeout. Persists nothing / fires nothing (warming only).
    void Promise.resolve()
      .then(() => posthog.reloadFeatureFlagsAsync())
      .catch(() => { /* warming is best-effort */ });
  } catch {
    /* never throw into a screen mount */
  }
};

// Persist a freshly-resolved assignment and fire its side effects. Split out so
// the "exactly once" contract is obvious: this runs only from the no-persisted-
// value branch of resolveOnboardingVariant.
const persistAssignment = async (variant: OnboardingVariant, source: 'flag' | 'fallback') => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_VARIANT, variant);
  } catch (err) {
    if (__DEV__) console.warn('[experiments] failed to persist variant:', err);
  }
  // Assignment event — fired once, on fresh assignment only. `source` lets the
  // dashboard split real flag decisions from fallbacks.
  safeCapture('onboarding_variant_assigned', { variant, source });
  // Super-property so every SUBSEQUENT event carries the variant. This is how
  // the whole funnel (steps → auth → paywall → purchase) gets tagged without
  // editing each call site.
  registerVariantSuperProperty(variant);
};

// Register `onboarding_variant` as a PostHog super-property. Wrapped because
// analytics must never throw into onboarding.
const registerVariantSuperProperty = (variant: OnboardingVariant) => {
  try {
    posthog.register({ onboarding_variant: variant });
  } catch (err) {
    if (__DEV__) console.warn('[experiments] failed to register variant super-property:', err);
  }
};

/**
 * Hydrate hook — call once on app start.
 *
 * If a persisted assignment exists, re-register the super-property. This is
 * necessary because `resetPostHog()` (logout/delete/demo teardown) wipes ALL
 * super-properties, mirroring how `environment` is re-registered in
 * src/config/posthog.ts. Without this, a user who logs out and relaunches
 * mid-experiment would emit post-reset events with no variant tag.
 */
export const hydrateOnboardingVariant = async (): Promise<void> => {
  try {
    const persisted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_VARIANT);
    if (persisted === 'control' || persisted === 'variant_b') {
      registerVariantSuperProperty(persisted);
    }
  } catch (err) {
    if (__DEV__) console.warn('[experiments] hydrateOnboardingVariant failed:', err);
  }
};

/**
 * Clear the persisted assignment (storage key ONLY).
 *
 * Called from the onboardingStore.clearState() path in LoadingScreen so a
 * future re-onboard (account deletion → fresh signup) gets a fresh assignment.
 *
 * DELIBERATELY does NOT unregister the super-property: the variant must keep
 * flowing on post-onboarding events (paywall / purchase) — subscription
 * conversion is the PRIMARY metric, and it fires after clearState has run.
 */
export const clearOnboardingVariant = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_VARIANT);
  } catch (err) {
    if (__DEV__) console.warn('[experiments] clearOnboardingVariant failed:', err);
  }
};
