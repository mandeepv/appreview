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

export async function clearCompletedLessons(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Same reasoning as above.
  }
}
