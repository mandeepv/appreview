/**
 * Reads section completion for the whole path.
 *
 * NO NEW STORAGE. Every section-based lesson already persists its completed
 * section ids under its own `storageKey`, and that remains the source of truth
 * — this only reads those stores and expresses the result in the path's
 * "<lessonSlug>#<sectionId>" key space.
 *
 * Flow lessons 1-4 have no storageKey (the field is overloaded: it also marks a
 * lesson hub-style and changes where `lesson_started` fires, so they cannot
 * simply be given one — see lessonCompletion.ts). Their single section is
 * resolved from the whole-lesson completion record instead, which is what that
 * module exists for.
 */

import { PATH_NODES } from './units';
import { getLesson } from './registry';
import { createProgressStore } from './progressStore';
import { getCompletedLessons, backfillFlowLessonsForUpgraders } from './lessonCompletion';

/**
 * Completed path-node keys, read across every lesson.
 *
 * Fails soft: a lesson whose store throws contributes nothing rather than
 * breaking the Learn screen, which is the first thing a subscriber sees after
 * the paywall.
 */
export async function getCompletedPathKeys(): Promise<string[]> {
  const bySlug = new Map<string, Set<string>>();

  // Section-based lessons: read each lesson's own completed-sections array once.
  const slugs = Array.from(new Set(PATH_NODES.map((n) => n.lessonSlug)));
  await Promise.all(
    slugs.map(async (slug) => {
      const lesson = getLesson(slug);
      if (!lesson?.storageKey) return;
      try {
        const sections = await createProgressStore(lesson.storageKey).getCompletedSections();
        bySlug.set(slug, new Set(sections));
      } catch {
        // Leave the lesson absent — it reads as unfinished, never as a crash.
      }
    }),
  );

  // Upgrade fix, once per install: v1.2.0 recorded nothing for flow lessons
  // 1-4, so without this every existing parent is pointed back at Lesson 1 with
  // the rest re-locked. Hub progress is already in hand here, which is exactly
  // the signal the backfill needs. See lessonCompletion.ts for the reasoning.
  const hasAnyHubProgress = Array.from(bySlug.values()).some((s) => s.size > 0);
  const flowSlugs = Array.from(
    new Set(PATH_NODES.filter((n) => !getLesson(n.lessonSlug)?.storageKey).map((n) => n.lessonSlug)),
  );
  await backfillFlowLessonsForUpgraders(hasAnyHubProgress, flowSlugs);

  // Flow lessons: one section each, so whole-lesson completion IS section
  // completion.
  const completedLessons = new Set(await getCompletedLessons());

  return PATH_NODES.filter((node) => {
    const sections = bySlug.get(node.lessonSlug);
    if (sections) return sections.has(node.sectionId);

    // No section store for this lesson. Two very different reasons, and they
    // must not be conflated (they were, until the 2026-09 review):
    //
    //   - it is a FLOW lesson, which has no store by design — its single
    //     section is complete iff the whole-lesson record says so.
    //   - it is a HUB lesson whose store THREW above. Falling back to the
    //     whole-lesson record there marks EVERY section of it done off one
    //     flag, which is the opposite of failing soft: a transient read error
    //     would silently skip a parent past a whole lesson, and the path's
    //     sequential lock would then hand them the one after it.
    //
    // A hub lesson that could not be read reads as unfinished.
    const isHubLesson = Boolean(getLesson(node.lessonSlug)?.storageKey);
    if (isHubLesson) return false;

    return completedLessons.has(node.lessonSlug);
  }).map((node) => node.key);
}
