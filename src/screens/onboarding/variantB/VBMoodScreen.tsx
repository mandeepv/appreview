import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { VBQuestionScreen, OptionList } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB, MOOD_OPTIONS } from './variantBContent';

// ACT 2 — temperature check. The user rates their OWN difficulty (reflection,
// not data collection). Single-select → auto-advance. Answer key persists in
// variantBAnswers (additive, variant-B-only — no migration).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBMood'>;

export const VBMoodScreen: React.FC<Props> = ({ navigation }) => {
  const { name, variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected = typeof variantBAnswers[VB.Mood] === 'string'
    ? (variantBAnswers[VB.Mood] as string)
    : null;

  const handleAdvance = (value: string) => {
    trackOnboardingStepCompleted(VB.Mood, value);
    navigation.navigate('VBChallenges');
  };

  return (
    <VBQuestionScreen
      screenName={VB.Mood}
      title={`${name || 'So'}, how do most days feel lately?`}
      subtitle="Be honest. This one's just between us."
      maskTitle
      onBack={() => navigation.goBack()}
    >
      <OptionList
        appearance="warm"
        mode="single"
        options={MOOD_OPTIONS}
        selected={selected}
        onSelect={(value) => setVariantBAnswer(VB.Mood, value)}
        onAdvance={handleAdvance}
      />
    </VBQuestionScreen>
  );
};
