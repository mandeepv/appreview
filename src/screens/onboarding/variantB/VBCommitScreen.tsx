import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { VBQuestionScreen, OptionList } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB, COMMIT_OPTIONS } from './variantBContent';

// ACT 3 — the COMMITMENT beat (Cialdini). Getting the user to actively state a
// commitment right before the paywall meaningfully lifts conversion. Single-
// select → auto-advance into the "you're all in" affirmation.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBCommit'>;

export const VBCommitScreen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected = typeof variantBAnswers[VB.Commit] === 'string'
    ? (variantBAnswers[VB.Commit] as string)
    : null;

  const handleAdvance = (value: string) => {
    trackOnboardingStepCompleted(VB.Commit, value);
    navigation.navigate('VBAllIn');
  };

  return (
    <VBQuestionScreen
      screenName={VB.Commit}
      title="Real talk. How ready are you to make this stick?"
      subtitle="There's no wrong answer, but be honest with yourself."
      onBack={() => navigation.goBack()}
    >
      <OptionList
        appearance="warm"
        mode="single"
        options={COMMIT_OPTIONS}
        selected={selected}
        onSelect={(value) => setVariantBAnswer(VB.Commit, value)}
        onAdvance={handleAdvance}
      />
    </VBQuestionScreen>
  );
};
