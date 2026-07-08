import { SuperwallExpoModule } from 'expo-superwall';

/**
 * The outcome of a restore-purchases attempt, normalized into the five
 * cases callers actually need to branch on. Extracted here so both
 * SettingsScreen (Alert-based UI) and LoadingScreen's escape hatch
 * (inline-error UI) can share ONE StoreKit-walking implementation
 * instead of each maintaining their own copy — SPEC-01 R3.
 *
 *   - 'restored'    → StoreKit walk completed and this Apple ID has an
 *                     ACTIVE entitlement. The subscription is real.
 *   - 'no_purchases'→ StoreKit walk completed but the resulting status is
 *                     INACTIVE. No entitlement exists for this Apple ID
 *                     (wrong Apple ID is the #1 real cause).
 *   - 'unknown'     → Superwall hasn't finished resolving subscription
 *                     status yet. Nudge the user to retry rather than
 *                     lying that there's nothing to restore.
 *   - 'failed'      → restorePurchases() itself reported failure. errorMessage
 *                     carries Superwall's message when present.
 *   - 'threw'       → an exception escaped the native call.
 */
export type RestoreOutcome =
  | { outcome: 'restored' }
  | { outcome: 'no_purchases' }
  | { outcome: 'unknown' }
  | { outcome: 'failed'; errorMessage: string | null }
  | { outcome: 'threw' };

/**
 * Restore the user's purchases via StoreKit and report a normalized outcome.
 *
 * Why restorePurchases() and NOT getSubscriptionStatus() alone: the latter
 * is a PURE PROPERTY READ of Superwall's cached subscriptionStatus — no
 * receipt refresh, no StoreKit sync (see
 * node_modules/expo-superwall/ios/SuperwallExpoModule.swift:258-262). A
 * reinstalling subscriber whose cached status was still UNKNOWN got a false
 * "No Purchases Found" and had to contact support to recover their
 * subscription. restorePurchases() actually calls
 * Superwall.shared.restorePurchases() which walks StoreKit. AFTER a
 * successful restore we still read subscriptionStatus to know whether there
 * was actually anything to restore for this Apple ID.
 *
 * This function does NOT call setIsSubscribed(). The app-level
 * onSubscriptionStatusChange listener in App.tsx is the single source of
 * truth for isSubscribed; letting restore also write it creates a race
 * condition between two writers. Callers decide navigation/UI based on the
 * returned outcome; the store flips on Superwall's own event.
 *
 * This function never throws — every failure path is folded into a
 * RestoreOutcome so callers can branch exhaustively.
 */
export async function restorePurchases(): Promise<RestoreOutcome> {
  try {
    // restorePurchases() returns { result: 'restored' | 'failed' }.
    const restoreResult = await SuperwallExpoModule.restorePurchases();

    if (restoreResult.result === 'failed') {
      if (__DEV__) console.error('Restore failed:', restoreResult.errorMessage);
      return { outcome: 'failed', errorMessage: restoreResult.errorMessage };
    }

    // Restore call succeeded — StoreKit walked, receipt refreshed. Now
    // check the resulting subscription status to distinguish "found and
    // restored a real entitlement" from "no purchases exist for this
    // Apple ID" from "still resolving, try again."
    const status = await SuperwallExpoModule.getSubscriptionStatus();

    if (status?.status === 'ACTIVE') {
      return { outcome: 'restored' };
    }
    if (status?.status === 'UNKNOWN') {
      // Superwall hasn't finished resolving yet.
      return { outcome: 'unknown' };
    }
    // INACTIVE — StoreKit walk completed but this Apple ID has no
    // entitlement for our app.
    return { outcome: 'no_purchases' };
  } catch (error) {
    if (__DEV__) console.error('Restore threw:', error);
    return { outcome: 'threw' };
  }
}
