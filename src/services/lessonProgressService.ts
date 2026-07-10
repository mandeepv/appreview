// SPEC-13 R2 — account-scoped lesson-progress sync (section level).
//
// This service is the DB side of lesson progress. It is wired BEHIND the
// createProgressStore factory (src/lessons/progressStore.ts), not called by
// screens directly (house rule: screens never import the Supabase client).
//
// Model: one row per (user_id, lesson_id) where lesson_id is the lesson SLUG
// (e.g. 'sprinklers'). `completed_sections text[]` mirrors the AsyncStorage
// array of section-id strings exactly, so a sign-in merge is a plain set union
// (idempotent, never destructive in either direction). The `completed` boolean
// is derived (all sections done) and kept for existing consumers.
//
// Sync posture (owner-decided):
//   - Local-first: AsyncStorage is the source of truth for the UI. The DB write
//     is background fire-and-forget; it NEVER surfaces a user-facing error for
//     progress sync. reportError only on a repeated (non-transient) failure.
//   - Payload is lesson slug + section IDs only. No free text, no extra fields
//     (INVARIANTS #8 posture).

import { supabase } from '../lib/supabase';
import { reportError } from '../config/sentry';

/** Read the completed-section array for one lesson from the DB (empty if none
 *  / signed-out / error). */
export async function getRemoteSections(lessonSlug: string): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('completed_sections')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return []; // no row yet
      throw error;
    }
    return data?.completed_sections ?? [];
  } catch (error) {
    if (__DEV__) console.warn('[lessonProgress] getRemoteSections failed:', error);
    return [];
  }
}

/** Read ALL of the current user's lesson progress as a slug → sections map.
 *  Used by the sign-in merge. Empty map if signed-out / error. */
export async function getAllRemoteProgress(): Promise<Record<string, string[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed_sections')
      .eq('user_id', user.id);

    if (error) throw error;

    const out: Record<string, string[]> = {};
    for (const row of data ?? []) {
      out[row.lesson_id] = row.completed_sections ?? [];
    }
    return out;
  } catch (error) {
    if (__DEV__) console.warn('[lessonProgress] getAllRemoteProgress failed:', error);
    return {};
  }
}

/**
 * Upsert the completed-section array for one lesson. `completed` is derived:
 * true iff every section is done (sectionCount = the lesson's section count in
 * the registry). Returns true on success, false on failure — the caller
 * (the factory's background sync) decides whether to reportError. Never throws.
 */
export async function upsertSections(
  lessonSlug: string,
  sections: string[],
  sectionCount: number,
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false; // signed-out: local-only, nothing to sync

    const completed = sectionCount > 0 && sections.length >= sectionCount;
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonSlug,
          completed_sections: sections,
          completed,
          completed_at: completed ? now : null,
          updated_at: now,
        },
        { onConflict: 'user_id,lesson_id' },
      );

    if (error) throw error;
    return true;
  } catch (error) {
    if (__DEV__) console.warn('[lessonProgress] upsertSections failed:', error);
    return false;
  }
}
