/**
 * The Learn path — a flat rail of every section in every lesson.
 *
 * Pure data + pure functions, no React, so the ordering and lock rules are
 * unit-testable without a simulator (same constraint as lessonRoutes.ts).
 *
 * FLATTENED. The path used to have one node per lesson, with sections hidden
 * behind a hub screen. It now has one node per SECTION — 49 of them — so the
 * rail is the only navigation and the hub is no longer on the happy path.
 *
 * LOCKED, SEQUENTIALLY. Exactly one node is current; everything after it is
 * locked, and finishing the current one immediately opens the next. No daily
 * drip: a parent with a free evening can keep going.
 *
 * THE VISIBLE HORIZON. Completed nodes stay (scroll back through them), the
 * current node is a card, and only the NEXT THREE are named. Beyond that the
 * rail continues unnamed — the future has weight without the whole course
 * being written out in advance.
 */

import { LESSON_REGISTRY, getLesson } from './registry';

/**
 * Lesson order on the path.
 *
 * NOT v1.2.0's order, despite what this comment used to claim. The live Learn
 * list ran ... Communication Mistakes (9), Helping Process Emotions (10),
 * Dissociation (11), Serve and Return (12), Recording Deep Bond Moments (13);
 * this puts Serve and Return and Recording Deep Bond Moments earlier, so the
 * bonding material lands before the harder emotional content. Lessons 1-8 are
 * unchanged.
 *
 * It matters because the path is now sequentially locked: this array IS the
 * curriculum, not a display order. Changing it re-orders what every parent
 * meets next, and reordering it after release moves the "earliest gap" for
 * users mid-path. Add new lessons at the END unless the re-ordering is the
 * point.
 */
export const LESSON_ORDER = [
  'lesson1',
  'lesson2',
  'lesson3',
  'lesson4',
  'labelingEmotions',
  'namingEmotions',
  'sprinklers',
  'emotionalSandbags',
  'serveReturn',
  'recordingDeepBondMoments',
  'communicationMistakes',
  'helpingProcessEmotions',
  'dissociation',
] as const;

/** How many unnamed-but-visible nodes sit past the current one. */
export const VISIBLE_AHEAD = 3;

/**
 * The one-word name each lesson goes by ON THE PATH.
 *
 * The active card's eyebrow used to read "TONIGHT · FIVE MINUTES", which said
 * when to do it but never what it was part of — a parent looking at "What NOT
 * to do when loved ones are upset" had no way to tell it belonged to
 * Sprinklers, or that four more sections of Sprinklers followed it. The section
 * titles are sentences; the lesson titles are too long for an eyebrow. This is
 * the short form that fits.
 *
 * Rules for adding one: name the THEME — what the parent is learning to do —
 * not the mechanism the lesson happens to explain. "Cortisol" and "Chemicals"
 * describe the biology on the page; "Foundations" and "Connection" describe
 * what the parent walks away able to do, which is what belongs on a card they
 * see at the start of a five-minute night. Single word where a single word is
 * honest, upper case at the point of use (not here), distinct from its
 * neighbours at a glance.
 *
 * Every slug in LESSON_ORDER must appear here; the guard below enforces it.
 */
export const LESSON_SHORT_NAME: Record<string, string> = {
  // The four flow lessons are the groundwork — what changed in the science and
  // how the brain's chemistry shapes a child long-term. A parent does not need
  // the chemical names on a card; they need to know this is the base to stand on.
  lesson1: 'Foundations',
  lesson2: 'Foundations',
  lesson3: 'Foundations',
  lesson4: 'Foundations',
  // The pair on emotions: the first is the concept (why giving a feeling a name
  // works at all), the second drills it on the parent's own Happy/Sad/Mad/Bad
  // moments. Named for the concept and the subject rather than "Labeling" and
  // "Naming", which were near-synonyms sitting back to back on the path.
  labelingEmotions: 'Understanding',
  namingEmotions: 'Feelings',
  // Noticing the bid for connection and meeting it.
  sprinklers: 'Bonding',
  // Named for what the CHILD gets when the weight comes off, not the parent's
  // verb — the whole lesson is about producing that.
  emotionalSandbags: 'Relief',
  serveReturn: 'Connection',
  recordingDeepBondMoments: 'Remembering',
  // What to say, and what to stop saying.
  communicationMistakes: 'Listening',
  helpingProcessEmotions: 'Repair',
  dissociation: 'Presence',
};

/**
 * The short name for a node's lesson, for the card eyebrow.
 *
 * Falls back to the slug rather than throwing: a missing entry should show
 * something imperfect on one card, never break the whole path. The startup
 * guard below is what actually catches the omission.
 */
export function shortLessonName(slug: string): string {
  return LESSON_SHORT_NAME[slug] ?? slug;
}

export interface PathNode {
  /** Stable identity across renders: "<lessonSlug>#<sectionId>". */
  key: string;
  lessonSlug: string;
  /** Index into the lesson's own sections array — what LessonScreen navigates by. */
  sectionIndex: number;
  /** The section's id as stored in its completed-sections array. */
  sectionId: string;
  /** The real section title from lesson content. Not rewritten here. */
  title: string;
  /** Position on the whole rail, 0-based. */
  index: number;
}

/** Every section of every lesson, in path order. */
export const PATH_NODES: PathNode[] = LESSON_ORDER.flatMap((slug) => {
  const lesson = getLesson(slug);
  if (!lesson) return [];
  return lesson.sections.map((section, sectionIndex) => ({
    key: `${slug}#${section.id}`,
    lessonSlug: slug,
    sectionIndex,
    sectionId: section.id,
    title: section.title,
    index: 0, // assigned below — flatMap cannot see the running total
  }));
}).map((node, index) => ({ ...node, index }));

