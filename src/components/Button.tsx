import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Shadows, Animation, Typography } from '../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  hapticFeedback?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  hapticFeedback = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: Animation.pressScale,
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'gradient':
        return styles.gradientButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'gradient' ? 'white' : Colors.primary} />
      ) : (
        <Text style={[styles.text, getTextStyle()]}>{title}</Text>
      )}
    </>
  );

  // Gradient variant now uses solid color for cleaner aesthetic
  if (variant === 'gradient' && !disabled) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[
            styles.button,
            styles.primaryButton,
            disabled && styles.disabled,
          ]}
        >
          {buttonContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          getButtonStyle(),
          disabled && styles.disabled,
          style,
        ]}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 16,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    ...Shadows.lg,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    ...Shadows.primaryStrong,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Shadows.none,
  },
  gradientButton: {
    backgroundColor: 'transparent',
    ...Shadows.primaryStrong,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: Typography.weights.bold,
    fontSize: 17,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: Colors.surface,
  },
  secondaryText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
