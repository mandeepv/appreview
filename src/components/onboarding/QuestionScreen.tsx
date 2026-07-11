import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ProgressBar } from '../ProgressBar';
import { Button } from '../Button';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useOnboardingStore } from '../../store/onboardingStore';
import { stepFor } from './flows';
import { useReduceMotion } from './useReduceMotion';

/**
 * SPEC-17 — the ONE onboarding question-screen layout shell.
 *
 * Replaces the per-screen mix of OnboardingContainer configs (centerTitle
 * on/off, hand-rolled headers, hardcoded hex, `totalSteps = 20`). It owns the
 * fixed vertical grammar and keeps the two seams the old container had:
 *
 *  - `screenName` auto-save: on blur/unmount we persist onboarding state and
 *    record the last screen (resume-mid-onboarding is shipped behavior — same
 *    behavior as OnboardingContainer's useFocusEffect, preserved verbatim).
 *  - back-button: a `onBack` handler renders the header back affordance.
 *
 * Grammar (top → bottom):
 *   header (back + progress) → title → optional subtitle → option area
 *   (scrolls internally) → footer slot (Continue, multi-select only).
 *
 * Progress derives from the declared flow arrays (flows.ts): `currentStep` /
 * `totalSteps` come from the screen's position — no per-screen numbers, no
 * bar-never-fills bug. A screen not in any flow renders no bar.
 *
 * Title is LEFT-aligned everywhere (DECISION 3) — one rule, the `centerTitle`
 * flag is gone. All spacing/colors/type are theme tokens; zero hardcoded hex.
 */

interface QuestionScreenProps {
  /** Screen name — drives BOTH progress derivation and persistence. Required. */
  screenName: string;
  title?: string;
  subtitle?: string;
  /**
   * SPEC-FIX-11 R5.5 — optional small muted caption under the subtitle. Used for
   * the first question screen's privacy/trust line ("All responses are stored
   * securely…"), which the SPEC-17 migration dropped. Presentation-only.
   */
  caption?: string;
  onBack?: () => void;
  /**
   * Footer content — the revealed Continue button (+ optional count pill) for
   * multi-select screens, or an explicit Continue for free-input/info screens.
   * Single-select screens pass nothing (they auto-advance).
   */
  footer?: React.ReactNode;
  children: React.ReactNode;
  /**
   * Override the derived progress (rare). Off-path screens that still want a bar
   * can pass explicit values; normally leave unset and let flows.ts decide.
   */
  progressOverride?: { currentStep: number; totalSteps: number };
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  screenName,
  title,
  subtitle,
  caption,
  onBack,
  footer,
  children,
  progressOverride,
}) => {
  const { saveState, setLastScreen } = useOnboardingStore();

  // Preserve OnboardingContainer's auto-save seam exactly: save + record last
  // screen when this screen loses focus or unmounts.
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (screenName) {
          saveState();
          setLastScreen(screenName);
        }
      };
    }, [screenName])
  );

  const progress = progressOverride ?? stepFor(screenName);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header: back + progress on one row */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          {onBack ? (
            <BackButton onPress={onBack} />
          ) : (
            <View style={styles.backButtonSpacer} />
          )}
          {progress && (
            <View style={styles.progressBarContainer}>
              <ProgressBar current={progress.currentStep} total={progress.totalSteps} />
            </View>
          )}
          <View style={styles.rightSpacer} />
        </View>
      </View>

      {/* Option area — scrolls internally when the content is tall. */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        {children}
      </ScrollView>

      {/* Footer slot — Continue lives here (multi-select reveal / explicit). */}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
};

/**
 * Multi-select Continue reveal (fade/slide-up into the footer) — shows when
 * `visible`, hides otherwise. Never a visible-but-disabled button: when not
 * visible it renders nothing and reserves no space. Reduce Motion → snap.
 */
export const RevealFooter: React.FC<{
  visible: boolean;
  children: React.ReactNode;
}> = ({ visible, children }) => {
  const reduceMotion = useReduceMotion();
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      anim.setValue(visible ? 1 : 0);
      return;
    }
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [visible, reduceMotion]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
};

/** Continue for multi-select — revealed on validity. Convenience wrapper. */
export const ContinueButton: React.FC<{ onPress: () => void; title?: string }> = ({
  onPress,
  title = 'Continue',
}) => <Button title={title} onPress={onPress} />;

const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  // Same chevron affordance the old OnboardingContainer drew, tokenized.
  <TouchableOpacity
    onPress={onPress}
    style={styles.backButton}
    accessibilityRole="button"
    accessibilityLabel="Go back"
  >
    <View style={styles.arrowContainer}>
      <View style={styles.arrowHead} />
      <View style={styles.arrowLine} />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowContainer: {
    width: 24,
    height: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 6,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderRightColor: Colors.textPrimary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arrowLine: {
    width: 16,
    height: 2,
    backgroundColor: Colors.textPrimary,
  },
  backButtonSpacer: {
    width: 40,
    height: 40,
  },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    lineHeight: 36,
    letterSpacing: Typography.letterSpacing.tight,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
    letterSpacing: 0.2,
    textAlign: 'left',
  },
  // SPEC-FIX-11 R5.5 — small muted trust/privacy caption under the subtitle.
  caption: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: -Spacing.lg,
    marginBottom: Spacing['2xl'],
    lineHeight: 18,
    textAlign: 'left',
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
