// SPEC-20 R13 — the webhook ↔ app contract for web (Dodo) purchases.
//
// Each repo tests its own half: the web repo's webhook tests check which row
// each Dodo event writes; this repo checks what a row means. Nothing checked
// that the two agree — and they had drifted: the web side gave late renewal
// webhooks 5 days' grace (review P1-8) while the app still cut access at the
// old date, so paying customers met the Apple paywall (fixed b26186f).
//
// CONTRACT below is one row per Dodo event: what the webhook writes, and what
// the app must grant at moments around T, the paid period's end. The rows are
// transcribed from the web repo's supabase/functions/_shared/entitlement.ts
// (decideSubscriptionWrite) and dodo-webhook/handler.ts. When that repo is
// checked out next to this one (~/kinderwell-web2app/kinderwell-web), the
// last block re-reads its code and fails if the assumptions here went stale;
// elsewhere (CI) it is skipped.

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ACTIVE_LATE_RENEWAL_GRACE_MS, isWebEntitled } from '../webEntitlement';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** T: the end of the period the customer has paid for (Dodo's next_billing_date). */
const T = Date.parse('2026-11-01T09:00:00Z');
const at = (offset: number) => new Date(T + offset);
const iso = (offset: number) => at(offset).toISOString();

/** The web repo's PAST_DUE_GRACE_MS: a failed renewal keeps access while Dodo retries. */
const PAST_DUE_FLOOR = 3 * DAY;

type Entry = {
  event: string;
  writes: { status: string; current_period_end: string | null };
  /** [offset from T, entitled?] */
  access: [number, boolean][];
};

const CONTRACT: Entry[] = [
  {
    event: 'subscription.active — first purchase, paid until T',
    writes: { status: 'active', current_period_end: iso(0) },
    access: [[-29 * DAY, true], [-MINUTE, true]],
  },
  {
    event: 'subscription.renewed — billed at T and delivered on time',
    writes: { status: 'active', current_period_end: iso(30 * DAY) },
    access: [[HOUR, true], [29 * DAY, true]],
  },
  {
    // Billed at T, but the webhook hasn't landed: the row still ends at T.
    // The server waits 5 days (sweep) and asks Dodo; the app waits 6.
    event: 'renewal webhook late — row still active, ending T (review P1-8)',
    writes: { status: 'active', current_period_end: iso(0) },
    access: [[HOUR, true], [3 * DAY, true], [6 * DAY - MINUTE, true], [6 * DAY, false]],
  },
  {
    // A failed renewal's next_billing_date is T itself; the webhook floors the
    // period end at now + 3 days and never moves it earlier (P2-3c).
    event: 'subscription.on_hold / past_due — card failed at T, Dodo retrying',
    writes: { status: 'past_due', current_period_end: iso(PAST_DUE_FLOOR) },
    access: [[DAY, true], [PAST_DUE_FLOOR - MINUTE, true], [PAST_DUE_FLOOR, false]],
  },
  {
    event: 'subscription.cancelled — cancelled mid-period, runs to T like Apple',
    writes: { status: 'cancelled', current_period_end: iso(0) },
    access: [[-DAY, true], [-MINUTE, true], [0, false], [HOUR, false]],
  },
  {
    event: 'subscription.expired / failed',
    writes: { status: 'expired', current_period_end: iso(0) },
    access: [[-DAY, false], [HOUR, false]],
  },
  {
    // Revoked immediately; the period end is left as it was.
    event: 'refund.succeeded — full refund',
    writes: { status: 'revoked', current_period_end: iso(0) },
    access: [[-20 * DAY, false], [-MINUTE, false]],
  },
  {
    event: 'dispute.opened — chargeback',
    writes: { status: 'revoked', current_period_end: iso(0) },
    access: [[-20 * DAY, false]],
  },
  {
    event: 'expiry sweep — an overdue row flipped to expired',
    writes: { status: 'expired', current_period_end: iso(0) },
    access: [[6 * DAY, false]],
  },
];

/** "T", "T+1h", "T−29d", "T+5d23h59m" — readable test names. */
function fromT(offset: number): string {
  if (offset === 0) return 'T';
  let rest = Math.abs(offset);
  const parts: string[] = [];
  for (const [unit, size] of [['d', DAY], ['h', HOUR], ['m', MINUTE]] as const) {
    const count = Math.floor(rest / size);
    if (count) parts.push(`${count}${unit}`);
    rest -= count * size;
  }
  return `T${offset < 0 ? '−' : '+'}${parts.join('')}`;
}

describe.each(CONTRACT)('$event', ({ writes, access }) => {
  const row = { ...writes, product_id: 'pdt_annual' };
  it.each(access.map(([offset, entitled]) => ({ when: fromT(offset), offset, entitled })))(
    'at $when → entitled: $entitled',
    ({ offset, entitled }) => {
      expect(isWebEntitled(row, at(offset))).toBe(entitled);
    },
  );
});

// ── Local cross-check against the web repo ──────────────────────────────────

const WEB_FUNCTIONS = path.join(os.homedir(), 'kinderwell-web2app', 'kinderwell-web', 'supabase', 'functions');
const webRepoPresent = fs.existsSync(WEB_FUNCTIONS);
const readWeb = (relative: string) => fs.readFileSync(path.join(WEB_FUNCTIONS, relative), 'utf8');

(webRepoPresent ? describe : describe.skip)('the web repo still writes what CONTRACT assumes', () => {
  it('each subscription event maps to the status CONTRACT uses', () => {
    const source = readWeb('_shared/entitlement.ts');
    const expected: Record<string, string> = {
      'subscription.active': 'active',
      'subscription.renewed': 'active',
      'subscription.plan_changed': 'active',
      'subscription.past_due': 'past_due',
      'subscription.on_hold': 'past_due',
      'subscription.cancelled': 'cancelled',
      'subscription.expired': 'expired',
      'subscription.failed': 'expired',
    };
    for (const [event, status] of Object.entries(expected)) {
      expect(source).toMatch(new RegExp(`'${event.replace('.', '\\.')}':\\s*'${status}'`));
    }
  });

  it('a failed renewal still gets the 3-day floor', () => {
    expect(readWeb('_shared/entitlement.ts')).toMatch(/PAST_DUE_GRACE_MS = 3 \* 24 \* 3600 \* 1000/);
  });

  it('refunds and disputes still revoke', () => {
    expect(readWeb('dodo-webhook/handler.ts')).toMatch(/status: 'revoked'/);
  });

  it("the expiry sweep still waits less than the app's late-renewal grace", () => {
    const match = readWeb('winback-sweep/handler.ts').match(/ACTIVE_EXPIRY_GRACE_MS = (\d+) \* DAY/);
    expect(match).not.toBeNull();
    expect(ACTIVE_LATE_RENEWAL_GRACE_MS).toBeGreaterThan(Number(match![1]) * DAY);
  });
});
