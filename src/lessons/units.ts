/**
 * The Learn path, grouped into units.
 *
 * Pure data, no React — so the ordering can be unit-tested without a simulator
 * (same constraint as lessonRoutes.ts).
 *
 * WHY UNITS. The Learn screen was a flat list of thirteen lessons, which asks a
 * tired parent to choose rather than continue. Chunking into four named units
 * turns "thirteen things" into "four short stretches", and gives progress
 * somewhere to land: a unit can be finished even when the path cannot.
 *
 * ORDER IS THE EXISTING ORDER. These are the same thirteen lessons in the same
 * sequence LearnScreen already rendered — the units are a grouping over that
 * order, not a re-teach. The `id` values match LESSON_NAV, so navigation is
 * unchanged.
 *
 * NOTHING IS LOCKED. This is a subscription app; a paying parent who wants
 * lesson nine tonight gets lesson nine. The path RECOMMENDS a next step by
 * emphasising it, and every other lesson stays openable. "Next" is an
 * invitation, never a gate.
 */

export type UnitId = 'foundations' | 'naming' | 'bond' | 'hard';

export interface PathLesson {
  /** Matches the key in LESSON_NAV — the existing navigation contract. */
  id: string;
  /** Registry slug, used to read whole-lesson completion. */
  slug: string;
  title: string;
}

export interface PathUnit {
  id: UnitId;
  /** Shown as "Unit 2 · Naming what they feel". */
  name: string;
  lessons: PathLesson[];
}

export const PATH_UNITS: PathUnit[] = [
  {
    id: 'foundations',
    name: 'Where this comes from',
    lessons: [
      { id: '1', slug: 'lesson1', title: 'What changed parenting Science?' },
      { id: '2', slug: 'lesson2', title: 'Happiness Chemicals' },
      { id: '3', slug: 'lesson3', title: 'The Long-Term Unhappiness Chemical' },
      { id: '4', slug: 'lesson4', title: 'The Long-Term Happiness Chemical' },
    ],
  },
  {
    id: 'naming',
    name: 'Naming what they feel',
    lessons: [
      { id: '5', slug: 'labelingEmotions', title: 'The Importance of Labeling Emotions' },
      { id: '6', slug: 'namingEmotions', title: 'Naming our Emotions' },
    ],
  },
  {
    id: 'bond',
    name: 'Building the bond',
    lessons: [
      { id: '7', slug: 'sprinklers', title: 'Sprinklers: Building Deep Bonds' },
      { id: '8', slug: 'emotionalSandbags', title: 'Emotional Sandbags' },
      { id: '12', slug: 'serveReturn', title: 'Serve and Return' },
      { id: '13', slug: 'recordingDeepBondMoments', title: 'Recording Deep Bond Moments' },
    ],
  },
  {
    id: 'hard',
    name: 'When it gets hard',
    lessons: [
      { id: '9', slug: 'communicationMistakes', title: 'Communication Mistakes' },
      { id: '10', slug: 'helpingProcessEmotions', title: 'Helping Someone Process Emotions' },
      { id: '11', slug: 'dissociation', title: 'Dissociation' },
    ],
  },
];

/** Every lesson on the path, flattened, in path order. */
export const PATH_LESSONS: PathLesson[] = PATH_UNITS.flatMap((u) => u.lessons);

/**
 * The lesson to emphasise: the first one not yet finished.
 *
 * Returns null when everything is done — the caller then has no "next" to
 * highlight, which is the correct end state rather than a bug.
 */
export function resolveNextLesson(completedSlugs: string[]): PathLesson | null {
  const done = new Set(completedSlugs);
  return PATH_LESSONS.find((l) => !done.has(l.slug)) ?? null;
}

/** Completed / total for one unit, for the header count. */
export function unitProgress(
  unit: PathUnit,
  completedSlugs: string[],
): { done: number; total: number } {
  const done = new Set(completedSlugs);
  return {
    done: unit.lessons.filter((l) => done.has(l.slug)).length,
    total: unit.lessons.length,
  };
}
