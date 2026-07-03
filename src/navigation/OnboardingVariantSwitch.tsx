import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './OnboardingNavigator';
import { useExperimentStore } from '../store/experimentStore';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
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

import { WelcomeScreenB } from '../screens/onboardingB/WelcomeScreenB';
import { SignInScreenB } from '../screens/onboardingB/SignInScreenB';
import { UserTypeScreenB } from '../screens/onboardingB/UserTypeScreenB';
import { NameAgeScreenB } from '../screens/onboardingB/NameAgeScreenB';
import { ChildrenCountScreenB } from '../screens/onboardingB/ChildrenCountScreenB';
import { ChildrenGenderScreenB } from '../screens/onboardingB/ChildrenGenderScreenB';
import { ChildrenAgeScreenB } from '../screens/onboardingB/ChildrenAgeScreenB';
import { ImprovementGoalsScreenB } from '../screens/onboardingB/ImprovementGoalsScreenB';
import { EducationalScreenB } from '../screens/onboardingB/EducationalScreenB';
import { PartnerInvolvementScreenB } from '../screens/onboardingB/PartnerInvolvementScreenB';
import { GoalSelectionScreenB } from '../screens/onboardingB/GoalSelectionScreenB';
import { ExperienceLevelScreenB } from '../screens/onboardingB/ExperienceLevelScreenB';
import { ParentingStylesScreenB } from '../screens/onboardingB/ParentingStylesScreenB';
import { EmotionalChallengesScreenB } from '../screens/onboardingB/EmotionalChallengesScreenB';
import { AuthScreenB } from '../screens/onboardingB/AuthScreenB';
import { LoadingScreenB } from '../screens/onboardingB/LoadingScreenB';
import { PremiumUnlockedScreenB } from '../screens/onboardingB/PremiumUnlockedScreenB';

// Every entry maps: screen name → [control component, variant B component].
// Auth / Loading / PremiumUnlocked point at the same underlying components in
// both variants for now — variant B reuses the real auth + paywall flow.
type ScreenPair<K extends keyof OnboardingStackParamList> = [
  React.ComponentType<NativeStackScreenProps<OnboardingStackParamList, K>>,
  React.ComponentType<NativeStackScreenProps<OnboardingStackParamList, K>>,
];

function makeSwitch<K extends keyof OnboardingStackParamList>(
  [Control, VariantB]: ScreenPair<K>
): React.ComponentType<NativeStackScreenProps<OnboardingStackParamList, K>> {
  return (props) => {
    const variant = useExperimentStore((s) => s.onboardingVariant);
    const Component = variant === 'variant_b' ? VariantB : Control;
    return <Component {...props} />;
  };
}

export const WelcomeSwitch = makeSwitch<'Welcome'>([WelcomeScreen, WelcomeScreenB]);
export const SignInSwitch = makeSwitch<'SignIn'>([SignInScreen, SignInScreenB]);
export const UserTypeSwitch = makeSwitch<'UserType'>([UserTypeScreen, UserTypeScreenB]);
export const NameAgeSwitch = makeSwitch<'NameAge'>([NameAgeScreen, NameAgeScreenB]);
export const ChildrenCountSwitch = makeSwitch<'ChildrenCount'>([ChildrenCountScreen, ChildrenCountScreenB]);
export const ChildrenGenderSwitch = makeSwitch<'ChildrenGender'>([ChildrenGenderScreen, ChildrenGenderScreenB]);
export const ChildrenAgeSwitch = makeSwitch<'ChildrenAge'>([ChildrenAgeScreen, ChildrenAgeScreenB]);
export const ImprovementGoalsSwitch = makeSwitch<'ImprovementGoals'>([ImprovementGoalsScreen, ImprovementGoalsScreenB]);
export const EducationalSwitch = makeSwitch<'Educational'>([EducationalScreen, EducationalScreenB]);
export const PartnerInvolvementSwitch = makeSwitch<'PartnerInvolvement'>([PartnerInvolvementScreen, PartnerInvolvementScreenB]);
export const GoalSelectionSwitch = makeSwitch<'GoalSelection'>([GoalSelectionScreen, GoalSelectionScreenB]);
export const ExperienceLevelSwitch = makeSwitch<'ExperienceLevel'>([ExperienceLevelScreen, ExperienceLevelScreenB]);
export const ParentingStylesSwitch = makeSwitch<'ParentingStyles'>([ParentingStylesScreen, ParentingStylesScreenB]);
export const EmotionalChallengesSwitch = makeSwitch<'EmotionalChallenges'>([EmotionalChallengesScreen, EmotionalChallengesScreenB]);
export const AuthSwitch = makeSwitch<'Auth'>([AuthScreen, AuthScreenB]);
export const LoadingSwitch = makeSwitch<'Loading'>([LoadingScreen, LoadingScreenB]);
export const PremiumUnlockedSwitch = makeSwitch<'PremiumUnlocked'>([PremiumUnlockedScreen, PremiumUnlockedScreenB]);
