import { PATH_UNITS, PATH_LESSONS, resolveNextLesson, unitProgress } from '../units';
import { LESSON_NAV } from '../../navigation/lessonRoutes';
import { getLesson } from '../registry';

// The path is a second table describing the same thirteen lessons that
// LESSON_NAV and the content registry already describe. Three tables that must
// agree is exactly the shape that drifts silently, so these assert the
// agreement rather than the contents.

describe('the Learn path covers every lesson exactly once', () => {
  it('has all thirteen lessons', () => {
    expect(PATH_LESSONS).toHaveLength(13);
  });

  it('lists no lesson twice', () => {
    const ids = PATH_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers exactly the lessons LESSON_NAV can navigate to', () => {
    expect(PATH_LESSONS.map((l) => l.id).sort()).toEqual(Object.keys(LESSON_NAV).sort());
  });

  // A slug that does not resolve means a node the user can tap and land nowhere.
  it('every slug resolves to real lesson content', () => {
    for (const lesson of PATH_LESSONS) {
      expect(getLesson(lesson.slug)).toBeDefined();
    }
  });

  it('every unit is named and non-empty', () => {
    for (const unit of PATH_UNITS) {
      expect(unit.name.length).toBeGreaterThan(0);
      expect(unit.lessons.length).toBeGreaterThan(0);
    }
  });
});

describe('resolveNextLesson — which node gets emphasised', () => {
  it('points at the very first lesson for a new user', () => {
    expect(resolveNextLesson([])?.slug).toBe('lesson1');
  });

  it('skips past what is finished', () => {
    expect(resolveNextLesson(['lesson1', 'lesson2'])?.slug).toBe('lesson3');
  });

  // Completion is order-independent: a parent can open lesson 9 on night one.
  // "Next" must still be the earliest unfinished lesson, not the one after
  // whatever they happened to finish last.
  it('returns the earliest gap, not the position after the last completion', () => {
    expect(resolveNextLesson(['lesson1', 'sprinklers'])?.slug).toBe('lesson2');
  });

  it('returns null once everything is done', () => {
    expect(resolveNextLesson(PATH_LESSONS.map((l) => l.slug))).toBeNull();
  });

  it('ignores slugs that are not on the path', () => {
    expect(resolveNextLesson(['not-a-lesson'])?.slug).toBe('lesson1');
  });
});

describe('unitProgress', () => {
  it('counts only the lessons in that unit', () => {
    const naming = PATH_UNITS.find((u) => u.id === 'naming')!;
    expect(unitProgress(naming, ['labelingEmotions', 'lesson1'])).toEqual({ done: 1, total: 2 });
  });

  it('reports zero for an untouched unit', () => {
    expect(unitProgress(PATH_UNITS[0], [])).toEqual({ done: 0, total: 4 });
  });
});
