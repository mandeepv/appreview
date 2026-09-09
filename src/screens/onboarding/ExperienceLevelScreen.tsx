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

// Titles alone, no supporting lines. Three descriptions turned a one-tap
// question into a paragraph to read; the labels already say enough.
const LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'new-to-science', label: 'Start from the basics' },
  { value: 'somewhat-familiar', label: 'I know the basics' },
  { value: 'know-a-lot', label: 'Go deeper than usual' },
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
