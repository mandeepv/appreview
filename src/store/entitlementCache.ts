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
// Fix: the flag is USER-BOUND — persisted as { userId, subscribed }. It may be
// honored ONLY when a session exists for that SAME userId. This module holds the
// pure parse + decision so it's unit-testable at the kernel boundary without the
// authStore's supabase/Superwall/PostHog/Sentry import graph.

export type PersistedSubRecord = { userId: string; subscribed: boolean };

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
      return parsed as PersistedSubRecord;
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

  // Not honored. Clear disk if there's anything stale to clear: a parsed record
  // that doesn't match the session (wrong/absent owner), OR any raw value when
  // there's no session at all (covers legacy bare values and mismatches).
  const somethingOnDisk = raw != null && raw !== '';
  const clearStale = record != null || (somethingOnDisk && sessionUserId === undefined) || somethingOnDisk;
  return { honor: false, clearStale };
}
