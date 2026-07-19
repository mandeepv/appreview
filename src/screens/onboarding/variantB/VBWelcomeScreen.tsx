import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 1 — cold-open hook. Names the pain before asking anything (the pattern
// every winning onboarding opens with). No back (entry point from Welcome), no
// progress bar (this beat sits before the counted question screens).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBWelcome'>;

export const VBWelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Welcome, 'get_started');
    navigation.navigate('VBIntro');
  };

  return (
    <StatementScreen
      screenName={VB.Welcome}
      title="The hardest job in the world came with no manual."
      body="Let's write yours — built around your family, in the next 2 minutes."
      ctaTitle="Get started"
      onContinue={handleContinue}
      showProgress={false}
    />
  );
};
