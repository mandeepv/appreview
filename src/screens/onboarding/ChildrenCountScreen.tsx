import React from 'react';
import { LayoutAnimation, Platform, UIManager, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen } from '../../components/onboarding';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange, ChildGender } from '../../types/onboarding';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenCount'>;

// SPEC-17: compound-input screen (counter + multi-age grid). Adopts the shell +
// footer grammar but KEEPS an explicit, gated Continue — this is not a plain
// single/multi question, so auto-advance/reveal don't apply. All internal
// interaction logic, values, analytics step, and screenName are unchanged.

const AGE_RANGES: { label: string; value: ChildAgeRange }[] = [
  { label: '0–1', value: '0-1' },
  { label: '2–4', value: '2-4' },
  { label: '5–7', value: '5-7' },
  { label: '8–12', value: '8-12' },
  { label: '13–17', value: '13-17' },
  { label: '18+', value: '18+' },
];

const GENDER_OPTIONS: { label: string; value: ChildGender }[] = [
  { label: 'Girl', value: 'girl' },
  { label: 'Boy', value: 'boy' },
  { label: 'Prefer not to say', value: 'prefer-not-to-say' },
];

export const ChildrenCountScreen: React.FC<Props> = ({ navigation }) => {
  const {
    childrenCount,
    updateChildrenCount,
    children,
    updateChildAgeRange,
    updateChildGender,
  } = useOnboardingStore();

  // Lazy initializer so we hydrate from the store on the first render instead of
  // an effect (which caused a cascading render — react-hooks/set-state-in-effect).
  const [selectedAges, setSelectedAges] = React.useState<Set<ChildAgeRange>>(() => {
    const initial = new Set<ChildAgeRange>();
    if (childrenCount) {
      children.forEach((child) => {
        if (child.ageRange) initial.add(child.ageRange);
      });
    }
    return initial;
  });
  const [showPersonalization] = React.useState(false);

  const animate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const incrementCount = () => {
    animate();
    updateChildrenCount((childrenCount || 0) + 1);
  };

  const decrementCount = () => {
    const current = childrenCount || 0;
    if (current > 0) {
      animate();
      updateChildrenCount(current - 1);
    }
  };

  // Hint shown when a tap is blocked by the cap, so the block isn't silent.
  const [capHint, setCapHint] = React.useState(false);

  const toggleAge = (age: ChildAgeRange) => {
    const newAges = new Set(selectedAges);
    const currentCount = childrenCount || 0;
    if (newAges.has(age)) {
      newAges.delete(age);
      setCapHint(false);
    } else if (newAges.size < currentCount) {
      // Only allow selection up to the child count.
      newAges.add(age);
      setCapHint(false);
    } else {
      // At the cap — don't fail silently: buzz + show the swap hint.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setCapHint(true);
    }
    setSelectedAges(newAges);
  };

  const handleContinue = () => {
    const count = childrenCount || 1;
    const ages = Array.from(selectedAges);
    for (let i = 0; i < count; i++) {
      if (ages.length > 0) {
        // Assign ages cyclically if count > ages selected.
        updateChildAgeRange(i, ages[i % ages.length]);
      }
    }
    trackOnboardingStepCompleted('ChildrenCount', { count, age_ranges: ages });
    navigation.navigate('ImprovementGoals');
  };

  const hasChildren = (childrenCount || 0) > 0;
  const hasAges = selectedAges.size > 0;
  const canContinue = hasChildren && hasAges;

  return (
    <QuestionScreen
      screenName="ChildrenCount"
      title="Let's personalize this for your child(ren)"
      onBack={() => navigation.goBack()}
      footer={<Button title="Continue" onPress={handleContinue} disabled={!canContinue} />}
    >
      {/* Count section — always visible */}
      <View style={styles.section}>
        <Text style={styles.label}>How many children do you have?</Text>
        <View style={styles.selectorContainer}>
          <View style={styles.selector}>
            <TouchableOpacity style={[styles.button, styles.buttonMinus]} onPress={decrementCount} activeOpacity={0.7}>
              <Text style={styles.buttonTextMinus}>-</Text>
            </TouchableOpacity>
            <View style={styles.display}>
              <Text style={styles.displayText}>{childrenCount || 0}</Text>
            </View>
            <TouchableOpacity style={[styles.button, styles.buttonPlus]} onPress={incrementCount} activeOpacity={0.7}>
              <Text style={styles.buttonTextPlus}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Age section — revealed once children > 0 */}
      {hasChildren && (
        <View style={styles.section}>
          <Text style={styles.ageLabel}>How old are they?</Text>
          <Text style={styles.sublabel}>Pick an age range for each of your kids.</Text>
          <View style={styles.ageGrid}>
            {AGE_RANGES.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={[styles.ageOption, selectedAges.has(range.value) && styles.ageOptionSelected]}
                onPress={() => toggleAge(range.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.ageOptionText, selectedAges.has(range.value) && styles.ageOptionTextSelected]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Cap feedback — appears when a tap is blocked so it isn't silent. */}
          {capHint && (
            <Text style={styles.capHint}>That covers all your kids — tap one to swap it.</Text>
          )}

          {/* Optional gender expand — kept behind the flag it shipped behind
              (currently off; the trigger is commented out upstream). */}
          {showPersonalization && (
            <View style={styles.personalizationSection}>
              <Text style={styles.subLabel}>Gender selection</Text>
              {Array.from({ length: childrenCount || 1 }).map((_, index) => (
                <View key={index} style={styles.childRow}>
                  <Text style={styles.childLabel}>Child {index + 1}</Text>
                  <View style={styles.genderRow}>
                    {GENDER_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.genderButton,
                          children[index]?.gender === option.value && styles.genderButtonSelected,
                          option.value === 'prefer-not-to-say' && styles.genderButtonWide,
                        ]}
                        onPress={() => updateChildGender(index, option.value)}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            children[index]?.gender === option.value && styles.genderTextSelected,
                          ]}
                        >
                          {option.label === 'Prefer not to say' ? 'N/A' : option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </QuestionScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing['2xl'],
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  ageOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  ageOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  ageOptionText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  ageOptionTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  personalizationSection: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  subLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  childLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderButton: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderButtonWide: {
    paddingHorizontal: Spacing.sm,
  },
  genderButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  genderText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  genderTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  // Age-question heading: same as `label` but tighter, since a subline follows.
  ageLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  sublabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  capHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  selectorContainer: {
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
    width: '100%',
    maxWidth: 300,
    ...({
      shadowColor: Colors.glassDark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }),
    alignSelf: 'center',
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonMinus: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonPlus: {
    backgroundColor: Colors.primary,
  },
  buttonTextMinus: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
    lineHeight: 28,
  },
  buttonTextPlus: {
    fontSize: Typography.sizes['2xl'],
    color: Colors.surface,
    fontWeight: Typography.weights.medium,
    lineHeight: 28,
  },
  display: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayText: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
});
