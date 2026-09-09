/**
 * Screen 01 in the design canvas — "STEP 3 OF 8".
 *
 * The canvas note is the whole idea: "one card per child, not one form". The
 * old screen asked for a count, then a single set of age-range chips shared
 * across every child, and cyclically assigned them — so two children could
 * never be recorded as 4 and 7, only as "one of these ages applies". Here each
 * child gets its own card with its own exact age and gender.
 *
 * GENDER IS BACK, CAREFULLY. `Child.gender` carries a standing warning: it was
 * once defaulted to 'boy' and silently saved that for everyone, so the type
 * keeps it optional and the note asks that any future collection require an
 * explicit tap. That is honoured here — a card starts with neither chip lit,
 * nothing is written until the parent taps, and Continue does not require it.
 *
 * AGE: the store speaks ChildAgeRange ('2-4', '5-7', …) and the canvas asks
 * for an exact year. We collect the year the design asks for and map it to the
 * existing bucket on save, so the Supabase payload and the analytics property
 * are unchanged from v1.2.0. `childYears` is local state only.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange, ChildGender } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  oInk,
  oForest,
} from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenCount'>;

const ORDINALS = ['Eldest', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
const MAX_CHILDREN = 6;
const DEFAULT_AGE = 5;

/** Exact year → the bucket the store and Supabase already speak. */
function ageRangeFor(years: number): ChildAgeRange {
  if (years <= 1) return '0-1';
  if (years <= 4) return '2-4';
  if (years <= 7) return '5-7';
  if (years <= 12) return '8-12';
  if (years <= 17) return '13-17';
  return '18+';
}

function GenderChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipOn : styles.chipOff,
        pressed ? { opacity: 0.8 } : null,
      ]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextOn : styles.chipTextOff]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AgeStepper({
  years,
  onChange,
}: {
  years: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.ageStepper}>
      <Pressable
        onPress={() => onChange(Math.max(0, years - 1))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Younger"
        style={({ pressed }) => [styles.ageBtn, pressed ? { opacity: 0.6 } : null]}
      >
        <View style={styles.minusBar} />
      </Pressable>
      <Pressable
        onPress={() => onChange(Math.min(18, years + 1))}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Older"
        style={({ pressed }) => [styles.ageBtn, styles.ageBtnPlus, pressed ? { opacity: 0.6 } : null]}
      >
        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke={C.cream} strokeWidth={3} strokeLinecap="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

export const ChildrenCountScreen: React.FC<Props> = ({ navigation }) => {
  const {
    childrenCount,
    updateChildrenCount,
    children,
    updateChildAgeRange,
    updateChildGender,
  } = useOnboardingStore();

  const count = childrenCount || 0;

  // Exact years live here; only the bucket reaches the store. Seeded from any
  // range already saved so going back doesn't lose the parent's answer.
  const [childYears, setChildYears] = useState<number[]>(() =>
    Array.from({ length: MAX_CHILDREN }, (_, i) => {
      const saved = children[i]?.ageRange;
      if (!saved) return DEFAULT_AGE;
      const first = parseInt(String(saved).split('-')[0], 10);
      return Number.isFinite(first) ? Math.max(first, 0) : DEFAULT_AGE;
    }),
  );

  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const setYears = (index: number, next: number) => {
    setChildYears((prev) => prev.map((y, i) => (i === index ? next : y)));
  };

  const handleContinue = () => {
    for (let i = 0; i < count; i++) {
      updateChildAgeRange(i, ageRangeFor(childYears[i]));
    }
    trackOnboardingStepCompleted('ChildrenCount', {
      count,
      age_ranges: Array.from({ length: count }, (_, i) => ageRangeFor(childYears[i])),
    });
    navigation.navigate('ImprovementGoals');
  };

  return (
    <OnboardingScreen
      step={3}
      headline="Tell us about your *kids*."
      subtitle="Exact ages matter — a 4-year-old and a 7-year-old need different words for the same moment."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={count === 0}
      scrollable
      footerNote={<Text style={styles.footnote}>You can update this any time.</Text>}
    >
      <View style={styles.countRow}>
        <Text style={styles.countLabel}>How many children?</Text>
        <View style={styles.countStepper}>
          <Pressable
            onPress={() => {
              if (count > 0) {
                animate();
                updateChildrenCount(count - 1);
              }
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fewer children"
            style={({ pressed }) => [styles.countBtn, pressed ? { opacity: 0.6 } : null]}
          >
            <View style={styles.minusBarLg} />
          </Pressable>

          <Text style={styles.countValue}>{count}</Text>

          <Pressable
            onPress={() => {
              if (count < MAX_CHILDREN) {
                animate();
                updateChildrenCount(count + 1);
              }
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More children"
            style={({ pressed }) => [
              styles.countBtn,
              styles.countBtnPlus,
              pressed ? { opacity: 0.6 } : null,
            ]}
          >
            <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke={C.cream} strokeWidth={2.8} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <View style={styles.cards}>
        {Array.from({ length: count }, (_, i) => {
          const gender = children[i]?.gender;
          const years = childYears[i];
          return (
            <View key={i} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTag}>{(ORDINALS[i] || 'Child').toUpperCase()}</Text>
                <AgeStepper years={years} onChange={(next) => setYears(i, next)} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.ageCol}>
                  <Text style={styles.ageLabel}>Age</Text>
                  <View style={styles.ageValueRule}>
                    <Text style={styles.ageValue}>{years}</Text>
                    <Text style={styles.ageUnit}>{years === 1 ? 'year old' : 'years old'}</Text>
                  </View>
                </View>

                <View style={styles.chips}>
                  <GenderChip
                    label="Girl"
                    selected={gender === 'girl'}
                    onPress={() => updateChildGender(i, 'girl' as ChildGender)}
                  />
                  <GenderChip
                    label="Boy"
                    selected={gender === 'boy'}
                    onPress={() => updateChildGender(i, 'boy' as ChildGender)}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: oInk(0.09),
  },
  countLabel: { fontFamily: F.sansMed, fontSize: T.ui, color: C.ink },
  countStepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: oInk(0.28),
  },
  countBtnPlus: { backgroundColor: C.forest, borderWidth: 0 },
  countValue: {
    width: 46,
    textAlign: 'center',
    fontFamily: F.serif,
    fontSize: T.h2,
    color: C.ink,
  },
  minusBarLg: { width: 15, height: 1.8, borderRadius: 2, backgroundColor: C.ink },

  cards: { gap: 12, marginTop: 20 },
  card: { backgroundColor: C.wash, borderRadius: R.card, padding: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTag: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.05,
    color: oInk(0.72),
  },
  cardBody: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 12 },
  ageCol: { flex: 1 },
  ageLabel: { fontFamily: F.sansMed, fontSize: T.meta, color: oInk(0.7) },
  ageValueRule: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
    marginTop: 2,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: oForest(0.5),
  },
  ageValue: { fontFamily: F.serif, fontSize: T.h2, color: C.ink },
  ageUnit: { fontFamily: F.serif, fontSize: T.uiSm, color: oInk(0.62) },

  ageStepper: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ageBtn: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: oInk(0.26),
  },
  ageBtnPlus: { backgroundColor: C.forest, borderWidth: 0 },
  minusBar: { width: 12, height: 1.7, borderRadius: 2, backgroundColor: C.ink },

  chips: { flexDirection: 'row', gap: 7, paddingBottom: 4 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999 },
  chipOn: { backgroundColor: C.forest },
  chipOff: { borderWidth: 1.5, borderColor: oInk(0.26) },
  chipText: { fontFamily: F.sansSemi, fontSize: T.uiSm },
  chipTextOn: { color: C.cream },
  chipTextOff: { color: oInk(0.74) },

  footnote: {
    fontFamily: F.serifItalic,
    fontSize: T.uiSm,
    color: oInk(0.7),
    textAlign: 'center',
  },
});
