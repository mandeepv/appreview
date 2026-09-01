import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — benefit proof. ⚠︎ The "two weeks / calmer / fewer blow-ups" claims
// are placeholder-but-hard-hitting — confirm defensible before ramping the flag
// (see the copy doc's checklist).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBBenefit'>;

export const VBBenefitScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Benefit, 'continue');
    navigation.navigate('VBCommit');
  };

  return (
    <StoryScreen
      screenName={VB.Benefit}
      image={require('../../../../assets/onboarding/emotional_okay.png')}
      title="Small shifts. Big difference."
      body={[
        'You don’t have to fix everything at once. You won’t.\n\nBut give it ',
        { text: 'two weeks', hl: true },
        ' and most parents say the same thing: the house feels calmer, and the hard moments stop running the day.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
    />
  );
};
