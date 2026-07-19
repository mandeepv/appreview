import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DevMenuScreen } from '../screens/DevMenuScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { UserTypeScreen } from '../screens/onboarding/UserTypeScreen';
import { NameAgeScreen } from '../screens/onboarding/NameAgeScreen';
import { ChildrenCountScreen } from '../screens/onboarding/ChildrenCountScreen';
import { ImprovementGoalsScreen } from '../screens/onboarding/ImprovementGoalsScreen';
import { EducationalScreen } from '../screens/onboarding/EducationalScreen';
import { PartnerInvolvementScreen } from '../screens/onboarding/PartnerInvolvementScreen';
import { ExperienceLevelScreen } from '../screens/onboarding/ExperienceLevelScreen';
import { EmotionalChallengesScreen } from '../screens/onboarding/EmotionalChallengesScreen';
// Variant B — the full long-form onboarding (docs/specs/variant-b-onboarding-copy.md).
import { VBWelcomeScreen } from '../screens/onboarding/variantB/VBWelcomeScreen';
import { VBIntroScreen } from '../screens/onboarding/variantB/VBIntroScreen';
import { VBNameScreen } from '../screens/onboarding/variantB/VBNameScreen';
import { VBRoleScreen } from '../screens/onboarding/variantB/VBRoleScreen';
import { VBKidsScreen } from '../screens/onboarding/variantB/VBKidsScreen';
import { VBMoodScreen } from '../screens/onboarding/variantB/VBMoodScreen';
import { VBChallengesScreen } from '../screens/onboarding/variantB/VBChallengesScreen';
import { VBWhenHardestScreen } from '../screens/onboarding/variantB/VBWhenHardestScreen';
import { VBMirrorScreen } from '../screens/onboarding/variantB/VBMirrorScreen';
import { VBGoalsScreen } from '../screens/onboarding/variantB/VBGoalsScreen';
import { VBReadyScreen } from '../screens/onboarding/variantB/VBReadyScreen';
import { VBCalculatingScreen } from '../screens/onboarding/variantB/VBCalculatingScreen';
import { VBSnapshotScreen } from '../screens/onboarding/variantB/VBSnapshotScreen';
import { VBHowItWorksScreen } from '../screens/onboarding/variantB/VBHowItWorksScreen';
import { VBBenefitScreen } from '../screens/onboarding/variantB/VBBenefitScreen';
import { VBCommitScreen } from '../screens/onboarding/variantB/VBCommitScreen';
import { VBAllInScreen } from '../screens/onboarding/variantB/VBAllInScreen';
import { VBRatingScreen } from '../screens/onboarding/variantB/VBRatingScreen';
import { VBRemindersScreen } from '../screens/onboarding/variantB/VBRemindersScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { RootNavigator } from './RootNavigator';
import { LessonPreviewRoute } from '../lessons/LessonPreviewRoute';
import type { OnboardingStackParamList } from './types';

// DEPRECATED transitional shim (SPEC-08). The ParamList now lives in
// navigation/types.ts (the single composition home) — import it from there in
// new code. This re-export only keeps existing importers compiling; it dies
// with the SPEC-09 screen-deletion dead-code pass (plan 5.5).
export type { OnboardingStackParamList };

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Splash"
    >
      {__DEV__ && <Stack.Screen name="DevMenu" component={DevMenuScreen} />}
      {__DEV__ && <Stack.Screen name="LessonPreview" component={LessonPreviewRoute} />}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UserType" component={UserTypeScreen} />
      <Stack.Screen name="NameAge" component={NameAgeScreen} />
      <Stack.Screen name="ChildrenCount" component={ChildrenCountScreen} />
      <Stack.Screen name="ImprovementGoals" component={ImprovementGoalsScreen} />
      <Stack.Screen name="Educational" component={EducationalScreen} />
      <Stack.Screen name="PartnerInvolvement" component={PartnerInvolvementScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="EmotionalChallenges" component={EmotionalChallengesScreen} />
      {/* Variant B — full long-form onboarding. Registered alongside the
          variant-A screens; only reached when Welcome resolves variant_b
          (enters at VBWelcome). Rejoins the shared flow at Auth. */}
      <Stack.Screen name="VBWelcome" component={VBWelcomeScreen} />
      <Stack.Screen name="VBIntro" component={VBIntroScreen} />
      <Stack.Screen name="VBName" component={VBNameScreen} />
      <Stack.Screen name="VBRole" component={VBRoleScreen} />
      <Stack.Screen name="VBKids" component={VBKidsScreen} />
      <Stack.Screen name="VBMood" component={VBMoodScreen} />
      <Stack.Screen name="VBChallenges" component={VBChallengesScreen} />
      <Stack.Screen name="VBWhenHardest" component={VBWhenHardestScreen} />
      <Stack.Screen name="VBMirror" component={VBMirrorScreen} />
      <Stack.Screen name="VBGoals" component={VBGoalsScreen} />
      <Stack.Screen name="VBReady" component={VBReadyScreen} />
      <Stack.Screen name="VBCalculating" component={VBCalculatingScreen} />
      <Stack.Screen name="VBSnapshot" component={VBSnapshotScreen} />
      <Stack.Screen name="VBHowItWorks" component={VBHowItWorksScreen} />
      <Stack.Screen name="VBBenefit" component={VBBenefitScreen} />
      <Stack.Screen name="VBCommit" component={VBCommitScreen} />
      <Stack.Screen name="VBAllIn" component={VBAllInScreen} />
      <Stack.Screen name="VBRating" component={VBRatingScreen} />
      <Stack.Screen name="VBReminders" component={VBRemindersScreen} />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={({ route }) => ({
          // In signup mode (default), user just finished onboarding — disable
          // swipe-back so they can't accidentally re-enter the flow. In
          // signin mode, allow back-swipe to return to Welcome (they may
          // have tapped "already have an account" by mistake).
          gestureEnabled: route.params?.mode === 'signin',
          headerBackVisible: false,
        })}
      />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Root" component={RootNavigator} />
    </Stack.Navigator>
  );
};
