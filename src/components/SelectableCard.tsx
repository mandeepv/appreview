import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ViewStyle, Animated, Image, ImageSourcePropType } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows, Typography, Animation } from '../constants/theme';

interface SelectableCardProps {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'default' | 'small' | 'text-only';
  icon?: string;
  imageSource?: ImageSourcePropType;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  subtitle,
  selected,
  onPress,
  variant = 'default',
  icon,
  imageSource,
  style,
  hapticFeedback = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

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

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  if (variant === 'text-only') {
    return (
      <TouchableOpacity onPress={handlePress} style={[styles.textOnly, style]}>
        <Text style={[styles.textOnlyLabel, selected && styles.textOnlyLabelSelected]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          variant === 'small' ? styles.cardSmall : styles.cardDefault,
          selected ? styles.cardSelected : styles.cardUnselected,
          style,
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          {imageSource ? (
            <View style={[styles.imageContainer, selected && styles.imageContainerSelected]}>
              <Image source={imageSource} style={styles.cardImage} resizeMode="contain" />
            </View>
          ) : icon ? (
            <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
          ) : null}
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              variant === 'small' && styles.titleSmall,
              selected ? styles.titleSelected : styles.titleUnselected,
            ]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
          {selected && (
            <Animated.View style={[
              styles.checkmark,
              { transform: [{ scale: checkmarkScale }] }
            ]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  textOnly: {
    paddingVertical: Spacing.sm,
  },
  textOnlyLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
  },
  textOnlyLabelSelected: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  card: {
    borderRadius: 20,
    marginBottom: Spacing.lg,
    borderWidth: 2.5,
  },
  cardDefault: {
    paddingVertical: 22,
    paddingHorizontal: 24,
  },
  cardSmall: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  cardUnselected: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
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
    borderRadius: 16,
    backgroundColor: Colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  iconContainerSelected: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circle
    backgroundColor: Colors.backgroundGray, // Or transparent if the image has bg
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
    overflow: 'hidden',
  },
  imageContainerSelected: {
    backgroundColor: Colors.surface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  icon: {
    fontSize: 26,
  },
  title: {
    fontWeight: Typography.weights.bold,
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  titleSmall: {
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
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
});
