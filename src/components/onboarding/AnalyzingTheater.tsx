import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { PostHogMaskView } from 'posthog-react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * AnalyzingTheater — the VARIANT-B-ONLY "building your plan" beat.
 *
 * Distinct from the shared PlanTheater (which the real pre-paywall LoadingScreen
 * uses and must NOT change): this is a richer, warm-canvas, PERSONALIZED version
 * for the fake mid-onboarding calculate moment. It reflects the user's own
 * answers back as it "works" (focus areas, kid age, goal) so it feels like the
 * app is thinking about THEM — the Cal-AI/Noom move that makes the snapshot feel
 * earned and primes the paywall.
 *
 * Presentation only: it takes a driven `progress` (0-100) and a list of
 * personalized `stages`; the caller (CalculatingView) owns the climb + onDone.
 * Reduce Motion collapses all motion to static.
 */

export interface AnalyzingStage {
  /** Progress threshold (0-100) at which this stage flips to done. */
  at: number;
  /** Label — may reference the user's answers, e.g. "Matching sleep lessons". */
  label: string;
  /**
   * Mask this label from PostHog session replay (it interpolates PII like child
   * age/count). The caller sets this on the age-bearing stage. See INVARIANTS.
   */
  mask?: boolean;
}

const RING_SIZE = 200;
const STROKE = 8;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface AnalyzingTheaterProps {
  progress: number;
  reduceMotion: boolean;
  stages: AnalyzingStage[];
  title: string;
  subtitle: string;
}

export const AnalyzingTheater: React.FC<AnalyzingTheaterProps> = ({
  progress,
  reduceMotion,
  stages,
  title,
  subtitle,
}) => {
  // Ease progress into a shared value so the ring + number glide instead of snap.
  const animated = useSharedValue(progress);
  useEffect(() => {
    animated.value = reduceMotion
      ? progress
      : withTiming(progress, { duration: 380, easing: Easing.out(Easing.cubic) });
  }, [progress, reduceMotion, animated]);

  const ringProps = useAnimatedProps(() => {
    const clamped = Math.min(Math.max(animated.value, 0), 100);
    return { strokeDashoffset: CIRCUMFERENCE * (1 - clamped / 100) };
  });

  // Big % number in the ring, driven off the same eased value. useDerivedValue +
  // a state mirror keeps the text a plain integer without per-frame React renders.
  const [displayPct, setDisplayPct] = React.useState(Math.round(progress));
  useDerivedValue(() => {
    runOnJS(setDisplayPct)(Math.round(animated.value));
  });

  // Gentle breathing pulse on the whole ring for "alive" feel. Still under RM.
  const breathe = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      breathe.value = 1;
      return;
    }
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [reduceMotion, breathe]);
  const ringPulse = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ringContainer, ringPulse]}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={Colors.primaryBg}
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={Colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            animatedProps={ringProps}
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <AnimatedText style={styles.pct}>{`${displayPct}%`}</AnimatedText>
        </View>
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.stages}>
        {stages.map((stage) => {
          const done = progress >= stage.at;
          const active = !done && progress >= (prevThreshold(stages, stage.at));
          const row = (
            <StageRow
              key={stage.label}
              label={stage.label}
              done={done}
              active={active}
              reduceMotion={reduceMotion}
            />
          );
          return stage.mask ? (
            <PostHogMaskView key={stage.label}>{row}</PostHogMaskView>
          ) : (
            row
          );
        })}
      </View>
    </View>
  );
};

/** The threshold of the stage before `at`, so the current stage can read "active". */
function prevThreshold(stages: AnalyzingStage[], at: number): number {
  const earlier = stages.filter((s) => s.at < at).map((s) => s.at);
  return earlier.length ? Math.max(...earlier) : 0;
}

/**
 * One stage row: an empty ring → filled check when `done`, with a light haptic
 * tick on the flip. While `active` (current stage, not yet done) it shows a
 * subtle pulsing dot so the eye knows what's "in progress". Reduce Motion snaps.
 */
const StageRow: React.FC<{
  label: string;
  done: boolean;
  active: boolean;
  reduceMotion: boolean;
}> = ({ label, done, active, reduceMotion }) => {
  const checkOpacity = useSharedValue(done ? 1 : 0);
  const dotPulse = useSharedValue(1);
  const wasDone = useRef(done);

  useEffect(() => {
    if (done && !wasDone.current) {
      if (!reduceMotion && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      checkOpacity.value = reduceMotion ? 1 : withTiming(1, { duration: 260 });
    } else if (!done) {
      checkOpacity.value = reduceMotion ? 0 : withTiming(0, { duration: 160 });
    }
    wasDone.current = done;
  }, [done, reduceMotion, checkOpacity]);

  useEffect(() => {
    if (reduceMotion || !active) {
      dotPulse.value = 1;
      return;
    }
    dotPulse.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 600, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [active, reduceMotion, dotPulse]);

  const checkStyle = useAnimatedStyle(() => ({ opacity: checkOpacity.value }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: active ? dotPulse.value : 1 }));

  return (
    <View style={styles.stageRow}>
      <View style={styles.stageIcon}>
        <Animated.View
          style={[
            styles.stageDot,
            (done || active) && styles.stageDotActive,
            !done && dotStyle,
          ]}
        />
        <Animated.Text style={[styles.stageCheck, checkStyle]}>✓</Animated.Text>
      </View>
      <Text style={[styles.stageLabel, (done || active) && styles.stageLabelActive]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
  },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: {
    fontSize: Typography.sizes['5xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.md,
  },
  // The stage list sits in a soft lifted card so it reads as a distinct panel
  // on the cream canvas (matches the warm option/snapshot cards).
  stages: {
    alignSelf: 'stretch',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius['2xl'],
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    ...Shadows.sm,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stageIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  stageDotActive: {
    borderColor: Colors.primary,
  },
  stageCheck: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  stageLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    fontWeight: Typography.weights.medium,
  },
  stageLabelActive: {
    color: Colors.textPrimary,
  },
});
