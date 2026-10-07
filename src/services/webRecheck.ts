import { checkWebEntitlement } from './entitlementService';
import { resolveWebRecheck } from '../navigation/routingPolicy';
import { useAuthStore } from '../store/authStore';

// The re-check of a cached 'web' subscription flag. A launch on that flag
// enters Root without the gate's web step, so this is the only thing that
// notices a refund, a chargeback or a lapsed subscription. It only ever
// CLEARS the flag (resolveWebRecheck): the session in progress is never
// interrupted, and the next launch gates — the same leniency Apple
// subscribers get from Superwall's status listener.
//
// Two gaps the web2app review (2026-10-07, AP-5) found, both closed here:
//   * It ran only at a cold launch, with the gate's 4-second timeout. On a
//     slow network it timed out every time and the flag never cleared. It
//     is off the launch path, so it now waits WEB_RECHECK_TIMEOUT_MS.
//   * Nothing re-checked an app that is never killed. App.tsx now asks again
//     whenever the app comes back to the foreground, at most hourly.

/** The background re-check is not on the launch path: it can wait. */
export const WEB_RECHECK_TIMEOUT_MS = 20_000;

/** How often returning to the foreground may re-check a web subscriber. */
export const FOREGROUND_RECHECK_INTERVAL_MS = 60 * 60 * 1000;

export type RecheckOutcome = 'cleared' | 'kept' | 'moot';

let lastRecheckAt = 0;
let inFlight: Promise<RecheckOutcome> | null = null;

/**
 * Re-checks `userId`'s web purchase and clears the cached flag if it is gone.
 * Fire-and-forget safe: never throws, and touches only the store. The flag
 * is cleared only if the same user is still signed in on a 'web' flag when
 * the answer arrives — a sign-out, an account switch or an Apple purchase in
 * the meantime makes the answer moot.
 */
export function recheckWebEntitlement(
  userId: string,
  { now = Date.now(), report = true }: { now?: number; report?: boolean } = {},
): Promise<RecheckOutcome> {
  if (inFlight) return inFlight;
  lastRecheckAt = now;
  inFlight = (async (): Promise<RecheckOutcome> => {
    try {
      const result = await checkWebEntitlement(userId, WEB_RECHECK_TIMEOUT_MS, { report });
      if (resolveWebRecheck(result) !== 'clear') return 'kept';
      const { user, subscriptionSource, setIsSubscribed } = useAuthStore.getState();
      if (user?.id !== userId || subscriptionSource !== 'web') return 'moot';
      if (__DEV__) console.log('[webRecheck] web entitlement gone — next launch will gate');
      setIsSubscribed(false);
      return 'cleared';
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/**
 * App.tsx, whenever the app returns to the foreground: re-check a signed-in
 * web subscriber if the last re-check was over an hour ago. Errors are not
 * reported from here (a phone offline all day would report hourly).
 */
export function maybeRecheckWebOnForeground(now = Date.now()): Promise<RecheckOutcome> | null {
  const { user, isSubscribed, subscriptionSource } = useAuthStore.getState();
  if (!user?.id || !isSubscribed || subscriptionSource !== 'web') return null;
  if (now - lastRecheckAt < FOREGROUND_RECHECK_INTERVAL_MS) return null;
  return recheckWebEntitlement(user.id, { now, report: false });
}

/** Tests only: forget the last re-check time. */
export function resetWebRecheckForTests(): void {
  lastRecheckAt = 0;
  inFlight = null;
}
