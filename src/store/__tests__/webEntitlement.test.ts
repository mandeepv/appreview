// Web purchases (2026-10) — the access rule for a kinderwell.app purchase.
// One case per row of the spec's status table, plus the date edge cases the
// app must catch itself (the server only expires rows when its sweep runs).

import * as fs from 'fs';
import * as path from 'path';
import {
  ACTIVE_LATE_RENEWAL_GRACE_MS,
  isWebEntitled,
  type WebEntitlementRow,
} from '../webEntitlement';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const NOW = new Date('2026-10-04T12:00:00Z');
const FUTURE = '2026-11-04T12:00:00Z';
const PAST = '2026-10-01T12:00:00Z';
const before = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

const row = (status: string, current_period_end: string | null): WebEntitlementRow => ({
  status,
  current_period_end,
  product_id: 'pdt_annual',
});

describe('isWebEntitled', () => {
  it('active + future → entitled', () => {
    expect(isWebEntitled(row('active', FUTURE), NOW)).toBe(true);
  });

  it('past_due + future → entitled (Dodo is retrying the card)', () => {
    expect(isWebEntitled(row('past_due', FUTURE), NOW)).toBe(true);
  });

  it('cancelled + future → entitled until the period ends, like Apple', () => {
    expect(isWebEntitled(row('cancelled', FUTURE), NOW)).toBe(true);
  });

  it('cancelled + past → not entitled', () => {
    expect(isWebEntitled(row('cancelled', PAST), NOW)).toBe(false);
  });

  it('revoked + future → NOT entitled (refund or chargeback, immediately)', () => {
    expect(isWebEntitled(row('revoked', FUTURE), NOW)).toBe(false);
  });

  it('expired → not entitled, whatever the date', () => {
    expect(isWebEntitled(row('expired', FUTURE), NOW)).toBe(false);
    expect(isWebEntitled(row('expired', PAST), NOW)).toBe(false);
  });

  it('null current_period_end → not entitled', () => {
    expect(isWebEntitled(row('active', null), NOW)).toBe(false);
  });

  it('no row → not entitled', () => {
    expect(isWebEntitled(null, NOW)).toBe(false);
    expect(isWebEntitled(undefined, NOW)).toBe(false);
  });

  it('an unparseable date → not entitled', () => {
    expect(isWebEntitled(row('active', 'not a date'), NOW)).toBe(false);
  });

  it('a cancelled period ending exactly now → not entitled', () => {
    expect(isWebEntitled(row('cancelled', NOW.toISOString()), NOW)).toBe(false);
  });

  it('an unknown status → not entitled', () => {
    expect(isWebEntitled(row('trialing', FUTURE), NOW)).toBe(false);
  });
});

// Web review P1-8: Dodo bills at period end and then sends the renewal webhook.
// Until it lands, the row is still `active` with the old date. The server waits
// 5 days before expiring such a row (and asks Dodo first); the app used to cut
// access at the old date, sending a customer who had just paid to the Apple
// paywall. These lock in that a late webhook no longer locks a payer out — and
// that the grace is for `active` alone.
describe('isWebEntitled — late renewal webhook (P1-8)', () => {
  it('active, an hour past its period end → still entitled', () => {
    expect(isWebEntitled(row('active', before(HOUR)), NOW)).toBe(true);
  });

  it('active, 3 days past → still entitled', () => {
    expect(isWebEntitled(row('active', PAST), NOW)).toBe(true);
  });

  it('active, a minute before the grace runs out → still entitled', () => {
    expect(isWebEntitled(row('active', before(ACTIVE_LATE_RENEWAL_GRACE_MS - 60_000)), NOW)).toBe(true);
  });

  it('active, exactly at the end of the grace → not entitled', () => {
    expect(isWebEntitled(row('active', before(ACTIVE_LATE_RENEWAL_GRACE_MS)), NOW)).toBe(false);
  });

  it('active, 30 days past → not entitled (the app still checks the date itself)', () => {
    expect(isWebEntitled(row('active', before(30 * DAY)), NOW)).toBe(false);
  });

  // The webhook sets these dates deliberately (a 3-day floor for a failing
  // card; never earlier than the paid period), so they get no extra time.
  it('past_due, an hour past its period end → not entitled', () => {
    expect(isWebEntitled(row('past_due', before(HOUR)), NOW)).toBe(false);
  });

  it('cancelled, an hour past its period end → not entitled', () => {
    expect(isWebEntitled(row('cancelled', before(HOUR)), NOW)).toBe(false);
  });
});

// The app must never give up on an `active` row before the server has had its
// chance to heal or expire it. The server's wait lives in SQL, so read it from
// the newest migration that (re)defines expire_stale_entitlements(): raising it
// there without raising ACTIVE_LATE_RENEWAL_GRACE_MS fails here. (The winback
// sweep's ACTIVE_EXPIRY_GRACE_MS in the web repo must match that same SQL.)
describe('the active grace covers the server sweep', () => {
  it('is at least a day longer than expire_stale_entitlements() waits on active rows', () => {
    const dir = path.join(__dirname, '..', '..', '..', 'supabase', 'migrations');
    const definers = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort()
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
      .filter((sql) => /create or replace function public\.expire_stale_entitlements\(\)/i.test(sql));
    expect(definers.length).toBeGreaterThan(0);

    const newest = definers[definers.length - 1];
    const match = newest.match(
      /status = 'active' and current_period_end < now\(\) - interval '(\d+) days?'/i,
    );
    // No match means the sweep's SQL changed shape: re-read it and update both
    // this pattern and the grace together.
    expect(match).not.toBeNull();

    const sweepDays = Number(match![1]);
    expect(ACTIVE_LATE_RENEWAL_GRACE_MS).toBeGreaterThanOrEqual((sweepDays + 1) * DAY);
  });
});
