/**
 * The onboarding shell — the frame every question screen sits in.
 *
 * Built from the Claude Design canvas "Kinderwell Onboarding Set.dc.html".
 * Six of the eight question screens are this shell plus a list of OptionRows,
 * which is why the shell is a component rather than a pattern each screen
 * copies: getting the header rhythm right once is what makes the flow read as
 * one thing.
 *
 * Anatomy, top to bottom (all values from the canvas — see the tokens block in
 * `src/constants/theme.ts` before adjusting any of them):
 *   - "STEP n OF 8" in mono, followed by a hairline that runs to the edge
 *   - a serif headline where one phrase is italic (pass it in *stars*)
 *   - an optional serif subtitle
 *   - the caller's content
 *   - a footer that sticks to the bottom: optional note, then the Continue pill
 *
 * NOTE: this deliberately does not use OnboardingContainer. That component
 * carries the old teal system and is still used by screens outside this
 * redesign; the two coexist until the rest of the app is migrated.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  OnboardingLayout as L,
  oInk,
} from '../../constants/theme';

/**
 * Serif text where *starred* spans render italic — the design's emphasis move
 * ("Tell us about your *kids*."). Splitting on the star keeps the copy in one
 * readable string at the call site instead of three nested <Text> nodes.
 */
export function RichHeadline({
  children,
  style,
}: {
  children: string;
  style?: TextStyle | TextStyle[];
}) {
  const parts = children.split('*');
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={{ fontFamily: F.serifItalic }}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
}

export function BackChevron({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={16} accessibilityRole="button" accessibilityLabel="Back">
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 18l-6-6 6-6"
          stroke={C.ink}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

/** "STEP 3 OF 8" plus the hairline that runs to the screen edge. */
export function StepLabel({ step, total = L.totalSteps }: { step: number; total?: number }) {
  return (
    <View style={styles.stepRow}>
      <Text style={styles.stepText}>{`STEP ${step} OF ${total}`}</Text>
      <View style={styles.stepRule} />
    </View>
  );
}

/**
 * The primary action. Disabled is the wash, never a faded green — per the
 * canvas note, a dimmed brand colour reads as broken rather than as "not yet".
 */
export function ContinuePill({
  label = 'Continue',
  onPress,
  disabled = false,
  style,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: disabled ? C.wash : C.forest },
        pressed && !disabled ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      <Text style={[styles.pillLabel, { color: disabled ? oInk(0.5) : C.cream }]}>{label}</Text>
    </Pressable>
  );
}

type Props = {
  /** Omit to hide the step label entirely — screen 15 has no label because the
   *  count should only move when the parent is actually asked something. */
  step?: number;
  totalSteps?: number;
  /** Wrap the emphasised phrase in *stars*. */
  headline: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  /** Sits directly above the pill — a count ("2 selected") or a serif aside. */
  footerNote?: React.ReactNode;
  /** Rendered under the pill, e.g. "I'd rather not say". */
  footerAction?: React.ReactNode;
  continueLabel?: string;
  onContinue?: () => void;
  continueDisabled?: boolean;
  /** Long option lists need to scroll; short ones shouldn't bounce. */
  scrollable?: boolean;
  /**
   * Makes the headline tappable. This exists for exactly one caller: AuthScreen
   * hangs the 7-tap Apple-reviewer demo bypass off its title (see
   * docs/DEMO_MODE.md). Deliberately invisible — no ripple, no affordance —
   * because a discoverable bypass is a rejection risk.
   */
  onHeadlinePress?: () => void;
};

export function OnboardingScreen({
  step,
  totalSteps,
  headline,
  subtitle,
  onBack,
  children,
  footerNote,
  footerAction,
  continueLabel,
  onContinue,
  continueDisabled = false,
  scrollable = false,
  onHeadlinePress,
}: Props) {
  const insets = useSafeAreaInsets();
  const Body = scrollable ? ScrollView : View;
  const bodyProps = scrollable
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollInner }
    : {};

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {onBack ? (
          <View style={styles.backRow}>
            <BackChevron onPress={onBack} />
          </View>
        ) : null}

        {step !== undefined ? <StepLabel step={step} total={totalSteps} /> : null}

        {onHeadlinePress ? (
          <Pressable onPress={onHeadlinePress} accessible={false}>
            <RichHeadline style={styles.headline}>{headline}</RichHeadline>
          </Pressable>
        ) : (
          <RichHeadline style={styles.headline}>{headline}</RichHeadline>
        )}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <Body style={styles.body} {...bodyProps}>
          {children}
        </Body>

        {/* Pushes the footer down when the content is short, and lets the list
            scroll under a footer that stays put when it is long. */}
        {!scrollable ? <View style={styles.spacer} /> : null}

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          {footerNote ? <View style={styles.footerNote}>{footerNote}</View> : null}
          {onContinue ? (
            <ContinuePill
              label={continueLabel}
              onPress={onContinue}
              disabled={continueDisabled}
            />
          ) : null}
          {footerAction ? <View style={styles.footerAction}>{footerAction}</View> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  content: { flex: 1, paddingHorizontal: L.screenPad },
  backRow: { paddingTop: 6, paddingBottom: 8, alignSelf: 'flex-start' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  stepText: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.05,
    color: oInk(0.7),
  },
  stepRule: { flex: 1, height: 1, backgroundColor: oInk(0.16) },
  headline: {
    fontFamily: F.serif,
    fontSize: T.h1,
    lineHeight: T.h1 * 1.2,
    letterSpacing: -0.45,
    color: C.ink,
    marginTop: 22,
  },
  subtitle: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.62,
    color: oInk(0.78),
    marginTop: 12,
  },
  body: { marginTop: 28 },
  scrollInner: { paddingBottom: 8 },
  spacer: { flex: 1, minHeight: 14 },
  footer: { paddingTop: 4 },
  footerNote: { paddingBottom: 13 },
  footerAction: { marginTop: 18 },
  pill: {
    width: '100%',
    height: L.buttonHeight,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: { fontFamily: F.sansSemi, fontSize: T.ui },
});
