// SPEC-19 R2 — account-scoped daily-activity sync (the DB side of the streak).
//
// Wired BEHIND the createProgressStore factory (src/lessons/progressStore.ts),
// not called by screens directly (house rule: screens never import the Supabase
// client). Mirrors lessonProgressService's posture exactly:
//   - Local-first: AsyncStorage (ACTIVITY_DAYS) is the source of truth for the
//     UI. The DB write is background fire-and-forget; it NEVER surfaces a
//     user-facing error. reportError only on a repeated (non-transient) failure
//     (handled by the caller, streak-of-3 like syncSectionsToRemote).
//   - Payload is a single local calendar date. No PII, no free text.
//
// Model: one row per (user_id, activity_date). Idempotent insert — completing
// five sections in a day is one row (ON CONFLICT DO NOTHING via the PK).

import { supabase } from '../lib/supabase';

/**
 * Outcome of a recordActivity attempt (same three-way contract as
 * lessonProgressService.upsertSections):
 *   'ok'      — the row was inserted (or already existed).
 *   'skipped' — no session (signed-out / demo mode). A legitimate no-op, NOT a
 *               failure; the caller must not count it toward its failure streak
 *               (else a demo user during Apple review would trip reportError).
 *   'failed'  — an actual DB/network error. Only this counts as a failure.
 */
export type RecordActivityOutcome = 'ok' | 'skipped' | 'failed';

/**
 * Record that the current user had activity on `date` ('YYYY-MM-DD',
 * device-local). Idempotent: ON CONFLICT DO NOTHING on the (user_id,
 * activity_date) PK. Never throws.
 */
export async function recordActivity(date: string): Promise<RecordActivityOutcome> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    // No session → signed-out / demo mode. Deliberate skip, not a failure
    // (activity is local-only for these users). Detected BEFORE the write so it
    // never touches the failure counter.
    if (!user) return 'skipped';

    const { error } = await supabase
      .from('daily_activity')
      // ignoreDuplicates makes this an "insert if absent" — the PK conflict is a
      // no-op, not an error (matches ON CONFLICT DO NOTHING).
      .upsert(
        { user_id: user.id, activity_date: date },
        { onConflict: 'user_id,activity_date', ignoreDuplicates: true },
      );

    if (error) throw error;
    return 'ok';
  } catch (error) {
    if (__DEV__) console.warn('[streak] recordActivity failed:', error);
    return 'failed';
  }
}

/**
 * Read the current user's activity dates ('YYYY-MM-DD'), most-recent history.
 *
 * Return-value contract (mirrors getAllRemoteProgress, SPEC-FIX-03 R1): a
 * successful fetch returns an array (empty `[]` legitimately means "signed in,
 * no rows yet"). A FETCH ERROR returns `null` — distinct from `[]`. The caller
 * MUST treat null as "unknown, do not merge/overwrite": merging on a null fetch
 * would union local with nothing and could wipe the user's remote streak. On
 * null the merge is skipped and retried on the next sign-in.
 */
export async function getActivityDays(): Promise<string[] | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return []; // signed-out is a legitimate "no rows", not an error

    const { data, error } = await supabase
      .from('daily_activity')
      .select('activity_date')
      .eq('user_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(400); // computeStreak only needs recent history; longestEver is cached locally

    if (error) throw error;
    return (data ?? []).map((row) => row.activity_date);
  } catch (error) {
    if (__DEV__) console.warn('[streak] getActivityDays failed:', error);
    return null; // fetch failed — caller skips the merge (no destructive write-back)
  }
}
