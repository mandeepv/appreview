import * as fs from 'fs';
import * as path from 'path';
import { parseLesson } from '../schema';
import { LESSON_REGISTRY } from '../registry';
import { HUB_META } from '../hubMeta';
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
import { STORAGE_KEYS } from '../../constants/storageKeys';

// SPEC-13 R6 — registry-completeness. Every content file in
// src/lessons/content/ MUST be registered in LESSON_REGISTRY (keyed by its
// slug = filename). Without this, dropping a new content/*.ts file that nobody
// registered would silently skip validation + never render — a real footgun.
// The content files are named exactly by slug (sprinklers.ts → 'sprinklers').
describe('registry completeness', () => {
  const contentDir = path.join(__dirname, '..', 'content');
  const contentSlugs = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => f.replace(/\.ts$/, ''));
  const registrySlugs = Object.keys(LESSON_REGISTRY);

  it('every content/*.ts file is registered in LESSON_REGISTRY', () => {
    const unregistered = contentSlugs.filter((s) => !registrySlugs.includes(s));
    expect(unregistered).toEqual([]);
  });

  it('every registry entry has a matching content file (no phantom slugs)', () => {
    const missingFile = registrySlugs.filter((s) => !contentSlugs.includes(s));
    expect(missingFile).toEqual([]);
  });

  it("each registry entry's slug field matches its key", () => {
    for (const [key, lesson] of Object.entries(LESSON_REGISTRY)) {
      expect(lesson.slug).toBe(key);
    }
  });
});

// SPEC-FIX-03 R6 — hubMeta completeness. Every HUB (section-based) lesson must
// have a HUB_META entry, and HUB_META must not carry phantom slugs. A missing
// key would previously have crashed the hub at render (meta.label); now the hub
// falls back gracefully, but a missing entry is still a bug this catches at
// test time. Flow lessons intentionally have no hub meta.
//
// SPEC-18 R1 note: "hub lesson" was previously equivalent to "has a storageKey",
// but flow lessons 1–4 now carry a storageKey too (for locking). They are still
// NOT hub lessons — they launch directly into LessonScreen, not a hub — so the
// discriminator is now "has a storageKey AND is not a flow lesson".
const FLOW_LESSON_SLUGS = new Set(['lesson1', 'lesson2', 'lesson3', 'lesson4']);
describe('hubMeta completeness', () => {
  const hubSlugs = Object.values(LESSON_REGISTRY)
    .filter((l) => l.storageKey && !FLOW_LESSON_SLUGS.has(l.slug))
    .map((l) => l.slug);
  const metaSlugs = Object.keys(HUB_META);

  it('every hub-style lesson has a HUB_META entry', () => {
    const missing = hubSlugs.filter((s) => !metaSlugs.includes(s));
    expect(missing).toEqual([]);
  });

  it('HUB_META has no phantom slugs (each key is a real hub lesson)', () => {
    const phantom = metaSlugs.filter((s) => !hubSlugs.includes(s));
    expect(phantom).toEqual([]);
  });

  it('every HUB_META entry has one section-meta per lesson section', () => {
    for (const slug of hubSlugs) {
      const lesson = LESSON_REGISTRY[slug];
      expect(HUB_META[slug].sections).toHaveLength(lesson.sections.length);
    }
  });
});

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
  // SPEC-18 R1: flow lessons are still single-section + linear, but they now
  // carry a namespaced storageKey so their completion is recorded + synced
  // (sequential locking needs the signal). The controller's completeSection
  // runs its storageKey branch for them now — verified here by asserting the
  // exact key each lesson maps to.
  const cases: Array<[string, ReturnType<typeof parseLesson> extends never ? never : any, number, string]> = [
    ['lesson1', lesson1, 16, STORAGE_KEYS.LESSON1_COMPLETED_SECTIONS],
    ['lesson2', lesson2, 17, STORAGE_KEYS.LESSON2_COMPLETED_SECTIONS],
    ['lesson3', lesson3, 20, STORAGE_KEYS.LESSON3_COMPLETED_SECTIONS],
    ['lesson4', lesson4, 19, STORAGE_KEYS.LESSON4_COMPLETED_SECTIONS],
  ];
  for (const [slug, raw, screens, key] of cases) {
    it(`${slug}: single section, namespaced storageKey, ${screens} screens`, () => {
      const p = parseLesson(raw);
      expect(p.storageKey).toBe(key);
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
