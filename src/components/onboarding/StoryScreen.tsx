import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PostHogMaskView } from 'posthog-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Animation as AnimationConfig, BorderRadius, Shadows } from '../../constants/theme';
import { useOnboardingStore } from '../../store/onboardingStore';
import { stepFor } from './flows';
import { Button } from '../Button';
import { useReduceMotion } from './useReduceMotion';
import { HighlightText, TextPart } from './HighlightText';

/**
 * Two-beat entrance: the visual + headline settle first, THEN the body and any
 * children (the highlighted number, the snapshot card) reveal ~180ms later. That
 * sequence is the point — it makes the payoff (the "you'll spend 2,372 hours"
 * fragment, the personalized plan) land as its own moment instead of the whole
 * screen fading in flat. This is motivated motion (narrative reveal), not a
 * blanket cross-fade.
 *
 * Animated.Values are created once via lazy useState initialisers (stable across
 * renders, no ref-in-render). Under Reduce Motion both beats snap to visible.
 * Returns a style per beat to spread onto the head and body groups.
 */
function useEntranceAnimation(reduceMotion: boolean) {
  const [headFade] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [headRise] = useState(() => new Animated.Value(reduceMotion ? 0 : 16));
  const [bodyFade] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [bodyRise] = useState(() => new Animated.Value(reduceMotion ? 0 : 16));

  useEffect(() => {
    if (reduceMotion) {
      headFade.setValue(1);
      headRise.setValue(0);
      bodyFade.setValue(1);
      bodyRise.setValue(0);
      return;
    }
    const beat = (fade: Animated.Value, rise: Animated.Value, delay: number) =>
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: AnimationConfig.duration.slow,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(rise, {
          toValue: 0,
          duration: AnimationConfig.duration.slow,
          delay,
          useNativeDriver: true,
        }),
      ]);
    // Head first, body 180ms behind it — enough to read as a sequence.
    Animated.parallel([
      beat(headFade, headRise, 0),
      beat(bodyFade, bodyRise, 180),
    ]).start();
  }, [reduceMotion, headFade, headRise, bodyFade, bodyRise]);

  return {
    head: { opacity: headFade, transform: [{ translateY: headRise }] },
    body: { opacity: bodyFade, transform: [{ translateY: bodyRise }] },
  };
}

/**
 * StoryScreen — the emotional "story beat" surface for variant B.
 *
 * This is the look every high-converting onboarding uses for its narrative
 * screens: a big LEFT-aligned headline, a restrained visual up top (an on-brand
 * illustration, or a single line-icon in a tinted brand chip — NOT a giant
 * emoji, which reads cheap), and body copy where the numbers that matter are
 * highlighted in the brand colour (the "you'll spend 2,372 hours" move). Content
 * is top-aligned (not centred like StatementScreen) so long copy reads like a
 * page of a story rather than a floating card.
 *
 * It shares StatementScreen's persistence seam (save + record lastScreen on
 * blur) and the thin top progress bar, so it slots into the same flow/resume
 * machinery. Use StoryScreen for pure narrative beats; use QuestionScreen for
 * anything with options.
 */
interface StoryScreenProps {
  screenName: string;
  /** Big headline. Left-aligned, bold. */
  title: string;
  /**
   * Body as highlightable fragments (see HighlightText). Plain strings render
   * muted; `{ text, hl: true }` fragments render in the accent colour. Optional.
   */
  body?: TextPart[];
  /**
   * Hero illustration shown above the title (preferred over emoji). Rendered
   * large and centered, contain-fit. Use the on-brand onboarding illustrations
   * in assets/onboarding. Wins over `emoji` when both are set.
   */
  image?: ImageSourcePropType;
  /**
   * Fallback visual when no `image` fits: a single Ionicons glyph rendered in a
   * tinted brand chip (same grammar as SnapshotCard's icon circles). Restrained
   * and on-brand — the deliberate replacement for the old giant-emoji look.
   * Ignored when `image` is set.
   */
  iconName?: React.ComponentProps<typeof Ionicons>['name'];
  /** Extra content under the body (charts, cards). */
  children?: React.ReactNode;
  ctaTitle: string;
  onContinue: () => void;
  secondaryTitle?: string;
  onSecondary?: () => void;
  onBack?: () => void;
  showProgress?: boolean;
  /** Mask the title from session replay (name-bearing titles). */
  maskTitle?: boolean;
  /**
   * Full-accent takeover (used for the "you're all in" affirmation): flips to a
   * primary-colour background with inverted text, mirroring the reference apps'
   * high-emotion pledge-locked screen.
   */
  accentFill?: boolean;
}

