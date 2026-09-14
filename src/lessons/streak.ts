/**
 * The streak — consecutive days on which the parent finished something.
 *
 * WHY THIS NEEDS ITS OWN RECORD. The per-lesson progress stores hold section
 * ids and nothing else; no timestamps exist anywhere, so "days in a row" cannot
 * be derived from what is already persisted. This keeps a small array of local
 * dates instead.
 *
 * HOW IT IS SHOWN. The count is always visible on the Learn header, zero
 * included: the number is the habit mechanic, and hiding it removes the stake
 * that brings people back. (It hid below two days for a while, on the argument
 * that a zero reads as a verdict on a hard week rather than as a nudge. The
 * owner's call was that visible stakes matter more; the flame dims at zero as
 * the compromise.)
 *
 * What it still never does:
 *
 *   - it counts UP and is never shown as broken, lost, or at risk
 *   - there is no "don't lose your streak" prompt, anywhere
 *   - missing days simply restarts the count; nothing announces it
 *
 * Dates are LOCAL calendar days, not UTC: a lesson finished at 11pm belongs to
 * that evening in the parent's own timezone, which is the only reading that
 * matches how they experienced it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const KEY = STORAGE_KEYS.ACTIVE_DAYS;

/** Local YYYY-MM-DD. Deliberately not toISOString(), which shifts to UTC. */
export function localDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayBefore(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDayKey(date);
}

async function readDays(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/** Record today as active. Idempotent — finishing five sections is still one day. */
export async function recordActiveDay(): Promise<void> {
  try {
    const days = await readDays();
    const today = localDayKey();
    if (days.includes(today)) return;
    // Keep the tail only. A year of days is far more than any streak needs and
    // this value is read on every Learn render.
    const next = [...days, today].slice(-400);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Non-fatal: a missed streak day must never block finishing a lesson.
  }
}

/**
 * Consecutive days ending today or yesterday.
 *
 * Yesterday still counts so the number does not vanish the moment midnight
 * passes — a parent who reads at 11pm on Monday and opens the app at 9am
 * Tuesday has not broken anything yet.
 */
export async function getStreak(): Promise<number> {
  const days = new Set(await readDays());
  if (days.size === 0) return 0;

  const today = localDayKey();
  let cursor = days.has(today) ? today : dayBefore(today);
  if (!days.has(cursor)) return 0;

  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = dayBefore(cursor);
  }
  return count;
}

/**
 * DEV ONLY — seed a run of consecutive days.
 *
 * `recordActiveDay` can only ever add today, so a real streak takes a real week
 * to produce and the pill's states cannot otherwise be seen on device.
 *
 * `endingDaysAgo` backdates the run: 0 is a live streak ending today, and
 * anything above 1 is a LAPSED one — days on record, none recent enough to
 * count, so getStreak returns 0. That is a different state from a new user with
 * no record at all, and it is the one the zero pill is really for.
 */
export async function seedStreakForDev(days: number, endingDaysAgo = 0): Promise<void> {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - (i + endingDaysAgo));
    keys.push(localDayKey(d));
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(keys));
}

export async function clearStreak(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // Same reasoning as above.
  }
}
