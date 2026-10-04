// Web purchases (2026-10) — the access rule for a kinderwell.app purchase, as
// PURE logic.
//
// A parent who buys on the website gets a row in `public.entitlements`, written
// ONLY by the Dodo webhook with the service role; the app reads its own row and
// never writes it (RLS: "own entitlement readable"). This module decides what
// that row means. It has no Supabase import, like ./entitlementCache, so the
// rule is unit-testable without the client's import graph. The read itself
// lives in src/services/entitlementService.ts.

// The columns the app reads. Narrower than the generated Row type on purpose:
// the gate depends on these three and nothing else.
export type WebEntitlementRow = {
  status: string;
  current_period_end: string | null;
  product_id: string;
};

// Statuses that grant access until current_period_end. `cancelled` is in the
// list deliberately: a cancelled web subscription runs to the end of the paid
// period, the same as a cancelled Apple one. `expired` and `revoked` (a refund
// or chargeback) never grant access, whatever the date says.
const ENTITLING_STATUSES = new Set(['active', 'past_due', 'cancelled']);

/**
 * Is this row an active web entitlement at `now`?
 *
 * The app checks the date ITSELF rather than trusting `status` alone: the server
 * only flips stale rows to `expired` hourly, with up to 5 days' grace, so an
 * `active` row can sit past its period end for a while. An unparseable or null
 * date is not entitled — the safe reading on a money path.
 */
export function isWebEntitled(row: WebEntitlementRow | null | undefined, now: Date): boolean {
  if (!row) return false;
  if (!ENTITLING_STATUSES.has(row.status)) return false;
  if (!row.current_period_end) return false;
  const end = Date.parse(row.current_period_end);
  if (Number.isNaN(end)) return false;
  return end > now.getTime();
}

/**
 * What the web check returned. Never an exception: the caller is the launch
 * gate, and an error there must fall through to Superwall, not crash it.
 * `timedOut` separates a slow network from a failed query for analytics; both
 * are errors to the gate.
 */
export type WebCheckResult =
  | { kind: 'entitled'; periodEnd: string; productId: string }
  | { kind: 'not_entitled' }
  | { kind: 'error'; timedOut: boolean };
