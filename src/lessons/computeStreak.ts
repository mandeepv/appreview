// SPEC-19 R2 — the streak semantics, as a pure function.
//
// We store FACTS (which local days had activity) and DERIVE the streak here. No
// stored counter to corrupt or migrate. `today` is ALWAYS a parameter (never a
// `new Date()` inside) so tests are deterministic and the midnight-crossing UI
// stays honest.
//
// Dates are device-local calendar dates as 'YYYY-MM-DD' strings. All arithmetic
// is done on those strings via a UTC-noon anchor (see toDayNumber) purely to
// count day-deltas — this is calendar math on already-local dates, NOT a UTC
// conversion of the user's clock, so no timezone skew is introduced.

export interface StreakResult {
  /** Consecutive active days ending at today or yesterday (see atRisk). */
  current: number;
  /** Best run ever, under the same freeze rule. */
  longest: number;
  /** The single date bridged by the freeze while computing `current`, if any. */
  freezeUsedOn: string | null;
  /** True when the streak is intact through yesterday but today isn't active yet. */
  atRisk: boolean;
}

// Convert 'YYYY-MM-DD' to an integer day index for delta math. Anchored at UTC
// noon so DST / offset never rounds a date across a boundary — we only ever take
// differences, so the absolute anchor is irrelevant, only that it's consistent.
function toDayNumber(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d, 12, 0, 0) / 86_400_000);
}

/**
 * Compute the streak from a list of activity dates.
 *
 * Freeze/grace rule: while walking a run backwards, a SINGLE missed day inside
 * the run is bridged automatically — at most ONE bridge per rolling 7 days of
 * the run. So a long streak survives one slip a week, but alternating-day usage
 * (a gap every other day) does NOT sustain a streak. No user-managed freeze
 * inventory in v1 — automatic and free. The bridged date (for the CURRENT run)
 * is reported as `freezeUsedOn`.
 *
 * `current` is the run ending at `today`; if today has no activity yet but
 * yesterday did (or is bridgeable), the streak is preserved and `atRisk` is
 * true ("do a lesson today to keep it").
 *
 * Input may be unsorted / duplicated — it's normalised to a unique set first.
 */
export function computeStreak(activityDates: string[], today: string): StreakResult {
  // Normalise: unique, valid 'YYYY-MM-DD' only, as a day-number set.
  const daySet = new Set<number>();
  for (const iso of activityDates) {
    if (typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      daySet.add(toDayNumber(iso));
    }
  }
  const todayNum = toDayNumber(today);

  // longest is computed over the whole history; current is the run ending at
  // today/yesterday. Both use the same walk-back-with-one-bridge-per-7-days
  // logic, so we share a single helper.
  const dayNumberToIso = (n: number): string => {
    const dateMs = n * 86_400_000 + 12 * 3_600_000; // reverse the noon anchor
    const dt = new Date(dateMs);
    const y = dt.getUTCFullYear();
    const mo = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const da = String(dt.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${da}`;
  };

  /**
   * Walk backwards from `endDay` (inclusive) counting consecutive active days,
   * bridging at most one gap per rolling 7 days of the run. `endDay` MUST be an
   * active day (the caller guarantees it). Returns the run length and the first
   * (most-recent) bridged day, if any.
   */
  const walkRun = (endDay: number): { length: number; firstBridge: number | null } => {
    let length = 0;
    let firstBridge: number | null = null;
    // Days (relative offsets, most-recent first) where a bridge was spent —
    // used to enforce "at most one bridge per rolling 7 days OF THE RUN".
    const bridgeOffsets: number[] = [];
    let cursor = endDay;
    let offsetFromEnd = 0;

    while (true) {
      if (daySet.has(cursor)) {
        length += 1;
        cursor -= 1;
        offsetFromEnd += 1;
        continue;
      }
      // `cursor` is a missing day. Try to bridge it: allowed only if the day
      // BEFORE it is active (a bridge spans exactly one missing day) AND we
      // haven't already spent a bridge within the last rolling 7 days of the run.
      const dayBefore = cursor - 1;
      const recentBridge = bridgeOffsets.some((o) => offsetFromEnd - o < 7);
      if (daySet.has(dayBefore) && !recentBridge) {
        // Spend a bridge on `cursor`; the run continues at dayBefore.
        bridgeOffsets.push(offsetFromEnd);
        if (firstBridge === null) firstBridge = cursor;
        // The bridged (missing) day does NOT count toward length; the run's
        // length is active days only.
        cursor -= 1; // step onto dayBefore (active) — next loop counts it
        offsetFromEnd += 1;
        continue;
      }
      break; // gap can't be bridged → run ends
    }
    return { length, firstBridge };
  };

  // --- current -------------------------------------------------------------
  let current = 0;
  let freezeUsedOn: string | null = null;
  let atRisk = false;

  if (daySet.has(todayNum)) {
    // Today active → run ends at today, not at risk.
    const run = walkRun(todayNum);
    current = run.length;
    freezeUsedOn = run.firstBridge !== null ? dayNumberToIso(run.firstBridge) : null;
    atRisk = false;
  } else {
    // Today not active yet. The streak is preserved if yesterday is active, OR
    // if today itself is bridgeable (yesterday missing but the day before is
    // active and a bridge is available). Either way it's atRisk until today is
    // done.
    const yesterday = todayNum - 1;
    if (daySet.has(yesterday)) {
      const run = walkRun(yesterday);
      current = run.length;
      freezeUsedOn = run.firstBridge !== null ? dayNumberToIso(run.firstBridge) : null;
      atRisk = current > 0;
    } else if (daySet.has(todayNum - 2)) {
      // Yesterday missing but the day-before is active: today's slot would be
      // bridged the moment we look from today. Report the run ending at
      // day-before, at risk, with today implicitly the bridge candidate.
      const run = walkRun(todayNum - 2);
      current = run.length;
      freezeUsedOn = run.firstBridge !== null ? dayNumberToIso(run.firstBridge) : null;
      atRisk = current > 0;
    } else {
      current = 0;
      atRisk = false;
    }
  }

  // --- longest -------------------------------------------------------------
  // Best run ever: walk a run from every active day that is a run's END (i.e.
  // the day after it is inactive), take the max length. Bridged days are handled
  // inside walkRun, so ending days are those with no active day immediately after.
  let longest = 0;
  for (const day of daySet) {
    // A run "ends" at `day` if day+1 is not active AND day+1 is not itself a
    // bridged continuation. Simplest correct approach: only consider days whose
    // successor is inactive as run-ends (a bridge is always followed by an active
    // day, so it can't be a run-end). This enumerates each maximal run once.
    if (!daySet.has(day + 1)) {
      const run = walkRun(day);
      if (run.length > longest) longest = run.length;
    }
  }
  // `current` can exceed a naive longest only in the atRisk-bridge edge; keep
  // longest ≥ current for consistency.
  if (current > longest) longest = current;

  return { current, longest, freezeUsedOn, atRisk };
}
