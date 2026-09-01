import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography, BorderRadius, Animation } from '../../constants/theme';
import { OptionCard, OptionCardVariant } from './OptionCard';
import { useReduceMotion } from './useReduceMotion';
import {
  AUTO_ADVANCE_DELAY_MS,
  isMultiSelectValid,
  claimSingleAdvance,
} from './optionListLogic';

/**
 * SPEC-17 — the ONE onboarding interaction component, two modes.
 *
 * `mode="single"` — owner-decided: single-select questions auto-advance on tap
 *   with NO Continue button. On tap we write the answer (via `onSelect`) → show
 *   the selected state + a light haptic → call `onAdvance` after a short delay
 *   (long enough to register the selection, short enough to feel instant). A
 *   guard ref makes rapid double-taps advance exactly once.
 *
 * `mode="multi"` — owner-decided: multi-select questions REVEAL a Continue
 *   button once the selection is valid (≥1) and hide it when invalid — never a
 *   permanently-disabled button. The reveal + the standardized selection-count
 *   pill live in the parent's footer via the render props this component
 *   returns; the list itself only owns the cards + toggling.
 *
 * Reduce Motion: entrance stagger and the auto-advance delay collapse (advance
 * fires on the next tick; cards appear at full opacity). The Continue reveal is
 * handled by the QuestionScreen footer, also motion-aware.
 */

export interface Option<T extends string> {
  value: T;
  label: string;
  subtitle?: string;
  /**
   * Ionicons glyph name shown in a tinted media chip. This is the graceful
   * fallback that renders NOW (and forever, for options that never get bespoke
   * art) so no card is ever blank or shows a broken image. When `imageSource`
   * is also set it wins; the icon still names the option for a11y.
   */
  icon?: React.ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name'];
  /**
   * Bespoke illustration (see docs/specs/variant-b-illustration-style.md). Wire
   * this per-option only once the real asset lands in assets/onboarding — until
   * then the `icon` fallback carries the card. Wins over `icon` when present.
   */
  imageSource?: import('react-native').ImageSourcePropType;
}

/**
 * `appearance` scopes the visual treatment WITHOUT touching variant A:
 *  - `'default'` (unset) → the original shared look. Variant A screens rely on
 *    this; they pass no appearance and get byte-identical behavior (variant
 *    falls through to OptionCard's own `illustration` default, border cards).
 *  - `'warm'` → the variant-B Headspace/Noom treatment: `compact` icon-chip
 *    default + soft lifted cards. ONLY variant B passes this.
 */
type OptionAppearance = 'default' | 'warm';

interface SingleProps<T extends string> {
  mode: 'single';
  options: readonly Option<T>[];
  /** Currently selected value (or null). */
  selected: T | null;
  /** Write the tapped value to the store. Runs BEFORE onAdvance. */
  onSelect: (value: T) => void;
  /** Navigate onward. Called once, after the auto-advance delay. */
  onAdvance: (value: T) => void;
  variant?: OptionCardVariant;
  appearance?: OptionAppearance;
  advanceDelayMs?: number;
}

interface MultiProps<T extends string> {
  mode: 'multi';
  options: readonly Option<T>[];
  selected: readonly T[];
  /** Toggle membership of a value in the selection. */
  onToggle: (value: T) => void;
  variant?: OptionCardVariant;
  appearance?: OptionAppearance;
  /** Word for the pill, e.g. "area" → "3 areas selected". */
  countNoun?: string;
}

type OptionListProps<T extends string> = SingleProps<T> | MultiProps<T>;

