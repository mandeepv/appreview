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

const DAY_MS = 24 * 60 * 60 * 1000;

// How long past current_period_end an `active` row still grants access.
//
// An `active` row only outlives its period when the renewal webhook hasn't
// landed. Dodo bills on next_billing_date and sends `subscription.renewed`,
// which moves current_period_end forward; if that delivery is late (Dodo
// retrying with backoff, a rotated webhook secret, an endpoint outage) the
// customer has paid but the row still carries the old date. Web review P1-8
// fixed the server for exactly this: expire_stale_entitlements() leaves
// `active` rows alone for 5 days, and the winback sweep asks Dodo about them
// first and heals the row when the subscription is live. The app was left
// cutting access at the old date — so for up to those 5 days a customer who
// had just been billed met the Apple paywall, and could pay a second time.
//
// So the app waits too: the server's 5 days plus one, so an hourly sweep that
// runs late can't open a gap between the app giving up and the server
// deciding. Once the sweep has decided, the row's status or date carries the
// answer and this grace stops mattering; the extra day only counts if the
// sweep itself is down. webEntitlement.test pins it against the newest
// migration that defines expire_stale_entitlements().
//
// Only `active`. The webhook writes `past_due` and `cancelled` dates on
// purpose — a 3-day floor while Dodo retries a card, and never earlier than
// the paid period — so for those statuses the date is the answer.
export const ACTIVE_LATE_RENEWAL_GRACE_MS = 6 * DAY_MS;

/**
 * Is this row an active web entitlement at `now`?
 *
 * The app checks the date ITSELF rather than trusting `status` alone: the server
 * only flips stale rows to `expired` when its sweep runs, so a row can say
 * `cancelled` or `past_due` after its period has ended. An `active` row keeps
 * ACTIVE_LATE_RENEWAL_GRACE_MS past its date for a late renewal webhook. An
 * unparseable or null date is not entitled — the safe reading on a money path.
 */
export function isWebEntitled(row: WebEntitlementRow | null | undefined, now: Date): boolean {
  if (!row) return false;
  if (!ENTITLING_STATUSES.has(row.status)) return false;
  if (!row.current_period_end) return false;
  const end = Date.parse(row.current_period_end);
  if (Number.isNaN(end)) return false;
  const grace = row.status === 'active' ? ACTIVE_LATE_RENEWAL_GRACE_MS : 0;
  return end + grace > now.getTime();
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
