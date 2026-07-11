import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../../components/OnboardingContainer';
import { SelectableCard } from '../../../components/SelectableCard';
import { Button } from '../../../components/Button';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';

// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above 0%.
// This is a SCAFFOLD, not a real onboarding question. Its only jobs are to
// prove the variant-B pipeline (routing, per-step analytics, answer
// persistence, save) and to establish the single-select interaction pattern
// that the real Q1 will later slot into. Do NOT invent parenting-domain copy
// here — the questions arrive later as a pure content edit.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ1'>;

// Option KEYS only (persisted + saved to Supabase) — never free text (PII rule).
const OPTIONS: { key: string; label: string }[] = [
  { key: 'placeholder_a', label: 'Placeholder option A' },
  { key: 'placeholder_b', label: 'Placeholder option B' },
  { key: 'placeholder_c', label: 'Placeholder option C' },
];

const SCREEN = 'VariantBQ1';

export const VariantBQ1Screen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  // Single-select: the stored answer is a string (option key) or absent.
  const selected = typeof variantBAnswers[SCREEN] === 'string'
    ? (variantBAnswers[SCREEN] as string)
    : null;

  const handleContinue = () => {
    if (!selected) return;
    // Same per-step event as variant A (trackOnboardingStepCompleted), so
    // per-step drop-off works for both arms in one insight; the variant itself
    // rides on the super-property.
    trackOnboardingStepCompleted(SCREEN, selected);
    navigation.navigate('VariantBQ2');
  };

  return (
    <OnboardingContainer
      screenName={SCREEN}
      title="[Placeholder] Variant B question 1 of 3"
      subtitle="[Placeholder] Single-select scaffold — real copy comes later."
      currentStep={1}
      totalSteps={3}
      onBack={() => navigation.goBack()}
      scrollable={true}
    >
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          {OPTIONS.map((option) => (
            <SelectableCard
              key={option.key}
              title={option.label}
              selected={selected === option.key}
              onPress={() => setVariantBAnswer(SCREEN, option.key)}
            />
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  cardsContainer: {
    gap: 16,
  },
});
