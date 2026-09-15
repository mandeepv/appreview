/**
 * Screen 14 in the design canvas — step 4 of 8.
 *
 * Multi-select: squares plus a running count. The count is the whole reason
 * the footer note exists — with seven rows and no cap, "3 selected" is the
 * only feedback that the taps registered without making the parent re-scan
 * the list.
 *
 * The headline asks what to work on rather than what feels hardest. Half the
 * options are goals ("Closer relationship", "More quality time"), so the old
 * "what's hardest" framing had them answering a different question than the
 * one asked. The option labels are v1.2.0's, unchanged — only the question
 * moved, so the stored values and the funnel stay comparable.
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

const GOALS: { value: ImprovementGoal; label: string }[] = [
  { value: 'behavior-issues', label: 'Behavior issues' },
  { value: 'closer-relationship', label: 'Closer relationship' },
  { value: 'less-fighting', label: 'Less fighting / tensions' },
  { value: 'improved-parenting-skills', label: 'Improved parenting skills' },
  { value: 'quality-time', label: 'More quality time' },
  { value: 'character-traits', label: 'Poor character traits' },
  { value: 'tantrums', label: 'Tantrums / whining' },
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
      screenName="ImprovementGoals"
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
