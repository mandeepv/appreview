import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../../components/OnboardingContainer';
import { SelectableCard } from '../../../components/SelectableCard';
import { Button } from '../../../components/Button';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { Colors } from '../../../constants/theme';

// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above 0%.
// SCAFFOLD, not a real question. This screen establishes the MULTI-select
// interaction pattern (one of each interaction across Q1/Q2/Q3 so the real
// questions later slot into a proven shape). Do NOT invent parenting-domain
// copy here.

type Props = NativeStackScreenProps<OnboardingStackParamList, 'VariantBQ2'>;

// Option KEYS only — never free text (PII rule).
const OPTIONS: { key: string; label: string }[] = [
  { key: 'placeholder_a', label: 'Placeholder option A' },
  { key: 'placeholder_b', label: 'Placeholder option B' },
  { key: 'placeholder_c', label: 'Placeholder option C' },
];

const SCREEN = 'VariantBQ2';

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

  return (
    <OnboardingContainer
      screenName={SCREEN}
      title="[Placeholder] Variant B question 2 of 3"
      subtitle="[Placeholder] Multi-select scaffold — real copy comes later."
      currentStep={2}
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
              selected={selected.includes(option.key)}
              onPress={() => toggle(option.key)}
            />
          ))}
        </View>

        {selected.length > 0 && (
          <Text style={styles.selectionCount}>
            {selected.length} selected
          </Text>
        )}

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={selected.length === 0}
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
  selectionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});
