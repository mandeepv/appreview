import { parseLesson } from '../schema';
import { LESSON_REGISTRY } from '../registry';
import { sprinklers } from '../content/sprinklers';
import { recordingDeepBondMoments } from '../content/recordingDeepBondMoments';
import { emotionalSandbags } from '../content/emotionalSandbags';
import { helpingProcessEmotions } from '../content/helpingProcessEmotions';
import { dissociation } from '../content/dissociation';
import { namingEmotions } from '../content/namingEmotions';
import { serveReturn } from '../content/serveReturn';
import { labelingEmotions } from '../content/labelingEmotions';
import { communicationMistakes } from '../content/communicationMistakes';
import { lesson1 } from '../content/lesson1';
import { lesson2 } from '../content/lesson2';
import { lesson3 } from '../content/lesson3';
import { lesson4 } from '../content/lesson4';

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

describe('emotionalSandbags content', () => {
  it('has the exact storage key and 6 sections summing to 47 screens', () => {
    const p = parseLesson(emotionalSandbags);
    expect(p.storageKey).toBe('@emotional_sandbags_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([3, 10, 10, 8, 10, 6]);
    expect(p.sections.reduce((n, s) => n + s.screens.length, 0)).toBe(47);
  });
});

describe('helpingProcessEmotions content', () => {
  it('has the exact storage key and 2 sections summing to 11 screens', () => {
    const p = parseLesson(helpingProcessEmotions);
    expect(p.storageKey).toBe('@helping_process_emotions_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([1, 10]);
  });
});

describe('dissociation content', () => {
  it('has the exact storage key and 4 sections summing to 25 screens', () => {
    const p = parseLesson(dissociation);
    expect(p.storageKey).toBe('@dissociation_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([7, 6, 9, 3]);
  });
});

describe('namingEmotions content', () => {
  it('maps 4 sublessons to sections ids 1..4, 6 screens each', () => {
    const p = parseLesson(namingEmotions);
    // Sublesson ids '1'..'4' MUST equal what markSubLessonComplete stores, so
    // existing progress in @naming_emotions_completed_sublessons survives.
    expect(p.storageKey).toBe('@naming_emotions_completed_sublessons');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([6, 6, 6, 6]);
  });

  it('preserves the interactive input blocks (not flattened to text)', () => {
    const p = parseLesson(namingEmotions);
    const types = p.sections.flatMap((s) => s.screens.flatMap((sc) =>
      sc.kind === 'content' ? sc.blocks.map((b) => b.type) : []));
    // Screen 2 of each sublesson = textInput (4); Screens 4 & 5 = emotionPicker (8).
    expect(types.filter((t) => t === 'textInput')).toHaveLength(4);
    expect(types.filter((t) => t === 'emotionPicker')).toHaveLength(8);
  });
});

describe('serveReturn content', () => {
  it('has the exact storage key and 6 sections summing to 22 screens', () => {
    const p = parseLesson(serveReturn);
    expect(p.storageKey).toBe('@serve_return_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([4, 4, 5, 3, 3, 3]);
  });
});

describe('labelingEmotions content', () => {
  it('has the exact storage key and 4 sections summing to 23 screens', () => {
    const p = parseLesson(labelingEmotions);
    expect(p.storageKey).toBe('@lesson5_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(['1', '2', '3', '4']);
    expect(p.sections.map((s) => s.screens.length)).toEqual([7, 4, 8, 4]);
  });
});

describe('communicationMistakes content', () => {
  it('has the exact storage key and 13 sections summing to 59 screens', () => {
    const p = parseLesson(communicationMistakes);
    expect(p.storageKey).toBe('@communication_mistakes_completed_sections');
    expect(p.sections.map((s) => s.id)).toEqual(
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'],
    );
    expect(p.sections.map((s) => s.screens.length)).toEqual(
      [6, 9, 6, 4, 7, 3, 2, 3, 1, 3, 4, 6, 5],
    );
    expect(p.sections.reduce((n, s) => n + s.screens.length, 0)).toBe(59);
  });
});

describe('flow lessons 1-4', () => {
  // Flow lessons are single-section, linear, and DO NOT persist progress —
  // storageKey must be absent so the controller skips the progress write.
  const cases: Array<[string, ReturnType<typeof parseLesson> extends never ? never : any, number]> = [
    ['lesson1', lesson1, 16],
    ['lesson2', lesson2, 17],
    ['lesson3', lesson3, 20],
    ['lesson4', lesson4, 19],
  ];
  for (const [slug, raw, screens] of cases) {
    it(`${slug}: single section, no storageKey, ${screens} screens`, () => {
      const p = parseLesson(raw);
      expect(p.storageKey).toBeUndefined();
      expect(p.sections).toHaveLength(1);
      expect(p.sections[0].id).toBe('1');
      expect(p.sections[0].screens.length).toBe(screens);
    });
  }

  it('preserves the multi-select quizzes as multiSelectQuiz blocks', () => {
    const types = [lesson3, lesson4].flatMap((l) =>
      parseLesson(l).sections.flatMap((s) => s.screens.flatMap((sc) =>
        sc.kind === 'content' ? sc.blocks.map((b) => b.type) : [])));
    // Lesson3 has 1 multiSelectQuiz, Lesson4 has 3.
    expect(types.filter((t) => t === 'multiSelectQuiz')).toHaveLength(4);
  });
});
