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
import { VB, GOAL_OPTIONS } from './variantBContent';

// ACT 3 — aspiration. Shifts the frame from problem → desired future. Multi-
// select. The VBSnapshot beat reads the first selected goal back as "your goal".
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBGoals'>;

export const VBGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected: string[] = Array.isArray(variantBAnswers[VB.Goals])
    ? (variantBAnswers[VB.Goals] as string[])
    : [];

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    setVariantBAnswer(VB.Goals, next);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted(VB.Goals, selected);
    navigation.navigate('VBReady');
  };

  return (
    <QuestionScreen
      screenName={VB.Goals}
      title="If this worked, what would change?"
      subtitle="Choose what you're hoping for."
      onBack={() => navigation.goBack()}
      footer={
        <>
          <SelectionCountPill count={selected.length} noun="goal" />
          <ContinueButton onPress={handleContinue} disabled={!isMultiSelectValid(selected)} />
        </>
      }
    >
      <OptionList
        mode="multi"
        options={GOAL_OPTIONS}
        selected={selected}
        onToggle={toggle}
      />
    </QuestionScreen>
  );
};
