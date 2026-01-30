import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  characterLimit?: number;
  showCharacterCount?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  success = false,
  characterLimit,
  showCharacterCount = true,
  value,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (success) return Colors.success;
    if (isFocused) return Colors.primary;
    return Colors.border;
  };

  const shouldShowCount = showCharacterCount && characterLimit && value;
  const remainingChars = characterLimit && value ? characterLimit - value.length : 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          error && styles.inputError,
          success && styles.inputSuccess,
        ]}
      >
        <TextInput
          value={value}
          style={[styles.input, style]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.textLight}
          maxLength={characterLimit}
          {...props}
        />
        {success && (
          <Text style={styles.successIcon}>✓</Text>
        )}
      </View>
      <View style={styles.footer}>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {shouldShowCount && !error && (
          <Text style={[
            styles.characterCount,
            remainingChars < 10 && styles.characterCountLow
          ]}>
            {remainingChars} characters remaining
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: Spacing.xl,
    minHeight: 60,
    ...Shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  inputSuccess: {
    borderColor: Colors.success,
    backgroundColor: Colors.surface,
  },
  successIcon: {
    fontSize: Typography.sizes.xl,
    color: Colors.success,
    marginLeft: Spacing.sm,
  },
  footer: {
    marginTop: Spacing.sm,
    minHeight: 20,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    marginTop: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  characterCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  characterCountLow: {
    color: Colors.warning,
    fontWeight: Typography.weights.medium,
  },
});
