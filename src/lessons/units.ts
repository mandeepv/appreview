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

/** Lesson order on the path. The same sequence the Learn list always used. */
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
 * Everything up to and including the current node, plus the named horizon, plus
 * a few unnamed nodes so the rail visibly continues under the tab bar rather
 * than stopping dead. Rendering all 49 would be a wall, which is the problem
 * this screen exists to solve.
 */
export function visibleNodes(completedKeys: string[], tailBeyondHorizon = 3): PathNode[] {
  const current = currentIndex(completedKeys);
  const end = Math.min(PATH_NODES.length, current + VISIBLE_AHEAD + tailBeyondHorizon + 1);
  // History is rendered IN FULL, from node one.
  //
  // It was capped for a while, because rendering every finished
  // node above the card pushed the card below the fold by section ten. That
  // fixed the card and broke something worth more: a parent scrolling up to
  // re-read what they have already done. The finished rail is the record of
  // their work, and it is the one part of this screen that accumulates.
  //
  // The card is kept on screen by `initialCardOffset` instead — the screen opens
  // already scrolled to it, with the history sitting above, reachable.
  return PATH_NODES.slice(0, end);
}

/**
 * How much finished rail shows above the card, in points.
 *
 * The card must be visible without scrolling, AND the rail above it must look
 * like it continues — landing flush on the card makes a long history invisible,
 * and a parent who cannot see it will not think to reach for it. A partial row
 * above the fold is the affordance that invites the scroll.
 *
 * Applied as `viewOffset` when the screen scrolls to the card on focus.
 */
export const HISTORY_PEEK = 96;

/** Completed / total, for the header. */
export function pathProgress(completedKeys: string[]): { done: number; total: number } {
  const done = new Set(completedKeys);
  return {
    done: PATH_NODES.filter((n) => done.has(n.key)).length,
    total: PATH_NODES.length,
  };
}

/** Guard: the path must describe the same lessons the registry holds. */
export const PATH_COVERS_ALL_LESSONS =
  LESSON_ORDER.length === Object.keys(LESSON_REGISTRY).length;
