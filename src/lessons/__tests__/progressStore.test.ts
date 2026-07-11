// Round-trip / byte-compatibility test for createProgressStore (SPEC-09 R3).
// Proves the factory reads + writes the SAME key and JSON format the old
// hand-written utils/*Progress.ts modules used, so existing users' progress
// survives the migration.

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

import { createProgressStore } from '../progressStore';

const KEY = '@dissociation_completed_sections';

describe('createProgressStore — byte-compatible with the old utils', () => {
  beforeEach(() => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  });

  it('reads progress written in the OLD format (array of id strings)', async () => {
    // Simulate what the old util left in storage.
    mockStore[KEY] = JSON.stringify(['1', '2']);
    const store = createProgressStore(KEY);
    expect(await store.getCompletedSections()).toEqual(['1', '2']);
  });

  it('writes the SAME key + JSON format the old util wrote', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1');
    await store.markSectionComplete('2');
    // Exact on-disk representation must match the old util's output.
    expect(mockStore[KEY]).toBe(JSON.stringify(['1', '2']));
  });

  it('is idempotent (no duplicate section ids)', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1');
    await store.markSectionComplete('1');
    expect(mockStore[KEY]).toBe(JSON.stringify(['1']));
  });

  it('round-trips: write via factory, read back the array', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('3');
    expect(await store.getCompletedSections()).toEqual(['3']);
  });

  it('reset clears the key', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1');
    await store.reset();
    expect(mockStore[KEY]).toBeUndefined();
    expect(await store.getCompletedSections()).toEqual([]);
  });

  it('missing key → empty array (matches old util default)', async () => {
    const store = createProgressStore('@never_written_key');
    expect(await store.getCompletedSections()).toEqual([]);
  });
});

// SPEC-18 R1 — flow lessons 1–4 gained a completion key. They are single-section
// (id '1'), so completing that one section IS completing the lesson. Verify the
// factory round-trips on the real flow-lesson key and that the store treats the
// single section as complete (this is the signal locking reads).
describe('createProgressStore — flow-lesson single-section completion (SPEC-18)', () => {
  const FLOW_KEY = '@kinderwell_lesson1_completed_sections';

  beforeEach(() => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  });

  it('completing section 1 records it under the namespaced key', async () => {
    const store = createProgressStore(FLOW_KEY);
    await store.markSectionComplete('1');
    expect(mockStore[FLOW_KEY]).toBe(JSON.stringify(['1']));
    expect(await store.getCompletedSections()).toEqual(['1']);
  });

  it('a flow lesson with 1 section is complete once that section is done', async () => {
    const store = createProgressStore(FLOW_KEY);
    await store.markSectionComplete('1');
    const done = await store.getCompletedSections();
    const totalSections = 1; // flow lessons are single-section
    expect(done.length >= totalSections).toBe(true);
  });
});

// SPEC-FIX-11 R3 — replays must count as streak activity. recordStreakActivity
// runs on EVERY markSectionComplete, not only the first-time write, so a user
// who finished everything can still extend a streak by replaying. Here we assert
// that re-completing an already-completed section still writes to ACTIVITY_DAYS
// (the streak signal) — previously it was gated behind the dedup guard and did
// nothing on a replay.
describe('createProgressStore — replays record streak activity (SPEC-FIX-11 R3)', () => {
  const ACTIVITY_KEY = '@kinderwell_activity_days';
  const KEY = '@kinderwell_lesson1_completed_sections';

  beforeEach(() => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  });

  it('first completion records streak activity', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1');
    // Let the fire-and-forget streak write settle.
    await new Promise((r) => setImmediate(r));
    expect(mockStore[ACTIVITY_KEY]).toBeDefined();
    expect(JSON.parse(mockStore[ACTIVITY_KEY]).days.length).toBe(1);
  });

  it('re-completing an already-done section STILL records streak activity (the replay fix)', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1'); // first time
    await new Promise((r) => setImmediate(r));
    // Wipe the streak log to prove the SECOND (replay) call writes on its own.
    delete mockStore[ACTIVITY_KEY];
    await store.markSectionComplete('1'); // replay — section already completed
    await new Promise((r) => setImmediate(r));
    expect(mockStore[ACTIVITY_KEY]).toBeDefined();
    expect(JSON.parse(mockStore[ACTIVITY_KEY]).days.length).toBe(1);
    // And the completed-sections set is unchanged (still just '1', idempotent).
    expect(JSON.parse(mockStore[KEY])).toEqual(['1']);
  });
});
