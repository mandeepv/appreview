import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostHogMaskView } from 'posthog-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from '../ProgressBar';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useOnboardingStore } from '../../store/onboardingStore';
import { stepFor } from './flows';

/**
 * VBQuestionScreen — the variant-B-ONLY warm question shell.
 *
 * WHY THIS EXISTS (and is not just QuestionScreen restyled): QuestionScreen is
 * shared with variant A (EmotionalChallenges, UserType, ExperienceLevel, …).
 * Restyling that shell would change variant A too, which must stay pixel-stable.
 * So variant B gets its own shell; variant A keeps the original untouched.
 *
 * Same seams/props as QuestionScreen so screens swap with a one-line import
 * change: `screenName` auto-save on blur, derived progress, `onBack`, `footer`
 * slot, `maskTitle`. The DIFFERENCE is purely visual — the "Headspace/Noom warm"
 * treatment that kills the old flat-white toy look:
 *   - warm CREAM canvas (Colors.background), not clinical white
 *   - a real Ionicons back chevron, not the hand-rolled CSS arrow
 *   - larger, more confident title with generous breathing room
 *   - the option area sits on the cream canvas; cards lift off it (OptionCard
 *     provides the soft shadow), so there IS depth instead of border-only rows
 */

interface VBQuestionScreenProps {
  screenName: string;
  title?: string;
  subtitle?: string;
  maskTitle?: boolean;
  onBack?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  progressOverride?: { currentStep: number; totalSteps: number };
}

export const VBQuestionScreen: React.FC<VBQuestionScreenProps> = ({
  screenName,
  title,
  subtitle,
  maskTitle = false,
  onBack,
  footer,
  children,
  progressOverride,
}) => {
  const { saveState, setLastScreen } = useOnboardingStore();
  const insets = useSafeAreaInsets();

  // Identical auto-save seam to QuestionScreen: persist + record last screen on
  // blur/unmount so resume-mid-onboarding keeps working. Memoised with all deps
  // (matches StoryScreen) so the linter is satisfied without a deps exception.
  const onBlurPersist = React.useCallback(() => {
    return () => {
      if (screenName) {
        saveState();
        setLastScreen(screenName);
      }
    };
  }, [screenName, saveState, setLastScreen]);
  useFocusEffect(onBlurPersist);

  const progress = progressOverride ?? stepFor(screenName);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          {onBack ? (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                onBack();
              }}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {title ? (
          maskTitle ? (
            <PostHogMaskView>
              <Text style={styles.title}>{title}</Text>
            </PostHogMaskView>
          ) : (
            <Text style={styles.title}>{title}</Text>
          )
        ) : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.optionArea}>{children}</View>
      </ScrollView>

      {footer ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Warm cream canvas — the single biggest change from the old flat-white
    // shell. Cards (surface white) now lift off this instead of blending in.
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
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
  backButtonSpacer: { width: 40, height: 40 },
  progressBarContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSpacer: { width: 40, height: 40 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.sizes['4xl'] * Typography.lineHeights.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textTertiary,
    marginBottom: Spacing['3xl'],
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
  },
  // Extra top breathing room before the first card, so the question owns the
  // top of the screen and the options feel like a distinct zone below it.
  optionArea: {
    marginTop: Spacing.xs,
  },
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing.md,
    gap: Spacing.sm,
    // No hairline border — on the cream canvas the footer reads as part of the
    // same warm surface; a divider line here would reintroduce the "form" look.
  },
});
