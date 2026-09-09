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
 *   - a back chevron and an eight-segment progress rail on one row
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
import { useNavigation } from '@react-navigation/native';
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

/**
 * Segmented progress: one bar per question, filled up to the current step.
 *
 * Replaces the earlier "STEP 3 OF 8" mono label. Eight segments make the
 * remaining count legible at a glance without reading a number, which is the
 * whole reason to prefer a bar here.
 *
 * The back chevron lives INSIDE this row, in a 44px hit target, rather than on
 * its own line above. That keeps the control in one fixed place on every
 * screen — including step 1, where it returns to Welcome — so it never appears
 * and disappears between screens as the user moves through the flow.
 */
export function ProgressRail({
  step,
  total = L.totalSteps,
  onBack,
}: {
  step: number;
  total?: number;
  onBack?: () => void;
}) {
  return (
    <View style={styles.railRow}>
      <View style={styles.railBackSlot}>
        {onBack ? <BackChevron onPress={onBack} /> : null}
      </View>
      <View style={styles.railTrack}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[styles.railSegment, i < step ? styles.railSegmentOn : styles.railSegmentOff]}
          />
        ))}
      </View>
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
  const navigation = useNavigation();

  // Only draw the back affordance when there is somewhere to go.
  //
  // The resume path is the reason this matters: SplashScreen restores an
  // interrupted signup, and if it ever lands a screen at the root of the stack
  // a back button there would have nothing to pop — React Navigation logs
  // "GO_BACK was not handled by any navigator" and the tap does nothing.
  // resolveResumeStack now rebuilds the full path so that shouldn't happen,
  // but this stays as the belt-and-braces: canGoBack() is runtime truth, and
  // any future entry point that lands mid-flow gets correct behaviour for free
  // rather than a dead button.
  const canGoBack = navigation.canGoBack();
  const showBack = Boolean(onBack) && canGoBack;
  const Body = scrollable ? ScrollView : View;
  const bodyProps = scrollable
    ? { showsVerticalScrollIndicator: false, contentContainerStyle: styles.scrollInner }
    : {};

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {step !== undefined ? (
          // The chevron rides inside the rail so it holds one fixed position
          // across every question screen.
          <ProgressRail
            step={step}
            total={totalSteps}
            onBack={showBack && onBack ? onBack : undefined}
          />
        ) : showBack && onBack ? (
          // Screens without a step (Auth, "Why this works") still need a way
          // back; they get the bare chevron in the same slot.
          <View style={styles.railRow}>
            <View style={styles.railBackSlot}>
              <BackChevron onPress={onBack} />
            </View>
          </View>
        ) : null}

        {onHeadlinePress ? (
          <Pressable onPress={onHeadlinePress} accessible={false}>
            <RichHeadline style={styles.headline}>{headline}</RichHeadline>
          </Pressable>
        ) : (
          <RichHeadline style={styles.headline}>{headline}</RichHeadline>
        )}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {/* `styles.body` carries flex:1 on both paths, so the body takes the
            space between header and footer: a short View leaves the footer at
            the bottom, and a long list scrolls inside its own bounds instead
            of growing over the header. */}
        <Body style={styles.body} {...bodyProps}>
          {children}
        </Body>

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
  railRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 4 },
  // 44px is the iOS minimum touch target; the negative margin pulls the chevron
  // glyph back to the 30px gutter so the padding does not visibly indent it.
  railBackSlot: {
    width: 44,
    height: 44,
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railTrack: { flex: 1, flexDirection: 'row', gap: 4 },
  railSegment: { flex: 1, height: 5, borderRadius: 3 },
  railSegmentOn: { backgroundColor: C.forest },
  railSegmentOff: { backgroundColor: oInk(0.14) },
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
  /**
   * `flex: 1` is load-bearing on the scrollable path. A ScrollView with no
   * flex in a column parent expands past its share of the height, overlapping
   * the header — which swallowed taps on the back chevron on exactly the four
   * screens that pass `scrollable`. Constraining it here makes the ScrollView
   * take the leftover space and scroll inside it, so the header stays tappable
   * and the footer stays put.
   */
  body: { flex: 1, marginTop: 28 },
  scrollInner: { paddingBottom: 8 },
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
