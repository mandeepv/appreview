/**
 * The lesson frame — the chrome every lesson screen sits in.
 *
 * Replaces the teal LessonContainer. It is deliberately the onboarding shell's
 * sibling (see src/components/onboarding/OnboardingScreen.tsx): the journey is
 * onboarding → the Learn path → a lesson, and the lesson was the one place the
 * old palette survived, so a parent tapped Start on a forest card and landed in
 * a different app.
 *
 * Anatomy, top to bottom:
 *   - back chevron · continuous progress rail · close, on one row
 *   - an optional mono eyebrow (the screen's `label`, e.g. "HAPPY SITUATION")
 *   - the scrolling body
 *   - a PINNED footer: optional note, the pill, optional quiet action
 *
 * WHY THE FOOTER IS PINNED. The old container put Next inside the scroll view,
 * at the end of the content. On any screen taller than the phone the button
 * was below the fold with nothing saying so — a parent had to guess that the
 * screen scrolled — and on the quiz screens it sat under the home indicator,
 * because the container only inset the top safe area. Pinned, it is always in
 * the same place, and the body scrolls between header and footer.
 *
 * WHY THERE IS A CLOSE BUTTON. Every Next pushes a new screen (see
 * LessonScreen), so the only way out of a lesson used to be pressing back once
 * per screen — twenty times from the end of Lesson 3. Close returns to wherever
 * the lesson was opened from in one step.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BackChevron, ContinuePill } from '../../components/onboarding/OnboardingScreen';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
  oInk,
} from '../../constants/theme';

/**
 * Lets a block bring the end of the body into view — used when a quiz reveals
 * its feedback, which lands below the options and, on a five-option question,
 * below the fold. Without it the parent sees Continue light up and never reads
 * why their answer was right or wrong.
 */
const ScrollToEndContext = React.createContext<() => void>(() => {});
export const useScrollLessonToEnd = () => React.useContext(ScrollToEndContext);

function CloseGlyph({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Close lesson"
    >
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 6L6 18M6 6l12 12"
          stroke={oInk(0.55)}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    </Pressable>
  );
}

type Props = {
  /** 0..1 — how far through the current section. */
  progress: number;
  /** The screen's `label` from content, shown as a mono eyebrow. */
  label?: string;
  onBack?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  /** The pill. Omit to render no primary action (the pill is never optional
   *  on a real screen, but the done view draws its own). */
  cta?: { label: string; onPress: () => void; disabled?: boolean };
  /** Sits above the pill — e.g. why it is disabled. */
  footerNote?: string;
  /** A quiet text action under the pill ("Skip this one"). */
  secondary?: { label: string; onPress: () => void };
};

export function LessonShell({
  progress,
  label,
  onBack,
  onClose,
  children,
  cta,
  footerNote,
  secondary,
}: Props) {
  const insets = useSafeAreaInsets();
  const pct = `${Math.max(0, Math.min(1, progress)) * 100}%` as const;
  const scrollRef = React.useRef<ScrollView>(null);
  // Deferred a frame so the content that triggered it has been laid out —
  // scrolling synchronously lands at the OLD end, above the new feedback.
  const scrollToEnd = React.useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  // When the body is taller than its window, flash the scroll indicator once.
  // With the pill pinned it is always visible — which also means a parent can
  // press it without realising the text continued underneath the footer. The
  // flash is the platform's own "there is more" signal, shown once per screen.
  const viewportH = React.useRef(0);
  const contentH = React.useRef(0);
  const flashed = React.useRef(false);
  const maybeFlash = React.useCallback(() => {
    if (flashed.current || !viewportH.current || !contentH.current) return;
    if (contentH.current > viewportH.current + 8) {
      flashed.current = true;
      setTimeout(() => scrollRef.current?.flashScrollIndicators(), 350);
    }
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* App.tsx sets `dark` globally, but LearnScreen flips it to `light` for
          its forest masthead — and LearnScreen stays mounted underneath every
          pushed lesson screen, so its value won. The clock and battery were
          white on cream for the whole lesson. The lesson declares its own. */}
      <StatusBar style="dark" />
      {/* Same reason as the onboarding shell: journaling screens have a text
          field, and without this the keyboard covers the pinned pill. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topRow}>
          <View style={styles.slot}>{onBack ? <BackChevron onPress={onBack} /> : null}</View>
          <View
            style={styles.track}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
          >
            <View style={[styles.fill, { width: pct }]} />
          </View>
          <View style={styles.slot}>{onClose ? <CloseGlyph onPress={onClose} /> : null}</View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          onLayout={(e) => {
            viewportH.current = e.nativeEvent.layout.height;
            maybeFlash();
          }}
          onContentSizeChange={(_w, h) => {
            contentH.current = h;
            maybeFlash();
          }}
        >
          {label ? <Text style={styles.eyebrow}>{label.toUpperCase()}</Text> : null}
          <ScrollToEndContext.Provider value={scrollToEnd}>{children}</ScrollToEndContext.Provider>
        </ScrollView>

        {cta || secondary ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
            {cta ? (
              <ContinuePill label={cta.label} onPress={cta.onPress} disabled={cta.disabled} />
            ) : null}
            {secondary ? (
              <Pressable
                onPress={secondary.onPress}
                hitSlop={10}
                accessibilityRole="button"
                style={styles.secondary}
              >
                <Text style={styles.secondaryLabel}>{secondary.label}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  flex: { flex: 1 },
  // The 44pt slots are touch targets; the negative margins pull the glyphs
  // back to the 30pt gutter so the padding does not visibly indent them.
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    paddingHorizontal: L.screenPad - 11,
  },
  slot: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: oInk(0.14),
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3, backgroundColor: C.forest },
  // Top-aligned, never centred. The old body centred its content vertically,
  // so revealing a quiz answer (which adds height) made the whole screen jump
  // upward under the parent's thumb.
  body: { paddingHorizontal: L.screenPad, paddingTop: 22, paddingBottom: 28, gap: 22 },
  eyebrow: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.08,
    color: C.clayDeep,
    marginBottom: -8,
  },
  footer: { paddingHorizontal: L.screenPad, paddingTop: 10 },
  footerNote: {
    fontFamily: F.sans,
    fontSize: T.uiSm,
    color: oInk(0.6),
    textAlign: 'center',
    paddingBottom: 12,
  },
  secondary: { alignSelf: 'center', marginTop: 16, paddingVertical: 4 },
  secondaryLabel: { fontFamily: F.sansMed, fontSize: T.uiSm, color: oInk(0.62) },
});
