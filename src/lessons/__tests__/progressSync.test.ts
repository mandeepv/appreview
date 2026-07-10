// SPEC-13 R2 — sync-layer tests for the progress store.
//
// Verifies the account-scoped sync behaviour WITHOUT importing the Supabase
// client: the service + registry are mocked. Covers the local-first background
// push and the non-destructive sign-in union merge.

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

// Mock the DB service (the lazy `import('../../services/lessonProgressService')`
// resolves to this — no Supabase client is loaded).
const mockUpsert = jest.fn(
  (_slug: string, _sections: string[], _count: number): Promise<boolean> => Promise.resolve(true),
);
const mockGetAll = jest.fn((): Promise<Record<string, string[]>> => Promise.resolve({}));
jest.mock('../../services/lessonProgressService', () => ({
  upsertSections: (slug: string, sections: string[], count: number) => mockUpsert(slug, sections, count),
  getAllRemoteProgress: () => mockGetAll(),
  getRemoteSections: jest.fn(() => Promise.resolve([])),
}));

// Mock the registry so we don't pull in the content files. One synced lesson
// (storageKey + slug + 3 sections) and one flow lesson (no storageKey).
jest.mock('../registry', () => {
  const synced = {
    slug: 'dissociation',
    storageKey: '@dissociation_completed_sections',
    sections: [{ id: '1' }, { id: '2' }, { id: '3' }],
  };
  const flow = { slug: 'lesson1', sections: [{ id: '1' }] };
  return {
    LESSON_REGISTRY: { dissociation: synced, lesson1: flow },
    getLessonByStorageKey: (key: string) =>
      key === synced.storageKey ? synced : undefined,
  };
});

import { createProgressStore, mergeRemoteIntoLocal } from '../progressStore';

const KEY = '@dissociation_completed_sections';

// Flush pending microtasks/promises — the background sync uses dynamic
// import(), which resolves over several microtask ticks. A macrotask boundary
// (setImmediate) guarantees they've all run.
const flush = () => new Promise((resolve) => setImmediate(resolve));

beforeEach(() => {
  for (const k of Object.keys(mockStore)) delete mockStore[k];
  mockUpsert.mockClear();
  mockGetAll.mockClear();
  mockUpsert.mockResolvedValue(true);
  mockGetAll.mockResolvedValue({});
});

describe('local-first background sync', () => {
  it('writes locally AND pushes the section array to the DB', async () => {
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1');
    // local write happened
    expect(mockStore[KEY]).toBe(JSON.stringify(['1']));
    // background upsert fired with slug + sections + section count
    // (flush the microtask queue the fire-and-forget push scheduled)
    await flush();
    expect(mockUpsert).toHaveBeenCalledWith('dissociation', ['1'], 3);
  });

  it('does not re-sync when the section was already complete (idempotent)', async () => {
    mockStore[KEY] = JSON.stringify(['1']);
    const store = createProgressStore(KEY);
    await store.markSectionComplete('1'); // no-op
    await flush();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe('mergeRemoteIntoLocal — sign-in union (non-destructive)', () => {
  it('unions remote completions into local without dropping either side', async () => {
    mockStore[KEY] = JSON.stringify(['1']); // local had section 1
    mockGetAll.mockResolvedValue({ dissociation: ['2', '3'] }); // remote had 2,3

    await mergeRemoteIntoLocal();

    const merged = JSON.parse(mockStore[KEY]) as string[];
    expect(merged.sort()).toEqual(['1', '2', '3']); // union, nothing lost
  });

  it('pushes the merged union back to the DB so remote converges', async () => {
    mockStore[KEY] = JSON.stringify(['1']);
    mockGetAll.mockResolvedValue({ dissociation: ['2'] });

    await mergeRemoteIntoLocal();
    await flush();

    // union ['1','2'] written back; last upsert call carries the union
    const calls = mockUpsert.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe('dissociation');
    expect([...lastCall[1]].sort()).toEqual(['1', '2']);
  });

  it('leaves local untouched when local already covers remote', async () => {
    mockStore[KEY] = JSON.stringify(['1', '2', '3']);
    mockGetAll.mockResolvedValue({ dissociation: ['1'] });

    await mergeRemoteIntoLocal();

    expect(JSON.parse(mockStore[KEY])).toEqual(['1', '2', '3']); // unchanged
  });
});
