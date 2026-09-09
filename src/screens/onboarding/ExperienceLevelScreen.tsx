/**
 * Screen 17 in the design canvas — "STEP 6 OF 8".
 *
 * Single-select with taller rows: each is a title plus a supporting line, so
 * the parent picks by how it sounds rather than by decoding a label. The
 * supporting copy is the canvas's, and it does real work — "Skip the
 * explaining" tells a confident reader they won't be talked down to.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ExperienceLevel } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import { OnboardingLayout as L } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExperienceLevel'>;

// v1.2.0's labels, which actually answer the question asked. An earlier pass
// collapsed each option to a single line and kept the wrong half — the
// SUBTITLE ("Start from the basics", "Advanced concepts and techniques") says
// what we will do about the answer, not how familiar the parent is, so two of
// the three options were replying to a question nobody asked.
const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'new-to-science', label: "I'm new to parenting science" },
  { value: 'somewhat-familiar', label: "I'm somewhat familiar with it" },
  { value: 'know-a-lot', label: 'I know a lot about parenting science' },
];

export const ExperienceLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { experienceLevel, updateExperienceLevel } = useOnboardingStore();

  const handleContinue = () => {
    if (!experienceLevel) return;
    trackOnboardingStepCompleted('ExperienceLevel', experienceLevel);
    navigation.navigate('EmotionalChallenges');
  };

  return (
    <OnboardingScreen
      step={6}
      headline="How familiar are you with modern parenting *ideas*?"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!experienceLevel}
    >
      <View style={styles.rows}>
        {LEVELS.map((level) => (
          <OptionRow
            key={level.value}
            label={level.label}
            mode="single"
            selected={experienceLevel === level.value}
            onPress={() => updateExperienceLevel(level.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
});
