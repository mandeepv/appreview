import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';

// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above 0%.
// SCAFFOLD, not a real question. Final variant-B screen — single-select, then
// rejoins the shared flow at Auth (signup mode, same as variant A's
// EmotionalChallenges → Auth). SPEC-17 migrated it to the system: single-select
// now auto-advances (no Continue). Do NOT invent parenting-domain copy here.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ3'>;

const SCREEN = 'VariantBQ3';

// Option KEYS only — never free text (PII rule).
const OPTIONS: Option<string>[] = [
  { value: 'placeholder_a', label: 'Placeholder option A' },
  { value: 'placeholder_b', label: 'Placeholder option B' },
  { value: 'placeholder_c', label: 'Placeholder option C' },
];

export const VariantBQ3Screen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected = typeof variantBAnswers[SCREEN] === 'string'
    ? (variantBAnswers[SCREEN] as string)
    : null;

  const handleAdvance = (value: string) => {
    trackOnboardingStepCompleted(SCREEN, value);
    // Rejoin the shared tail: Auth in signup mode (default), same as variant A.
    // Loading / theater / paywall are untouched and shared across both arms.
    navigation.navigate('Auth');
  };

  return (
    <QuestionScreen
      screenName={SCREEN}
      title="[Placeholder] Variant B question 3 of 3"
      subtitle="[Placeholder] Single-select scaffold — real copy comes later."
      onBack={() => navigation.goBack()}
    >
      <OptionList
        mode="single"
        options={OPTIONS}
        selected={selected}
        onSelect={(value) => setVariantBAnswer(SCREEN, value)}
        onAdvance={handleAdvance}
      />
    </QuestionScreen>
  );
};