export function OptionList<T extends string>(props: OptionListProps<T>) {
  const reduceMotion = useReduceMotion();

  const warm = props.appearance === 'warm';
  // Variant resolution is appearance-scoped so variant A is untouched:
  //  - default appearance → pass `variant` straight through (undefined lets
  //    OptionCard apply its own `illustration` default = variant A's old look).
  //  - warm appearance → `compact` icon-chip default (variant B's dense lists).
  const resolvedVariant: OptionCardVariant | undefined = warm
    ? props.variant ?? 'compact'
    : props.variant;

  // Single-select double-advance guard. Guards a rapid double-tap into firing
  // onAdvance twice. It must reset on FOCUS, not on mount: React Navigation's
  // native stack keeps a screen mounted when you navigate forward, so pressing
  // Back returns to a still-mounted screen whose guard is still `advanced:true`
  // from the first pass — leaving the user unable to re-select/advance. The
  // useFocusEffect below clears the guard (and any stale timer) every time the
  // screen regains focus, so re-tapping after Back works.
  const advanceGuard = useRef({ advanced: false });
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  useFocusEffect(
    useCallback(() => {
      // Re-arm on focus (initial mount AND return-via-Back). Cancel any timer
      // that was mid-flight when we left, so it can't fire onAdvance late.
      advanceGuard.current.advanced = false;
      if (advanceTimer.current) {
        clearTimeout(advanceTimer.current);
        advanceTimer.current = null;
      }
    }, [])
  );

  const handleSingleTap = (value: T, onSelect: SingleProps<T>['onSelect'], onAdvance: SingleProps<T>['onAdvance'], delay: number) => {
    if (!claimSingleAdvance(advanceGuard.current)) return; // rapid double-tap → no-op
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(value); // answer written to the store BEFORE navigation
    const effectiveDelay = reduceMotion ? 0 : delay;
    advanceTimer.current = setTimeout(() => onAdvance(value), effectiveDelay);
  };

  if (props.mode === 'single') {
    const { options, selected, onSelect, onAdvance, advanceDelayMs } = props;
    const delay = advanceDelayMs ?? AUTO_ADVANCE_DELAY_MS;
    return (
      <View style={styles.list}>
        {options.map((opt, index) => (
          <StaggeredItem key={opt.value} index={index} reduceMotion={reduceMotion}>
            <OptionCard
              title={opt.label}
              subtitle={opt.subtitle}
              icon={opt.icon}
              imageSource={opt.imageSource}
              variant={resolvedVariant}
              warm={warm}
              selected={selected === opt.value}
              onPress={() => handleSingleTap(opt.value, onSelect, onAdvance, delay)}
            />
          </StaggeredItem>
        ))}
      </View>
    );
  }

  const { options, selected, onToggle } = props;
  const handleToggle = (value: T) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  };
  return (
    <View style={styles.list}>
      {options.map((opt, index) => (
        <StaggeredItem key={opt.value} index={index} reduceMotion={reduceMotion}>
          <OptionCard
            title={opt.label}
            subtitle={opt.subtitle}
            icon={opt.icon}
            imageSource={opt.imageSource}
            variant={resolvedVariant}
            warm={warm}
            selected={selected.includes(opt.value)}
            onPress={() => handleToggle(opt.value)}
          />
        </StaggeredItem>
      ))}
    </View>
  );
}

/**
 * Standardized selection-count pill (multi-select) — moved into the system so
 * every multi screen shows the same "N nouns selected" chip. Rendered by the
 * QuestionScreen footer, next to the revealed Continue.
 */
export const SelectionCountPill: React.FC<{ count: number; noun: string }> = ({ count, noun }) => {
  if (count <= 0) return null;
  const label = count === 1 ? noun : `${noun}s`;
  return (
    <Text style={styles.selectionCount}>
      {count} {label} selected
    </Text>
  );
};

// Subtle staggered entrance (≤300ms total). Skipped under Reduce Motion: the
// item snaps to full opacity with no translate. Opacity/translate only — never
// a layout-affecting spring (per the motion spec).
const StaggeredItem: React.FC<{ index: number; reduceMotion: boolean; children: React.ReactNode }> = ({
  index,
  reduceMotion,
  children,
}) => {
  const anim = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) {
      anim.setValue(1);
      return;
    }
    Animated.timing(anim, {
      toValue: 1,
      duration: Animation.duration.normal,
      delay: Math.min(index * 40, 240), // cap the stagger so long lists don't crawl
      useNativeDriver: true,
    }).start();
  }, [reduceMotion]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        marginBottom: Spacing.lg,
      }}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  list: {
    // marginBottom is owned per-item by StaggeredItem so the animated wrapper
    // carries the gap (a plain `gap` on the list would fight the transform).
  },
  selectionCount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.full,
    alignSelf: 'center',
    overflow: 'hidden',
  },
});

export { isMultiSelectValid };
