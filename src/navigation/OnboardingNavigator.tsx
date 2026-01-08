import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all screens
import { DevMenuScreen } from '../screens/DevMenuScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { UserTypeScreen } from '../screens/onboarding/UserTypeScreen';
import { NameAgeScreen } from '../screens/onboarding/NameAgeScreen';
import { ChildrenCountScreen } from '../screens/onboarding/ChildrenCountScreen';
import { ChildrenGenderScreen } from '../screens/onboarding/ChildrenGenderScreen';
import { ChildrenAgeScreen } from '../screens/onboarding/ChildrenAgeScreen';
import { ImprovementGoalsScreen } from '../screens/onboarding/ImprovementGoalsScreen';
import { ExpertEndorsementScreen } from '../screens/onboarding/ExpertEndorsementScreen';
import { ParentingRealityScreen } from '../screens/onboarding/ParentingRealityScreen';
import { NotificationPermissionScreen } from '../screens/onboarding/NotificationPermissionScreen';
import { PartnerInvolvementScreen } from '../screens/onboarding/PartnerInvolvementScreen';
import { InvitePartnerScreen } from '../screens/onboarding/InvitePartnerScreen';
import { GoalSelectionScreen } from '../screens/onboarding/GoalSelectionScreen';
import { ExperienceLevelScreen } from '../screens/onboarding/ExperienceLevelScreen';
import { ParentingStylesScreen } from '../screens/onboarding/ParentingStylesScreen';
import { EducationalScreen } from '../screens/onboarding/EducationalScreen';
import { EmotionalChallengesScreen } from '../screens/onboarding/EmotionalChallengesScreen';
import { AuthScreen } from '../screens/onboarding/AuthScreen';
import { LoadingScreen } from '../screens/onboarding/LoadingScreen';
import { LessonDetailsScreen } from '../screens/onboarding/LessonDetailsScreen';
import { LessonPreviewScreen } from '../screens/onboarding/LessonPreviewScreen';
import { PaywallScreen } from '../screens/onboarding/PaywallScreen';
import PremiumUnlockedScreen from '../screens/PremiumUnlockedScreen';
import { RootNavigator } from './RootNavigator';

export type OnboardingStackParamList = {
  DevMenu: undefined;
  Splash: undefined;
  UserType: undefined;
  NameAge: undefined;
  ChildrenCount: undefined;
  ChildrenGender: undefined;
  ChildrenAge: undefined;
  ImprovementGoals: undefined;
  ExpertEndorsement: undefined;
  Educational: undefined;
  ParentingReality: undefined;
  NotificationPermission: undefined;
  PartnerInvolvement: undefined;
  InvitePartner: undefined;
  GoalSelection: undefined;
  ExperienceLevel: undefined;
  ParentingStyles: undefined;
  EmotionalChallenges: undefined;
  Auth: undefined;
  Loading: undefined;
  LessonDetails: undefined;
  LessonPreview: undefined;
  Paywall: undefined;
  PremiumUnlocked: undefined;
  Root: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="DevMenu"
    >
      <Stack.Screen name="DevMenu" component={DevMenuScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="UserType" component={UserTypeScreen} />
      <Stack.Screen name="NameAge" component={NameAgeScreen} />
      <Stack.Screen name="ChildrenCount" component={ChildrenCountScreen} />
      <Stack.Screen name="ChildrenGender" component={ChildrenGenderScreen} />
      <Stack.Screen name="ChildrenAge" component={ChildrenAgeScreen} />
      <Stack.Screen name="ImprovementGoals" component={ImprovementGoalsScreen} />
      <Stack.Screen name="ExpertEndorsement" component={ExpertEndorsementScreen} />
      <Stack.Screen name="Educational" component={EducationalScreen} />
      <Stack.Screen name="ParentingReality" component={ParentingRealityScreen} />
      <Stack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
      <Stack.Screen name="PartnerInvolvement" component={PartnerInvolvementScreen} />
      <Stack.Screen name="InvitePartner" component={InvitePartnerScreen} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelScreen} />
      <Stack.Screen name="ParentingStyles" component={ParentingStylesScreen} />
      <Stack.Screen name="EmotionalChallenges" component={EmotionalChallengesScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="LessonDetails" component={LessonDetailsScreen} />
      <Stack.Screen name="LessonPreview" component={LessonPreviewScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="PremiumUnlocked" component={PremiumUnlockedScreen} />
      <Stack.Screen name="Root" component={RootNavigator} />
    </Stack.Navigator>
  );
};
