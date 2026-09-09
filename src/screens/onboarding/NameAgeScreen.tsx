/**
 * Screens 13a / 13b in the design canvas — step 2 of 8.
 *
 * Layout follows v1.2.0 rather than the canvas, which drew both fields as thin
 * hairline rules with small labels. On device that read as too quiet to fill
 * in, so the sizes here follow the shipped ones: 19pt semibold labels, an 18pt
 * input, and the stepper's 40pt value between two 56pt buttons.
 *
 * The stepper is a single pill containing minus, value, plus. Spreading the
 * buttons across the screen width pushed them to opposite edges and broke the
 * read as one control; grouping them in a pill keeps the value and its two
 * controls together the way the original did.
 *
 * Both fields are grouped at the top as v1.2.0 stacked them, with generous air
 * between them — at a tight gap the two labels read as one block of text
 * rather than two separate questions. Only the Continue pill sits at the
 * bottom; that is the shell's job.
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
  oInk,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

const MIN_AGE = 18;
const MAX_AGE = 100;

function Tick() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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

function StepButton({
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
      accessibilityRole="button"
      accessibilityLabel={isPlus ? 'Increase age' : 'Decrease age'}
      style={({ pressed }) => [
        styles.stepBtn,
        isPlus ? styles.stepBtnPlus : styles.stepBtnMinus,
        disabled ? styles.stepBtnDisabled : null,
        pressed && !disabled ? { opacity: 0.7 } : null,
      ]}
    >
      {isPlus ? (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
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
  const ruleActive = hasName || focused;

  const handleContinue = () => {
    // A name is required. v1.2.0 accepted a blank field and stored 'Parent',
    // which meant later screens addressed a stranger as "Parent". The
    // analytics payload still reports presence only, never the name.
    if (!hasName) return;
    updateNameAndAge(trimmed, age);
    trackOnboardingStepCompleted('NameAge', { age, has_name: true });
    navigation.navigate('ChildrenCount');
  };

  return (
    <OnboardingScreen
      step={2}
      // Emphasis sits on who this is for, not on the machinery of
      // personalising. The canvas's subtitle ("So examples feel relevant to
      // your life") only restated the headline, so it is gone.
      headline="Let's personalize this for *you*."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!hasName || age <= 0}
    >
      <View style={styles.nameBlock}>
        <Text style={styles.fieldLabel}>Your name</Text>
        <View style={[styles.fieldRule, ruleActive ? styles.fieldRuleActive : null]}>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter your name"
            placeholderTextColor={oInk(0.45)}
            style={styles.input}
            maxLength={50}
            returnKeyType="done"
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Your name"
          />
          {hasName ? <Tick /> : null}
        </View>
      </View>

      <View style={styles.ageBlock}>
        <Text style={styles.fieldLabel}>Your age</Text>
        <View style={styles.stepperPill}>
          <StepButton
            kind="minus"
            disabled={age <= MIN_AGE}
            onPress={() => setAge((prev) => Math.max(MIN_AGE, prev - 1))}
          />
          <Text style={styles.ageValue}>{age}</Text>
          <StepButton
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
  // The shell already leaves 28px under the headline; this adds to it so the
  // first field is not crowded against the title.
  nameBlock: { marginTop: 14 },
  fieldLabel: { fontFamily: F.sansSemi, fontSize: 19, color: C.ink, letterSpacing: 0.2 },
  fieldRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: oInk(0.24),
  },
  fieldRuleActive: { borderBottomColor: C.forest },
  input: {
    flex: 1,
    fontFamily: F.sansMed,
    fontSize: 18,
    color: C.ink,
    padding: 0,
  },

  // Both fields sit together at the top with a 24px gap, as v1.2.0 had them
  // (`content` gap 2xl). No divider — it is one short form, and the rule made
  // it read as two sections. An earlier pass pushed this block to the bottom
  // of the screen, which separated the age from the name it belongs with.
  ageBlock: {
    marginTop: 44,
  },
  // One pill holding minus | value | plus, centred — keeps the controls beside
  // the number they change rather than at opposite screen edges.
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: C.wash,
    borderRadius: 999,
    padding: 8,
    marginTop: 16,
  },
  ageValue: {
    minWidth: 108,
    textAlign: 'center',
    fontFamily: F.serif,
    fontSize: 40,
    letterSpacing: -1,
    color: C.ink,
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
  stepBtnDisabled: { opacity: 0.35 },
  minusBar: { width: 20, height: 2.2, borderRadius: 2, backgroundColor: C.ink },
});
