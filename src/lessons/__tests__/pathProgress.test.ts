let mockStore: Record<string, string> = {};
let mockThrowingKeys = new Set<string>();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => {
    if (mockThrowingKeys.has(k)) return Promise.reject(new Error('storage unavailable'));
    return Promise.resolve(mockStore[k] ?? null);
  }),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

// The remote mirror is not what this module's contract is about, and leaving it
// live would make these tests depend on a Supabase client.
jest.mock('../../services/lessonProgressService', () => ({
  getRemoteSections: jest.fn(() => Promise.resolve([])),
  getAllRemoteProgress: jest.fn(() => Promise.resolve(null)),
  pushSections: jest.fn(() => Promise.resolve()),
}));

import { getCompletedPathKeys } from '../pathProgress';
import { PATH_NODES } from '../units';
import { getLesson } from '../registry';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const hubNode = PATH_NODES.find((n) => getLesson(n.lessonSlug)?.storageKey)!;
const hubLesson = getLesson(hubNode.lessonSlug)!;
const flowNode = PATH_NODES.find((n) => !getLesson(n.lessonSlug)?.storageKey)!;

beforeEach(() => {
  mockStore = {};
  mockThrowingKeys = new Set();
  // The upgrade backfill runs once per install and would otherwise grant the
  // flow lessons in every test that has hub progress.
  mockStore[STORAGE_KEYS.FLOW_BACKFILL_DONE] = '1';
});

// This module decides what the path shows as DONE, and the path is
// sequentially locked — so an over-report here does not just look wrong, it
// hands a parent a lesson they have not earned and hides the one they were on.

describe('getCompletedPathKeys', () => {
  it('reports nothing for a fresh install', async () => {
    await expect(getCompletedPathKeys()).resolves.toEqual([]);
  });

  it('reads a hub lesson from its own section store', async () => {
    mockStore[hubLesson.storageKey!] = JSON.stringify([hubNode.sectionId]);
    await expect(getCompletedPathKeys()).resolves.toContain(hubNode.key);
  });

  it('reads a flow lesson from the whole-lesson record', async () => {
    mockStore[STORAGE_KEYS.LESSONS_COMPLETED] = JSON.stringify([flowNode.lessonSlug]);
    await expect(getCompletedPathKeys()).resolves.toContain(flowNode.key);
  });

  // THE BUG THIS LOCKS (2026-09 review): a hub lesson whose store threw used to
  // fall through to the whole-lesson record, which marks EVERY section of it
  // done off one flag. A transient read error would skip a parent past a whole
  // lesson, and the sequential lock would then offer them the one after it.
  it('treats an unreadable hub lesson as unfinished, never as complete', async () => {
    mockThrowingKeys.add(hubLesson.storageKey!);
    mockStore[STORAGE_KEYS.LESSONS_COMPLETED] = JSON.stringify([hubNode.lessonSlug]);

    const done = await getCompletedPathKeys();
    const sectionsOfThatLesson = PATH_NODES.filter((n) => n.lessonSlug === hubNode.lessonSlug);
    for (const node of sectionsOfThatLesson) {
      expect(done).not.toContain(node.key);
    }
  });

  it('keeps reporting other lessons when one store throws', async () => {
    mockThrowingKeys.add(hubLesson.storageKey!);
    mockStore[STORAGE_KEYS.LESSONS_COMPLETED] = JSON.stringify([flowNode.lessonSlug]);
    await expect(getCompletedPathKeys()).resolves.toContain(flowNode.key);
  });

  it('survives a corrupted section store instead of throwing', async () => {
    mockStore[hubLesson.storageKey!] = 'not json';
    await expect(getCompletedPathKeys()).resolves.toEqual(expect.any(Array));
  });

  it('only ever returns keys that exist on the path', async () => {
    mockStore[hubLesson.storageKey!] = JSON.stringify([hubNode.sectionId, 'ghost-section']);
    const done = await getCompletedPathKeys();
    const known = new Set(PATH_NODES.map((n) => n.key));
    done.forEach((k) => expect(known.has(k)).toBe(true));
  });
});
