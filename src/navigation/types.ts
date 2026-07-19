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

// --- Root stack: nested inside Onboarding's `Root` route. -------------------
// MainTabs is itself a navigator, composed with NavigatorScreenParams so
// navigate('MainTabs', { screen: 'Learn' }) type-checks. The lesson-launcher
// hub screens (LabelingEmotionsLesson, etc.) are plain screens with no params.
// SPEC-09 Phase 4: the old per-screen LessonFlow navigator + its ~343-route
// LessonStackParamList were deleted; lessons now render through the generic
// LessonScreen route below.
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
  // SPEC-09 Phase 4 — the one surviving old-lesson screen (Labeling
  // all-sections-complete card), now a direct RootStack route.
  Lesson5Complete: undefined;
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
  ImprovementGoals: undefined;
  Educational: undefined;
  PartnerInvolvement: undefined;
  ExperienceLevel: undefined;
  EmotionalChallenges: undefined;
  // SPEC-15 — variant-B onboarding scaffold (placeholder screens). Fresh users
  // assigned variant_b branch here from Welcome instead of UserType, then
  // rejoin the shared flow at Auth. Route names round-trip through
  // ONBOARDING_LAST_SCREEN so a kill-and-resume mid-variant-B lands correctly.
  VariantBQ1: undefined;
  VariantBQ2: undefined;
  VariantBQ3: undefined;
  Auth: { mode?: 'signin' | 'signup' } | undefined;
  Loading: undefined;
  Root: NavigatorScreenParams<RootStackParamList> | undefined;
  // Dev-only preview of a data-driven lesson (SPEC-09). Registered under
  // __DEV__ in OnboardingNavigator; stripped from production builds.
  LessonPreview: { slug?: string } | undefined;
};

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
