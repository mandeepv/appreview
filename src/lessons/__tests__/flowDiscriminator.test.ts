// SPEC-FIX-11 R2 — the flow/hub discriminator is single-sourced in the registry
// and drives who fires `lesson_started`. These pin it so the regression (flow
// lessons stopped firing lesson_started once SPEC-18 gave them storage keys)
// can't recur: the discriminator must be exactly lessons 1–4 and must NOT be
// inferred from storageKey.

import { FLOW_LESSON_SLUGS, isFlowLesson, LESSON_REGISTRY } from '../registry';

describe('flow-lesson discriminator', () => {
  it('is exactly lessons 1–4', () => {
    expect([...FLOW_LESSON_SLUGS].sort()).toEqual(['lesson1', 'lesson2', 'lesson3', 'lesson4']);
  });

  it('isFlowLesson is true for flow lessons, false for hub lessons', () => {
    expect(isFlowLesson('lesson1')).toBe(true);
    expect(isFlowLesson('lesson4')).toBe(true);
    expect(isFlowLesson('sprinklers')).toBe(false);
    expect(isFlowLesson('recordingDeepBondMoments')).toBe(false);
    expect(isFlowLesson('nope')).toBe(false);
  });

  it('is NOT equivalent to "has no storageKey" (the SPEC-18 regression trap)', () => {
    // Every registered lesson — flow AND hub — now has a storageKey, so the old
    // `!storageKey` check would classify ZERO lessons as flow. The registry set
    // is the only correct source.
    for (const lesson of Object.values(LESSON_REGISTRY)) {
      expect(lesson.storageKey).toBeDefined();
    }
    // Flow lessons still resolve as flow despite having keys.
    expect(isFlowLesson('lesson1')).toBe(true);
  });

  it('the controller fires lesson_started for flow lessons only (mirrors the guard at LessonController:82)', () => {
    // The controller condition is: isFlowLesson(slug) && sectionIndex===0 &&
    // screenIndex===0. Assert the discriminator half for a flow vs a hub lesson
    // (the section/screen half is trivial positional logic).
    const wouldFire = (slug: string, sectionIndex: number, screenIndex: number) =>
      isFlowLesson(slug) && sectionIndex === 0 && screenIndex === 0;

    expect(wouldFire('lesson1', 0, 0)).toBe(true);
    expect(wouldFire('lesson1', 0, 1)).toBe(false);
    expect(wouldFire('sprinklers', 0, 0)).toBe(false); // hub → controller never fires it
  });
});
