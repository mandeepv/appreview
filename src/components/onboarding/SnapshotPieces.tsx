import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';

/**
 * Presentational pieces for the variant-B "mirror" beats — the recap chips on
 * VBReady and the personalized snapshot card on VBSnapshot. They render values
 * the caller derives from the onboarding store; they own no logic or state.
 * See docs/specs/variant-b-onboarding-copy.md (screens 12 & 14).
 */

/** A horizontal wrap of small pill chips echoing the user's answers back. */
export const RecapChips: React.FC<{ chips: string[] }> = ({ chips }) => (
  <View style={styles.chipRow}>
    {chips.map((c) => (
      <View key={c} style={styles.chip}>
        <Text style={styles.chipText}>{c}</Text>
      </View>
    ))}
  </View>
);

export interface SnapshotRow {
  label: string;
  value: string;
}

/** The "here's your personalized plan" card — the earned aha-moment payoff. */
export const SnapshotCard: React.FC<{ rows: SnapshotRow[] }> = ({ rows }) => (
  <View style={styles.card}>
    {rows.map((row, i) => (
      <View
        key={row.label}
        style={[styles.cardRow, i < rows.length - 1 && styles.cardRowDivider]}
      >
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={styles.rowValue}>{row.value}</Text>
      </View>
    ))}
  </View>
);

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
  card: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    ...Shadows.md,
  },
  cardRow: {
    paddingVertical: Spacing.lg,
  },
  cardRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: Typography.letterSpacing.wide,
    marginBottom: Spacing.xs,
  },
  rowValue: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
});
