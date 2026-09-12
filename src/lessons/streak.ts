/**
 * The streak — consecutive days on which the parent finished something.
 *
 * WHY THIS NEEDS ITS OWN RECORD. The per-lesson progress stores hold section
 * ids and nothing else; no timestamps exist anywhere, so "days in a row" cannot
 * be derived from what is already persisted. This keeps a small array of local
 * dates instead.
 *
 * WHY IT IS DELIBERATELY GENTLE. A streak is the one mechanic that can make a
 * parenting app tell a tired parent they have failed at parenting. So:
 *
 *   - it counts UP and is never shown as broken, lost, or at risk
 *   - there is no "don't lose your streak" prompt, anywhere
 *   - missing days simply restarts the count; nothing announces it
 *   - the pill hides entirely below two days, so a lapse reads as absence
 *     rather than as a zero being held up to them
 *
 * Dates are LOCAL calendar days, not UTC: a lesson finished at 11pm belongs to
 * that evening in the parent's own timezone, which is the only reading that
 * matches how they experienced it.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

const KEY = STORAGE_KEYS.ACTIVE_DAYS;
const NODE_DAYS_KEY = STORAGE_KEYS.NODE_DAYS;

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
 * Which local day a given path node was finished on, for the rail's day labels
 * ("SUN" beside a finished row).
 *
 * Separate from the day ARRAY above: that answers "was anything done on day X"
 * for the streak, this answers "when was node Y done" for the rail. Neither can
 * be derived from the other, and the per-lesson progress stores hold no
 * timestamps at all.
 *
 * Best-effort: nodes finished before this shipped have no entry and simply show
 * no label, which is why the rail must read correctly without one.
 */
export async function recordNodeDay(nodeKey: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(NODE_DAYS_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    if (map[nodeKey]) return;
    map[nodeKey] = localDayKey();
    await AsyncStorage.setItem(NODE_DAYS_KEY, JSON.stringify(map));
  } catch {
    // Non-fatal — a missing label costs three letters on one row.
  }
}

export async function getNodeDays(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(NODE_DAYS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** "SUN" / "MON" … from a YYYY-MM-DD produced by localDayKey. */
export function weekdayLabel(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  if (!y || !m || !d) return '';
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date(y, m - 1, d).getDay()] ?? '';
}

export async function clearStreak(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEY, NODE_DAYS_KEY]);
  } catch {
    // Same reasoning as above.
  }
}
