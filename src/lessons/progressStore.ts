// SPEC-09 Phase 3 — the progress-store factory.
//
// The 8 hand-written src/utils/*Progress.ts modules were byte-identical apart
// from their storage key: each exposed markSectionComplete / getCompletedSections
// / reset*, storing a JSON array of completed section-id strings under one key.
// `createProgressStore(storageKey)` replaces all 8 with one factory.
//
// BYTE-COMPATIBLE: same key, same JSON format (an array of section-id strings),
// same idempotent append. Existing users' progress survives untouched — the
// key and value shape are identical to what the old utils wrote (round-trip
// verified in progressStore.test.ts).
//
// SPEC-13 R2 — account-scoped sync is layered in BEHIND this factory. The local
// AsyncStorage write stays the source of truth for the UI (local-first); after
// each successful local write we fire a BACKGROUND, fire-and-forget DB upsert
// (syncSectionsToRemote). It never blocks the caller, never throws, and never
// surfaces a user-facing error. Sign-in reconciliation is mergeRemoteIntoLocal
// (a set union — non-destructive in either direction).

import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTE: the sync layer's dependencies (registry → content, the Supabase-backed
// service, Sentry) are imported LAZILY inside the sync functions below, NOT at
// module scope. This keeps the local AsyncStorage path — and progressStore.test
// — free of the Supabase client (which throws at import when env vars are
// absent, e.g. in the test env). The local-first write never touches these.

export interface ProgressStore {
  /** Append a section id to the completed array (idempotent). */
  markSectionComplete: (sectionId: string) => Promise<void>;
  /** Read the completed section-id array (empty on none / error). */
  getCompletedSections: () => Promise<string[]>;
  /** Clear all progress for this lesson. */
  reset: () => Promise<void>;
}

// Consecutive background-sync failures per storageKey. We only reportError on a
// REPEATED failure (a transient offline blip is expected and silent).
const syncFailureStreak: Record<string, number> = {};
const SYNC_FAILURE_ALERT_THRESHOLD = 3;

/**
 * Background, fire-and-forget push of a lesson's completed-section array to the
 * DB. Local-first: this runs AFTER the local write and is never awaited by the
 * UI path. Signed-out users and lessons with no registry entry are no-ops.
 * A single failure is silent (offline is normal); reportError only fires once
 * the streak crosses the threshold, so a genuinely broken sync is still visible.
 */
async function syncSectionsToRemote(storageKey: string, sections: string[]): Promise<void> {
  try {
    // Lazy require() — keeps the Supabase client out of the local-write path
    // and the AsyncStorage-only test (see the module-header note). require() is
    // used over dynamic import() because it's synchronous, Metro-friendly, and
    // mockable in jest (jest's default env can't execute import()).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getLessonByStorageKey } = require('./registry') as typeof import('./registry');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { upsertSections } = require('../services/lessonProgressService') as typeof import('../services/lessonProgressService');

    const lesson = getLessonByStorageKey(storageKey);
    // No registry lesson for this key → nothing to sync (local only). Note: flow
    // lessons 1–4 DO sync now (SPEC-18 R1 gave them keys), so they are NOT an
    // example of this branch anymore (SPEC-FIX-11 R6).
    if (!lesson) return;

    const outcome = await upsertSections(lesson.slug, sections, lesson.sections.length);
    // SPEC-FIX-03 R2: 'skipped' (no session) is a deliberate no-op — it neither
    // resets nor increments the failure streak, so a signed-out / demo user
    // completing sections never trips reportError (which would fire during
    // Apple review). Only a real 'failed' counts.
    if (outcome === 'skipped') {
      return;
    }
    if (outcome === 'ok') {
      syncFailureStreak[storageKey] = 0;
    } else {
      syncFailureStreak[storageKey] = (syncFailureStreak[storageKey] ?? 0) + 1;
      if (syncFailureStreak[storageKey] >= SYNC_FAILURE_ALERT_THRESHOLD) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { reportError } = require('../config/sentry') as typeof import('../config/sentry');
        reportError(new Error('lesson progress sync repeatedly failing'), {
          lesson: lesson.slug,
          streak: syncFailureStreak[storageKey],
        });
      }
    }
  } catch (error) {
    // Defensive: upsertSections already swallows its own errors, but never let a
    // background sync reject bubble anywhere.
    if (__DEV__) console.warn('[progressStore] background sync threw:', error);
  }
}

