// SPEC-09 Phase 3 — the lesson registry.
//
// Maps a lesson slug → its data-driven Lesson object. The generic hub +
// controller resolve a lesson from here by slug (passed as the route param
// typed via SPEC-08). As each hand-built lesson is converted to data (one
// commit per lesson), its content module is registered here.

import type { Lesson } from './schema';
import { lesson1 } from './content/lesson1';
import { lesson2 } from './content/lesson2';
import { lesson3 } from './content/lesson3';
import { lesson4 } from './content/lesson4';
import { sprinklers } from './content/sprinklers';
import { recordingDeepBondMoments } from './content/recordingDeepBondMoments';
import { emotionalSandbags } from './content/emotionalSandbags';
import { helpingProcessEmotions } from './content/helpingProcessEmotions';
import { dissociation } from './content/dissociation';
import { namingEmotions } from './content/namingEmotions';
import { serveReturn } from './content/serveReturn';
import { labelingEmotions } from './content/labelingEmotions';
import { communicationMistakes } from './content/communicationMistakes';

export const LESSON_REGISTRY: Record<string, Lesson> = {
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  sprinklers,
  recordingDeepBondMoments,
  emotionalSandbags,
  helpingProcessEmotions,
  dissociation,
  namingEmotions,
  serveReturn,
  labelingEmotions,
  communicationMistakes,
};

export function getLesson(slug: string): Lesson | undefined {
  return LESSON_REGISTRY[slug];
}
