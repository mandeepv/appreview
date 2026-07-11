// SPEC-19 R4 — computeStreak, tested exhaustively (pure, deterministic).
//
// `today` is always injected; every case names it explicitly. Dates are
// device-local 'YYYY-MM-DD' strings. The freeze rule: at most one bridged
// (missing) day per rolling 7 days of the run.

import { computeStreak } from '../computeStreak';

describe('computeStreak — basic runs', () => {
  it('empty history → zeros, not at risk', () => {
    expect(computeStreak([], '2026-07-12')).toEqual({
      current: 0,
      longest: 0,
      freezeUsedOn: null,
      atRisk: false,
    });
  });

  it('today only → current 1', () => {
    const r = computeStreak(['2026-07-12'], '2026-07-12');
    expect(r.current).toBe(1);
    expect(r.longest).toBe(1);
    expect(r.atRisk).toBe(false);
    expect(r.freezeUsedOn).toBeNull();
  });

  it('three consecutive days ending today → current 3', () => {
    const r = computeStreak(['2026-07-10', '2026-07-11', '2026-07-12'], '2026-07-12');
    expect(r.current).toBe(3);
    expect(r.longest).toBe(3);
    expect(r.atRisk).toBe(false);
  });

  it('unsorted + duplicated input tolerated', () => {
    const r = computeStreak(
      ['2026-07-12', '2026-07-10', '2026-07-11', '2026-07-11', '2026-07-12'],
      '2026-07-12',
    );
    expect(r.current).toBe(3);
  });
});

describe('computeStreak — atRisk (today not yet active)', () => {
  it('active through yesterday, today empty → streak preserved, atRisk', () => {
    const r = computeStreak(['2026-07-10', '2026-07-11'], '2026-07-12');
    expect(r.current).toBe(2);
    expect(r.atRisk).toBe(true);
  });

  it('last activity was 2 days ago (yesterday missing) → today is the bridge slot, atRisk', () => {
    // day-before-yesterday active, yesterday missing, today empty. Looking from
    // today, yesterday would be bridged → run through day-2 preserved, at risk.
    const r = computeStreak(['2026-07-09', '2026-07-10'], '2026-07-12');
    expect(r.current).toBe(2);
    expect(r.atRisk).toBe(true);
  });

  it('last activity 3+ days ago → streak lost', () => {
    const r = computeStreak(['2026-07-08', '2026-07-09'], '2026-07-12');
    expect(r.current).toBe(0);
    expect(r.atRisk).toBe(false);
  });

  it('SPEC-FIX-11 R5.8 — ACCEPTED edge: at-risk can exceed what completing today yields (pinned)', () => {
    // today 07-12 inactive; 07-11 missing (gap A, adjacent to today), 07-10
    // active, 07-09 missing (gap B), 07-08 + 07-07 active. Walking at-risk as if
    // today WILL be bridged lets BOTH gaps bridge → current 3.
    const atRisk = computeStreak(['2026-07-10', '2026-07-08', '2026-07-07'], '2026-07-12');
    expect(atRisk.atRisk).toBe(true);
    expect(atRisk.current).toBe(3);

    // But once the user actually completes today, today is a REAL active day, so
    // it no longer counts as a bridge — and the two gaps can't both bridge inside
    // the rolling-7 window → current drops to 2. This DROP-after-completing is the
    // accepted display artifact; pinned so a future change is deliberate.
    const afterToday = computeStreak(['2026-07-12', '2026-07-10', '2026-07-08', '2026-07-07'], '2026-07-12');
    expect(afterToday.atRisk).toBe(false);
    expect(afterToday.current).toBe(2);
    expect(afterToday.current).toBeLessThan(atRisk.current);
  });
});

describe('computeStreak — freeze / grace (one bridge per rolling 7 days)', () => {
  it('a single missed day inside the run is bridged and reported', () => {
    // 07-08, 07-09, [07-10 missing], 07-11, 07-12 (today). One gap bridged.
    const r = computeStreak(['2026-07-08', '2026-07-09', '2026-07-11', '2026-07-12'], '2026-07-12');
    expect(r.current).toBe(4); // 4 active days, the gap bridged
    expect(r.freezeUsedOn).toBe('2026-07-10');
  });

  it('two gaps within 7 days → the run breaks at the second gap', () => {
    // today 07-12. 07-12, 07-11, [07-10 gap #1 bridged], 07-09, [07-08 gap #2 —
    // within 7 days of the first bridge → NOT allowed], 07-07...
    const r = computeStreak(
      ['2026-07-12', '2026-07-11', '2026-07-09', '2026-07-07'],
      '2026-07-12',
    );
    // Run: 07-12, 07-11, bridge 07-10, 07-09 → stops at 07-08 (second gap not
    // bridgeable within the rolling-7 window). current = 3 active days.
    expect(r.current).toBe(3);
    expect(r.freezeUsedOn).toBe('2026-07-10');
  });

  it('two gaps 8+ days apart are both bridged', () => {
    // A long run with a gap, then >7 active days, then another gap — both bridge.
    const dates = [
      '2026-07-20', // today
      '2026-07-19',
      // gap 07-18 (bridge #1)
      '2026-07-17',
      '2026-07-16',
      '2026-07-15',
      '2026-07-14',
      '2026-07-13',
      '2026-07-12',
      '2026-07-11',
      // gap 07-10 (bridge #2 — 9 days after bridge #1, allowed)
      '2026-07-09',
      '2026-07-08',
    ];
    const r = computeStreak(dates, '2026-07-20');
    // 11 active days, both gaps bridged.
    expect(r.current).toBe(11);
    // freezeUsedOn reports the most-recent bridge.
    expect(r.freezeUsedOn).toBe('2026-07-18');
  });

  it('alternating-day usage does NOT sustain a streak', () => {
    // every other day: 07-12, 07-10, 07-08, 07-06. First gap (07-11) bridges,
    // but the next gap (07-09) is within 7 days → break. So current is just the
    // bridged front: 07-12, 07-10 = 2.
    const r = computeStreak(['2026-07-12', '2026-07-10', '2026-07-08', '2026-07-06'], '2026-07-12');
    expect(r.current).toBe(2);
  });
});

describe('computeStreak — longest vs current', () => {
  it('longest reflects a past run longer than the current one', () => {
    // Past run of 5 (06-01..06-05), then a long gap, then current run of 2.
    const dates = [
      '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05',
      '2026-07-11', '2026-07-12',
    ];
    const r = computeStreak(dates, '2026-07-12');
    expect(r.current).toBe(2);
    expect(r.longest).toBe(5);
  });

  it('longest survives even when current is 0', () => {
    const dates = ['2026-06-01', '2026-06-02', '2026-06-03'];
    const r = computeStreak(dates, '2026-07-12');
    expect(r.current).toBe(0);
    expect(r.longest).toBe(3);
  });
});

describe('computeStreak — calendar boundaries', () => {
  it('bridges a month boundary', () => {
    // 06-30 active, [07-01 missing], 07-02 active, today 07-02.
    const r = computeStreak(['2026-06-29', '2026-06-30', '2026-07-02'], '2026-07-02');
    expect(r.current).toBe(3);
    expect(r.freezeUsedOn).toBe('2026-07-01');
  });

  it('bridges a year boundary', () => {
    const r = computeStreak(['2025-12-30', '2025-12-31', '2026-01-02'], '2026-01-02');
    expect(r.current).toBe(3);
    expect(r.freezeUsedOn).toBe('2026-01-01');
  });
});
