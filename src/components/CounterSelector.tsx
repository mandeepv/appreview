import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

interface CounterSelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  label?: string;
  hapticFeedback?: boolean;
}

export const CounterSelector: React.FC<CounterSelectorProps> = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 100,
  label,
  hapticFeedback = true,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onIncrement();
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.selector}>
        <TouchableOpacity
          onPress={handleDecrement}
          disabled={value <= min}
          style={[
            styles.button,
            styles.decrementButton,
            value <= min && styles.buttonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            styles.decrementButtonText,
            value <= min && styles.buttonTextDisabled,
          ]}>
            −
          </Text>
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>

        <TouchableOpacity
          onPress={handleIncrement}
          disabled={value >= max}
          style={[
            styles.button,
            styles.incrementButton,
            value >= max && styles.buttonDisabled,
          ]}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.buttonText,
            styles.incrementButtonText,
            value >= max && styles.buttonTextDisabled,
          ]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    letterSpacing: 0.2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  decrementButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  incrementButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes['3xl'],
  },
  decrementButtonText: {
    color: Colors.textTertiary,
  },
  incrementButtonText: {
    color: Colors.surface,
  },
  buttonTextDisabled: {
    color: Colors.textDisabled,
  },
  valueContainer: {
    paddingHorizontal: Spacing['4xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 40,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
});
