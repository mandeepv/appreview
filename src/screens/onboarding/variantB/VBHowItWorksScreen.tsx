import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — educate/justify the value before the paywall. Short, concrete promise.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBHowItWorks'>;

export const VBHowItWorksScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.HowItWorks, 'continue');
    navigation.navigate('VBBenefit');
  };

  return (
    <StatementScreen
      screenName={VB.HowItWorks}
      title="Real techniques. 5 minutes a day."
      body="Short, science-backed lessons you can use the same day — no fluff, no lectures. Built by child-development experts, made for real life."
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
    />
  );
};
