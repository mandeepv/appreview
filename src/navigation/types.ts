// Single source of truth for React Navigation param lists (SPEC-08).
//
// Before this file, each navigator declared its own ParamList inline and the
// lists were NOT composed across nesting boundaries — so navigating from a
// lesson screen to `LessonFlow` (a Root route) with a nested `{ screen }`
// param couldn't type-check, and ~20 callsites reached for `as any`. Here we
// define every ParamList once, compose the nested ones with
// NavigatorScreenParams, and register the top-level stack via the
// `declare global` block so `useNavigation()` is typed WITHOUT per-call
// generics.
//
// TYPES ONLY: route names and param shapes here are byte-identical to what the
// navigators registered before — this file changes types, never runtime.

import type { NavigatorScreenParams } from '@react-navigation/native';

// --- Leaf/tab navigator: the bottom tabs inside Root's MainTabs. ------------
// New in SPEC-08 (the tab navigator was previously untyped, which is why
// navigate('Learn') needed a cast). Route names match MainTabNavigator.
export type MainTabParamList = {
  Learn: undefined;
  Settings: undefined;
};

// --- Lesson stack: every lesson/quiz/sub-lesson screen. ---------------------
export type LessonStackParamList = {
  Lesson1Screen1: undefined;
  Lesson1Screen2: undefined;
  Lesson1Screen3: undefined;
  Lesson1Screen4: undefined;
  Lesson1Screen5: undefined;
  Lesson1Screen6: undefined;
  Lesson1Screen7: undefined;
  Lesson1Screen8: undefined;
  Lesson1Screen9: undefined;
  Lesson1Screen10: undefined;
  Lesson1Screen11: undefined;
  Lesson1Quiz: undefined;
  Lesson1QuizQ1: undefined;
  Lesson1QuizQ2: undefined;
  Lesson1QuizQ3: undefined;
  Lesson1Complete: undefined;
  Lesson2Screen1: undefined;
  Lesson2Screen2: undefined;
  Lesson2Screen3: undefined;
  Lesson2Screen4: undefined;
  Lesson2Screen5: undefined;
  Lesson2Screen6: undefined;
  Lesson2Screen7: undefined;
  Lesson2Screen8: undefined;
  Lesson2Screen9: undefined;
  Lesson2Screen10: undefined;
  Lesson2Screen11: undefined;
  Lesson2Screen12: undefined;
  Lesson2Quiz: undefined;
  Lesson2QuizQ1: undefined;
  Lesson2QuizQ2: undefined;
  Lesson2QuizQ3: undefined;
  Lesson2Complete: undefined;
  Lesson3Screen1: undefined;
  Lesson3Screen2: undefined;
  Lesson3Screen3: undefined;
  Lesson3Screen4: undefined;
  Lesson3Screen5: undefined;
  Lesson3Screen6: undefined;
  Lesson3Screen7: undefined;
  Lesson3Screen8: undefined;
  Lesson3Screen9: undefined;
  Lesson3Screen10: undefined;
  Lesson3Screen11: undefined;
  Lesson3Screen12: undefined;
  Lesson3Quiz: undefined;
  Lesson3QuizQ1: undefined;
  Lesson3QuizQ2: undefined;
  Lesson3QuizQ3: undefined;
  Lesson3QuizQ4: undefined;
  Lesson3QuizQ5: undefined;
  Lesson3QuizQ6: undefined;
  Lesson3Complete: undefined;
  Lesson4Screen1: undefined;
  Lesson4Screen2: undefined;
  Lesson4Screen3: undefined;
  Lesson4Screen4: undefined;
  Lesson4Screen5: undefined;
  Lesson4Screen6: undefined;
  Lesson4Screen7: undefined;
  Lesson4Screen8: undefined;
  Lesson4Screen9: undefined;
  Lesson4Screen10: undefined;
  Lesson4Screen11: undefined;
  Lesson4Quiz: undefined;
  Lesson4QuizQ1: undefined;
  Lesson4QuizQ2: undefined;
  Lesson4QuizQ3: undefined;
  Lesson4QuizQ4: undefined;
  Lesson4QuizQ5: undefined;
  Lesson4QuizQ6: undefined;
  Lesson4Complete: undefined;
  Lesson5Sec1Screen1: undefined;
  Lesson5Sec1Screen2: undefined;
  Lesson5Sec1Screen3: undefined;
  Lesson5Sec1Screen4: undefined;
  Lesson5Sec1Screen5: undefined;
  Lesson5Sec1Screen6: undefined;
  Lesson5Sec1Screen7: undefined;
  Lesson5Sec2Screen1: undefined;
  Lesson5Sec2Screen2: undefined;
  Lesson5Sec2Screen3: undefined;
  Lesson5Sec2Screen4: undefined;
  Lesson5Sec3Screen1: undefined;
  Lesson5Sec3Screen2: undefined;
  Lesson5Sec3Screen3: undefined;
  Lesson5Sec3Screen4: undefined;
  Lesson5Sec3Screen5: undefined;
  Lesson5Sec3Screen6: undefined;
  Lesson5Sec3Screen7: undefined;
  Lesson5Sec3Screen8: undefined;
  Lesson5Sec4Screen1: undefined;
  Lesson5Sec4Screen2: undefined;
  Lesson5Sec4Screen3: undefined;
  Lesson5Sec4Screen4: undefined;
  Lesson5Complete: undefined;
  NamingEmotionsSub1Screen1: undefined;
  NamingEmotionsSub1Screen2: undefined;
  NamingEmotionsSub1Screen3: undefined;
  NamingEmotionsSub1Screen4: undefined;
  NamingEmotionsSub1Screen5: undefined;
  NamingEmotionsSub1Screen6: undefined;
  NamingEmotionsSub2Screen1: undefined;
  NamingEmotionsSub2Screen2: undefined;
  NamingEmotionsSub2Screen3: undefined;
  NamingEmotionsSub2Screen4: undefined;
  NamingEmotionsSub2Screen5: undefined;
  NamingEmotionsSub2Screen6: undefined;
  NamingEmotionsSub3Screen1: undefined;
  NamingEmotionsSub3Screen2: undefined;
  NamingEmotionsSub3Screen3: undefined;
  NamingEmotionsSub3Screen4: undefined;
  NamingEmotionsSub3Screen5: undefined;
  NamingEmotionsSub3Screen6: undefined;
  NamingEmotionsSub4Screen1: undefined;
  NamingEmotionsSub4Screen2: undefined;
  NamingEmotionsSub4Screen3: undefined;
  NamingEmotionsSub4Screen4: undefined;
  NamingEmotionsSub4Screen5: undefined;
  NamingEmotionsSub4Screen6: undefined;
  SprinklersSec1Screen1: undefined;
  SprinklersSec1Screen2: undefined;
  SprinklersSec1Screen3: undefined;
  SprinklersSec1Screen4: undefined;
  SprinklersSec1Screen5: undefined;
  SprinklersSec1Screen6: undefined;
  SprinklersSec1Screen7: undefined;
  SprinklersSec1Screen8: undefined;
  SprinklersSec1Screen9: undefined;
  SprinklersSec1Screen10: undefined;
  SprinklersSec2Screen1: undefined;
  SprinklersSec2Screen2: undefined;
  SprinklersSec2Screen3: undefined;
  SprinklersSec2Screen4: undefined;
  SprinklersSec2Screen5: undefined;
  SprinklersSec2Screen6: undefined;
  SprinklersSec2Screen7: undefined;
  SprinklersSec2Screen8: undefined;
  SprinklersSec2Screen9: undefined;
  SprinklersSec2Screen10: undefined;
  SprinklersSec2Screen11: undefined;
  SprinklersSec2Screen12: undefined;
  SprinklersSec2Screen13: undefined;
  SprinklersSec3Screen1: undefined;
  SprinklersSec3Screen2: undefined;
  SprinklersSec3Screen3: undefined;
  SprinklersSec3Screen4: undefined;
  SprinklersSec3Screen5: undefined;
  SprinklersSec3Screen6: undefined;
  SprinklersSec3Screen7: undefined;
  SprinklersSec3Screen8: undefined;
  SprinklersSec3Screen9: undefined;
  SprinklersSec3Screen10: undefined;
  SprinklersSec3Screen11: undefined;
  SprinklersSec3Screen12: undefined;
  SprinklersSec3Screen13: undefined;
  SprinklersSec3Screen14: undefined;
  SprinklersSec4Screen1: undefined;
  SprinklersSec4Screen2: undefined;
  SprinklersSec4Screen3: undefined;
  SprinklersSec4Screen4: undefined;
  SprinklersSec4Screen5: undefined;
  SprinklersSec4Screen6: undefined;
  SprinklersSec4Screen7: undefined;
  SprinklersSec4Screen8: undefined;
  SprinklersSec4Screen9: undefined;
  SprinklersSec5Screen1: undefined;
  SprinklersSec5Screen2: undefined;
  SprinklersSec5Screen3: undefined;
  SprinklersSec5Screen4: undefined;
  SprinklersSec5Screen5: undefined;
  SprinklersSec5Screen6: undefined;
  SandbagsSec1Screen1: undefined;
  SandbagsSec1Screen2: undefined;
  SandbagsSec1Screen3: undefined;
  SandbagsSec2Screen1: undefined;
  SandbagsSec2Screen2: undefined;
  SandbagsSec2Screen3: undefined;
  SandbagsSec2Screen4: undefined;
  SandbagsSec2Screen5: undefined;
  SandbagsSec2Screen6: undefined;
  SandbagsSec2Screen7: undefined;
  SandbagsSec2Screen8: undefined;
  SandbagsSec2Screen9: undefined;
  SandbagsSec2Screen10: undefined;
  EmotionalSandbagsSec3Screen1: undefined;
  EmotionalSandbagsSec3Screen2: undefined;
  EmotionalSandbagsSec3Screen3: undefined;
  EmotionalSandbagsSec3Screen4: undefined;
  EmotionalSandbagsSec3Screen5: undefined;
  EmotionalSandbagsSec3Screen6: undefined;
  EmotionalSandbagsSec3Screen7: undefined;
  EmotionalSandbagsSec3Screen8: undefined;
  EmotionalSandbagsSec3Screen9: undefined;
  EmotionalSandbagsSec3Screen10: undefined;
  EmotionalSandbagsSec4Screen1: undefined;
  EmotionalSandbagsSec4Screen2: undefined;
  EmotionalSandbagsSec4Screen3: undefined;
  EmotionalSandbagsSec4Screen4: undefined;
  EmotionalSandbagsSec4Screen5: undefined;
  EmotionalSandbagsSec4Screen6: undefined;
  EmotionalSandbagsSec4Screen7: undefined;
  EmotionalSandbagsSec4Screen8: undefined;
  EmotionalSandbagsSec5Screen1: undefined;
  EmotionalSandbagsSec5Screen2: undefined;
  EmotionalSandbagsSec5Screen3: undefined;
  EmotionalSandbagsSec5Screen4: undefined;
  EmotionalSandbagsSec5Screen5: undefined;
  EmotionalSandbagsSec5Screen6: undefined;
  EmotionalSandbagsSec5Screen7: undefined;
  EmotionalSandbagsSec5Screen8: undefined;
  EmotionalSandbagsSec5Screen9: undefined;
  EmotionalSandbagsSec5Screen10: undefined;
  EmotionalSandbagsSec6Screen1: undefined;
  EmotionalSandbagsSec6Screen2: undefined;
  EmotionalSandbagsSec6Screen3: undefined;
  EmotionalSandbagsSec6Screen4: undefined;
  EmotionalSandbagsSec6Screen5: undefined;
  EmotionalSandbagsSec6Screen6: undefined;
  CommunicationMistakesSec1Screen1: undefined;
  CommunicationMistakesSec1Screen2: undefined;
  CommunicationMistakesSec1Screen3: undefined;
  CommunicationMistakesSec1Screen4: undefined;
  CommunicationMistakesSec1Screen5: undefined;
  CommunicationMistakesSec1Screen6: undefined;
  CommunicationMistakesSec2Screen1: undefined;
  CommunicationMistakesSec2Screen2: undefined;
  CommunicationMistakesSec2Screen3: undefined;
  CommunicationMistakesSec2Screen4: undefined;
  CommunicationMistakesSec2Screen5: undefined;
  CommunicationMistakesSec2Screen6: undefined;
  CommunicationMistakesSec2Screen7: undefined;
  CommunicationMistakesSec2Screen8: undefined;
  CommunicationMistakesSec2Screen9: undefined;
  CommunicationMistakesSec3Screen1: undefined;
  CommunicationMistakesSec3Screen2: undefined;
  CommunicationMistakesSec3Screen3: undefined;
  CommunicationMistakesSec3Screen4: undefined;
  CommunicationMistakesSec3Screen5: undefined;
  CommunicationMistakesSec3Screen6: undefined;
  CommunicationMistakesSec4Screen1: undefined;
  CommunicationMistakesSec4Screen2: undefined;
  CommunicationMistakesSec4Screen3: undefined;
  CommunicationMistakesSec4Screen4: undefined;
  CommunicationMistakesSec5Screen1: undefined;
  CommunicationMistakesSec5Screen2: undefined;
  CommunicationMistakesSec5Screen3: undefined;
  CommunicationMistakesSec5Screen4: undefined;
  CommunicationMistakesSec5Screen5: undefined;
  CommunicationMistakesSec5Screen6: undefined;
  CommunicationMistakesSec5Screen7: undefined;
  CommunicationMistakesSec6Screen1: undefined;
  CommunicationMistakesSec6Screen2: undefined;
  CommunicationMistakesSec6Screen3: undefined;
  CommunicationMistakesSec7Screen1: undefined;
  CommunicationMistakesSec7Screen2: undefined;
  CommunicationMistakesSec8Screen1: undefined;
  CommunicationMistakesSec8Screen2: undefined;
  CommunicationMistakesSec8Screen3: undefined;
  CommunicationMistakesSec9Screen1: undefined;
  CommunicationMistakesSec10Screen1: undefined;
  CommunicationMistakesSec10Screen2: undefined;
  CommunicationMistakesSec10Screen3: undefined;
  CommunicationMistakesSec11Screen1: undefined;
  CommunicationMistakesSec11Screen2: undefined;
  CommunicationMistakesSec11Screen3: undefined;
  CommunicationMistakesSec11Screen4: undefined;
  CommunicationMistakesSec12Screen1: undefined;
  CommunicationMistakesSec12Screen2: undefined;
  CommunicationMistakesSec12Screen3: undefined;
  CommunicationMistakesSec12Screen4: undefined;
  CommunicationMistakesSec12Screen5: undefined;
  CommunicationMistakesSec12Screen6: undefined;
  CommunicationMistakesSec13Screen1: undefined;
  CommunicationMistakesSec13Screen2: undefined;
  CommunicationMistakesSec13Screen3: undefined;
  CommunicationMistakesSec13Screen4: undefined;
  CommunicationMistakesSec13Screen5: undefined;
  HelpingProcessEmotionsSec1Screen1: undefined;
  HelpingProcessEmotionsSec2Screen1: undefined;
  HelpingProcessEmotionsSec2Screen2: undefined;
  HelpingProcessEmotionsSec2Screen3: undefined;
  HelpingProcessEmotionsSec2Screen4: undefined;
  HelpingProcessEmotionsSec2Screen5: undefined;
  HelpingProcessEmotionsSec2Screen6: undefined;
  HelpingProcessEmotionsSec2Screen7: undefined;
  HelpingProcessEmotionsSec2Screen8: undefined;
  HelpingProcessEmotionsSec2Screen9: undefined;
  HelpingProcessEmotionsSec2Screen10: undefined;
  ServeReturnSec1Screen1: undefined;
  ServeReturnSec1Screen2: undefined;
  ServeReturnSec1Screen3: undefined;
  ServeReturnSec1Screen4: undefined;
  ServeReturnSec2Screen1: undefined;
  ServeReturnSec2Screen2: undefined;
  ServeReturnSec2Screen3: undefined;
  ServeReturnSec2Screen4: undefined;
  ServeReturnSec3Screen1: undefined;
  ServeReturnSec3Screen2: undefined;
  ServeReturnSec3Screen3: undefined;
  ServeReturnSec3Screen4: undefined;
  ServeReturnSec3Screen5: undefined;
  ServeReturnSec4Screen1: undefined;
  ServeReturnSec4Screen2: undefined;
  ServeReturnSec4Screen3: undefined;
  ServeReturnSec5Screen1: undefined;
  ServeReturnSec5Screen2: undefined;
  ServeReturnSec5Screen3: undefined;
  ServeReturnSec6Screen1: undefined;
  ServeReturnSec6Screen2: undefined;
  ServeReturnSec6Screen3: undefined;
  RecordingDeepBondMomentsSec1Screen1: undefined;
  RecordingDeepBondMomentsSec1Screen2: undefined;
  RecordingDeepBondMomentsSec1Screen3: undefined;
  RecordingDeepBondMomentsSec1Screen4: undefined;
  RecordingDeepBondMomentsSec1Screen5: undefined;
  RecordingDeepBondMomentsSec1Screen6: undefined;
  DissociationSec1Screen1: undefined;
  DissociationSec1Screen2: undefined;
  DissociationSec1Screen3: undefined;
  DissociationSec1Screen4: undefined;
  DissociationSec1Screen5: undefined;
  DissociationSec1Screen6: undefined;
  DissociationSec1Screen7: undefined;
  DissociationSec2Screen1: undefined;
  DissociationSec2Screen2: undefined;
  DissociationSec2Screen3: undefined;
  DissociationSec2Screen4: undefined;
  DissociationSec2Screen5: undefined;
  DissociationSec2Screen6: undefined;
  DissociationSec3Screen1: undefined;
  DissociationSec3Screen2: undefined;
  DissociationSec3Screen3: undefined;
  DissociationSec3Screen4: undefined;
  DissociationSec3Screen5: undefined;
  DissociationSec3Screen6: undefined;
  DissociationSec3Screen7: undefined;
  DissociationSec3Screen8: undefined;
  DissociationSec3Screen9: undefined;
  DissociationSec4Screen1: undefined;
  DissociationSec4Screen2: undefined;
  DissociationSec4Screen3: undefined;
};