export const StoryScreen: React.FC<StoryScreenProps> = ({
  screenName,
  title,
  body,
  image,
  iconName,
  children,
  ctaTitle,
  onContinue,
  secondaryTitle,
  onSecondary,
  onBack,
  showProgress = true,
  maskTitle = false,
  accentFill = false,
}) => {
  const { saveState, setLastScreen } = useOnboardingStore();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const entranceStyle = useEntranceAnimation(reduceMotion);

  // Persist + record lastScreen on blur (same seam as StatementScreen/
  // QuestionScreen). Wrapped in a memoised callback with all its deps so the
  // linter is satisfied without an intentional-deps exception.
  const onBlurPersist = useCallback(() => {
    return () => {
      if (screenName) {
        saveState();
        setLastScreen(screenName);
      }
    };
  }, [screenName, saveState, setLastScreen]);
  useFocusEffect(onBlurPersist);

  const progress = showProgress ? stepFor(screenName) : null;

  const titleColor = accentFill ? Colors.surface : Colors.textPrimary;
  const bodyColor = accentFill ? Colors.surface : Colors.textSecondary;
  const highlightColor = accentFill ? Colors.surface : Colors.primary;

  const titleNode = (
    <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
  );

  return (
    <SafeAreaView
      style={[styles.container, accentFill && { backgroundColor: Colors.primary }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <View style={styles.topRow}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backSpacer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={accentFill ? Colors.surface : Colors.textPrimary}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.backSpacer} />
          )}
          {progress ? (
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressTrack,
                  accentFill && { backgroundColor: 'rgba(255,255,255,0.3)' },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    accentFill && { backgroundColor: Colors.surface },
                    {
                      width: `${
                        Math.min(Math.max(progress.currentStep / progress.totalSteps, 0), 1) * 100
                      }%`,
                    },
                  ]}
                />
              </View>
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
        <Animated.View style={entranceStyle.head}>
          {image ? (
            // Intentional rounded card behind the illustration so the image reads
            // as a designed hero tile, not a stray white box on the cream canvas.
            <View style={styles.heroCard}>
              <Image source={image} style={styles.heroImage} resizeMode="contain" />
            </View>
          ) : iconName ? (
            <View style={[styles.iconChip, accentFill && styles.iconChipAccent]}>
              <Ionicons
                name={iconName}
                size={30}
                color={accentFill ? Colors.surface : Colors.primary}
              />
            </View>
          ) : null}
          {maskTitle ? <PostHogMaskView>{titleNode}</PostHogMaskView> : titleNode}
        </Animated.View>
        <Animated.View style={entranceStyle.body}>
          {body && body.length > 0 ? (
            <HighlightText
              parts={body}
              style={[styles.body, { color: bodyColor }]}
              highlightColor={highlightColor}
            />
          ) : null}
          {children}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Button title={ctaTitle} onPress={onContinue} />
        {secondaryTitle && onSecondary ? (
          <Text
            style={[styles.secondary, accentFill && { color: Colors.surface }]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  backSpacer: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { flex: 1, paddingHorizontal: Spacing.md },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryBg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.primary },
  content: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing['2xl'],
    flexGrow: 1,
  },
  // Designed hero tile: a soft rounded surface the illustration sits inside, so
  // the image reads as an intentional card rather than a bare box on the canvas.
  heroCard: {
    alignSelf: 'center',
    width: '82%',
    aspectRatio: 1,
    borderRadius: BorderRadius['2xl'],
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    marginBottom: Spacing['2xl'],
    ...Shadows.sm,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  // Tinted brand chip holding a single line-icon — the restrained stand-in for
  // the old 56px floating emoji. Matches SnapshotCard's icon-circle grammar so
  // the whole flow shares one visual system.
  iconChip: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  iconChipAccent: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  title: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    lineHeight: Typography.sizes['5xl'] * Typography.lineHeights.tight,
    letterSpacing: Typography.letterSpacing.tight,
  },
  body: {
    fontSize: Typography.sizes.xl,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xl * Typography.lineHeights.relaxed,
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
