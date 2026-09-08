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

const LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  {
    value: 'new-to-science',
    label: 'Start from the basics',
    description: "I've not read much. Assume nothing and I'll keep up.",
  },
  {
    value: 'somewhat-familiar',
    label: 'I know a lot about parenting science',
    description: 'Skip the explaining — I want what to do in the room.',
  },
  {
    value: 'know-a-lot',
    label: 'Advanced concepts and techniques',
    description: 'Co-regulation, repair, nervous systems. Go deeper than usual.',
  },
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
      subtitle="There's no wrong answer — it only sets where we begin."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!experienceLevel}
    >
      <View style={styles.rows}>
        {LEVELS.map((level) => (
          <OptionRow
            key={level.value}
            label={level.label}
            description={level.description}
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
