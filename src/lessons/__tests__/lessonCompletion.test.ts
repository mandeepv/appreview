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

import {
  getCompletedLessons,
  markLessonCompleted,
  clearCompletedLessons,
  backfillFlowLessonsForUpgraders,
} from '../lessonCompletion';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const FLOW = ['lesson1', 'lesson2', 'lesson3', 'lesson4'] as const;

beforeEach(() => {
  mockStore = {};
});

describe('whole-lesson completion', () => {
  it('starts empty', async () => {
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });

  it('records a lesson once, however many times it is marked', async () => {
    await markLessonCompleted('lesson1');
    await markLessonCompleted('lesson1');
    await expect(getCompletedLessons()).resolves.toEqual(['lesson1']);
  });

  // This value is read on every Learn render; a corrupted one must not take the
  // screen down with it.
  it('survives a corrupted value instead of throwing', async () => {
    mockStore[STORAGE_KEYS.LESSONS_COMPLETED] = 'not json';
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });

  it('clears', async () => {
    await markLessonCompleted('lesson1');
    await clearCompletedLessons();
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });
});

// The upgrade path, which only ever runs once per install and is therefore the
// hardest thing to re-test on a device. v1.2.0 persisted NOTHING for flow
// lessons 1-4, so without this every existing parent is pointed back at Lesson
// 1 with the rest of the path re-locked behind the new sequential rule.
describe('backfillFlowLessonsForUpgraders', () => {
  it('marks flow lessons done for a parent with hub progress', async () => {
    await backfillFlowLessonsForUpgraders(true, FLOW);
    await expect(getCompletedLessons()).resolves.toEqual([...FLOW]);
  });

  // A genuinely new install has no hub progress and must not be handed four
  // lessons it never did.
  it('grants nothing when there is no hub progress', async () => {
    await backfillFlowLessonsForUpgraders(false, FLOW);
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });

  it('keeps lessons the parent had already finished', async () => {
    await markLessonCompleted('sprinklers');
    await backfillFlowLessonsForUpgraders(true, FLOW);
    const done = await getCompletedLessons();
    expect(done).toContain('sprinklers');
    FLOW.forEach((slug) => expect(done).toContain(slug));
  });

  // The guard that matters most: a parent who resets their progress must not
  // have lessons 1-4 silently re-granted on the next render.
  it('never runs twice, even after progress is cleared', async () => {
    await backfillFlowLessonsForUpgraders(true, FLOW);
    await clearCompletedLessons();
    await backfillFlowLessonsForUpgraders(true, FLOW);
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });

  it('marks itself done even when nothing was granted', async () => {
    await backfillFlowLessonsForUpgraders(false, FLOW);
    expect(mockStore[STORAGE_KEYS.FLOW_BACKFILL_DONE]).toBeDefined();
  });

  // Ordering guard: the attempt flag is written BEFORE the grant, so a failure
  // mid-way cannot leave this retrying on every launch.
  it('does not retry after a failed grant', async () => {
    await backfillFlowLessonsForUpgraders(true, []);
    await backfillFlowLessonsForUpgraders(true, FLOW);
    await expect(getCompletedLessons()).resolves.toEqual([]);
  });
});
