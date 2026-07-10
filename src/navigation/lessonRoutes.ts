// Lesson-ID → navigation-target lookup, extracted out of LearnScreen (a React
// component) so it can be unit-tested without importing the component (SPEC-04
// constraint: tests must not import React components / require a simulator).
//
// The test asserts every target here resolves to a route registered in
// RootNavigator's RootStackParamList — i.e. no lesson can point at a screen
// that doesn't exist. Keeping this table and the param list as the two
// importable "tables" makes that a pure set-containment check.

import type { RootStackParamList } from './types';

// Runtime list of every route name registered in RootNavigator's
// RootStackParamList. RootStackParamList is a TYPE (erased at runtime), so the
// route-coverage test can't enumerate its keys directly — it imports this
// array instead. The `satisfies` check below makes tsc fail if this list ever
// drifts from the param list (missing or extra route), so the two can't get
// out of sync silently. Kept here (a non-component module) so the test never
// has to import the RootNavigator component.
export const ROOT_STACK_ROUTE_NAMES = [
  'MainTabs',
  'LessonScreen',
  'Lesson5Complete',
  'LabelingEmotionsLesson',
  'NamingOurEmotionsLesson',
  'SprinklersLesson',
  'EmotionalSandbagsLesson',
  'CommunicationMistakesLesson',
  'HelpingSomeoneProcessEmotionsLesson',
  'DissociationLesson',
  'ServeAndReturnLesson',
  'RecordingDeepBondMomentsLesson',
] as const satisfies readonly (keyof RootStackParamList)[];

// Compile-time guard that ROOT_STACK_ROUTE_NAMES covers EVERY key of
// RootStackParamList (not just that each entry is valid). If a route is added
// to RootStackParamList but not to the array above, `_assertAllRoutesListed`
// fails to type-check. The value is never used at runtime.
type _MissingRoutes = Exclude<keyof RootStackParamList, (typeof ROOT_STACK_ROUTE_NAMES)[number]>;
const _assertAllRoutesListed: _MissingRoutes extends never ? true : never = true;
void _assertAllRoutesListed;

// The param-less RootStack routes a `kind:'screen'` target may navigate to
// directly (the lesson hubs — reached via navigate(name) with no params). This
// EXCLUDES routes that require params (e.g. the SPEC-09 generic LessonScreen),
// so `navigation.navigate(target.name)` type-checks against the no-param
// overload. `undefined extends Params` picks exactly the routes whose params
// are optional.
type ParamlessRootRoute = {
  [K in keyof RootStackParamList]: undefined extends RootStackParamList[K] ? K : never;
}[keyof RootStackParamList];

// Every target carries the lesson `slug` (SPEC-FIX-03 R4). The engine's
// analytics events key on the registry slug; carrying it here lets
// `lesson_tapped` send the SAME slug as `lesson_id` so the tapped → started
// funnel joins. (Hub lessons navigate by route `name`, which is NOT the slug —
// hence the explicit field.)
export type LessonNavTarget = { slug: string } & (
  // SPEC-09 Phase 3 — the flow lessons (1-4) launch directly into the generic
  // data-driven LessonScreen by slug. Single section; returns to MainTabs.
  | { kind: 'data'; lessonId: string }
  | { kind: 'screen'; name: ParamlessRootRoute }
);

export const LESSON_NAV: Record<string, LessonNavTarget> = {
  '1': { slug: 'lesson1', kind: 'data', lessonId: 'lesson1' },
  '2': { slug: 'lesson2', kind: 'data', lessonId: 'lesson2' },
  '3': { slug: 'lesson3', kind: 'data', lessonId: 'lesson3' },
  '4': { slug: 'lesson4', kind: 'data', lessonId: 'lesson4' },
  '5': { slug: 'labelingEmotions', kind: 'screen', name: 'LabelingEmotionsLesson' },
  '6': { slug: 'namingEmotions', kind: 'screen', name: 'NamingOurEmotionsLesson' },
  '7': { slug: 'sprinklers', kind: 'screen', name: 'SprinklersLesson' },
  '8': { slug: 'emotionalSandbags', kind: 'screen', name: 'EmotionalSandbagsLesson' },
  '9': { slug: 'communicationMistakes', kind: 'screen', name: 'CommunicationMistakesLesson' },
  '10': { slug: 'helpingProcessEmotions', kind: 'screen', name: 'HelpingSomeoneProcessEmotionsLesson' },
  '11': { slug: 'dissociation', kind: 'screen', name: 'DissociationLesson' },
  '12': { slug: 'serveReturn', kind: 'screen', name: 'ServeAndReturnLesson' },
  '13': { slug: 'recordingDeepBondMoments', kind: 'screen', name: 'RecordingDeepBondMomentsLesson' },
};

// The set of `kind: 'screen'` route names a lesson can navigate to directly.
// Exported so the route-coverage test can assert containment against
// RootStackParamList's keys without re-deriving the list.
export const LESSON_SCREEN_ROUTE_NAMES: readonly (keyof RootStackParamList)[] =
  Object.values(LESSON_NAV)
    .filter((t): t is Extract<LessonNavTarget, { kind: 'screen' }> => t.kind === 'screen')
    .map((t) => t.name);
