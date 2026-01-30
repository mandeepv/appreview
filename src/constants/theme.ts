/**
 * Centralized Design System
 * Single source of truth for colors, typography, spacing, shadows, and other design tokens
 */

export const Colors = {
  // Primary Brand Colors - Soft Sage Teal "Calm Growth"
  primary: '#4F8F8B',       // Soft Sage Teal - Trust + care
  primaryDark: '#3D7470',   // Darker teal - For depth
  primaryLight: '#6BA8A4',  // Lighter teal - For highlights
  primaryBg: '#E8F2F1',     // Light teal tint - Subtle backgrounds
  primaryTint: '#D4E7E5',   // Teal tint - Icon containers
  primaryAccent: '#A5C9C7', // Soft teal accent - Dividers

  // Gradient combinations (using solid primary for now)
  gradientStart: '#4F8F8B',
  gradientEnd: '#6BA8A4',
  gradientAccent: '#3D7470',

  // Text Colors - Deep Charcoal "Quiet Confidence"
  textPrimary: '#2E2E2E',   // Deep Charcoal - Authority without harshness
  textSecondary: '#4A4A4A', // Medium charcoal - Strong body text
  textTertiary: '#6B6B6B',  // Light charcoal - Muted text
  textMuted: '#8B8B8B',     // Gray - Helper text
  textLight: '#A8A8A8',     // Light gray - Placeholder
  textDisabled: '#CFCFCF',  // Very light gray - Disabled

  // Backgrounds - Warm Cream "Safe Space"
  background: '#FAF7F2',     // Warm Cream - Human, not clinical
  backgroundGray: '#F5F2ED', // Slightly darker cream - Subtle contrast
  surface: '#FFFFFF',        // Pure white - Elevated surfaces
  surfaceHover: '#F0EDE8',   // Cream hover - Hover states
  surfaceElevated: '#FFFFFF', // White cards with shadows

  // Borders - Refined and minimal
  border: '#E5E1DC',        // Light warm gray - Default
  borderLight: '#F0EDE8',   // Very light - Subtle
  borderDark: '#D1CCC4',    // Darker warm gray - Strong
  borderFocus: '#4F8F8B',   // Primary for focus

  // Semantic colors - Soft and encouraging
  success: '#F4C7A1',       // Soft Sun Peach - "Encouragement"
  successBg: '#FDF5EF',     // Very light peach - Backgrounds
  successDark: '#E8AB7A',   // Darker peach - For depth
  error: '#D08C7A',         // Soft Terracotta - Non-alarming
  errorBg: '#F9EBE7',       // Light terracotta - Backgrounds
  errorDark: '#C17563',     // Darker terracotta - For depth
  warning: '#D08C7A',       // Soft Terracotta - Same as error
  warningBg: '#F9EBE7',     // Light terracotta - Backgrounds
  info: '#BFD8E2',          // Muted Sky Blue - "Clarity"
  infoBg: '#EEF6F9',        // Very light sky blue - Backgrounds

  // Glass morphism & overlays
  glass: 'rgba(250, 247, 242, 0.8)',
  glassDark: 'rgba(46, 46, 46, 0.1)',
  overlay: 'rgba(46, 46, 46, 0.75)',
  overlayLight: 'rgba(46, 46, 46, 0.4)',

  // Accent colors - Secondary palette
  accent: '#BFD8E2',        // Muted Sky Blue - Secondary accent
  accentLight: '#D9E8ED',   // Lighter sky blue
  accentDark: '#A5C4D0',    // Darker sky blue
} as const;

export const Typography = {
  sizes: {
    xs: 12,
    sm: 13,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    hero: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // Premium multi-layer shadows for depth
  xs: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  xl: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 12,
  },
  // Colored glow shadows for emphasis
  primary: {
    shadowColor: '#4F8F8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryStrong: {
    shadowColor: '#4F8F8B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
  },
  accent: {
    shadowColor: '#BFD8E2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  success: {
    shadowColor: '#F4C7A1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
} as const;

export const Animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  spring: {
    damping: 15,
    stiffness: 150,
  },
  pressScale: 0.97,
} as const;

// Helper function to create consistent icon container sizes
export const IconSizes = {
  sm: 40,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
} as const;

// Export default theme object
export const theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  animation: Animation,
  iconSizes: IconSizes,
} as const;

export default theme;
