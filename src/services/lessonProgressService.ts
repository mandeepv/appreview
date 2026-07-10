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

/**
 * Read ALL of the current user's lesson progress as a slug → sections map.
 * Used by the sign-in merge.
 *
 * Return-value contract (SPEC-FIX-03 R1 — data-loss fix): a successful fetch
 * returns a map (empty `{}` legitimately means "signed in, no rows yet"). A
 * FETCH ERROR returns `null` — distinct from `{}`. The caller MUST treat null
 * as "unknown, do not merge": merging a `{}` from an errored fetch would union
 * local with nothing and then WRITE THAT BACK, silently wiping the user's
 * remote progress (and flipping `completed` true→false). On null the merge is
 * skipped entirely, local is left untouched, and it retries on the next
 * sign-in.
 */
export async function getAllRemoteProgress(): Promise<Record<string, string[]> | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {}; // signed-out is a legitimate "no rows", not an error

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
    return null; // fetch failed — caller skips the merge (no destructive write-back)
  }
}

/**
 * Outcome of an upsert attempt (SPEC-FIX-03 R2). THREE outcomes, not two:
 *   'ok'      — the DB write succeeded.
 *   'skipped' — no session (signed-out / demo mode). A legitimate no-op, NOT a
 *               failure. The caller must NOT count this toward its
 *               repeated-failure threshold (otherwise a signed-out user
 *               completing sections would spuriously reportError — e.g. a demo
 *               user during Apple review).
 *   'failed'  — an actual DB/network error. Only this counts as a failure.
 */
export type UpsertOutcome = 'ok' | 'skipped' | 'failed';

/**
 * Upsert the completed-section array for one lesson. `completed` is derived:
 * true iff every section is done (sectionCount = the lesson's section count in
 * the registry). Never throws.
 */
export async function upsertSections(
  lessonSlug: string,
  sections: string[],
  sectionCount: number,
): Promise<UpsertOutcome> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // No session → signed-out / demo mode. This is a deliberate skip, not a
    // failure (the sync is local-only for these users). Detected BEFORE the
    // upsert so it never touches the failure counter.
    if (!user) return 'skipped';

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
    return 'ok';
  } catch (error) {
    if (__DEV__) console.warn('[lessonProgress] upsertSections failed:', error);
    return 'failed';
  }
}
