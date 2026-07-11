import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';

// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above 0%.
// This is a SCAFFOLD, not a real onboarding question. Its only jobs are to prove
// the variant-B pipeline (routing, per-step analytics, answer persistence, save)
// and to establish the single-select interaction pattern. SPEC-17 migrated it to
// the onboarding UX system: single-select now auto-advances (no Continue). Do
// NOT invent parenting-domain copy here — the real questions arrive later as a
// pure content edit.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ1'>;

const SCREEN = 'VariantBQ1';

// Option KEYS only (persisted + saved to Supabase) — never free text (PII rule).
const OPTIONS: Option<string>[] = [
  { value: 'placeholder_a', label: 'Placeholder option A' },
  { value: 'placeholder_b', label: 'Placeholder option B' },
  { value: 'placeholder_c', label: 'Placeholder option C' },
];

export const VariantBQ1Screen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  // Single-select: the stored answer is a string (option key) or absent.
  const selected = typeof variantBAnswers[SCREEN] === 'string'
    ? (variantBAnswers[SCREEN] as string)
    : null;

  const handleAdvance = (value: string) => {
    // Same per-step event as variant A (trackOnboardingStepCompleted), so
    // per-step drop-off works for both arms in one insight; the variant itself
    // rides on the super-property.
    trackOnboardingStepCompleted(SCREEN, value);
    navigation.navigate('VariantBQ2');
  };

  return (
    <QuestionScreen
      screenName={SCREEN}
      title="[Placeholder] Variant B question 1 of 3"
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
