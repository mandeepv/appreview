import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DevMenuScreen } from '../screens/DevMenuScreen';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { RootNavigator } from './RootNavigator';
import {
  WelcomeSwitch,
  SignInSwitch,
  UserTypeSwitch,
  NameAgeSwitch,
  ChildrenCountSwitch,
  ChildrenGenderSwitch,
  ChildrenAgeSwitch,
  ImprovementGoalsSwitch,
  EducationalSwitch,
  PartnerInvolvementSwitch,
  GoalSelectionSwitch,
  ExperienceLevelSwitch,
  ParentingStylesSwitch,
  EmotionalChallengesSwitch,
  AuthSwitch,
  LoadingSwitch,
  PremiumUnlockedSwitch,
} from './OnboardingVariantSwitch';

export type OnboardingStackParamList = {
  DevMenu: undefined;
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
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
  Auth: undefined;
  Loading: undefined;
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
      initialRouteName="Splash"
    >
      {__DEV__ && <Stack.Screen name="DevMenu" component={DevMenuScreen} />}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeSwitch} />
      <Stack.Screen name="SignIn" component={SignInSwitch} />
      <Stack.Screen name="UserType" component={UserTypeSwitch} />
      <Stack.Screen name="NameAge" component={NameAgeSwitch} />
      <Stack.Screen name="ChildrenCount" component={ChildrenCountSwitch} />
      <Stack.Screen name="ChildrenGender" component={ChildrenGenderSwitch} />
      <Stack.Screen name="ChildrenAge" component={ChildrenAgeSwitch} />
      <Stack.Screen name="ImprovementGoals" component={ImprovementGoalsSwitch} />
      <Stack.Screen name="Educational" component={EducationalSwitch} />
      <Stack.Screen name="PartnerInvolvement" component={PartnerInvolvementSwitch} />
      <Stack.Screen name="GoalSelection" component={GoalSelectionSwitch} />
      <Stack.Screen name="ExperienceLevel" component={ExperienceLevelSwitch} />
      <Stack.Screen name="ParentingStyles" component={ParentingStylesSwitch} />
      <Stack.Screen name="EmotionalChallenges" component={EmotionalChallengesSwitch} />
      <Stack.Screen
        name="Auth"
        component={AuthSwitch}
        options={{
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="Loading" component={LoadingSwitch} />
      <Stack.Screen name="PremiumUnlocked" component={PremiumUnlockedSwitch} />
      <Stack.Screen name="Root" component={RootNavigator} />
    </Stack.Navigator>
  );
};
