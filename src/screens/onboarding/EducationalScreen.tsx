/**
 * Screen 15 in the design canvas — "WHY THIS WORKS".
 *
 * No step label. The canvas is explicit about why: the count should only move
 * when the parent is actually asked something, and this screen asks nothing.
 * Showing "STEP 5 OF 8" on a reassurance beat would make the flow feel longer
 * than it is.
 *
 * Numbered serif rows, forest numerals, hairline rules between — an editorial
 * list rather than three feature cards.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Educational'>;

const POINTS: { title: string; body: string }[] = [
  {
    title: 'Expert-backed lessons',
    body: 'Written by child psychologists, not scraped from forums.',
  },
  {
    title: 'Quick & effective',
    body: 'Five minutes after bedtime. One thing to try tomorrow.',
  },
  {
    title: 'Personalized for you',
    body: 'Built from your answers — your children, your hardest week.',
  },
];

export const EducationalScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = () => {
    trackOnboardingStepCompleted('Educational', {});
    navigation.navigate('PartnerInvolvement');
  };

  return (
    <OnboardingScreen
      headline="Why this *works*"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
    >
      <View>
        {POINTS.map((point, i) => (
          <View
            key={point.title}
            style={[styles.row, i < POINTS.length - 1 ? styles.rowRule : null]}
          >
            <Text style={styles.numeral}>{String(i + 1).padStart(2, '0')}</Text>
            <View style={styles.textCol}>
              <Text style={styles.title}>{point.title}</Text>
              <Text style={styles.body}>{point.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 18, paddingVertical: 22 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: oInk(0.09) },
  numeral: { fontFamily: F.serif, fontSize: 24, color: C.forest, width: 32, flexShrink: 0 },
  textCol: { flex: 1 },
  title: { fontFamily: F.serif, fontSize: T.h3, lineHeight: T.h3 * 1.3, color: C.ink },
  body: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.55,
    color: oInk(0.76),
    marginTop: 6,
  },
});
