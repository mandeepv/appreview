/**
 * Screen 18 in the design canvas — "STEP 7 OF 8".
 *
 * The canvas note is the brief: "held, not audited". This is the one screen
 * that asks the parent to admit something, so the rows are set in Newsreader
 * rather than Figtree — serif reads as a letter, sans reads as a form — and
 * the subtitle says out loud that nothing here is a verdict. The lock line and
 * the offered way out are part of that, not decoration.
 *
 * "I'd rather not say" maps onto the existing `'okay'` value, which has always
 * been the exclusive escape option ("I'm doing okay right now"). Keeping the
 * stored value means the Supabase payload and the PostHog property are
 * unchanged from v1.2.0 — only the wording the parent sees is softer.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path, Rect } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { EmotionalChallenge } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
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
];

/** The exclusive opt-out. Kept as a distinct value so it never reads as a feeling. */
const RATHER_NOT_SAY: EmotionalChallenge = 'okay';

function LockIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
      <Rect
        x={4}
        y={11}
        width={16}
        height={10}
        rx={2.5}
        stroke={C.forestDeep}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Path
        d="M8 11V7.5a4 4 0 018 0V11"
        stroke={C.forestDeep}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const EmotionalChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { emotionalChallenges, toggleEmotionalChallenge } = useOnboardingStore();
  const optedOut = emotionalChallenges.includes(RATHER_NOT_SAY);
  const feelingCount = emotionalChallenges.filter((c) => c !== RATHER_NOT_SAY).length;

  // Picking a feeling clears the opt-out and vice versa — they can't both be
  // true. This mirrors the v1.2.0 behaviour exactly.
  const handleToggle = (value: EmotionalChallenge) => {
    if (optedOut) toggleEmotionalChallenge(RATHER_NOT_SAY);
    toggleEmotionalChallenge(value);
  };

  const handleRatherNotSay = () => {
    if (optedOut) {
      toggleEmotionalChallenge(RATHER_NOT_SAY);
      return;
    }
    emotionalChallenges.forEach((c) => toggleEmotionalChallenge(c));
    toggleEmotionalChallenge(RATHER_NOT_SAY);
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('EmotionalChallenges', emotionalChallenges);
    navigation.navigate('Auth');
  };

  return (
    <OnboardingScreen
      step={7}
      headline="How have you been *feeling* lately?"
      subtitle="Whatever you pick, nothing here is a verdict on you. Take as many as are true."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={emotionalChallenges.length === 0}
      scrollable
      footerNote={
        feelingCount > 0 ? (
          <Text style={styles.count}>{`${feelingCount} selected`}</Text>
        ) : undefined
      }
      footerAction={
        <Text style={styles.ratherNot} onPress={handleRatherNotSay}>
          {optedOut ? 'Actually, let me pick' : "I'd rather not say"}
        </Text>
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

      <View style={styles.lockRow}>
        <LockIcon />
        <Text style={styles.lockText}>Stored securely to personalize your lessons.</Text>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
  lockRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 22 },
  lockText: {
    flex: 1,
    fontFamily: F.serifItalic,
    fontSize: T.uiSm,
    lineHeight: T.uiSm * 1.5,
    color: oInk(0.74),
  },
  count: {
    fontFamily: F.sansMed,
    fontSize: T.uiSm,
    color: oInk(0.72),
    textAlign: 'center',
  },
  ratherNot: {
    fontFamily: F.sansMed,
    fontSize: 16,
    color: oInk(0.72),
    textAlign: 'center',
  },
});
