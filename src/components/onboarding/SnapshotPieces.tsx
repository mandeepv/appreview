import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PostHogMaskView } from 'posthog-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, BorderRadius, Shadows, Animation } from '../../constants/theme';
import { useReduceMotion } from './useReduceMotion';

/**
 * Presentational pieces for the variant-B "mirror" beats — the recap chips on
 * VBReady and the personalized snapshot card on VBSnapshot. They render values
 * the caller derives from the onboarding store; they own no logic or state.
 * See docs/specs/variant-b-onboarding-copy.md (screens 12 & 14).
 */

/**
 * A horizontal wrap of small pill chips echoing the user's answers back.
 *
 * `chips` may be plain strings, or `{ text, mask }` objects — a masked chip has
 * its text hidden from PostHog session replay (the family chip carries child
 * count/ages = PII, docs/INVARIANTS.md). Plain strings are never masked.
 */
export type RecapChip = string | { text: string; mask?: boolean };

export const RecapChips: React.FC<{ chips: RecapChip[] }> = ({ chips }) => (
  <View style={styles.chipRow}>
    {chips.map((c) => {
      const text = typeof c === 'string' ? c : c.text;
      const mask = typeof c === 'string' ? false : !!c.mask;
      const chip = (
        <View style={styles.chip}>
          <Text style={styles.chipText}>{text}</Text>
        </View>
      );
      return (
        <React.Fragment key={text}>
          {mask ? <PostHogMaskView>{chip}</PostHogMaskView> : chip}
        </React.Fragment>
      );
    })}
  </View>
);

export interface SnapshotRow {
  label: string;
  value: string;
  /** Leading Ionicons glyph shown in a tinted circle (e.g. "people-outline"). */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /**
   * Render this card in the brand accent (filled) instead of plain surface. Used
   * for the hero "matched for you" row so the reveal has a clear focal point.
   */
  accent?: boolean;
  /**
   * When true, the row's VALUE is hidden from PostHog session replay (wrapped in
   * PostHogMaskView → accessibilityLabel "ph-no-capture"). Used for the family
   * row, whose value contains child count/ages (PII we don't send to PostHog,
   * docs/INVARIANTS.md). The label stays visible; only the personal value is
   * masked, so the aha-moment card still reads in replay.
   */
  mask?: boolean;
}

/**
 * The "here's your personalized plan" reveal — the earned aha-moment payoff.
 *
 * Rendered as a stack of individual stat cards (each with a tinted icon, a small
 * label, and a bold value), mirroring the high-converting "personalized
 * snapshot" screens in the reference apps rather than a flat bordered list. One
 * row may be `accent` to act as the focal point.
 *
 * The rows CASCADE in (staggered spring, ~90ms apart) with a soft haptic tick as
 * each lands — so the plan reads as being assembled for the user in real time,
 * not just printed. Reduce Motion collapses to an instant, silent render.
 */
export const SnapshotCard: React.FC<{ rows: SnapshotRow[] }> = ({ rows }) => (
  <View style={styles.cardStack}>
    {rows.map((row, index) => {
      const valueNode = (
        <Text style={[styles.rowValue, row.accent && styles.rowValueAccent]} numberOfLines={2}>
          {row.value}
        </Text>
      );
      return (
        <SnapshotRowReveal key={row.label} index={index} accent={row.accent}>
          {row.icon ? (
            <View style={[styles.iconCircle, row.accent && styles.iconCircleAccent]}>
              <Ionicons
                name={row.icon}
                size={22}
                color={row.accent ? Colors.surface : Colors.primary}
              />
            </View>
          ) : null}
          <View style={styles.statText}>
            <Text style={[styles.rowLabel, row.accent && styles.rowLabelAccent]}>{row.label}</Text>
            {row.mask ? <PostHogMaskView>{valueNode}</PostHogMaskView> : valueNode}
          </View>
        </SnapshotRowReveal>
      );
    })}
  </View>
);

/**
 * One snapshot row's staggered spring-in. Fades + rises + settles via spring,
 * delayed by its index so the stack cascades. Fires a light haptic as it lands
 * (a selection tick for plain rows, a heavier success thud for the accent hero
 * row) so the reveal is felt, not just seen. Reduce Motion → instant + silent.
 */
const SnapshotRowReveal: React.FC<{
  index: number;
  accent?: boolean;
  children: React.ReactNode;
}> = ({ index, accent, children }) => {
  const reduceMotion = useReduceMotion();
  // Lazy useState initialiser (not useRef.current) so the render body never
  // reads a ref during render — matches StoryScreen's pattern and keeps the
  // react-hooks/refs lint clean.
  const [anim] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));

  useEffect(() => {
    if (reduceMotion) {
      anim.setValue(1);
      return;
    }
    const delay = 120 + index * 90; // let the screen settle, then cascade
    const timer = setTimeout(() => {
      Haptics.impactAsync(
        accent ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {}); // haptics are best-effort; never block the reveal
      Animated.spring(anim, {
        toValue: 1,
        damping: Animation.spring.damping,
        stiffness: Animation.spring.stiffness,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [reduceMotion, index, accent, anim]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        accent && styles.statCardAccent,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  chip: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  chipText: {
    fontSize: Typography.sizes.md,
    color: Colors.primaryDark,
    fontWeight: Typography.weights.medium,
  },
  cardStack: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  statCardAccent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBg,
  },
  iconCircleAccent: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
    marginBottom: Spacing.xs,
  },
  rowLabelAccent: {
    color: 'rgba(255,255,255,0.85)',
  },
  rowValue: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  rowValueAccent: {
    color: Colors.surface,
  },
});
