import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — benefit proof. ⚠︎ The "2 weeks / calmer homes / fewer blow-ups" claims
// are placeholder-but-hard-hitting — confirm defensible before ramping the flag
// (see the copy doc's checklist).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBBenefit'>;

export const VBBenefitScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Benefit, 'continue');
    navigation.navigate('VBCommit');
  };

  return (
    <StatementScreen
      screenName={VB.Benefit}
      title="Small changes, real momentum."
      body="Parents who stick with Kinderwell for 2 weeks report calmer homes and fewer daily blow-ups."
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
    />
  );
};
