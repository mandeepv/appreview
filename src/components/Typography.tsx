import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography as TypographyTokens } from '../constants/theme';

interface BaseTextProps extends TextProps {
  color?: string;
  center?: boolean;
}

// Heading 1 - For main page titles
export const Heading1: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textPrimary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.heading1,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Heading 2 - For section headers
export const Heading2: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textPrimary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.heading2,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Heading 3 - For card titles
export const Heading3: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textPrimary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.heading3,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Subtitle - For subtitles and descriptions under headings
export const Subtitle: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textTertiary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.subtitle,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Body Text - For standard paragraph text
export const BodyText: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textSecondary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.body,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Caption - For small helper text
export const Caption: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textMuted,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.caption,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Label - For form labels and button text
export const Label: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textSecondary,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.label,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

// Micro - For very small text (terms, fine print)
export const Micro: React.FC<BaseTextProps> = ({
  style,
  color = Colors.textMuted,
  center = false,
  ...props
}) => (
  <Text
    style={[
      styles.micro,
      { color },
      center && styles.center,
      style
    ]}
    {...props}
  />
);

const styles = StyleSheet.create({
  heading1: {
    fontSize: TypographyTokens.sizes['4xl'],
    fontWeight: TypographyTokens.weights.bold,
    lineHeight: TypographyTokens.sizes['4xl'] * 1.2,
    letterSpacing: -0.8,
  },
  heading2: {
    fontSize: TypographyTokens.sizes['3xl'],
    fontWeight: TypographyTokens.weights.bold,
    lineHeight: TypographyTokens.sizes['3xl'] * 1.25,
    letterSpacing: -0.5,
  },
  heading3: {
    fontSize: TypographyTokens.sizes.xl,
    fontWeight: TypographyTokens.weights.bold,
    lineHeight: TypographyTokens.sizes.xl * 1.4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: TypographyTokens.sizes.lg,
    fontWeight: TypographyTokens.weights.medium,
    lineHeight: TypographyTokens.sizes.lg * 1.5,
    letterSpacing: 0,
  },
  body: {
    fontSize: TypographyTokens.sizes.base,
    fontWeight: TypographyTokens.weights.regular,
    lineHeight: TypographyTokens.sizes.base * 1.6,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: TypographyTokens.sizes.sm,
    fontWeight: TypographyTokens.weights.medium,
    lineHeight: TypographyTokens.sizes.sm * 1.5,
    letterSpacing: 0.1,
  },
  label: {
    fontSize: TypographyTokens.sizes.md,
    fontWeight: TypographyTokens.weights.semibold,
    lineHeight: TypographyTokens.sizes.md * 1.4,
    letterSpacing: 0.3,
  },
  micro: {
    fontSize: TypographyTokens.sizes.xs,
    fontWeight: TypographyTokens.weights.regular,
    lineHeight: TypographyTokens.sizes.xs * 1.5,
    letterSpacing: 0.2,
  },
  center: {
    textAlign: 'center',
  },
});
