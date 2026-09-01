import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
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
    <StoryScreen
      screenName={VB.Welcome}
      image={require('../../../../assets/onboarding/mother_illustration.png')}
      title="The most important job you'll ever do. And nobody trained you for it."
      body={[
        'You learn on the fly, running on no sleep, hoping today goes better than yesterday.\n\n',
        'Answer a few questions and we’ll build a plan around ',
        { text: 'your child', hl: true },
        '. Two minutes, tops.',
      ]}
      ctaTitle="Let's begin"
      onContinue={handleContinue}
      showProgress={false}
    />
  );
};
