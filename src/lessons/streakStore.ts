// SPEC-19 R2 — local-first streak store (the AsyncStorage side).
//
// Stores the activity FACTS ({ days, longestEver }) under ACTIVITY_DAYS and
// derives the streak via the pure computeStreak. Mirrors progressStore's
// local-first posture: the local write is the source of truth for the UI; the
// DB sync (streakService.recordActivity) is background fire-and-forget and is
// LAZILY required inside the write path so the Supabase client stays out of the
// local path and the tests (exactly like syncSectionsToRemote).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { computeStreak, type StreakResult } from './computeStreak';
import {
  trackStreakDayRecorded,
  trackStreakFreezeUsed,
  trackStreakLost,
} from '../lib/analytics';

const KEY = STORAGE_KEYS.ACTIVITY_DAYS;

// Keep the most recent ~400 local days. computeStreak only needs recent history;
// `longestEver` is cached separately so trimming can never shrink the record.
const MAX_DAYS = 400;

interface ActivityBlob {
  days: string[];        // 'YYYY-MM-DD', device-local, unsorted-tolerant
  longestEver: number;   // cached all-time longest, survives trimming
  // Last current-streak length the app OBSERVED, persisted so we can fire
  // streak_lost exactly once when a run breaks (transition detection, not a
  // per-read event). Absent on old blobs → treated as 0.
  lastKnownStreak?: number;
}

const EMPTY: ActivityBlob = { days: [], longestEver: 0, lastKnownStreak: 0 };

/** Today's device-LOCAL calendar date as 'YYYY-MM-DD' (not UTC — see spec). */
export function localToday(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function readBlob(): Promise<ActivityBlob> {
  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (!stored) return { ...EMPTY };
    const parsed = JSON.parse(stored);
    // Tolerate the legacy/absent shape defensively.
    return {
      days: Array.isArray(parsed?.days) ? parsed.days : [],
      longestEver: typeof parsed?.longestEver === 'number' ? parsed.longestEver : 0,
      lastKnownStreak: typeof parsed?.lastKnownStreak === 'number' ? parsed.lastKnownStreak : 0,
    };
  } catch (error) {
    if (__DEV__) console.error('[streak] readBlob failed:', error);
    return { ...EMPTY };
  }
}

async function writeBlob(blob: ActivityBlob): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(blob));
}

// Trim to the most recent MAX_DAYS by calendar order (descending), preserving
// uniqueness. Pure helper so the trim-preserves-longest test can target it.
export function trimDays(days: string[]): string[] {
  const unique = Array.from(new Set(days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))));
  unique.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // newest first
  return unique.slice(0, MAX_DAYS);
}

/**
 * Record today's activity locally (idempotent) and fire a background DB sync.
 * Returns the streak AFTER recording, plus whether today was newly recorded
 * (the "first section of the day" transition — drives the Day-N celebration and
 * the streak_day_recorded event).
 *
 * `now` is injected so the caller/tests control the clock (no `new Date()`
 * hidden here). The DB sync is NOT awaited (local-first; offline still records).
 */
export async function recordActivityToday(now: Date): Promise<{
  streak: StreakResult;
  newlyRecordedToday: boolean;
  previousLength: number;
}> {
  const today = localToday(now);
  const blob = await readBlob();

  const before = computeStreak(blob.days, today);
  const alreadyToday = blob.days.includes(today);

  if (!alreadyToday) {
    const days = trimDays([today, ...blob.days]);
    const after = computeStreak(days, today);
    const longestEver = Math.max(blob.longestEver, after.longest, after.current);
    await writeBlob({ days, longestEver, lastKnownStreak: after.current });

    // Background, non-awaited DB sync. Lazily required so the Supabase client
    // stays out of the local path and the local-only tests (like progressStore).
    void syncActivityToRemote(today);

    // Analytics (counts only). streak_day_recorded on the first section of the
    // day; streak_freeze_used when this record's walk bridged a gap ending today.
    trackStreakDayRecorded(after.current);
    if (after.freezeUsedOn) trackStreakFreezeUsed(after.current);

    return {
      streak: { ...after, longest: longestEver },
      newlyRecordedToday: true,
      previousLength: before.current,
    };
  }

  // Already recorded today — no write, no sync, no celebration.
  return {
    streak: { ...before, longest: Math.max(blob.longestEver, before.longest) },
    newlyRecordedToday: false,
    previousLength: before.current,
  };
}

