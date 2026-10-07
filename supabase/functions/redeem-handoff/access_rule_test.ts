// deno test (the table is a static JSON import: no read permission needed)
// redeem-handoff's copy of the web access rule against the table the app's
// isWebEntitled and the website's hasAccess also run over
// (../_shared/access_rule_cases.json; web2app review 2026-10-07, AP-3/XR-3).
import { assertEquals } from 'jsr:@std/assert@1';
import { hasWebAccess } from './handler.ts';
import table from '../_shared/access_rule_cases.json' with { type: 'json' };

type Case = { status: string; hours_after_end: number | null; entitled: boolean; why: string };
const cases = table.cases as Case[];
const NOW = new Date('2026-11-01T09:00:00.000Z');

for (const c of cases) {
  Deno.test(`access rule: ${c.status}, ${c.hours_after_end ?? 'no end'} h after the end → ${c.entitled} (${c.why})`, () => {
    const end = c.hours_after_end === null ? null : new Date(NOW.getTime() - c.hours_after_end * 3600 * 1000).toISOString();
    assertEquals(hasWebAccess({ status: c.status, current_period_end: end }, NOW), c.entitled);
  });
}
