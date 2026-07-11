import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/theme';
import type { StreakResult } from '../lessons/computeStreak';

// SPEC-19 UI (v1 minimal) — the streak chip for LearnScreen's header.
//
// flame + current count; dimmed/outline flame when atRisk (no activity yet
// today), filled when today is done. Tap → a small explainer sheet: current,
// longest, the one-line freeze rule, and today's state. Theme tokens only.

interface StreakChipProps {
  streak: StreakResult;
}

export const StreakChip: React.FC<StreakChipProps> = ({ streak }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Zero streak: still render the chip (dimmed) so the affordance is discoverable
  // — tapping explains how it works.
  const filled = !streak.atRisk && streak.current > 0;

  return (
    <>
      <TouchableOpacity
        style={[styles.chip, filled ? styles.chipFilled : styles.chipDimmed]}
        onPress={() => setSheetOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Streak: ${streak.current} day${streak.current === 1 ? '' : 's'}${streak.atRisk ? ', at risk — do a lesson today to keep it' : ''}`}
        activeOpacity={0.8}
      >
        <Ionicons
          name={filled ? 'flame' : 'flame-outline'}
          size={18}
          color={filled ? Colors.error : Colors.textMuted}
        />
        <Text style={[styles.count, filled ? styles.countFilled : styles.countDimmed]}>
          {streak.current}
        </Text>
      </TouchableOpacity>

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setSheetOpen(false)}>
          {/* Stop propagation: taps inside the sheet don't dismiss. */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Your streak</Text>

            <View style={styles.row}>
              <Ionicons name="flame" size={20} color={Colors.error} />
              <Text style={styles.rowLabel}>Current</Text>
              <Text style={styles.rowValue}>{streak.current} {streak.current === 1 ? 'day' : 'days'}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="trophy-outline" size={20} color={Colors.primary} />
              <Text style={styles.rowLabel}>Longest</Text>
              <Text style={styles.rowValue}>{streak.longest} {streak.longest === 1 ? 'day' : 'days'}</Text>
            </View>

            <Text style={styles.todayState}>
              {streak.atRisk
                ? 'Do a lesson today to keep your streak going.'
                : streak.current > 0
                  ? "You're done for today — nice work."
                  : 'Complete a lesson section to start your streak.'}
            </Text>

            <Text style={styles.freezeRule}>
              Miss a single day and we bridge it for you automatically — up to once a week, free.
            </Text>

            <TouchableOpacity style={styles.doneButton} onPress={() => setSheetOpen(false)} activeOpacity={0.8}>
              <Text style={styles.doneText}>Got it</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  chipFilled: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.error,
  },
  chipDimmed: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  count: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  countFilled: {
    color: Colors.errorDark,
  },
  countDimmed: {
    color: Colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlayLight,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    paddingBottom: Spacing['4xl'],
    ...Shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  sheetTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  todayState: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  freezeRule: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  doneButton: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  doneText: {
    color: Colors.surface,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
});
