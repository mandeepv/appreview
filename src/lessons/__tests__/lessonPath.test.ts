// SPEC-18 R4 — LESSON_PATH integrity + flow-lesson completion keys.
//
// LESSON_PATH is the single source of lesson order that LearnScreen renders and
// unlockPolicy walks. These checks keep it honest against the registry and the
// navigation table, and confirm the flow lessons 1–4 now carry the completion
// keys locking depends on (SPEC-18 R1).

import { LESSON_PATH } from '../unlockPolicy';
import { LESSON_REGISTRY, getLesson, getLessonByStorageKey } from '../registry';
import { LESSON_NAV } from '../../navigation/lessonRoutes';
import { STORAGE_KEYS } from '../../constants/storageKeys';

describe('LESSON_PATH integrity', () => {
  it('has exactly 13 lessons', () => {
    expect(LESSON_PATH).toHaveLength(13);
  });

  it('has no duplicate slugs', () => {
    expect(new Set(LESSON_PATH).size).toBe(LESSON_PATH.length);
  });

  it('every path slug exists in LESSON_REGISTRY', () => {
    for (const slug of LESSON_PATH) {
      expect(LESSON_REGISTRY[slug]).toBeDefined();
    }
  });

  it('matches the LESSON_NAV order (module ids 1..13 in path order)', () => {
    const navOrder = Object.keys(LESSON_NAV)
      .sort((a, b) => Number(a) - Number(b))
      .map((id) => LESSON_NAV[id].slug);
    expect([...LESSON_PATH]).toEqual(navOrder);
  });

  it('every LESSON_NAV target slug is reachable from the path', () => {
    const pathSet = new Set<string>(LESSON_PATH);
    for (const target of Object.values(LESSON_NAV)) {
      expect(pathSet.has(target.slug)).toBe(true);
    }
  });
});

describe('flow lessons 1-4 — completion keys (SPEC-18 R1)', () => {
  const cases: [string, string][] = [
    ['lesson1', STORAGE_KEYS.LESSON1_COMPLETED_SECTIONS],
    ['lesson2', STORAGE_KEYS.LESSON2_COMPLETED_SECTIONS],
    ['lesson3', STORAGE_KEYS.LESSON3_COMPLETED_SECTIONS],
    ['lesson4', STORAGE_KEYS.LESSON4_COMPLETED_SECTIONS],
  ];

  it('each flow lesson carries its namespaced storageKey', () => {
    for (const [slug, key] of cases) {
      expect(getLesson(slug)?.storageKey).toBe(key);
    }
  });

  it('getLessonByStorageKey resolves each flow-lesson key back to the lesson', () => {
    for (const [slug, key] of cases) {
      expect(getLessonByStorageKey(key)?.slug).toBe(slug);
    }
  });

  it('the new keys use the @kinderwell_ namespace (new keys, never shipped)', () => {
    for (const [, key] of cases) {
      expect(key.startsWith('@kinderwell_')).toBe(true);
    }
  });
});
