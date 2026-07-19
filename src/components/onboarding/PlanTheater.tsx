import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * PlanTheater — the pre-paywall "creating your lesson plan" visual.
 *
 * PRESENTATION ONLY. It takes the LoadingScreen's existing `progress` (0-100)
 * and `reduceMotion`, and renders a premium loading moment: a breathing logo
 * inside an SVG progress ring, plus a staggered checklist of build-up stages
 * that tick off as progress climbs. It owns NO gate/paywall logic — the ring
 * fill and which stages are "done" are pure functions of the `progress` prop
 * that LoadingScreen already drives. Reduce Motion collapses all motion to
 * static states.
 */

// Build-up stages, gated by progress thresholds. Copy mirrors the tone of the
// old getMessage() beats but framed as discrete "work being done" steps — the
// checklist reads as real personalization happening, which primes the paywall.
const STAGES = [
  { at: 25, label: 'Analyzing your answers' },
  { at: 55, label: 'Matching lessons to your family' },
  { at: 85, label: 'Personalizing your plan' },
  { at: 100, label: 'Finalizing' },
] as const;

const RING_SIZE = 168;
const STROKE = 6;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface PlanTheaterProps {
  /** LoadingScreen's existing progress state (0-100). */
  progress: number;
  reduceMotion: boolean;
  /** Logo asset (LoadingScreen passes its icon). */
  logoSource: number;
}

export const PlanTheater: React.FC<PlanTheaterProps> = ({ progress, reduceMotion, logoSource }) => {
  // Smoothly track progress into a shared value so the ring eases toward each
  // new target instead of snapping when LoadingScreen bumps progress.
  const animatedProgress = useSharedValue(progress);
  useEffect(() => {
    animatedProgress.value = reduceMotion
      ? progress
      : withTiming(progress, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [progress, reduceMotion, animatedProgress]);

  // Ring stroke offset derived from the eased progress (full circle at 100).
  const ringProps = useAnimatedProps(() => {
    const clamped = Math.min(Math.max(animatedProgress.value, 0), 100);
    return { strokeDashoffset: CIRCUMFERENCE * (1 - clamped / 100) };
  });

  // Breathing logo: a gentle scale loop. Collapses to still under Reduce Motion.
  const breathe = useSharedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      breathe.value = 1;
      return;
    }
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [reduceMotion, breathe]);
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <View style={styles.wrap}>
      {/* Ring + breathing logo */}
      <View style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          {/* Track */}
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={Colors.primaryBg}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Progress arc — starts at 12 o'clock, fills clockwise */}
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
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>

      <Text style={styles.title}>Creating your lesson plan</Text>
      <Text style={styles.subtitle}>Building a program tailored to your family</Text>

      {/* Staggered build-up checklist */}
      <View style={styles.stages}>
        {STAGES.map((stage) => (
          <StageRow key={stage.label} label={stage.label} done={progress >= stage.at} reduceMotion={reduceMotion} />
        ))}
      </View>
    </View>
  );
};

/**
 * One build-up row. Fades/lifts in the checkmark the first time `done` flips
 * true, with a light haptic tick — so each completed stage feels like real
 * progress. Reduce Motion snaps with no haptic.
 */
const StageRow: React.FC<{ label: string; done: boolean; reduceMotion: boolean }> = ({
  label,
  done,
  reduceMotion,
}) => {
  const checkOpacity = useSharedValue(done ? 1 : 0);
  const wasDone = useRef(done);

  useEffect(() => {
    if (done && !wasDone.current) {
      // First transition to done → tick + reveal.
      if (!reduceMotion && Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      checkOpacity.value = reduceMotion ? 1 : withTiming(1, { duration: 260 });
    } else if (!done) {
      checkOpacity.value = reduceMotion ? 0 : withTiming(0, { duration: 160 });
    }
    wasDone.current = done;
  }, [done, reduceMotion, checkOpacity]);

  const checkStyle = useAnimatedStyle(() => ({ opacity: checkOpacity.value }));

  return (
    <View style={styles.stageRow}>
      <View style={styles.stageIcon}>
        {/* Empty dot underneath; check fades in over it when done. */}
        <View style={styles.stageDot} />
        <Animated.Text style={[styles.stageCheck, checkStyle]}>✓</Animated.Text>
      </View>
      <Text style={[styles.stageLabel, done && styles.stageLabelDone]}>{label}</Text>
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
  logoWrapper: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 96,
    height: 96,
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
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.md,
  },
  stages: {
    alignSelf: 'stretch',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stageIcon: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryBg,
  },
  stageCheck: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  stageLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  stageLabelDone: {
    color: Colors.textPrimary,
  },
});
