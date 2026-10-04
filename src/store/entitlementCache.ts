// SPEC-FIX-08 R1 — the persisted entitlement cache, as PURE logic.
//
// The `isSubscribed` flag is cached on disk so a paying user isn't paywalled on
// every cold launch while Superwall's onSubscriptionStatusChange warms up. The
// bug this module closes: the old format was a bare 'true'/'false' with NO
// owner, so a stale `true` left by user A (via delete-account, session expiry,
// or an account switch) could be read and honored for user B (or no user) — a
// NEVER-PAID user reaching content. The old defense (clear-on-sign-out) was an
// event race, not a guarantee.
//
// Fix: the flag is USER-BOUND — persisted as { userId, subscribed } (plus
// `source` since 2026-10, which does not affect binding). It may be
// honored ONLY when a session exists for that SAME userId. This module holds the
// pure parse + decision so it's unit-testable at the kernel boundary without the
// authStore's supabase/Superwall/PostHog/Sentry import graph.

// WHO vouched for the flag. 'superwall' = an Apple subscription Superwall
// reported (or a purchase/restore on its paywall). 'web' = a kinderwell.app
// purchase, read from the `entitlements` row by the launch gate (see
// src/services/entitlementService.ts). The source decides who may CLEAR the
// flag — see resolveSuperwallStatus below. Added for web purchases (2026-10);
// an added field on the same key, not a rename (INVARIANTS: never rename a
// shipped key without a migration).
export type SubSource = 'web' | 'superwall';

export type PersistedSubRecord = { userId: string; subscribed: boolean; source: SubSource };

/**
 * Parse a raw AsyncStorage value into an owned record, or null.
 * Returns null for: absent, malformed, OR a LEGACY bare 'true'/'false' (no
 * owner). A legacy/unowned value is intentionally NOT parseable into a record,
 * so callers never honor it as a terminal grant — the confirmed-subscriber path
 * re-writes it in the owned format within seconds of launch.
 */
export function parseSubRecord(raw: string | null | undefined): PersistedSubRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.userId === 'string' &&
      typeof parsed.subscribed === 'boolean'
    ) {
      // Records written before web purchases existed carry no `source`; every
      // one of them was vouched for by Superwall. Anything that is not exactly
      // 'web' reads as 'superwall' too — the conservative misread, because a
      // 'superwall' flag is the one Superwall is allowed to clear.
      const source: SubSource = parsed.source === 'web' ? 'web' : 'superwall';
      return { userId: parsed.userId, subscribed: parsed.subscribed, source };
    }
  } catch {
    // Not JSON → legacy bare value (unowned). Fall through to null.
  }
  return null;
}

/**
 * The core rule. Given the raw persisted value and the current session's user
 * id, decide whether to honor the cached `subscribed` on hydrate.
 *
 *   honor === true  ONLY when a record exists, is owned by the current session
 *                   user, AND says subscribed. This is the only path that skips
 *                   the paywall from cache.
 *   clearStale      true when there's a stale/unowned/mismatched value that
 *                   should be removed from disk so it can't be read again.
 *
 * No session, a different user, a legacy bare value, or a malformed value all
 * resolve to honor=false — a stale `true` can NEVER grant a different-or-absent
 * user free access.
 */
export function resolveCachedEntitlement(
  raw: string | null | undefined,
  sessionUserId: string | undefined,
): { honor: boolean; clearStale: boolean } {
  const record = parseSubRecord(raw);

  // Owned by the currently-signed-in user → honor its subscribed value.
  if (record && sessionUserId && record.userId === sessionUserId) {
    return { honor: record.subscribed, clearStale: false };
  }

  // Not honored. Clear disk if there's anything stale to clear. SPEC-FIX-10 F7:
  // the earlier `record != null || (somethingOnDisk && sessionUserId === undefined)
  // || somethingOnDisk` degenerated to just `somethingOnDisk` (the third term
  // subsumes the first two — a parsed record and a legacy value both imply
  // something is on disk). Simplified to the equivalent readable form; the honor
  // logic above is unchanged.
  const somethingOnDisk = raw != null && raw !== '';
  return { honor: false, clearStale: somethingOnDisk };
}

/**
 * What a Superwall subscription-status event may do to the cached flag.
 *
 * Every web buyer is INACTIVE to Superwall — they have no Apple subscription —
 * so an unconditional "INACTIVE → clear" (the rule before web purchases) wiped
 * their unlock seconds after every launch: offline launches then stuck on the
 * retry screen and Settings showed them as unsubscribed. So:
 *
 *   ACTIVE    → set subscribed, source 'superwall'. Apple wins when a user has
 *               both, which also hands Settings the Apple management row.
 *   INACTIVE  → clear ONLY a flag Superwall itself vouched for. A 'web' flag
 *               is cleared only by the web re-check, sign-out or deletion.
 *   UNKNOWN   → leave it; Superwall sends a definitive update once it resolves.
 *
 * `currentSource` is the source of the flag as it stands now, or null when
 * the user is not subscribed (clearing is then a harmless no-op).
 */
export function resolveSuperwallStatus(
  status: string,
  currentSource: SubSource | null,
): 'subscribe' | 'clear' | 'keep' {
  if (status === 'ACTIVE') return 'subscribe';
  if (status === 'INACTIVE') return currentSource === 'web' ? 'keep' : 'clear';
  return 'keep';
}
