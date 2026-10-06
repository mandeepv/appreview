// SPEC-20 R6 (Phase 6 gap-fill) — progressStore's edges: storage failures,
// non-synced keys, and the sign-in merge across devices. The main paths are
// in progressStore.test and progressSync.test.
//
// A failed LOCAL write is the dangerous one: by then the controller has
// already fired lesson_section_completed (maybe lesson_completed), so
// analytics say the parent finished while the rail still shows the section
// waiting — and unlike the remote sync there is no retry to heal it. It must
// be reported, and must never throw into the lesson. AsyncStorage and Sentry
// are the global fakes.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProgressStore, mergeRemoteIntoLocal } from '../progressStore';
import { resetAnalyticsFakes, sentryModule } from '../../test/analytics';
import { queryLog, resetSupabaseFake, setTableResult, supabase } from '../../test/supabase';
import { makeUser } from '../../test/factories';

const KEY = '@recording_deep_bond_moments_completed_sections';

beforeEach(async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  await AsyncStorage.clear();
  resetAnalyticsFakes();
  resetSupabaseFake();
});

afterEach(() => jest.restoreAllMocks());

it('a failed local write is reported (always — no streak threshold) and never throws', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('disk full'));
  await expect(createProgressStore(KEY).markSectionComplete('1')).resolves.toBeUndefined();
  expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
    context: 'mark_section_complete_local_write',
    storageKey: KEY,
    sectionId: '1',
  });
});

it('unreadable saved progress reads as none, not a crash', async () => {
  await AsyncStorage.setItem(KEY, '{corrupt');
  await expect(createProgressStore(KEY).getCompletedSections()).resolves.toEqual([]);
});

it('the sign-in merge never throws, even when storage fails', async () => {
  const getItem = AsyncStorage.getItem as jest.Mock;
  const working = getItem.getMockImplementation();
  getItem.mockRejectedValue(new Error('storage unavailable'));
  try {
    await expect(mergeRemoteIntoLocal()).resolves.toBeUndefined();
  } finally {
    getItem.mockImplementation(working);
  }
});

it('a failed reset never throws', async () => {
  (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('disk error'));
  await expect(createProgressStore(KEY).reset()).resolves.toBeUndefined();
});

it('a non-Error failure is still reported, as an Error', async () => {
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce('quota exceeded');
  await createProgressStore(KEY).markSectionComplete('1');
  expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({ sectionId: '1' }));
});

it('a store whose key belongs to no synced lesson stays local — nothing is sent', async () => {
  supabase.auth.getUser.mockResolvedValue({ data: { user: makeUser('user-a') }, error: null });
  await createProgressStore('@not_a_lesson').markSectionComplete('1');
  await new Promise((resolve) => setImmediate(resolve)); // the sync is fire-and-forget
  expect(await createProgressStore('@not_a_lesson').getCompletedSections()).toEqual(['1']);
  expect(queryLog.filter((q) => q.op === 'upsert')).toEqual([]);
});

// SPEC-13: on sign-in, another device's progress appears here.
it('sign-in merge: server-only progress lands on this device; lessons with none are not written', async () => {
  supabase.auth.getUser.mockResolvedValue({ data: { user: makeUser('user-a') }, error: null });
  setTableResult('lesson_progress', {
    data: [{ lesson_id: 'recordingDeepBondMoments', completed_sections: ['1'] }],
    error: null,
  });
  await mergeRemoteIntoLocal();
  expect(await createProgressStore(KEY).getCompletedSections()).toEqual(['1']);
  expect(await AsyncStorage.getItem('@sprinklers_completed_sections')).toBeNull();
});