/**
 * Read the current streak without recording (for the chip on screen focus).
 *
 * Also detects a BROKEN run: if the persisted last-known streak was > 1 and the
 * current run has collapsed to 0/1, fire streak_lost ONCE and persist the new
 * (lower) last-known so it can't re-fire. This is the honest "the app observed a
 * break" moment — it happens on a read, since a break is the passage of time,
 * not an action. Writing lastKnownStreak here is the fire-once guard.
 */
export async function getStreak(now: Date): Promise<StreakResult> {
  const today = localToday(now);
  const blob = await readBlob();
  const s = computeStreak(blob.days, today);
  const result = { ...s, longest: Math.max(blob.longestEver, s.longest) };

  const previous = blob.lastKnownStreak ?? 0;
  if (previous > 1 && s.current <= 1) {
    trackStreakLost(previous);
  }
  // Persist the observed current so the transition fires exactly once and future
  // reads compare against the up-to-date value.
  if (s.current !== previous) {
    await writeBlob({ days: blob.days, longestEver: result.longest, lastKnownStreak: s.current });
  }

  return result;
}

// Consecutive background-sync failures. reportError only on a REPEATED failure
// (a transient offline blip is expected and silent) — mirrors progressStore.
let syncFailureStreak = 0;
const SYNC_FAILURE_ALERT_THRESHOLD = 3;

/**
 * Background push of today's activity to the DB. Local-first: runs AFTER the
 * local write, never awaited by the UI. Signed-out/demo users are a no-op
 * ('skipped', never a failure). Silent on a single failure; reportError only
 * once the streak crosses the threshold.
 */
async function syncActivityToRemote(date: string): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { recordActivity } = require('../services/streakService') as typeof import('../services/streakService');
    const outcome = await recordActivity(date);
    if (outcome === 'skipped') return; // no session — neither success nor failure
    if (outcome === 'ok') {
      syncFailureStreak = 0;
    } else {
      syncFailureStreak += 1;
      if (syncFailureStreak >= SYNC_FAILURE_ALERT_THRESHOLD) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { reportError } = require('../config/sentry') as typeof import('../config/sentry');
        reportError(new Error('streak activity sync repeatedly failing'), {
          streak: syncFailureStreak,
        });
      }
    }
  } catch (error) {
    if (__DEV__) console.warn('[streak] background sync threw:', error);
  }
}

/**
 * Sign-in reconciliation: union remote activity dates into local (and push
 * local-only dates up), so a re-installed device restores its streak. Set-union
 * of dates is order-free and idempotent — same non-destructive posture as
 * lesson progress. Best-effort and silent; a null fetch (unknown) skips the
 * merge entirely (never wipe on a fetch error).
 */
export async function mergeRemoteActivityIntoLocal(): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getActivityDays } = require('../services/streakService') as typeof import('../services/streakService');
    const remote: string[] | null = await getActivityDays();
    if (remote === null) return; // fetch error → unknown, do not merge

    const blob = await readBlob();
    const union = trimDays([...blob.days, ...remote]);

    // Recompute longestEver over the union (before trimming loses old days, the
    // union is already the freshest 400; longestEver is monotonic so max with it).
    const longest = union.length > 0 ? Math.max(blob.longestEver, 0) : blob.longestEver;

    // Only write if the merge changed local (avoid churn). Preserve
    // lastKnownStreak — the merge changes history, not the observed transition.
    if (union.length !== blob.days.length || union.some((d, i) => d !== blob.days[i])) {
      await writeBlob({ days: union, longestEver: longest, lastKnownStreak: blob.lastKnownStreak ?? 0 });
    }

    // Push any local-only dates up so remote converges too. Background,
    // non-blocking; recordActivity is idempotent per date.
    const remoteSet = new Set(remote);
    for (const d of blob.days) {
      if (!remoteSet.has(d)) void syncActivityToRemote(d);
    }
  } catch (error) {
    if (__DEV__) console.warn('[streak] mergeRemoteActivityIntoLocal failed:', error);
  }
}
