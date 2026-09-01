import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — locks the pledge the user just made on VBCommit ("you're all in").
// Affirming the commitment back deepens it before the rating + paywall. Uses the
// full-accent takeover (accentFill) for the emotional high, mirroring the
// reference apps' pledge-locked screen.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBAllIn'>;

export const VBAllInScreen: React.FC<Props> = ({ navigation }) => {
  const { name } = useOnboardingStore();

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.AllIn, 'continue');
    navigation.navigate('VBRating');
  };

  return (
    <StoryScreen
      screenName={VB.AllIn}
      accentFill
      iconName="flame-outline"
      title={`That's the hard part done, ${name || 'friend'}.`}
      maskTitle
      body={[
        'Choosing to change how you show up? Most people never get there. You just did.\n\nThe rest is small, doable steps. Let’s build the home you actually want, one at a time.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Let's go"
      onContinue={handleContinue}
    />
  );
};
