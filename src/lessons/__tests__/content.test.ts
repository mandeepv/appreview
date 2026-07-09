import { parseLesson } from '../schema';
import { LESSON_REGISTRY } from '../registry';
import { sprinklers } from '../content/sprinklers';
import { recordingDeepBondMoments } from '../content/recordingDeepBondMoments';

// Previews the Phase-4 content-validation CI test: every registered lesson
// must zod-parse. Broken content fails this test (and, in Phase 4, CI).
describe('every registered lesson validates against the schema', () => {
  for (const [slug, lesson] of Object.entries(LESSON_REGISTRY)) {
    it(`${slug} parses`, () => {
      expect(() => parseLesson(lesson)).not.toThrow();
    });
  }
});

describe('sprinklers content', () => {
  it('has the exact storage key and 5 sections summing to 52 screens', () => {
    const p = parseLesson(sprinklers);
    expect(p.storageKey).toBe('@sprinklers_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4', '5']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([10, 13, 14, 9, 6]);
    expect(p.sections.reduce((n, s) => n + s.screens.length, 0)).toBe(52);
  });
});

describe('recordingDeepBondMoments content', () => {
  it('has the exact storage key and 1 section of 6 screens', () => {
    const p = parseLesson(recordingDeepBondMoments);
    expect(p.storageKey).toBe('@recording_deep_bond_moments_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1']);
    expect(p.sections[0].screens.length).toBe(6);
  });
});
