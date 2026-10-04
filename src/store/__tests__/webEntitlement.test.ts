// Web purchases (2026-10) — the access rule for a kinderwell.app purchase.
// One case per row of the spec's status table, plus the date edge cases the
// app must catch itself (the server only expires rows hourly, with grace).

import { isWebEntitled, type WebEntitlementRow } from '../webEntitlement';

const NOW = new Date('2026-10-04T12:00:00Z');
const FUTURE = '2026-11-04T12:00:00Z';
const PAST = '2026-10-01T12:00:00Z';

const row = (status: string, current_period_end: string | null): WebEntitlementRow => ({
  status,
  current_period_end,
  product_id: 'pdt_annual',
});

describe('isWebEntitled', () => {
  it('active + future → entitled', () => {
    expect(isWebEntitled(row('active', FUTURE), NOW)).toBe(true);
  });

  it('active + past → not entitled (the app checks the date itself)', () => {
    expect(isWebEntitled(row('active', PAST), NOW)).toBe(false);
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

  it('a period ending exactly now → not entitled', () => {
    expect(isWebEntitled(row('active', NOW.toISOString()), NOW)).toBe(false);
  });

  it('an unknown status → not entitled', () => {
    expect(isWebEntitled(row('trialing', FUTURE), NOW)).toBe(false);
  });
});
