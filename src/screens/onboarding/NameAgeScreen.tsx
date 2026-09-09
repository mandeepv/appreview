/**
 * Screens 13a / 13b in the design canvas — "STEP 2 OF 8".
 *
 * The canvas draws the name field three times (EMPTY / TYPING / VALID) as a
 * state legend, not as three fields: one underlined input that moves from a
 * hairline rule and italic placeholder, to a forest rule while typing, to a
 * forest rule with a tick once it holds a name. 13b is the same screen with
 * the keyboard up — the stepper stays reachable, which is why the age control
 * is a compact row rather than a full-width block.
 *
 * The field is a serif input on a rule rather than a boxed FormInput. That is
 * deliberate in the canvas: a bordered box reads as a form to fill in, a rule
 * reads as a letter to complete.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { useOnboardingStore } from '../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

const MIN_AGE = 18;
const MAX_AGE = 100;

function Tick() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={C.forest}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function StepperButton({
  kind,
  onPress,
  disabled,
}: {
  kind: 'minus' | 'plus';
  onPress: () => void;
  disabled?: boolean;
}) {
  const isPlus = kind === 'plus';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={isPlus ? 'Increase age' : 'Decrease age'}
      style={({ pressed }) => [
        styles.stepBtn,
        isPlus ? styles.stepBtnPlus : styles.stepBtnMinus,
        disabled ? { opacity: 0.4 } : null,
        pressed && !disabled ? { opacity: 0.7 } : null,
      ]}
    >
      {isPlus ? (
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke={C.cream} strokeWidth={2.8} strokeLinecap="round" />
        </Svg>
      ) : (
        <View style={styles.minusBar} />
      )}
    </Pressable>
  );
}

export const NameAgeScreen: React.FC<Props> = ({ navigation }) => {
  const { name: storedName, age: storedAge, updateNameAndAge } = useOnboardingStore();
  const [name, setName] = useState(storedName);
  const [age, setAge] = useState<number>(storedAge || 30);
  const [focused, setFocused] = useState(false);

  const trimmed = name.trim();
  const hasName = trimmed.length > 0;
  // The rule lights forest as soon as the field is live — typing or filled —
  // and stays hairline only while genuinely empty and untouched.
  const ruleActive = hasName || focused;

  const handleContinue = () => {
    // Unchanged from v1.2.0: an empty name still stores 'Parent' rather than
    // blocking, and the analytics payload reports presence, never the name.
    const finalName = trimmed || 'Parent';
    updateNameAndAge(finalName, age);
    trackOnboardingStepCompleted('NameAge', { age, has_name: hasName });
    navigation.navigate('ChildrenCount');
  };

  return (
    <OnboardingScreen
      step={2}
      headline="Let's *personalize* this for you."
      subtitle="So examples feel relevant to your life."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={age <= 0}
      scrollable
    >
      <View>
        <Text style={styles.fieldLabel}>Your first name</Text>
        <View style={[styles.fieldRule, ruleActive ? styles.fieldRuleActive : null]}>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="What should we call you?"
            placeholderTextColor={oInk(0.72)}
            style={[styles.input, !hasName ? styles.inputPlaceholderFace : null]}
            maxLength={50}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Your first name"
          />
          {hasName ? <Tick /> : null}
        </View>
      </View>

      <View style={styles.ageRow}>
        <View>
          <Text style={styles.fieldLabel}>Your age</Text>
          <View style={styles.ageValueRow}>
            <Text style={styles.ageValue}>{age}</Text>
            <Text style={styles.ageRange}>{`${MIN_AGE} – ${MAX_AGE}`}</Text>
          </View>
        </View>

        <View style={styles.stepper}>
          <StepperButton
            kind="minus"
            disabled={age <= MIN_AGE}
            onPress={() => setAge((prev) => Math.max(MIN_AGE, prev - 1))}
          />
          <StepperButton
            kind="plus"
            disabled={age >= MAX_AGE}
            onPress={() => setAge((prev) => Math.min(MAX_AGE, prev + 1))}
          />
        </View>
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: F.sansMed, fontSize: T.meta, color: oInk(0.7) },
  fieldRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    paddingBottom: 9,
    borderBottomWidth: 1.5,
    borderBottomColor: oInk(0.24),
  },
  fieldRuleActive: { borderBottomColor: C.forest },
  input: { flex: 1, fontFamily: F.serif, fontSize: T.h3, color: C.ink, padding: 0 },
  inputPlaceholderFace: { fontFamily: F.serifItalic },

  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 22,
    borderTopWidth: 1,
    borderTopColor: oInk(0.09),
  },
  ageValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2 },
  ageValue: { fontFamily: F.serif, fontSize: T.h1, color: C.ink },
  ageRange: { fontFamily: F.serif, fontSize: T.uiSm, color: oInk(0.66) },

  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
});
