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
