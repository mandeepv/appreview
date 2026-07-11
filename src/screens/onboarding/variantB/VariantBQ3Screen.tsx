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
// SCAFFOLD, not a real question. Final variant-B screen — single-select, then
// rejoins the shared flow at Auth (signup mode, same as variant A's
// EmotionalChallenges → Auth). Do NOT invent parenting-domain copy here.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ3'>;

// Option KEYS only — never free text (PII rule).
const OPTIONS: { key: string; label: string }[] = [
  { key: 'placeholder_a', label: 'Placeholder option A' },
  { key: 'placeholder_b', label: 'Placeholder option B' },
  { key: 'placeholder_c', label: 'Placeholder option C' },
];

const SCREEN = 'VariantBQ3';

export const VariantBQ3Screen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected = typeof variantBAnswers[SCREEN] === 'string'
    ? (variantBAnswers[SCREEN] as string)
    : null;

  const handleContinue = () => {
    if (!selected) return;
    trackOnboardingStepCompleted(SCREEN, selected);
    // Rejoin the shared tail: Auth in signup mode (default), same as variant A.
    // Loading / theater / paywall are untouched and shared across both arms.
    navigation.navigate('Auth');
  };

  return (
    <OnboardingContainer
      screenName={SCREEN}
      title="[Placeholder] Variant B question 3 of 3"
      subtitle="[Placeholder] Single-select scaffold — real copy comes later."
      currentStep={3}
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
