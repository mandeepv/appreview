// Lesson-ID → navigation-target lookup, extracted out of LearnScreen (a React
// component) so it can be unit-tested without importing the component (SPEC-04
// constraint: tests must not import React components / require a simulator).
//
// The test asserts every target here resolves to a route registered in
// RootNavigator's RootStackParamList — i.e. no lesson can point at a screen
// that doesn't exist. Keeping this table and the param list as the two
// importable "tables" makes that a pure set-containment check.

import type { RootStackParamList } from './RootNavigator';

// Runtime list of every route name registered in RootNavigator's
// RootStackParamList. RootStackParamList is a TYPE (erased at runtime), so the
// route-coverage test can't enumerate its keys directly — it imports this
// array instead. The `satisfies` check below makes tsc fail if this list ever
// drifts from the param list (missing or extra route), so the two can't get
// out of sync silently. Kept here (a non-component module) so the test never
// has to import the RootNavigator component.
export const ROOT_STACK_ROUTE_NAMES = [
  'MainTabs',
  'LessonFlow',
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

export type LessonNavTarget =
  | { kind: 'flow'; screen: 'Lesson1Screen1' | 'Lesson2Screen1' | 'Lesson3Screen1' | 'Lesson4Screen1' }
  | { kind: 'screen'; name: keyof RootStackParamList };

export const LESSON_NAV: Record<string, LessonNavTarget> = {
  '1': { kind: 'flow', screen: 'Lesson1Screen1' },
  '2': { kind: 'flow', screen: 'Lesson2Screen1' },
  '3': { kind: 'flow', screen: 'Lesson3Screen1' },
  '4': { kind: 'flow', screen: 'Lesson4Screen1' },
  '5': { kind: 'screen', name: 'LabelingEmotionsLesson' },
  '6': { kind: 'screen', name: 'NamingOurEmotionsLesson' },
  '7': { kind: 'screen', name: 'SprinklersLesson' },
  '8': { kind: 'screen', name: 'EmotionalSandbagsLesson' },
  '9': { kind: 'screen', name: 'CommunicationMistakesLesson' },
  '10': { kind: 'screen', name: 'HelpingSomeoneProcessEmotionsLesson' },
  '11': { kind: 'screen', name: 'DissociationLesson' },
  '12': { kind: 'screen', name: 'ServeAndReturnLesson' },
  '13': { kind: 'screen', name: 'RecordingDeepBondMomentsLesson' },
};

// The set of `kind: 'screen'` route names a lesson can navigate to directly.
// Exported so the route-coverage test can assert containment against
// RootStackParamList's keys without re-deriving the list.
export const LESSON_SCREEN_ROUTE_NAMES: readonly (keyof RootStackParamList)[] =
  Object.values(LESSON_NAV)
    .filter((t): t is Extract<LessonNavTarget, { kind: 'screen' }> => t.kind === 'screen')
    .map((t) => t.name);
