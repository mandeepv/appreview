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

// SPEC-FIX-11 R2 — the flow/hub discriminator, single-sourced here.
//
// "Flow lessons" are the linear numbered lessons 1–4 that launch directly into
// LessonScreen (no hub). "Hub lessons" (5–13) land on LessonHubScreen first.
// This distinction drives who fires `lesson_started` (the controller for flow
// lessons; the hub for hub lessons) and the LearnScreen flow/hub split.
//
// It MUST NOT be inferred from `storageKey`: SPEC-18 R1 gave flow lessons 1–4
// storage keys (so their completion is recorded for the streak/locking), which
// broke the old `!lesson.storageKey` check — the exact regression this fixes.
// The set is the source of truth; consumers import it (never re-derive).
export const FLOW_LESSON_SLUGS: ReadonlySet<string> = new Set([
  'lesson1',
  'lesson2',
  'lesson3',
  'lesson4',
]);

export function isFlowLesson(slug: string): boolean {
  return FLOW_LESSON_SLUGS.has(slug);
}

// SPEC-13 R2 — the progress factory is keyed by storageKey, but the DB syncs by
// lesson slug + needs the section count (to derive the `completed` flag). This
// maps a storageKey back to its lesson so the sync layer behind the factory can
// resolve both.
//
// SPEC-FIX-11 R2: flow lessons now HAVE storageKeys (SPEC-18 R1) and therefore
// appear here and DO sync — the old "flow lessons never sync, so they're absent"
// note is no longer true and has been removed.
const LESSONS_BY_STORAGE_KEY: Record<string, Lesson> = Object.fromEntries(
  Object.values(LESSON_REGISTRY)
    .filter((l) => l.storageKey)
    .map((l) => [l.storageKey as string, l]),
);

export function getLessonByStorageKey(storageKey: string): Lesson | undefined {
  return LESSONS_BY_STORAGE_KEY[storageKey];
}
