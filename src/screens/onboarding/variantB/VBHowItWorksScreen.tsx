import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
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
    <StoryScreen
      screenName={VB.HowItWorks}
      image={require('../../../../assets/onboarding/brain-science-foundation.png')}
      title="No 300-page books. Just five minutes."
      body={[
        'Every lesson gives you ',
        { text: 'one thing to try today', hl: true },
        '.\n\nGrounded in real child development science, written for tired parents in the middle of it, not for a classroom.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
    />
  );
};
