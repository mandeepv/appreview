import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — locks the pledge the user just made on VBCommit ("you're all in").
// Affirming the commitment back deepens it before the rating + paywall.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBAllIn'>;

export const VBAllInScreen: React.FC<Props> = ({ navigation }) => {
  const { name } = useOnboardingStore();

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.AllIn, 'continue');
    navigation.navigate('VBRating');
  };

  return (
    <StatementScreen
      screenName={VB.AllIn}
      title={`You're all in, ${name || 'friend'}. 💪`}
      body="That decision is the hardest part — and you just made it. Let's build the home you want, one small win at a time."
      onBack={() => navigation.goBack()}
      ctaTitle="Let's go"
      onContinue={handleContinue}
    />
  );
};
