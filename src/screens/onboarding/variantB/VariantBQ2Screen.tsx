import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import {
  QuestionScreen,
  OptionList,
  Option,
  ContinueButton,
  SelectionCountPill,
  isMultiSelectValid,
} from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';

// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above 0%.
// SCAFFOLD, not a real question — establishes the MULTI-select pattern. SPEC-17
// migrated it to the system: Continue REVEALS on >=1 selection (never a disabled
// button). Do NOT invent parenting-domain copy here.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ2'>;

const SCREEN = 'VariantBQ2';

// Option KEYS only — never free text (PII rule).
const OPTIONS: Option<string>[] = [
  { value: 'placeholder_a', label: 'Placeholder option A' },
  { value: 'placeholder_b', label: 'Placeholder option B' },
  { value: 'placeholder_c', label: 'Placeholder option C' },
];

export const VariantBQ2Screen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  // Multi-select: the stored answer is a string[] (option keys) or absent.
  const selected: string[] = Array.isArray(variantBAnswers[SCREEN])
    ? (variantBAnswers[SCREEN] as string[])
    : [];

  const toggle = (key: string) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    setVariantBAnswer(SCREEN, next);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted(SCREEN, selected);
    navigation.navigate('VariantBQ3');
  };

  const valid = isMultiSelectValid(selected);

  return (
    <QuestionScreen
      screenName={SCREEN}
      title="[Placeholder] Variant B question 2 of 3"
      subtitle="[Placeholder] Multi-select scaffold — real copy comes later."
      onBack={() => navigation.goBack()}
      footer={
        <>
          <SelectionCountPill count={selected.length} noun="option" />
          <ContinueButton onPress={handleContinue} disabled={!valid} />
        </>
      }
    >
      <OptionList mode="multi" options={OPTIONS} selected={selected} onToggle={toggle} />
    </QuestionScreen>
  );
};
