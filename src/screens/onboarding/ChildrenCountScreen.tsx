/**
 * Screen 01 in the design canvas — step 3 of 8.
 *
 * Restyled onto the cream/forest system, but the INTERACTION is v1.2.0's: a
 * count stepper, then one shared set of age-range chips.
 *
 * The canvas drew a card per child with an exact age and gender on each. It
 * was rejected in review: exact ages are not what the lessons key off (the
 * content is written per age band), and spawning a card per child turned one
 * quick question into a form that grows. The chips are one tap per band and
 * fit on a screen regardless of family size.
 *
 * Age assignment therefore stays exactly as it shipped: the selected bands are
 * assigned across the children cyclically. Same stored values, same analytics
 * payload.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
} from '../../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenCount'>;

const AGE_RANGES: { label: string; value: ChildAgeRange }[] = [
  { label: '0–1', value: '0-1' },
  { label: '2–4', value: '2-4' },
  { label: '5–7', value: '5-7' },
  { label: '8–12', value: '8-12' },
  { label: '13–17', value: '13-17' },
  { label: '18+', value: '18+' },
];

const MAX_CHILDREN = 8;

export const ChildrenCountScreen: React.FC<Props> = ({ navigation }) => {
  const { childrenCount, updateChildrenCount, children, updateChildAgeRange } =
    useOnboardingStore();

  const [selectedAges, setSelectedAges] = useState<Set<ChildAgeRange>>(() => {
    const initial = new Set<ChildAgeRange>();
    if (childrenCount) {
      children.forEach((child) => {
        if (child.ageRange) initial.add(child.ageRange);
      });
    }
    return initial;
  });

  const count = childrenCount || 0;
  const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const toggleAge = (age: ChildAgeRange) => {
    const next = new Set(selectedAges);
    if (next.has(age)) {
      next.delete(age);
    } else if (next.size < count) {
      // Can't claim more bands than there are children — v1.2.0 behaviour.
      next.add(age);
    }
    setSelectedAges(next);
  };

  const handleContinue = () => {
    const ages = Array.from(selectedAges);
    for (let i = 0; i < count; i++) {
      if (ages.length > 0) updateChildAgeRange(i, ages[i % ages.length]);
    }
    trackOnboardingStepCompleted('ChildrenCount', { count, age_ranges: ages });
    navigation.navigate('ImprovementGoals');
  };

  const canContinue = count > 0 && selectedAges.size > 0;

  return (
    <OnboardingScreen
      screenName="ChildrenCount"
      step={3}
      headline="Now about your *children*."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!canContinue}
      scrollable
    >
      <View>
        <Text style={styles.label}>How many children do you have?</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => {
              if (count > 0) {
                animate();
                const next = count - 1;
                updateChildrenCount(next);
                // Drop any bands the smaller count can no longer hold.
                //
                // toggleAge caps selections at `count`, but stepping DOWN
                // afterwards left them behind: pick three bands for three
                // children, step to two, and three chips stayed lit while
                // handleContinue assigned only the first two cyclically. The
                // extra chip read as chosen and silently did nothing.
                setSelectedAges((prev) =>
                  prev.size <= next ? prev : new Set(Array.from(prev).slice(0, next)),
                );
              }
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fewer children"
            style={({ pressed }) => [
              styles.stepBtn,
              styles.stepBtnMinus,
              count === 0 ? { opacity: 0.4 } : null,
              pressed ? { opacity: 0.6 } : null,
            ]}
          >
            <View style={styles.minusBar} />
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
              styles.stepBtn,
              styles.stepBtnPlus,
              pressed ? { opacity: 0.6 } : null,
            ]}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke={C.cream} strokeWidth={2.8} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      {count > 0 ? (
        <View style={styles.ageSection}>
          <Text style={styles.label}>How old are they?</Text>
          <Text style={styles.hint}>Select all that apply.</Text>
          <View style={styles.chips}>
            {AGE_RANGES.map((range) => {
              const on = selectedAges.has(range.value);
              return (
                <Pressable
                  key={range.value}
                  onPress={() => toggleAge(range.value)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on }}
                  style={({ pressed }) => [
                    styles.chip,
                    on ? styles.chipOn : styles.chipOff,
                    pressed ? { opacity: 0.8 } : null,
                  ]}
                >
                  <Text style={[styles.chipText, on ? styles.chipTextOn : styles.chipTextOff]}>
                    {range.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  label: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink, letterSpacing: 0.2 },
  hint: { fontFamily: F.serifItalic, fontSize: T.uiSm, color: oInk(0.7), marginTop: 4 },

  // Same pill as NameAge — minus, value, plus grouped together rather than
  // spread to the screen edges.
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: C.wash,
    borderRadius: 999,
    padding: 8,
    marginTop: 16,
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnMinus: { backgroundColor: C.paper, borderWidth: 1.5, borderColor: oInk(0.18) },
  stepBtnPlus: { backgroundColor: C.forest },
  minusBar: { width: 20, height: 2.2, borderRadius: 2, backgroundColor: C.ink },
  countValue: {
    minWidth: 108,
    textAlign: 'center',
    fontFamily: F.serif,
    fontSize: 40,
    letterSpacing: -1,
    color: C.ink,
  },

  ageSection: {
    marginTop: 30,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: oInk(0.09),
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  chip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 999 },
  chipOn: { backgroundColor: C.forest },
  chipOff: { backgroundColor: C.wash },
  chipText: { fontFamily: F.sansSemi, fontSize: T.ui },
  chipTextOn: { color: C.cream },
  chipTextOff: { color: oInk(0.78) },
});
