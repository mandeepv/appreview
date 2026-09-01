import React from 'react';
import { LayoutAnimation, Platform, UIManager, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { VBQuestionScreen, ContinueButton } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { ChildAgeRange } from '../../../types/onboarding';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../../constants/theme';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// ACT 2 — "tell us about your kids". WARM variant-B fork of the children-count
// picker (variant A keeps ChildrenCountScreen untouched). Same store fields
// (childrenCount / children[].ageRange) and the SAME 'ChildrenCount' analytics
// step, so it's data-identical to variant A — only the shell + styling are the
// warm treatment (cream canvas, left-aligned labels, warm pills) so it stops
// being the one off-style screen in the flow. Gender selection is omitted (it's
// behind an off-by-default flag in the shared screen and never shown).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBKids'>;

const AGE_RANGES: { label: string; value: ChildAgeRange }[] = [
  { label: '0–1', value: '0-1' },
  { label: '2–4', value: '2-4' },
  { label: '5–7', value: '5-7' },
  { label: '8–12', value: '8-12' },
  { label: '13–17', value: '13-17' },
  { label: '18+', value: '18+' },
];

export const VBKidsScreen: React.FC<Props> = ({ navigation }) => {
  const { childrenCount, updateChildrenCount, children, updateChildAgeRange } = useOnboardingStore();

  // Lazy initializer (hydrate from store on first render, no effect cascade).
  const [selectedAges, setSelectedAges] = React.useState<Set<ChildAgeRange>>(() => {
    const initial = new Set<ChildAgeRange>();
    if (childrenCount) {
      children.forEach((child) => {
        if (child.ageRange) initial.add(child.ageRange);
      });
    }
    return initial;
  });
  const [capHint, setCapHint] = React.useState(false);

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const incrementCount = () => {
    Haptics.selectionAsync().catch(() => {});
    animate();
    updateChildrenCount((childrenCount || 0) + 1);
  };

  const decrementCount = () => {
    const current = childrenCount || 0;
    if (current > 0) {
      Haptics.selectionAsync().catch(() => {});
      animate();
      updateChildrenCount(current - 1);
    }
  };

  const toggleAge = (age: ChildAgeRange) => {
    const newAges = new Set(selectedAges);
    const currentCount = childrenCount || 0;
    if (newAges.has(age)) {
      newAges.delete(age);
      setCapHint(false);
    } else if (newAges.size < currentCount) {
      Haptics.selectionAsync().catch(() => {});
      newAges.add(age);
      setCapHint(false);
    } else {
      // At the cap — don't fail silently: buzz + show the swap hint.
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setCapHint(true);
    }
    setSelectedAges(newAges);
  };

  const handleContinue = () => {
    const count = childrenCount || 1;
    const ages = Array.from(selectedAges);
    for (let i = 0; i < count; i++) {
      if (ages.length > 0) {
        // Assign ages cyclically if count > ages selected (same as variant A).
        updateChildAgeRange(i, ages[i % ages.length]);
      }
    }
    trackOnboardingStepCompleted('ChildrenCount', { count, age_ranges: ages });
    navigation.navigate('VBMood');
  };

  const hasChildren = (childrenCount || 0) > 0;
  const canContinue = hasChildren && selectedAges.size > 0;

  return (
    <VBQuestionScreen
      screenName={VB.Kids}
      title="Tell us about your kids."
      subtitle="So the plan fits the ages you're actually parenting."
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} disabled={!canContinue} />}
    >
      {/* Count stepper */}
      <View style={styles.section}>
        <Text style={styles.label}>How many children do you have?</Text>
        <View style={styles.stepper}>
          <TouchableOpacity
            style={[styles.stepBtn, styles.stepBtnMinus]}
            onPress={decrementCount}
            activeOpacity={0.7}
            accessibilityLabel="Fewer children"
          >
            <Ionicons name="remove" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.count}>{childrenCount || 0}</Text>
          <TouchableOpacity
            style={[styles.stepBtn, styles.stepBtnPlus]}
            onPress={incrementCount}
            activeOpacity={0.7}
            accessibilityLabel="More children"
          >
            <Ionicons name="add" size={24} color={Colors.surface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Age pills — revealed once children > 0 */}
      {hasChildren && (
        <View style={styles.section}>
          <Text style={styles.label}>How old are they?</Text>
          <Text style={styles.sublabel}>Pick an age range for each of your kids.</Text>
          <View style={styles.ageGrid}>
            {AGE_RANGES.map((range) => {
              const on = selectedAges.has(range.value);
              return (
                <TouchableOpacity
                  key={range.value}
                  style={[styles.agePill, on && styles.agePillSelected]}
                  onPress={() => toggleAge(range.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.agePillText, on && styles.agePillTextSelected]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {capHint && (
            <Text style={styles.capHint}>That covers all your kids — tap one to swap it.</Text>
          )}
        </View>
      )}
    </VBQuestionScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing['3xl'],
  },
  label: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  sublabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  // Stepper — a soft lifted pill on the cream canvas, matching the warm cards.
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
    ...Shadows.sm,
  },
  stepBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnMinus: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  stepBtnPlus: {
    backgroundColor: Colors.primary,
    ...Shadows.primary,
  },
  count: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  // Age pills styled like the warm option cards: soft lifted, teal on select.
  agePill: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.sm,
  },
  agePillSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
    ...Shadows.primary,
  },
  agePillText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  agePillTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  capHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.md,
  },
});
