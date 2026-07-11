// SPEC-18 R4 — the locking policy kernel, tested exhaustively (pure, no render).
//
// Mirrors the routingPolicy test style: cover every branch of the two cohorts
// and the fail-open cases, so a regression in the lock rules is caught here
// rather than on a device.

import {
  LESSON_PATH,
  LOCKING_CUTOFF_ISO,
  resolveUnlockState,
  isLegacyCohort,
  resolveLessonTap,
} from '../unlockPolicy';

// A date safely before / after the cutoff, derived from the constant so the test
// survives the boundary edit (DECISION 1) without churn.
const cutoffMs = Date.parse(LOCKING_CUTOFF_ISO);
const BEFORE = new Date(cutoffMs - 86_400_000).toISOString(); // 1 day before
const AFTER = new Date(cutoffMs + 86_400_000).toISOString(); // 1 day after

// Build the completed/hasProgress maps from a list of completed + partial slugs.
function maps(completed: string[], partial: string[] = []) {
  const completedBySlug: Record<string, boolean> = {};
  const hasProgressBySlug: Record<string, boolean> = {};
  for (const s of completed) {
    completedBySlug[s] = true;
    hasProgressBySlug[s] = true;
  }
  for (const s of partial) hasProgressBySlug[s] = true;
  return { completedBySlug, hasProgressBySlug };
}

describe('isLegacyCohort — fail open', () => {
  it('demo user is always legacy (regardless of date)', () => {
    expect(isLegacyCohort({ isDemoUser: true, signupDateIso: AFTER })).toBe(true);
  });
  it('signup before the cutoff is legacy', () => {
    expect(isLegacyCohort({ isDemoUser: false, signupDateIso: BEFORE })).toBe(true);
  });
  it('signup at/after the cutoff is NOT legacy (sequential)', () => {
    expect(isLegacyCohort({ isDemoUser: false, signupDateIso: AFTER })).toBe(false);
    expect(isLegacyCohort({ isDemoUser: false, signupDateIso: LOCKING_CUTOFF_ISO })).toBe(false);
  });
  it('null signup date fails open (legacy)', () => {
    expect(isLegacyCohort({ isDemoUser: false, signupDateIso: null })).toBe(true);
  });
  it('garbage signup date fails open (legacy)', () => {
    expect(isLegacyCohort({ isDemoUser: false, signupDateIso: 'not-a-date' })).toBe(true);
  });
});

describe('resolveUnlockState — legacy cohort', () => {
  it('signup before cutoff → every lesson unlocked, completed where recorded', () => {
    const { completedBySlug, hasProgressBySlug } = maps(['lesson1', 'sprinklers']);
    const r = resolveUnlockState({ signupDateIso: BEFORE, isDemoUser: false, completedBySlug, hasProgressBySlug });
    for (const slug of LESSON_PATH) {
      expect(r[slug]).toBe(slug === 'lesson1' || slug === 'sprinklers' ? 'completed' : 'unlocked');
    }
  });

  it('demo user → all unlocked regardless of date', () => {
    const { completedBySlug, hasProgressBySlug } = maps([]);
    const r = resolveUnlockState({ signupDateIso: AFTER, isDemoUser: true, completedBySlug, hasProgressBySlug });
    expect(Object.values(r).every((s) => s === 'unlocked')).toBe(true);
  });

  it('null/garbage date → all unlocked (fail open)', () => {
    const { completedBySlug, hasProgressBySlug } = maps([]);
    for (const date of [null, 'garbage']) {
      const r = resolveUnlockState({ signupDateIso: date, isDemoUser: false, completedBySlug, hasProgressBySlug });
      expect(Object.values(r).every((s) => s === 'unlocked')).toBe(true);
    }
  });
});

describe('resolveUnlockState — sequential cohort (post-cutoff)', () => {
  const base = { signupDateIso: AFTER, isDemoUser: false };

  it('empty progress → only lesson 1 unlocked, rest locked', () => {
    const r = resolveUnlockState({ ...base, ...maps([]) });
    expect(r[LESSON_PATH[0]]).toBe('unlocked');
    for (const slug of LESSON_PATH.slice(1)) expect(r[slug]).toBe('locked');
  });

  it('chain unlock: completing lesson N unlocks N+1', () => {
    const r = resolveUnlockState({ ...base, ...maps(['lesson1']) });
    expect(r['lesson1']).toBe('completed');
    expect(r['lesson2']).toBe('unlocked');
    expect(r['lesson3']).toBe('locked');
  });

  it('all complete → all completed', () => {
    const r = resolveUnlockState({ ...base, ...maps([...LESSON_PATH]) });
    expect(Object.values(r).every((s) => s === 'completed')).toBe(true);
  });

  it('mid-path partial progress: a lesson with progress is not locked, but the chain past it stays locked', () => {
    // Lesson 7 (sprinklers) has partial progress; 2–6 untouched. Post-cutoff,
    // the upgrade-window belt-and-braces keeps sprinklers unlocked, but the
    // chain (2..6, and 8 which needs 7 COMPLETE) stays locked.
    const r = resolveUnlockState({ ...base, ...maps([], ['sprinklers']) });
    expect(r['lesson1']).toBe('unlocked'); // first always
    expect(r['lesson2']).toBe('locked');
    expect(r['sprinklers']).toBe('unlocked'); // has progress → never locked
    expect(r['emotionalSandbags']).toBe('locked'); // needs sprinklers COMPLETE
  });

  it('completing a lesson always renders completed even mid-chain', () => {
    const r = resolveUnlockState({ ...base, ...maps(['sprinklers']) });
    expect(r['sprinklers']).toBe('completed'); // replay allowed
    expect(r['emotionalSandbags']).toBe('unlocked'); // predecessor complete
  });

  it('unknown slugs in the maps are ignored (only LESSON_PATH drives output)', () => {
    const r = resolveUnlockState({
      ...base,
      completedBySlug: { madeUpSlug: true },
      hasProgressBySlug: { madeUpSlug: true },
    });
    expect(r['madeUpSlug']).toBeUndefined();
    expect(Object.keys(r).sort()).toEqual([...LESSON_PATH].sort());
  });
});

describe('resolveLessonTap', () => {
  it('locked → blocked with the predecessor slug', () => {
    expect(resolveLessonTap('lesson2', 'locked')).toEqual({ kind: 'blocked', blockingSlug: 'lesson1' });
    // sprinklers is index 6 in LESSON_PATH → predecessor is namingEmotions (index 5).
    expect(resolveLessonTap('sprinklers', 'locked')).toEqual({ kind: 'blocked', blockingSlug: 'namingEmotions' });
  });
  it('unlocked and completed both navigate', () => {
    expect(resolveLessonTap('lesson2', 'unlocked')).toEqual({ kind: 'navigate' });
    expect(resolveLessonTap('lesson2', 'completed')).toEqual({ kind: 'navigate' });
  });
  it('a locked first lesson has no blocker (defensive — lesson 1 is never locked)', () => {
    expect(resolveLessonTap('lesson1', 'locked')).toEqual({ kind: 'blocked', blockingSlug: null });
  });
});
