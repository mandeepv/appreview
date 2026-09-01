import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
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
    <StoryScreen
      screenName={VB.Mirror}
      image={require('../../../../assets/onboarding/emotional_burned_out.png')}
      title={`Take a breath, ${name || 'friend'}.`}
      maskTitle
      body={[
        { text: '83% of parents', hl: true },
        ' just told us the exact same thing.\n\nThat voice saying you should already know how to handle this? It’s wrong. You were never taught. That’s not a flaw, it’s the whole reason we’re here.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="I'm ready"
      onContinue={handleContinue}
    />
  );
};
