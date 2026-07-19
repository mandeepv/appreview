import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 2→3 hinge — the MIRROR beat. Reflects the user's answers back with social
// proof so the experience feels bespoke (Cialdini social proof + the "you're
// further than most" reframe). ⚠︎ The 83% stat is placeholder-but-hard-hitting —
// confirm defensible before ramping the flag (see the copy doc's checklist).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBMirror'>;

export const VBMirrorScreen: React.FC<Props> = ({ navigation }) => {
  const { name } = useOnboardingStore();

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Mirror, 'continue');
    navigation.navigate('VBGoals');
  };

  return (
    <StatementScreen
      screenName={VB.Mirror}
      title={`You're not alone, ${name || 'friend'}.`}
      body="83% of parents told us the exact same thing you just did. The good news: it's learnable — and you're already further than most just by being here."
      onBack={() => navigation.goBack()}
      ctaTitle="I'm ready"
      onContinue={handleContinue}
    />
  );
};
