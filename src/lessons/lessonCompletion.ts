/**
 * Whole-lesson completion, for the Learn path.
 *
 * WHY THIS IS NOT `storageKey`.
 *
 * The obvious move is to give flow lessons 1-4 a `storageKey` like every other
 * lesson, so their progress persists. It does not work: `storageKey` carries
 * THREE meanings in this codebase, and only one of them is "saves progress".
 *
 *   1. The AsyncStorage key for the completed-sections array.
 *   2. The flow-vs-hub discriminator. LessonController fires `lesson_started`
 *      only for lessons WITHOUT a key (for hub lessons, LessonHubScreen owns
 *      the fire). Adding a key to 1-4 makes both sides skip it, and the event
 *      silently disappears for four lessons.
 *   3. A requirement to have a HUB_META entry — content.test.ts asserts every
 *      keyed lesson has one, and flow lessons deliberately have none.
 *
 * So whole-lesson completion gets its own small record instead. It answers one
 * question — "has this lesson been finished?" — for every lesson, flow or hub,
 * and touches none of the three behaviours above.
 *
 * For hub lessons this is derived rather than authoritative: the section store
 * remains the source of truth for WHICH sections are done, and this only marks
 * that the last one was reached.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

/** Slugs of lessons the user has finished, as a JSON array. */
const KEY = STORAGE_KEYS.LESSONS_COMPLETED;

export async function getCompletedLessons(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Defensive: a corrupted or hand-edited value must not crash the Learn
    // screen, which is the first thing a subscriber sees after the gate.
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export async function markLessonCompleted(slug: string): Promise<void> {
  try {
    const current = await getCompletedLessons();
    if (current.includes(slug)) return;
    await AsyncStorage.setItem(KEY, JSON.stringify([...current, slug]));
  } catch {
    // Non-fatal. Losing a completion mark costs a checkmark on the path; it
    // must never block a user finishing a lesson.
  }
}

/**
 * ONE-TIME UPGRADE FIX — reconstruct flow-lesson completion for existing users.
 *
 * THE PROBLEM. The path treats "current" as the earliest unfinished node, and
 * lessons 1-4 sit first in LESSON_ORDER. Their completion is read from this
 * module's record — a key v1.2.0 never wrote, because v1.2.0 deliberately
 * persisted nothing for flow lessons (no `storageKey`, nothing in Supabase's
 * lesson_progress either; verified in both). So on first launch after the
 * upgrade, a parent who had finished all thirteen lessons would be pointed
 * back at Lesson 1, with everything past it re-locked behind the new
 * sequential rule.
 *
 * THE INFERENCE. Nothing recorded whether they did lessons 1-4, so this
 * reconstructs it: v1.2.0's Learn list ordered those four FIRST, so progress in
 * any later (hub) lesson means the parent walked past them. Any hub progress at
 * all therefore implies 1-4 are done.
 *
 * WHERE IT IS WRONG, and why that is acceptable: someone who did only lessons
 * 1-3 and never opened a hub lesson has left no trace anywhere, so they redo
 * those. That is a few minutes of re-reading for a small group, against every
 * engaged upgrader otherwise being told to start over.
 *
 * Runs once, guarded by its own key — a parent who later resets progress must
 * not have these silently re-granted.
 */
export async function backfillFlowLessonsForUpgraders(
  hasAnyHubProgress: boolean,
  flowSlugs: readonly string[],
): Promise<void> {
  try {
    const done = await AsyncStorage.getItem(STORAGE_KEYS.FLOW_BACKFILL_DONE);
    if (done) return;
    // Mark it attempted FIRST. If the writes below fail we do not want this
    // retrying on every launch and re-granting lessons a parent has since
    // cleared.
    await AsyncStorage.setItem(STORAGE_KEYS.FLOW_BACKFILL_DONE, '1');

    if (!hasAnyHubProgress) return;

    const current = await getCompletedLessons();
    const merged = Array.from(new Set([...current, ...flowSlugs]));
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // Non-fatal: worst case the parent starts at lesson 1, which is the
    // behaviour this exists to improve, not a break.
  }
}

export async function clearCompletedLessons(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Same reasoning as above.
  }
}
