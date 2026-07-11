// SPEC-19 R4 — streakStore: local-first record/read, sign-in merge, trim, and
// the analytics transitions. Mocks AsyncStorage + the lazy-required service +
// Sentry + analytics, so no Supabase client is loaded (mirrors progressSync).

const mockStore: Record<string, string> = {};

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
}));

type RecordActivityOutcome = 'ok' | 'skipped' | 'failed';
const mockRecord = jest.fn((_date: string): Promise<RecordActivityOutcome> => Promise.resolve('ok'));
const mockGetDays = jest.fn((): Promise<string[] | null> => Promise.resolve([]));
jest.mock('../../services/streakService', () => ({
  recordActivity: (date: string) => mockRecord(date),
  getActivityDays: () => mockGetDays(),
}));

const mockReportError = jest.fn();
jest.mock('../../config/sentry', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

const mockDayRecorded = jest.fn();
const mockFreezeUsed = jest.fn();
const mockLost = jest.fn();
jest.mock('../../lib/analytics', () => ({
  trackStreakDayRecorded: (n: number) => mockDayRecorded(n),
  trackStreakFreezeUsed: (n: number) => mockFreezeUsed(n),
  trackStreakLost: (n: number) => mockLost(n),
}));

// Imports MUST follow the jest.mock() calls above (the module under test pulls
// the mocked service at require time) — the standard jest-mock ordering, same as
// progressSync.test.ts. Disable import/first for these two required imports.
// eslint-disable-next-line import/first
import { STORAGE_KEYS } from '../../constants/storageKeys';
// eslint-disable-next-line import/first
import {
  recordActivityToday,
  getStreak,
  mergeRemoteActivityIntoLocal,
  trimDays,
  localToday,
} from '../streakStore';

const KEY = STORAGE_KEYS.ACTIVITY_DAYS;

// A fixed clock helper: build a Date at local noon on the given Y-M-D.
const at = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  mockRecord.mockClear();
  mockGetDays.mockClear();
  mockReportError.mockClear();
  mockDayRecorded.mockClear();
  mockFreezeUsed.mockClear();
  mockLost.mockClear();
});

describe('localToday', () => {
  it('formats device-local Y-M-D (not UTC)', () => {
    expect(localToday(at('2026-07-12'))).toBe('2026-07-12');
  });
});

describe('recordActivityToday — idempotent daily append', () => {
  it('first completion of the day records + celebrates + fires streak_day_recorded', async () => {
    const r = await recordActivityToday(at('2026-07-12'));
    expect(r.newlyRecordedToday).toBe(true);
    expect(r.streak.current).toBe(1);
    expect(mockRecord).toHaveBeenCalledWith('2026-07-12');
    expect(mockDayRecorded).toHaveBeenCalledWith(1);
    // Persisted.
    expect(JSON.parse(mockStore[KEY]).days).toEqual(['2026-07-12']);
  });

  it('second completion the SAME day does not re-record or re-celebrate', async () => {
    await recordActivityToday(at('2026-07-12'));
    mockRecord.mockClear();
    mockDayRecorded.mockClear();
    const r = await recordActivityToday(at('2026-07-12'));
    expect(r.newlyRecordedToday).toBe(false);
    expect(mockRecord).not.toHaveBeenCalled();
    expect(mockDayRecorded).not.toHaveBeenCalled();
  });

  it('never throws into the caller even if the store is corrupt', async () => {
    mockStore[KEY] = 'not-json';
    await expect(recordActivityToday(at('2026-07-12'))).resolves.toBeDefined();
  });

  it('fires streak_freeze_used when the recording bridges a gap ending today', async () => {
    // Pre-seed: 07-10 active, 07-11 missing, record 07-12 → bridge 07-11.
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-09', '2026-07-10'], longestEver: 2, lastKnownStreak: 2 });
    const r = await recordActivityToday(at('2026-07-12'));
    expect(r.streak.freezeUsedOn).toBe('2026-07-11');
    expect(mockFreezeUsed).toHaveBeenCalled();
  });
});

describe('getStreak — streak_lost transition (fire once)', () => {
  it('fires streak_lost once when a run of >1 collapses', async () => {
    // Last known 5, but the days are all old → current collapses to 0.
    mockStore[KEY] = JSON.stringify({
      days: ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'],
      longestEver: 5,
      lastKnownStreak: 5,
    });
    const s = await getStreak(at('2026-07-12'));
    expect(s.current).toBe(0);
    expect(mockLost).toHaveBeenCalledWith(5);
    // A second read does NOT re-fire (lastKnownStreak was persisted to 0).
    mockLost.mockClear();
    await getStreak(at('2026-07-12'));
    expect(mockLost).not.toHaveBeenCalled();
  });

  it('does not fire when the streak is intact', async () => {
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-11', '2026-07-12'], longestEver: 2, lastKnownStreak: 2 });
    await getStreak(at('2026-07-12'));
    expect(mockLost).not.toHaveBeenCalled();
  });
});

describe('recordActivityToday — service outcomes never throw', () => {
  it("'skipped' (signed-out) does not report an error", async () => {
    mockRecord.mockResolvedValueOnce('skipped');
    await recordActivityToday(at('2026-07-12'));
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it("a single 'failed' does not report (transient offline is silent)", async () => {
    mockRecord.mockResolvedValueOnce('failed');
    await recordActivityToday(at('2026-07-12'));
    expect(mockReportError).not.toHaveBeenCalled();
  });
});

describe('mergeRemoteActivityIntoLocal — sign-in union (non-destructive)', () => {
  it('unions remote dates into local', async () => {
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-12'], longestEver: 1, lastKnownStreak: 1 });
    mockGetDays.mockResolvedValueOnce(['2026-07-10', '2026-07-11']);
    await mergeRemoteActivityIntoLocal();
    const days = JSON.parse(mockStore[KEY]).days.sort();
    expect(days).toEqual(['2026-07-10', '2026-07-11', '2026-07-12']);
  });

  it('a null fetch (error) skips the merge entirely (never wipes local)', async () => {
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-12'], longestEver: 1, lastKnownStreak: 1 });
    mockGetDays.mockResolvedValueOnce(null);
    await mergeRemoteActivityIntoLocal();
    expect(JSON.parse(mockStore[KEY]).days).toEqual(['2026-07-12']);
  });

  it('pushes local-only dates up to the service', async () => {
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-12'], longestEver: 1, lastKnownStreak: 1 });
    mockGetDays.mockResolvedValueOnce([]); // remote has nothing
    await mergeRemoteActivityIntoLocal();
    expect(mockRecord).toHaveBeenCalledWith('2026-07-12');
  });
});

describe('trimDays', () => {
  it('keeps the most recent 400, unique, newest-first', () => {
    // 405 consecutive days → only 400 kept.
    const days: string[] = [];
    for (let i = 0; i < 405; i++) {
      const d = new Date(2025, 0, 1 + i, 12);
      days.push(localToday(d));
    }
    const trimmed = trimDays([...days, ...days]); // duplicated input
    expect(trimmed.length).toBe(400);
    expect(new Set(trimmed).size).toBe(400);
    // Newest first.
    expect(trimmed[0] > trimmed[1]).toBe(true);
  });

  it('longestEver survives trimming (cached separately, not recomputed from trimmed days)', async () => {
    // Seed a long-ago 400-day run cached as longestEver, plus a tiny recent run.
    mockStore[KEY] = JSON.stringify({ days: ['2026-07-12'], longestEver: 365, lastKnownStreak: 0 });
    const s = await getStreak(at('2026-07-12'));
    expect(s.longest).toBe(365); // trimming/recent days can't shrink it
  });
});
