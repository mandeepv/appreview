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
}));

jest.mock('../../services/lessonProgressService', () => ({
  getRemoteSections: jest.fn(() => Promise.resolve([])),
  getAllRemoteProgress: jest.fn(() => Promise.resolve(null)),
  pushSections: jest.fn(() => Promise.resolve()),
}));

import { getCompletedPathKeys } from '../pathProgress';
import { currentIndex, PATH_NODES } from '../units';
import { getLesson } from '../registry';

/**
 * The upgrade path, simulated against what v1.2.0 ACTUALLY left on disk.
 *
 * The unit tests around the backfill check its own logic; these check the
 * thing that matters to a person — where the path points on the first launch
 * after updating. It is the highest-risk regression in this release, because
 * the path is sequentially LOCKED: pointing a returning parent at Lesson 1
 * does not merely look wrong, it re-locks every lesson they had already
 * reached.
 *
 * v1.2.0's disk state, verified against that tag: one AsyncStorage key per HUB
 * lesson holding its completed section ids, and NOTHING AT ALL for flow
 * lessons 1-4 (they had no storageKey, and nothing in Supabase either).
 */

/** Seed the per-lesson stores exactly as v1.2.0 wrote them. */
function seedV120(hubLessonsFinished: number) {
  const hubSlugs = Array.from(new Set(PATH_NODES.map((n) => n.lessonSlug))).filter(
    (slug) => getLesson(slug)?.storageKey,
  );
  for (const slug of hubSlugs.slice(0, hubLessonsFinished)) {
    const lesson = getLesson(slug)!;
    mockStore[lesson.storageKey!] = JSON.stringify(lesson.sections.map((s) => s.id));
  }
}

beforeEach(() => {
  mockStore = {};
});

describe('first launch after upgrading from v1.2.0', () => {
  // The headline case: someone who finished the whole app. Before the backfill
  // they were pointed at Lesson 1 and told to start over.
  it('does not send a finished parent back to lesson 1', async () => {
    seedV120(Number.MAX_SAFE_INTEGER);
    const done = await getCompletedPathKeys();
    expect(done).toHaveLength(PATH_NODES.length);
    expect(currentIndex(done)).toBe(PATH_NODES.length);
  });

  it('puts a partway parent past the flow lessons, not before them', async () => {
    seedV120(2);
    const done = await getCompletedPathKeys();
    // Flow lessons 1-4 lead the path; anyone with hub progress walked them.
    expect(currentIndex(done)).toBeGreaterThan(4);
  });

  // The guard against over-granting: a genuinely new install has no hub
  // progress, so it must start at the very beginning like anyone else.
  it('leaves a brand-new install at the first node', async () => {
    const done = await getCompletedPathKeys();
    expect(done).toHaveLength(0);
    expect(currentIndex(done)).toBe(0);
  });

  // The backfill is one-shot. A second read in the same session (the Learn
  // screen re-reads on every focus) must not keep re-granting.
  it('is stable across repeated reads', async () => {
    seedV120(2);
    const first = await getCompletedPathKeys();
    const second = await getCompletedPathKeys();
    expect(second).toEqual(first);
  });
});
