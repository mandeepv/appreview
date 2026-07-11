// SPEC-18 R2 — the lesson-locking policy kernel.
//
// Duolingo-style sequential locking, decided by two pure functions (same
// compute→act philosophy as src/navigation/routingPolicy.ts): the screen reads
// local progress + the session's signup date, calls resolveUnlockState to get a
// per-lesson state map, then renders. No I/O, no navigation, no imports beyond
// the canonical order — given the same input it always returns the same map.
//
// TWO cohorts:
//   - LEGACY (signed up before LOCKING_CUTOFF_ISO, or demo, or unknown date):
//     every lesson unlocked — exactly today's behavior. This fully replaces
//     per-lesson progress-grandfathering: anyone with pre-v1.5.0 progress by
//     definition signed up before the cutoff, so they're legacy and never see a
//     lock (including the lessons-1–4 cohort whose completions were never
//     recorded before SPEC-18 R1).
//   - SEQUENTIAL (signed up at/after the cutoff): lesson N unlocks when lesson
//     N−1 is complete, with a belt-and-braces "any recorded progress never
//     locks" rule for the upgrade-window edge case (see below).

// The canonical lesson order — one explicit array, matching LearnScreen's
// learningModules 1→13 order (and the LESSON_NAV slugs). This is the SINGLE
// source of order; LearnScreen renders from it. Keeping it here (a pure module,
// no component imports) lets the R4 integrity test assert it against the
// registry + nav table without touching a screen.
export const LESSON_PATH = [
  'lesson1',
  'lesson2',
  'lesson3',
  'lesson4',
  'labelingEmotions',
  'namingEmotions',
  'sprinklers',
  'emotionalSandbags',
  'communicationMistakes',
  'helpingProcessEmotions',
  'dissociation',
  'serveReturn',
  'recordingDeepBondMoments',
] as const;

export type LessonSlug = (typeof LESSON_PATH)[number];

// The signup-date cutoff dividing legacy (all-unlocked) from sequential users.
//
// PLACEHOLDER until set at the v1.5.0 version boundary (DECISION 1). The final
// pre-tag commit replaces this with the real submission/release moment so every
// account that exists before locking ships is legacy. A far-future placeholder
// would lock nobody; a far-PAST placeholder would lock everybody — so this MUST
// be set deliberately. The value is a UTC ISO 8601 timestamp.
//
// NOTE: kept far in the future so that if it somehow ships unset, the failure is
// SAFE (everyone is legacy = everyone unlocked = today's behavior), never the
// dangerous direction (locking existing users out).
export const LOCKING_CUTOFF_ISO = '2099-01-01T00:00:00.000Z';

/** Per-lesson visual/interaction state the screen renders. */
export type LessonUnlockState = 'completed' | 'unlocked' | 'locked';

export interface UnlockPolicyInput {
  /**
   * The Supabase user's `created_at` (already on the authStore user, persisted
   * with the session — no network read). null when signed out / unavailable.
   */
  signupDateIso: string | null;
  /** The App-Review demo bypass — always all-unlocked (reviewer browses all). */
  isDemoUser: boolean;
  /** slug → true iff every section of that lesson is complete. */
  completedBySlug: Record<string, boolean>;
  /** slug → true iff the lesson has ≥1 recorded section (any progress). */
  hasProgressBySlug: Record<string, boolean>;
}

/**
 * Whether the session belongs to the LEGACY cohort (all lessons unlocked).
 *
 * Fail OPEN: demo users, a missing/unparsable signup date, and any date before
 * the cutoff all resolve to legacy. We never lock an EXISTING user out of
 * previously-accessible content because of a parse bug — genuinely new users
 * always have a valid `created_at`, so the only accounts that hit the
 * null/garbage branch are ones we shouldn't be locking anyway. Why-commented
 * per the spec.
 */
export function isLegacyCohort(input: Pick<UnlockPolicyInput, 'signupDateIso' | 'isDemoUser'>): boolean {
  if (input.isDemoUser) return true;
  if (!input.signupDateIso) return true; // no date → fail open (legacy)

  const signupMs = Date.parse(input.signupDateIso);
  const cutoffMs = Date.parse(LOCKING_CUTOFF_ISO);
  if (Number.isNaN(signupMs)) return true; // unparsable → fail open (legacy)

  // Signed up strictly before the cutoff → legacy. Exactly at / after → subject
  // to sequential locking.
  return signupMs < cutoffMs;
}

/**
 * Resolve the per-lesson unlock state for the whole path.
 *
 * Legacy cohort → every lesson is 'completed' (where recorded) or 'unlocked'.
 * Sequential cohort:
 *   - Lesson 1 is always unlocked.
 *   - Lesson N is unlocked iff lesson N−1 is COMPLETED (all sections done).
 *   - Belt-and-braces: a lesson with ANY recorded progress is never 'locked',
 *     regardless of chain position. This covers the residual upgrade window — a
 *     post-cutoff signup can spend weeks on a pre-v1.5.0 binary (no locking)
 *     making mid-path progress before updating; locking a lesson they're
 *     visibly partway through would read as data loss. Why-commented per spec.
 *   - Completed lessons stay 'completed' (tappable forever — replay allowed).
 *
 * Unknown slugs in the progress maps are ignored; only LESSON_PATH drives output.
 */
export function resolveUnlockState(input: UnlockPolicyInput): Record<string, LessonUnlockState> {
  const { completedBySlug, hasProgressBySlug } = input;
  const legacy = isLegacyCohort(input);

  const result: Record<string, LessonUnlockState> = {};
  let previousCompleted = true; // lesson 1's "predecessor" is treated as done

  for (const slug of LESSON_PATH) {
    const isCompleted = completedBySlug[slug] === true;
    const hasProgress = hasProgressBySlug[slug] === true;

    if (isCompleted) {
      // Completed always wins — full-color card, replay allowed.
      result[slug] = 'completed';
    } else if (legacy) {
      // Legacy cohort: everything not completed is simply unlocked.
      result[slug] = 'unlocked';
    } else if (previousCompleted || hasProgress) {
      // Sequential: predecessor done (or first lesson), OR the user already has
      // progress here (upgrade-window belt-and-braces) → unlocked.
      result[slug] = 'unlocked';
    } else {
      result[slug] = 'locked';
    }

    // The chain gate for the NEXT lesson is strictly "is THIS one complete".
    // Progress-without-completion unlocks the current lesson (above) but does
    // NOT cascade the chain forward — you still must finish it to unlock N+1.
    previousCompleted = isCompleted;
  }

  return result;
}