// --- Root stack: nested inside Onboarding's `Root` route. -------------------
// MainTabs and LessonFlow are themselves navigators, so they're composed with
// NavigatorScreenParams so `navigate('LessonFlow', { screen: 'Lesson1Screen1' })`
// type-checks the nested screen name. The individual lesson-launcher screens
// (LabelingEmotionsLesson, etc.) are plain screens with no params.
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  LessonFlow: NavigatorScreenParams<LessonStackParamList> | undefined;
  // SPEC-09 Phase 3 — the generic data-driven lesson route. One screen renders
  // every lesson via the registry + LessonController. `returnTo` is the route
  // to return to on section-complete (the lesson's hub, or 'MainTabs' for flow
  // lessons launched from the Learn tab).
  LessonScreen: {
    lessonId: string;
    sectionIndex: number;
    screenIndex: number;
    returnTo?: keyof RootStackParamList;
  };
  LabelingEmotionsLesson: undefined;
  NamingOurEmotionsLesson: undefined;
  SprinklersLesson: undefined;
  EmotionalSandbagsLesson: undefined;
  CommunicationMistakesLesson: undefined;
  HelpingSomeoneProcessEmotionsLesson: undefined;
  DissociationLesson: undefined;
  ServeAndReturnLesson: undefined;
  RecordingDeepBondMomentsLesson: undefined;
};

