import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 1 — "before we begin". Sets the expectation (a few questions → your plan)
// and lowers the guard with the privacy reassurance the App Store cares about.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBIntro'>;

export const VBIntroScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Intro, 'continue');
    navigation.navigate('VBName');
  };

  return (
    <StatementScreen
      screenName={VB.Intro}
      title="A few quick questions."
      body="Your answers shape every lesson we build for you. Nothing here is shared — it's just for your plan."
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
      showProgress={false}
    />
  );
};
