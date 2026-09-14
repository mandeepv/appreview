let mockStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((k) => delete mockStore[k]);
    return Promise.resolve();
  }),
}));

import { localDayKey, getStreak, recordActiveDay } from '../streak';
import { STORAGE_KEYS } from '../../constants/storageKeys';

beforeEach(() => {
  mockStore = {};
});

/** Seed ACTIVE_DAYS with day keys offset from today. */
function seedDays(...offsets: number[]) {
  const days = offsets.map((o) => {
    const d = new Date();
    d.setDate(d.getDate() - o);
    return localDayKey(d);
  });
  mockStore[STORAGE_KEYS.ACTIVE_DAYS] = JSON.stringify(days);
}


// Date maths is where streaks go wrong quietly: a UTC slip moves a late-evening
// lesson into the next day, and a parent who read at 11pm is told they missed
// it. These cover the two pure helpers; the AsyncStorage-backed functions are
// exercised on device.

describe('localDayKey', () => {
  it('formats a local calendar day', () => {
    expect(localDayKey(new Date(2026, 8, 12))).toBe('2026-09-12');
  });

  it('zero-pads single-digit months and days', () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  // The bug this guards: toISOString() would roll a late-evening lesson into
  // tomorrow for anyone west of UTC, breaking the streak for the exact parent
  // the app is written for — the one reading after bedtime.
  it('keeps a late-evening time on the same local day', () => {
    expect(localDayKey(new Date(2026, 8, 12, 23, 30))).toBe('2026-09-12');
  });

  it('keeps an early-morning time on the same local day', () => {
    expect(localDayKey(new Date(2026, 8, 12, 0, 15))).toBe('2026-09-12');
  });
});

describe('getStreak', () => {
  it('is zero with no history', async () => {
    await expect(getStreak()).resolves.toBe(0);
  });

  it('counts consecutive days ending today', async () => {
    seedDays(2, 1, 0);
    await expect(getStreak()).resolves.toBe(3);
  });

  // Midnight must not wipe the number out from under a parent who read last
  // night and opened the app this morning.
  it('still counts when the last active day was yesterday', async () => {
    seedDays(2, 1);
    await expect(getStreak()).resolves.toBe(2);
  });

  it('stops at a gap rather than counting total days', async () => {
    seedDays(5, 4, 1, 0);
    await expect(getStreak()).resolves.toBe(2);
  });

  it('is zero once two days have been missed', async () => {
    seedDays(3, 2);
    await expect(getStreak()).resolves.toBe(0);
  });

  it('counts a day once however many sections were finished', async () => {
    await recordActiveDay();
    await recordActiveDay();
    await recordActiveDay();
    await expect(getStreak()).resolves.toBe(1);
  });

  it('survives a corrupted value instead of throwing', async () => {
    mockStore[STORAGE_KEYS.ACTIVE_DAYS] = 'not json';
    await expect(getStreak()).resolves.toBe(0);
  });

  // The Learn header shows the count always, zero included, so zero is a state
  // the UI renders rather than a state it hides. A parent with a real history
  // who lapsed must read as 0 — not as their old streak, and not as an error.
  it('is zero after a lapse, however long the run before it was', async () => {
    seedDays(12, 11, 10, 9, 8, 7, 6);
    await expect(getStreak()).resolves.toBe(0);
  });

  it('restarts from one when a lapsed parent comes back', async () => {
    seedDays(12, 11, 10);
    await recordActiveDay();
    await expect(getStreak()).resolves.toBe(1);
  });
});