// --- Onboarding stack: the top-level navigator. -----------------------------
// `Root` is the RootNavigator, composed so nested navigate() calls type-check.
export type OnboardingStackParamList = {
  DevMenu: undefined;
  Splash: undefined;
  Welcome: undefined;
  UserType: undefined;
  NameAge: undefined;
  ChildrenCount: undefined;
  ChildrenGender: undefined;
  ChildrenAge: undefined;
  ImprovementGoals: undefined;
  Educational: undefined;
  PartnerInvolvement: undefined;
  GoalSelection: undefined;
  ExperienceLevel: undefined;
  ParentingStyles: undefined;
  EmotionalChallenges: undefined;
  Auth: { mode?: 'signin' | 'signup' } | undefined;
  Loading: undefined;
  PremiumUnlocked: undefined;
  Root: NavigatorScreenParams<RootStackParamList> | undefined;
  // Dev-only preview of a data-driven lesson (SPEC-09). Registered under
  // __DEV__ in OnboardingNavigator; stripped from production builds.
  LessonPreview: { slug?: string } | undefined;
};

// --- Nested-navigate helper -------------------------------------------------
// NavigatorScreenParams is a DISTRIBUTED union: it requires `screen` to be a
// single literal route name, so `navigate('LessonFlow', { screen })` won't
// type-check when `screen` is a variable typed as the whole
// `keyof LessonStackParamList` union (which is the real case — lesson-launcher
// screens pick the target route from data). This helper is the ONE place that
// bridges "a route-name variable" to the composed param type. It's a pure
// pass-through: at runtime it returns exactly `{ screen }` — byte-identical to
// what the callsites passed before — so this is a type-only change.
export function lessonFlowParams(
  screen: keyof LessonStackParamList,
): NavigatorScreenParams<LessonStackParamList> {
  return { screen } as NavigatorScreenParams<LessonStackParamList>;
}

// --- Global registration ----------------------------------------------------
// Registering the top-level (Onboarding) stack as the default RootParamList
// means useNavigation() is typed everywhere without passing a per-call
// generic. React Navigation v7 "Type checking the navigator" pattern.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends OnboardingStackParamList {}
  }
}
