import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, ContinueButton } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildGender } from '../../types/onboarding';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenGender'>;

// SPEC-17: per-child screen (gender per child, laid out as icon rows). Adopts
// the shell + footer grammar and tokenizes the colors; keeps its bespoke row
// layout (icon segmented buttons don't map onto OptionCard). Off the active path
// today (kept registered). Explicit Continue; unchanged navigation/behavior.
const GENDER_OPTIONS: { value: ChildGender; label: string; icon: string }[] = [
  { value: 'boy', label: 'Boy', icon: '👦' },
  { value: 'girl', label: 'Girl', icon: '👧' },
  { value: 'expecting', label: "I'm expecting", icon: '🤰' },
];

export const ChildrenGenderScreen: React.FC<Props> = ({ navigation }) => {
  const { children, updateChildGender } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ChildrenAge');
  };

  return (
    <QuestionScreen
      screenName="ChildrenGender"
      title="What are the genders of your children?"
      subtitle="Select for each child"
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} />}
    >
      {children.map((child, index) => (
        <View key={index} style={styles.childSection}>
          <Text style={styles.childLabel}>Child {index + 1}</Text>
          <View style={styles.optionsRow}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updateChildGender(index, option.value)}
                style={[
                  styles.genderButton,
                  child.gender === option.value ? styles.genderButtonSelected : styles.genderButtonUnselected,
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.genderIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.genderLabel,
                    child.gender === option.value ? styles.genderLabelSelected : styles.genderLabelUnselected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => updateChildGender(index, 'prefer-not-to-say')} style={styles.preferNotToSay}>
            <Text
              style={[
                styles.preferNotToSayText,
                child.gender === 'prefer-not-to-say' && styles.preferNotToSayTextSelected,
              ]}
            >
              Prefer not to say
            </Text>
          </TouchableOpacity>
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
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  genderButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  genderIcon: {
    fontSize: Typography.sizes['2xl'],
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  genderLabelSelected: {
    color: Colors.surface,
  },
  genderLabelUnselected: {
    color: Colors.textPrimary,
  },
  preferNotToSay: {
    paddingVertical: Spacing.sm,
  },
  preferNotToSayText: {
    fontSize: Typography.sizes.md,
    textAlign: 'center',
    color: Colors.textTertiary,
  },
  preferNotToSayTextSelected: {
    color: Colors.primary,
  },
});
