import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionCard, ContinueButton } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange } from '../../types/onboarding';
import { Colors, Spacing, Typography } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenAge'>;

// SPEC-17: per-child screen (a single-select age per child). Not a plain
// single/multi question, so it keeps an explicit Continue; it adopts the shell +
// OptionCard visual family for consistency. Off the active path today (kept
// registered). Unchanged navigation/behavior.
const AGE_RANGES: { value: ChildAgeRange; label: string }[] = [
  { value: '0-1', label: '0-1 years' },
  { value: '2-4', label: '2-4 years' },
  { value: '5-7', label: '5-7 years' },
  { value: '8-12', label: '8-12 years' },
  { value: '13-17', label: '13-17 years' },
  { value: '18+', label: '18+' },
];

export const ChildrenAgeScreen: React.FC<Props> = ({ navigation }) => {
  const { children, updateChildAgeRange } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ImprovementGoals');
  };

  return (
    <QuestionScreen
      screenName="ChildrenAge"
      title="How old are your children?"
      subtitle="Select the age ranges that apply"
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} />}
    >
      {children.map((child, index) => (
        <View key={index} style={styles.childSection}>
          <Text style={styles.childLabel}>Child {index + 1}</Text>
          {AGE_RANGES.map((range) => (
            <View key={range.value} style={styles.cardGap}>
              <OptionCard
                title={range.label}
                variant="compact"
                selected={child.ageRange === range.value}
                onPress={() => updateChildAgeRange(index, range.value)}
              />
            </View>
          ))}
        </View>
      ))}
    </QuestionScreen>
  );
};

const styles = StyleSheet.create({
  childSection: {
    marginBottom: Spacing['2xl'],
  },
  childLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  cardGap: {
    marginBottom: Spacing.md,
  },
});
