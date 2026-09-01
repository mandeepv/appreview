import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
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
    <StoryScreen
      screenName={VB.Intro}
      iconName="people-outline"
      title="Let's start with your family."
      body={[
        'No right answers, no judgment. The more real you are, the sharper your plan gets, built for ',
        { text: 'your child', hl: true },
        ', not the average one.\n\nEverything you share stays on your side. It just shapes your plan.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Continue"
      onContinue={handleContinue}
      showProgress={false}
    />
  );
};
