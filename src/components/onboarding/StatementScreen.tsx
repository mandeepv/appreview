import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Typography, Animation as AnimationConfig } from '../../constants/theme';
import { useOnboardingStore } from '../../store/onboardingStore';
import { stepFor } from './flows';
import { Button } from '../Button';
import { useReduceMotion } from './useReduceMotion';

/**
 * StatementScreen — the narrative "beat" screen for variant B onboarding.
 *
 * The variant-B flow (see docs/specs/variant-b-onboarding-copy.md) intersperses
 * QUESTION screens (which use QuestionScreen + OptionList) with STATEMENT beats:
 * the cold-open hook, the "you're not alone" mirror, the commitment affirmation,
 * how-it-works, etc. Those beats have no options — just a title, body, one
 * primary CTA (and an optional secondary link). This is their shell.
 *
 * It mirrors QuestionScreen's grammar EXACTLY so the two feel like one system:
 * - same SafeAreaView + header (back + derived progress bar),
 * - same token-only spacing/colour/type,
 * - same `screenName` auto-save-on-blur seam (resume-mid-onboarding keeps working),
 * - same footer padding math (safe-area inset + cushion for the home indicator).
 *
 * It renders NO gate/paywall logic. Reduce Motion collapses the fade-in.
 */

interface StatementScreenProps {
  /** Screen name — drives progress derivation AND the resume persistence seam. */
  screenName: string;
  /** Big headline (the emotional beat). */
  title: string;
  /** Supporting paragraph. Rendered under the title. */
  body?: string;
  /** Optional extra content between body and footer (recap chips, snapshot card…). */
  children?: React.ReactNode;
  onBack?: () => void;
  /** Primary CTA label + action. */
  ctaTitle: string;
  onContinue: () => void;
  /** Optional secondary text button under the primary CTA ("Maybe later"). */
  secondaryTitle?: string;
  onSecondary?: () => void;
  /**
   * Off-path beats (VBWelcome/VBIntro/VBName sit before the counted question
   * screens) can hide the progress bar. Question-adjacent beats derive it.
   */
  showProgress?: boolean;
}

export const StatementScreen: React.FC<StatementScreenProps> = ({
  screenName,
  title,
  body,
  children,
  onBack,
  ctaTitle,
  onContinue,
  secondaryTitle,
  onSecondary,
  showProgress = true,
}) => {
  const { saveState, setLastScreen } = useOnboardingStore();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const fadeAnim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  // Same auto-save seam as QuestionScreen: persist + record last screen on blur.
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

  useEffect(() => {
    if (reduceMotion) {
      fadeAnim.setValue(1);
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: AnimationConfig.duration.slow,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, fadeAnim]);

  const progress = showProgress ? stepFor(screenName) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          {onBack ? (
            <BackChevron onPress={onBack} />
          ) : (
            <View style={styles.backSpacer} />
          )}
          {progress ? (
            <View style={styles.progressContainer}>
              <ProgressBarLite current={progress.currentStep} total={progress.totalSteps} />
            </View>
          ) : (
            <View style={styles.progressContainer} />
          )}
          <View style={styles.backSpacer} />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          {children}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button title={ctaTitle} onPress={onContinue} />
        {secondaryTitle && onSecondary ? (
          <Text
            style={styles.secondary}
            onPress={onSecondary}
            accessibilityRole="button"
          >
            {secondaryTitle}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

// Minimal chevron matching QuestionScreen's BackButton affordance (kept local so
// StatementScreen doesn't need to export internals from QuestionScreen).
const BackChevron: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <Text
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="Go back"
    style={styles.backChevron}
  >
    ‹
  </Text>
);

// Lightweight progress bar (same visual as the system ProgressBar: a filled
// track). Kept inline to avoid coupling to QuestionScreen's non-exported one.
const ProgressBarLite: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const pct = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
    </View>
  );
};

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
  backSpacer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    fontSize: 34,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryBg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes['4xl'] * Typography.lineHeights.tight,
  },
  body: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.md,
    gap: Spacing.md,
    alignItems: 'center',
  },
  secondary: {
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
    paddingVertical: Spacing.sm,
    textDecorationLine: 'underline',
  },
});