/**
 * SPEC-19 — record today's streak activity, background and defensive. Lazily
 * requires streakStore so the Supabase-backed sync it triggers never enters the
 * local lesson-progress path or the progressStore local-only tests. `new Date()`
 * lives here (not inside computeStreak, which stays pure) — this is the real
 * "what day is it now" edge, at the write moment. Never throws into the caller.
 */
async function recordStreakActivity(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { recordActivityToday } = require('./streakStore') as typeof import('./streakStore');
    await recordActivityToday(new Date());
  } catch (error) {
    if (__DEV__) console.warn('[progressStore] streak activity record threw:', error);
  }
}

export function createProgressStore(storageKey: string): ProgressStore {
  return {
    markSectionComplete: async (sectionId: string): Promise<void> => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const completed: string[] = stored ? JSON.parse(stored) : [];
        if (!completed.includes(sectionId)) {
          completed.push(sectionId);
          await AsyncStorage.setItem(storageKey, JSON.stringify(completed));
          // Local write succeeded and drove the UI. Sync in the background —
          // NOT awaited (local-first; offline still saves locally).
          void syncSectionsToRemote(storageKey, completed);
        }
        // SPEC-19 + SPEC-FIX-11 R3 — a day counts when the user completes ≥1
        // section, INCLUDING replays. So record streak activity on EVERY
        // completion event, not only on the first-time write above: a user who
        // has finished all 13 lessons must still be able to extend a streak by
        // replaying. recordActivityToday is idempotent per day, so a repeat is
        // just one AsyncStorage read. Lazily required (keeps the Supabase-backed
        // sync out of this module's local path and the local-only tests),
        // non-awaited, and self-contained: a streak failure never affects the
        // lesson-progress write above.
        void recordStreakActivity();
      } catch (error) {
        if (__DEV__) console.error('Error marking section complete:', error);
      }
    },

    getCompletedSections: async (): Promise<string[]> => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        if (__DEV__) console.error('Error getting completed sections:', error);
        return [];
      }
    },

    reset: async (): Promise<void> => {
      try {
        await AsyncStorage.removeItem(storageKey);
      } catch (error) {
        if (__DEV__) console.error('Error resetting progress:', error);
      }
    },
  };
}

/**
 * SPEC-13 R2 — sign-in / session-start reconciliation. Fetches ALL remote
 * completions for the now-signed-in user and unions them into local
 * AsyncStorage per lesson (non-destructive: local ∪ remote). Because every hub
 * reads the same AsyncStorage keys via the factory, merging into AsyncStorage
 * propagates to the UI for free. Then writes the merged union back to the DB so
 * both sides converge (covers the case where local had completions the remote
 * didn't — e.g. progress made while signed out).
 *
 * Best-effort and silent: any failure leaves local progress intact (the user
 * keeps what they had); progress sync is never user-facing.
 */
export async function mergeRemoteIntoLocal(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LESSON_REGISTRY } = require('./registry') as typeof import('./registry');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAllRemoteProgress } = require('../services/lessonProgressService') as typeof import('../services/lessonProgressService');

    const remote = await getAllRemoteProgress(); // slug -> sections, or null on fetch error
    // SPEC-FIX-03 R1: a null fetch is "unknown", NOT "empty". Skip the whole
    // merge — do not write anything back — so an errored fetch can't wipe the
    // user's remote progress. Local stays as-is; retries on the next sign-in.
    if (remote === null) return;

    for (const lesson of Object.values(LESSON_REGISTRY)) {
      if (!lesson.storageKey) continue; // no key → nothing to sync (flow lessons 1–4 DO have keys now — SPEC-FIX-11 R6)
      const key = lesson.storageKey;

      const localStored = await AsyncStorage.getItem(key);
      const local: string[] = localStored ? JSON.parse(localStored) : [];
      const remoteSections = remote[lesson.slug] ?? [];

      if (local.length === 0 && remoteSections.length === 0) continue;

      const union = Array.from(new Set([...local, ...remoteSections]));
      // Only write if the merge actually changed local (avoid churn).
      if (union.length !== local.length) {
        await AsyncStorage.setItem(key, JSON.stringify(union));
      }
      // Push the union back to the DB so remote converges too (covers
      // signed-out-then-signed-in local progress). Background, non-blocking.
      void syncSectionsToRemote(key, union);
    }
  } catch (error) {
    if (__DEV__) console.warn('[progressStore] mergeRemoteIntoLocal failed:', error);
  }
}
