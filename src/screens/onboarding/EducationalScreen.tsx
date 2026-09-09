/**
 * Screen 19 in the design canvas — "three marks, three claims".
 *
 * No progress rail. This screen asks nothing, and moving the count on a screen
 * that takes no answer makes the flow feel longer than it is.
 *
 * The first pass rendered this as three lines of plain serif text and read as
 * filler. It is the last thing a parent sees before being asked to sign up, so
 * it has to look like evidence: each claim gets a card, a drawn mark, and a
 * numeral.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path, Circle } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen, RichHeadline } from '../../components/onboarding/OnboardingScreen';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  oInk,
  oForest,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

/** An open book — lessons that are written and sourced. */
function BookMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 5.2A1.2 1.2 0 015.2 4H10a2.4 2.4 0 012.4 2.4V19.5a1.9 1.9 0 00-1.9-1.8H5.2A1.2 1.2 0 014 16.5z"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.4 5.2A1.2 1.2 0 0019.2 4H14.4A2.4 2.4 0 0012 6.4V19.5a1.9 1.9 0 011.9-1.8h5.3a1.2 1.2 0 001.2-1.2z"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A clock — five minutes. */
function ClockMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.6} stroke={C.forest} strokeWidth={2} />
      <Path
        d="M12 7.4V12l3.2 2"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A heart — built for this family. */
function HeartMark() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.6-7 10-7 10z"
        stroke={C.forest}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const POINTS: { Mark: () => React.JSX.Element; title: string; body: string }[] = [
  {
    Mark: BookMark,
    title: 'Written by child *psychologists*',
    body: 'Every lesson is signed and sourced. Nothing here came off a forum at 2am.',
  },
  {
    Mark: ClockMark,
    title: 'Five minutes, *one* thing to try',
    body: 'Read it after bedtime, use it tomorrow. No homework, no catching up.',
  },
  {
    Mark: HeartMark,
    title: 'Built from *your* answers',
    body: "Your children's ages, your hardest week. Not a course everyone gets.",
  },
];

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted('Educational', {});
    navigation.navigate('PartnerInvolvement');
  };

  return (
    <OnboardingScreen
      headline="Three reasons this one *sticks*."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      scrollable
    >
      <View style={styles.cards}>
        {POINTS.map(({ Mark, title, body }, i) => (
          <View key={title} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.markDisc}>
                <Mark />
              </View>
              <Text style={styles.numeral}>{String(i + 1).padStart(2, '0')}</Text>
            </View>
            <RichHeadline style={styles.cardTitle}>{title}</RichHeadline>
            <Text style={styles.cardBody}>{body}</Text>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  cards: { gap: 10 },
  card: { backgroundColor: C.wash, borderRadius: R.card, paddingVertical: 17, paddingHorizontal: 20 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  markDisc: {
    width: 46,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: oForest(0.45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeral: { fontFamily: F.serif, fontSize: 28, color: oForest(0.55), letterSpacing: -0.5 },
  cardTitle: {
    fontFamily: F.serif,
    fontSize: 23,
    lineHeight: 23 * 1.28,
    color: C.ink,
    marginTop: 11,
  },
  cardBody: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.55,
    color: oInk(0.78),
    marginTop: 6,
  },
});
