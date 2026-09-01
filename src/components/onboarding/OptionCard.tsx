import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography, Animation, Shadows } from '../../constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * SPEC-17 — the ONE option-card visual family for onboarding.
 *
 * Consolidates the former `SelectableCard` and `UserTypeScreen`'s bespoke
 * square / horizontal cards into a single component with layout variants. The
 * selected state is ONE rule everywhere — primary border + primary-tint fill +
 * a check badge — so no screen re-invents "what selected looks like".
 *
 * Variants:
 *  - `illustration` (default): image/icon on the left, title + optional subtitle,
 *    check badge on the right. The image-card look used by UserType /
 *    ImprovementGoals / ExperienceLevel / EmotionalChallenges.
 *  - `compact`: text-only row (no media), tighter padding. For plain option
 *    lists like PartnerInvolvement / ParentingStyles / GoalSelection.
 *
 * All spacing/colors/type come from theme tokens — zero hardcoded hex (the
 * hardcoded values in the old cards were an INVARIANT-adjacent smell the spec
 * calls out explicitly).
 */

export type OptionCardVariant = 'illustration' | 'compact';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  variant?: OptionCardVariant;
  /**
   * Warm (Headspace/Noom) card treatment — soft lifted shadow, no heavy border,
   * Ionicons media chip. ONLY variant B passes this (via OptionList
   * appearance="warm"). When false the card renders the ORIGINAL shared look
   * (border-2.5 white cards) so variant A is byte-identical.
   */
  warm?: boolean;
  /** Ionicons glyph shown in the tinted media chip. The graceful fallback. */
  icon?: IoniconName;
  /** Illustration shown in the media slot. Wins over `icon` when present. */
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  disabled?: boolean;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  variant = 'illustration',
  warm = false,
  icon,
  imageSource,
  style,
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    if (selected) {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        damping: Animation.spring.damping,
        stiffness: Animation.spring.stiffness,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(checkmarkScale, {
        toValue: 0,
        duration: Animation.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [selected]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: Animation.spring.damping,
      stiffness: Animation.spring.stiffness,
      useNativeDriver: true,
    }).start();
  };

  // Media renders for BOTH variants now: an illustration when one is wired, else
  // the Ionicons chip. Every option gets a visual anchor — the fix for the old
  // bare-text-on-white look. `compact` uses a smaller chip; `illustration` a
  // larger image tile.
  const hasMedia = Boolean(imageSource || icon);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        style={[
          warm ? styles.cardWarm : styles.card,
          variant === 'compact' ? styles.cardCompact : styles.cardDefault,
          warm
            ? selected
              ? styles.cardWarmSelected
              : styles.cardWarmUnselected
            : selected
              ? styles.cardSelected
              : styles.cardUnselected,
          style,
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          {hasMedia ? (
            imageSource ? (
              <View
                style={[
                  styles.imageContainer,
                  variant === 'compact' && styles.imageContainerCompact,
                  selected && styles.imageContainerSelected,
                ]}
              >
                <Image
                  source={imageSource}
                  style={styles.cardImage}
                  // Warm compact art fills the cream chip (cover) so its own cream
                  // bg blends into the chip and only the subject reads; variant A
                  // keeps its original `contain`.
                  resizeMode={warm && variant === 'compact' ? 'cover' : 'contain'}
                />
              </View>
            ) : (
              <View
                style={[
                  styles.iconContainer,
                  variant === 'compact' && styles.iconContainerCompact,
                  selected && styles.iconContainerSelected,
                ]}
              >
                <Ionicons
                  name={icon as IoniconName}
                  size={variant === 'compact' ? 20 : 26}
                  color={selected ? Colors.primary : Colors.primaryDark}
                />
              </View>
            )
          ) : null}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                variant === 'compact' && styles.titleCompact,
                selected ? styles.titleSelected : styles.titleUnselected,
              ]}
            >
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {selected && (
            <Animated.View style={[styles.checkmark, { transform: [{ scale: checkmarkScale }] }]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ORIGINAL shared card (variant A). Untouched — border-2.5 on white.
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2.5,
  },
  cardDefault: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing['2xl'],
  },
  cardCompact: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  cardUnselected: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  // WARM card (variant B only): soft lifted surface on the cream canvas via a
  // tinted shadow, a 1px hairline instead of a heavy border, and a teal glow on
  // select. This is the Headspace/Noom depth the flat-white cards lacked.
  cardWarm: {
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
  },
  cardWarmSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
    ...Shadows.primary,
  },
  cardWarmUnselected: {
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    ...Shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  iconContainerCompact: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    overflow: 'hidden',
  },
  // In compact (warm) lists an illustration chip matches the icon chip's size +
  // radius, but its bg is the app CREAM (Colors.background) — which is almost
  // exactly the _illo art's own baked-in background, so the art blends into the
  // chip with no visible seam/box (the beige-square-on-page clash in the first
  // render). Sits beside teal-tint icon chips as a soft, intentional pairing.
  imageContainerCompact: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    backgroundColor: Colors.background,
  },
  imageContainerSelected: {
    backgroundColor: Colors.surface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: Typography.sizes.base,
    lineHeight: 24,
  },
  titleSelected: {
    color: Colors.primary,
  },
  titleUnselected: {
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  checkmarkText: {
    color: Colors.surface,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
});
