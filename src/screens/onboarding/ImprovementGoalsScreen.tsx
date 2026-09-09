/**
 * Screen 14 in the design canvas — step 4 of 8.
 *
 * Multi-select: squares plus a running count. The count is the whole reason
 * the footer note exists — with seven rows and no cap, "3 selected" is the
 * only feedback that the taps registered without making the parent re-scan
 * the list.
 *
 * The headline asks what to work on rather than what feels hardest. The
 * options are goals ("Closer relationship", "More quality time"), so under a
 * "what's hardest" framing half of them answered a different question than
 * the one being asked. The stored values are untouched — this is a wording
 * change only, so the funnel stays comparable.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ImprovementGoal } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ImprovementGoals'>;

// Every row is a thing to work TOWARD, so they all answer the same question.
// Two were left phrased as complaints — "Poor character traits" also judged
// the child, which is not what a parent wants to tap about their own kid.
const GOALS: { value: ImprovementGoal; label: string }[] = [
  { value: 'behavior-issues', label: 'Better behavior' },
  { value: 'closer-relationship', label: 'Closer relationship' },
  { value: 'less-fighting', label: 'Less fighting / tension' },
  { value: 'improved-parenting-skills', label: 'Improved parenting skills' },
  { value: 'quality-time', label: 'More quality time' },
  { value: 'character-traits', label: 'Kindness and character' },
  { value: 'tantrums', label: 'Fewer tantrums / whining' },
];

export const ImprovementGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { improvementGoals, toggleImprovementGoal } = useOnboardingStore();
  const count = improvementGoals.length;

  const handleContinue = () => {
    trackOnboardingStepCompleted('ImprovementGoals', improvementGoals);
    navigation.navigate('Educational');
  };

  return (
    <OnboardingScreen
      step={4}
      headline="What do you want to *work on*?"
      subtitle="Select all that apply."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={count === 0}
      scrollable
      footerNote={
        count > 0 ? <Text style={styles.count}>{`${count} selected`}</Text> : undefined
      }
    >
      <View style={styles.rows}>
        {GOALS.map((goal) => (
          <OptionRow
            key={goal.value}
            label={goal.label}
            mode="multi"
            selected={improvementGoals.includes(goal.value)}
            onPress={() => toggleImprovementGoal(goal.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
  count: {
    fontFamily: F.sansMed,
    fontSize: T.uiSm,
    color: oInk(0.72),
    textAlign: 'center',
  },
});
