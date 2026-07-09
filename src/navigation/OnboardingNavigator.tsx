import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DevMenuScreen } from '../screens/DevMenuScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { UserTypeScreen } from '../screens/onboarding/UserTypeScreen';
import { NameAgeScreen } from '../screens/onboarding/NameAgeScreen';
import { ChildrenCountScreen } from '../screens/onboarding/ChildrenCountScreen';
import { ChildrenGenderScreen } from '../screens/onboarding/ChildrenGenderScreen';
import { ChildrenAgeScreen } from '../screens/onboarding/ChildrenAgeScreen';
import { ImprovementGoalsScreen } from '../screens/onboarding/ImprovementGoalsScreen';
import { EducationalScreen } from '../screens/onboarding/EducationalScreen';
import { PartnerInvolvementScreen } from '../screens/onboarding/PartnerInvolvementScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { ExperienceLevelScreen } from '../screens/onboarding/ExperienceLevelScreen';
import { ParentingStylesScreen } from '../screens/onboarding/ParentingStylesScreen';
import { EmotionalChallengesScreen } from '../screens/onboarding/EmotionalChallengesScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import PremiumUnlockedScreen from '../screens/PremiumUnlockedScreen';
import { RootNavigator } from './RootNavigator';
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
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="UserType" component={UserTypeScreen} />
      <Stack.Screen name="NameAge" component={NameAgeScreen} />
      <Stack.Screen name="ChildrenCount" component={ChildrenCountScreen} />
      <Stack.Screen name="ChildrenGender" component={ChildrenGenderScreen} />
      <Stack.Screen name="ChildrenAge" component={ChildrenAgeScreen} />
      <Stack.Screen name="ImprovementGoals" component={ImprovementGoalsScreen} />
      <Stack.Screen name="Educational" component={EducationalScreen} />
      <Stack.Screen name="PartnerInvolvement" component={PartnerInvolvementScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="ParentingStyles" component={ParentingStylesScreen} />
      <Stack.Screen name="EmotionalChallenges" component={EmotionalChallengesScreen} />
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
      <Stack.Screen name="PremiumUnlocked" component={PremiumUnlockedScreen} />
      <Stack.Screen name="Root" component={RootNavigator} />
    </Stack.Navigator>
  );
};