export type NodeState = 'done' | 'current' | 'ahead' | 'locked';

/**
 * Which node the parent is on: the first one they have not finished.
 *
 * Completion is a SET, not a count — a parent can finish out of order via a
 * deep link or an older build, and the current node must still be the earliest
 * gap rather than "one past the last thing they did".
 *
 * Returns the rail length when everything is done, so `state()` reports every
 * node as 'done' and no card is drawn.
 */
export function currentIndex(completedKeys: string[]): number {
  const done = new Set(completedKeys);
  const first = PATH_NODES.findIndex((n) => !done.has(n.key));
  return first === -1 ? PATH_NODES.length : first;
}

/**
 * What one node looks like on the rail.
 *
 *   done     finished — stays visible, scroll back to re-read
 *   current  the card, the only thing with a Start button
 *   ahead    named but not openable (the next VISIBLE_AHEAD)
 *   locked   past the horizon: the rail continues, the title does not
 */
export function nodeState(node: PathNode, completedKeys: string[]): NodeState {
  const done = new Set(completedKeys);
  if (done.has(node.key)) return 'done';

  const current = currentIndex(completedKeys);
  if (node.index === current) return 'current';
  if (node.index <= current + VISIBLE_AHEAD) return 'ahead';
  return 'locked';
}

/** Only a finished node or the current one may be opened. */
export function canOpen(node: PathNode, completedKeys: string[]): boolean {
  const state = nodeState(node, completedKeys);
  return state === 'done' || state === 'current';
}

/**
 * The slice of the rail worth rendering.
 *
 * Everything up to and including the current node, plus the named horizon.
 * Rendering all 49 would be a wall, which is the problem this screen exists to
 * solve.
 *
 * `tailBeyondHorizon` used to default to 3, adding unnamed nodes past the
 * horizon so the rail "visibly continued rather than stopping dead". The intent
 * was right and the execution inverted it: three rows holding a dot and no
 * text at all do not read as "more is coming", they read as content that
 * failed to load. They were also tappable, so a parent got told to "finish the
 * section you're on to unlock this one" about a row with no title — "this one"
 * referred to nothing they could see. And they sat directly above a footer
 * promising "the rest gets written as you go", which implied those blanks WERE
 * the rest, when in fact they are real, already-written sections.
 *
 * Nothing is rendered past the named horizon. Three treatments were tried
 * there and all three failed for the same reason — a ROW is the wrong element
 * for the job. Blank rows read as content that failed to load; a fading rail
 * could not be told apart from a rail that had simply run out; locks on
 * untitled rows said "locked" without ever saying locked WHAT.
 *
 * Continuation is now carried by a closing block below the list (see
 * LearnScreen's ListFooterComponent), which is the pattern the learning apps
 * that have solved this converge on: Duolingo groups its path into named units
 * with headers rather than trailing the rail off into placeholders. A block can
 * hold a heading and a sentence and look deliberate; a half-drawn row cannot.
 * Crucially it also states no TOTAL, because the catalogue is meant to grow and
 * any count would fix a ceiling the product does not intend.
 */
export function visibleNodes(completedKeys: string[], tailBeyondHorizon = 0): PathNode[] {
  const current = currentIndex(completedKeys);
  const end = Math.min(PATH_NODES.length, current + VISIBLE_AHEAD + tailBeyondHorizon + 1);
  // History is rendered IN FULL, from node one.
  //
  // It was capped for a while, because rendering every finished node above the
  // card pushed the card below the fold by section ten. That fixed the card and
  // broke something worth more: a parent scrolling up to re-read what they have
  // already done. The finished rail is the record of their work, and it is the
  // one part of this screen that accumulates.
  //
  // The card is kept on screen by the list opening AT it instead — fixed row
  // heights make that an exact index, with the history above it, reachable.
  return PATH_NODES.slice(0, end);
}

/** Completed / total, for the header. */
export function pathProgress(completedKeys: string[]): { done: number; total: number } {
  const done = new Set(completedKeys);
  return {
    done: PATH_NODES.filter((n) => done.has(n.key)).length,
    total: PATH_NODES.length,
  };
}

/**
 * Guard: the path must describe the same lessons the registry holds.
 *
 * Checks IDENTITY, not just count. A length-only comparison passes when a slug
 * in LESSON_ORDER is misspelled or renamed — the counts still match, every test
 * still goes green, and the lesson silently vanishes from the app because
 * getLesson() returns undefined and PATH_NODES skips it. Since the path is the
 * only lesson navigation, that is content becoming unreachable with no error
 * anywhere. (Caught in the 2026-09 pre-release review.)
 */
export const PATH_COVERS_ALL_LESSONS =
  LESSON_ORDER.length === Object.keys(LESSON_REGISTRY).length &&
  LESSON_ORDER.every((slug) => slug in LESSON_REGISTRY) &&
  Object.keys(LESSON_REGISTRY).every((slug) =>
    (LESSON_ORDER as readonly string[]).includes(slug),
  );

/**
 * Guard: every lesson on the path has a short name for the card eyebrow.
 *
 * Same failure shape as the one above, quieter: shortLessonName falls back to
 * the raw slug, so a missing entry ships an eyebrow reading "RECORDINGDEEPBOND\
 * MOMENTS" rather than crashing. Asserted in tests so adding a lesson without a
 * short name fails the suite instead of the card.
 */
export const ALL_LESSONS_HAVE_SHORT_NAMES = LESSON_ORDER.every(
  (slug) => typeof LESSON_SHORT_NAME[slug] === 'string' && LESSON_SHORT_NAME[slug].length > 0,
);
