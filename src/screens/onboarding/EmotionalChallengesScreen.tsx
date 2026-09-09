/**
 * Screen 18 in the design canvas — step 7 of 8.
 *
 * The canvas note is the brief: "held, not audited". This is the one screen
 * that asks the parent to admit something, so the rows are set in Newsreader
 * rather than Figtree — serif reads as a letter, sans reads as a form — and
 * the subtitle says out loud that nothing here is a verdict.
 *
 * The canvas also drew a "stored securely" lock line and an "I'd rather not
 * say" opt-out. Both were cut: the lock line raised a privacy question
 * mid-flow that the parent had not asked, and the opt-out sat under the
 * Continue pill competing with it.
 *
 * "I'm doing okay right now" is NOT that opt-out — it is v1.2.0's fifth
 * option and a real answer, so it stays, and stays exclusive.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { EmotionalChallenge } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmotionalChallenges'>;

const FEELINGS: { value: EmotionalChallenge; label: string }[] = [
  { value: 'overwhelmed', label: 'Feeling overwhelmed' },
  { value: 'anxious', label: 'Feeling anxious' },
  { value: 'burned-out', label: 'Feeling burned out' },
  { value: 'emotionally-distant', label: 'Feeling emotionally distant' },
  { value: 'okay', label: "I'm doing okay right now" },
];

/**
 * Exclusive: it cannot be true alongside a struggle, so picking it clears the
 * others and picking any other clears it. v1.2.0 behaved the same way.
 *
 * Distinct from the "I'd rather not say" opt-out that briefly sat under the
 * Continue pill — that was a refusal to answer and was cut. This is an answer.
 */
const OKAY: EmotionalChallenge = 'okay';

export const EmotionalChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { emotionalChallenges, toggleEmotionalChallenge } = useOnboardingStore();
  // Count the struggles only: "1 selected" under a lone "I'm doing okay"
  // restates what the row already shows.
  const feelingCount = emotionalChallenges.filter((c) => c !== OKAY).length;

  const handleToggle = (value: EmotionalChallenge) => {
    const isOkay = value === OKAY;
    const okaySelected = emotionalChallenges.includes(OKAY);

    if (isOkay && !okaySelected) {
      // Choosing "doing okay" clears every struggle.
      emotionalChallenges.forEach((c) => toggleEmotionalChallenge(c));
      toggleEmotionalChallenge(OKAY);
      return;
    }
    if (!isOkay && okaySelected) {
      // Choosing a struggle clears "doing okay".
      toggleEmotionalChallenge(OKAY);
    }
    toggleEmotionalChallenge(value);
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('EmotionalChallenges', emotionalChallenges);
    navigation.navigate('Auth');
  };

  return (
    <OnboardingScreen
      step={7}
      headline="How have you been *feeling* lately?"
      subtitle="Select all that apply."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={emotionalChallenges.length === 0}
      scrollable
      footerNote={
        feelingCount > 0 ? (
          <Text style={styles.count}>{`${feelingCount} selected`}</Text>
        ) : undefined
      }
    >
      <View style={styles.rows}>
        {FEELINGS.map((feeling) => (
          <OptionRow
            key={feeling.value}
            label={feeling.label}
            mode="multi"
            serif
            selected={emotionalChallenges.includes(feeling.value)}
            onPress={() => handleToggle(feeling.value)}
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
