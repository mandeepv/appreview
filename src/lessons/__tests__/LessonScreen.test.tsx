// SPEC-20 R7 — lesson analytics, through the real screen and controller.
//
// `lesson_started` has regressed in both directions (see
// lessonStartedSemantics.test, which pins the structural facts): it once
// stopped firing for nine lessons, then fired on every screen, because each
// Next pushes a fresh LessonScreen. The rule: it fires when the lesson is
// OPENED (`entry: true`), and the pushes that advance a lesson omit the flag.
// `lesson_completed` must fire once — on the write that completes the last
// section — not again when a finished lesson is replayed.
//
// The lesson is recordingDeepBondMoments: one section, six content screens
// ("Next" × 5, then "Finish lesson"). Progress is the real store on the
// AsyncStorage fake.

import { fireEvent, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonScreen } from '../LessonScreen';
import { createProgressStore } from '../progressStore';
import { renderScreen } from '../../test/render';
import { capturedEvents, resetAnalyticsFakes } from '../../test/analytics';
import { resetSupabaseFake } from '../../test/supabase';

const LESSON = 'recordingDeepBondMoments';
const STORAGE_KEY = '@recording_deep_bond_moments_completed_sections';
const LAST_SCREEN = 5;

const openLesson = (params: { screenIndex: number; entry?: boolean }) =>
  renderScreen(LessonScreen, {
    name: 'LessonScreen',
    params: { lessonId: LESSON, sectionIndex: 0, returnTo: 'MainTabs', ...params },
  });

const count = (event: string) => capturedEvents().filter((e) => e === event).length;

beforeEach(async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  await AsyncStorage.clear();
  resetSupabaseFake();
  resetAnalyticsFakes();
});

afterEach(() => jest.restoreAllMocks());

describe('lesson_started fires once per visit', () => {
  it('opened from the path (entry: true) → lesson_started, once', async () => {
    await openLesson({ screenIndex: 0, entry: true });
    expect(count('lesson_started')).toBe(1);
  });

  it('Next pushes the following screen WITHOUT the entry flag, and that screen stays quiet', async () => {
    const navigation = await openLesson({ screenIndex: 0, entry: true });
    await fireEvent.press(screen.getByText('Next'));

    expect(navigation.push).toHaveBeenCalledTimes(1);
    const [route, params] = navigation.push.mock.calls[0];
    expect(route).toBe('LessonScreen');
    expect(params).toMatchObject({ lessonId: LESSON, sectionIndex: 0, screenIndex: 1 });
    expect(params.entry).not.toBe(true);

    // The pushed screen mounts as the navigator would mount it.
    await openLesson(params);
    expect(count('lesson_started')).toBe(1);
  });
});

describe('lesson_completed fires once, on the write that finishes the lesson', () => {
  it('finishing the last section → lesson_completed, once, and the section is saved', async () => {
    const navigation = await openLesson({ screenIndex: LAST_SCREEN });
    await fireEvent.press(screen.getByText('Finish lesson'));

    expect(count('lesson_section_completed')).toBe(1);
    expect(count('lesson_completed')).toBe(1);
    expect(await createProgressStore(STORAGE_KEY).getCompletedSections()).toEqual(['1']);
    expect(navigation.push).toHaveBeenCalledWith(
      'LessonScreen',
      expect.objectContaining({ lessonId: LESSON, screenIndex: LAST_SCREEN + 1 }),
    );
  });

  it('replaying a lesson already finished → the section is logged, the lesson is not completed again', async () => {
    await createProgressStore(STORAGE_KEY).markSectionComplete('1');
    resetAnalyticsFakes();

    await openLesson({ screenIndex: LAST_SCREEN });
    await fireEvent.press(screen.getByText('Finish lesson'));

    expect(count('lesson_section_completed')).toBe(1);
    expect(count('lesson_completed')).toBe(0);
  });
});
