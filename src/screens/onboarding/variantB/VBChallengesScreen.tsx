import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import {
  QuestionScreen,
  OptionList,
  ContinueButton,
  SelectionCountPill,
  isMultiSelectValid,
} from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB, CHALLENGE_OPTIONS } from './variantBContent';

// ACT 2 — biggest challenge (self-identify the pain). Multi-select → Continue
// reveals on ≥1. Answer keys persist in variantBAnswers; the VBSnapshot beat
// reads these back into a human-readable focus.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBChallenges'>;

export const VBChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected: string[] = Array.isArray(variantBAnswers[VB.Challenges])
    ? (variantBAnswers[VB.Challenges] as string[])
    : [];

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    setVariantBAnswer(VB.Challenges, next);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted(VB.Challenges, selected);
    navigation.navigate('VBWhenHardest');
  };

  return (
    <QuestionScreen
      screenName={VB.Challenges}
      title="What's hardest for you lately?"
      subtitle="Pick as many as feel true."
      onBack={() => navigation.goBack()}
      footer={
        <>
          <SelectionCountPill count={selected.length} noun="area" />
          <ContinueButton onPress={handleContinue} disabled={!isMultiSelectValid(selected)} />
        </>
      }
    >
      <OptionList
        mode="multi"
        options={CHALLENGE_OPTIONS}
        selected={selected}
        onToggle={toggle}
      />
    </QuestionScreen>
  );
};
