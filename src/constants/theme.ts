/**
 * Centralized Design System
 * Single source of truth for colors, typography, spacing, shadows, and other design tokens
 */

export const Colors = {
  // Primary Brand Colors - Premium gradient-ready palette
  primary: '#FF3B7F',       // Vibrant pink - Commands attention
  primaryDark: '#D91A5E',   // Deep magenta - For depth
  primaryLight: '#FF6B9D',  // Lighter pink - For highlights
  primaryBg: '#FFF0F5',     // Barely-there pink - Subtle backgrounds
  primaryTint: '#FFE0EB',   // Light pink tint - Icon containers
  primaryAccent: '#FFC2D9', // Soft pink accent - Dividers

  // Gradient combinations
  gradientStart: '#FF3B7F',
  gradientEnd: '#FF6B9D',
  gradientAccent: '#B24592', // Purple-pink for variety

  // Sophisticated neutrals - True professional grade
  textPrimary: '#0F172A',   // Slate 900 - Crisp, modern black
  textSecondary: '#1E293B', // Slate 800 - Strong body text
  textTertiary: '#475569',  // Slate 600 - Muted text
  textMuted: '#64748B',     // Slate 500 - Helper text
  textLight: '#94A3B8',     // Slate 400 - Placeholder
  textDisabled: '#CBD5E1',  // Slate 300 - Disabled

  // Backgrounds - Multi-layer depth system
  background: '#FFFFFF',     // Pure white base
  backgroundGray: '#F8FAFC', // Slate 50 - Subtle contrast
  surface: '#FFFFFF',        // Elevated surfaces
  surfaceHover: '#F1F5F9',   // Slate 100 - Hover states
  surfaceElevated: '#FFFFFF', // Cards with shadows

  // Borders - Refined and minimal
  border: '#E2E8F0',        // Slate 200 - Default
  borderLight: '#F1F5F9',   // Slate 100 - Subtle
  borderDark: '#CBD5E1',    // Slate 300 - Strong
  borderFocus: '#FF3B7F',   // Primary for focus

  // Semantic colors - Balanced and professional
  success: '#10B981',       // Emerald 500
  successBg: '#D1FAE5',     // Emerald 100
  successDark: '#059669',   // Emerald 600
  error: '#EF4444',         // Red 500
  errorBg: '#FEE2E2',       // Red 100
  errorDark: '#DC2626',     // Red 600
  warning: '#F59E0B',       // Amber 500
  warningBg: '#FEF3C7',     // Amber 100
  info: '#3B82F6',          // Blue 500
  infoBg: '#DBEAFE',        // Blue 100

  // Glass morphism & overlays
  glass: 'rgba(255, 255, 255, 0.8)',
  glassDark: 'rgba(15, 23, 42, 0.1)',
  overlay: 'rgba(15, 23, 42, 0.75)',
  overlayLight: 'rgba(15, 23, 42, 0.4)',

  // Accent colors for variety
  accent: '#8B5CF6',        // Purple 500
  accentLight: '#C4B5FD',   // Purple 300
  accentDark: '#7C3AED',    // Purple 600
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
    shadowColor: '#FF3B7F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryStrong: {
    shadowColor: '#FF3B7F',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 8,
  },
  accent: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  success: {
    shadowColor: '#10B981',
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
