// The app's web access rule (isWebEntitled) against the table of cases the
// website's hasAccess and redeem-handoff's hasWebAccess also run over —
// supabase/functions/_shared/access_rule_cases.json, byte-identical in both
// repos (scripts/check-migration-parity.sh compares it). This replaces
// leaning on webEntitlementContract's cross-repo block, which needs the web
// repo checked out next to this one and so is skipped in CI (web2app review
// 2026-10-07, AP-3/XR-3).
import { isWebEntitled } from '../webEntitlement';
import table from '../../../supabase/functions/_shared/access_rule_cases.json';

type Case = { status: string; hours_after_end: number | null; entitled: boolean; why: string };
const cases = table.cases as Case[];

const NOW = new Date('2026-11-01T09:00:00.000Z');

describe('the web access rule, case by case', () => {
  it('has cases to run', () => {
    expect(cases.length).toBeGreaterThan(10);
  });

  it.each(cases)('$status, $hours_after_end h after the end → $entitled ($why)', (c) => {
    const end = c.hours_after_end === null ? null : new Date(NOW.getTime() - c.hours_after_end * 3600 * 1000).toISOString();
    expect(isWebEntitled({ status: c.status, current_period_end: end, product_id: 'pdt_annual' }, NOW)).toBe(c.entitled);
  });
});
