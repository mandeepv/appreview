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
                updateChildrenCount(count - 1);
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
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
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
  label: { fontFamily: F.sansMed, fontSize: T.ui, color: C.ink },
  hint: { fontFamily: F.serifItalic, fontSize: T.uiSm, color: oInk(0.7), marginTop: 4 },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnMinus: { borderWidth: 1.5, borderColor: oInk(0.28) },
  stepBtnPlus: { backgroundColor: C.forest },
  minusBar: { width: 16, height: 1.8, borderRadius: 2, backgroundColor: C.ink },
  countValue: {
    flex: 1,
    textAlign: 'center',
    fontFamily: F.serif,
    fontSize: T.h1,
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
