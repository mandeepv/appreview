// SPEC-09 Phase 3 — the generic lesson hub.
//
// One data-driven hub replaces the ~400-line per-lesson hub duplicates. Given
// a Lesson + optional display metadata (emoji, label, description), it renders
// the section cards with completion state read from the lesson's progress
// store. Reproduces the existing hub look (header, title block, progress badge,
// numbered section cards with connecting line + completion checkmarks).
//
// Phase 3 scope: used via the additive dev-preview route (DevMenu) so you can
// device-check a data lesson without touching the shipping gate/routes. The
// real cutover (replacing the hand-built hubs) is a later push.

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { createProgressStore } from './progressStore';
import { safeCapture } from '../lib/analytics';
import type { Lesson } from './schema';

export interface LessonHubMeta {
  emoji: string;
  label: string;
  description: string;
  // Per-section display, indexed to lesson.sections. Each section card shows a
  // tinted icon (green when that section is complete) + a subtitle under the
  // title — matching the hand-built hubs (SPEC-13 R3 parity).
  sections: { icon: keyof typeof Ionicons.glyphMap; description: string }[];
  // The tinted callout card at the bottom of every hub.
  bottomInfo: { icon: keyof typeof Ionicons.glyphMap; text: string };
}

interface LessonHubScreenProps {
  lesson: Lesson;
  // Optional (SPEC-FIX-03 R6): a missing/partial meta must NOT crash the hub.
  // When absent, the hub renders with sensible defaults (title from the lesson,
  // no per-section subtitle/icon, no bottom info card) instead of throwing on
  // meta.label / meta.bottomInfo.
  meta?: Partial<LessonHubMeta>;
  onBack: () => void;
  // Start a section (open the generic lesson at section index, screen 0).
  onOpenSection: (sectionIndex: number) => void;
}

export const LessonHubScreen: React.FC<LessonHubScreenProps> = ({
  lesson,
  meta,
  onBack,
  onOpenSection,
}) => {
  // Normalize meta so every access below is safe (R6 graceful fallback).
  const emoji = meta?.emoji ?? '📘';
  const label = meta?.label ?? '';
  const description = meta?.description ?? '';
  const metaSections = meta?.sections ?? [];
  const bottomInfo = meta?.bottomInfo ?? null;

  const [completed, setCompleted] = useState<string[]>([]);
  // Flow lessons have no storageKey (no persisted progress) — the hub then
  // just shows 0/… complete and never reads/writes. Only section-based lessons
  // have a store.
  const store = React.useMemo(
    () => (lesson.storageKey ? createProgressStore(lesson.storageKey) : null),
    [lesson.storageKey],
  );

  // SPEC-13 R4/R5 — for hub lessons, landing on the hub IS the "opened" moment,
  // so the hub owns the single lesson_started fire (the controller skips hub
  // lessons to avoid double-counting). Same event name + same-or-richer props
  // (id + title + label) that LearnScreen used to send — PostHog continuity.
  // Fires once per hub mount.
  React.useEffect(() => {
    safeCapture('lesson_started', {
      lesson_id: lesson.slug,
      lesson_title: lesson.title,
      lesson_label: label || null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!store) return;
      let alive = true;
      store.getCompletedSections().then((c) => {
        if (alive) setCompleted(c);
      });
      return () => {
        alive = false;
      };
    }, [store]),
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>{emoji}</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>
                {completed.length}/{lesson.sections.length} Complete
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.lessonsContainer}>
          {lesson.sections.map((section, index) => {
            const isDone = completed.includes(section.id);
            return (
              <TouchableOpacity
                key={section.id}
                style={styles.lessonCard}
                onPress={() => onOpenSection(index)}
                activeOpacity={0.7}
              >
                {index < lesson.sections.length - 1 && <View style={styles.connectingLine} />}
                <View style={styles.lessonContent}>
                  <View style={[styles.numberCircle, isDone && styles.numberCircleDone]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    ) : (
                      <Text style={styles.numberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonHeader}>
                      {metaSections[index]?.icon && (
                        <Ionicons
                          name={metaSections[index].icon}
                          size={20}
                          color={isDone ? Colors.success : Colors.textTertiary}
                          style={styles.lessonIcon}
                        />
                      )}
                      <Text style={[styles.lessonTitle, isDone && { color: Colors.success }]}>
                        {section.title}
                      </Text>
                    </View>
                    {metaSections[index]?.description ? (
                      <Text style={styles.lessonDescription}>{metaSections[index].description}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {bottomInfo ? (
          <View style={styles.bottomInfo}>
            <View style={styles.infoCard}>
              <Ionicons name={bottomInfo.icon} size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{bottomInfo.text}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  scrollView: { flex: 1 },
  contentContainer: { paddingBottom: 40 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  titleSection: { paddingHorizontal: 24, alignItems: 'center', marginBottom: 32 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.md,
  },
  mainIcon: { fontSize: 40 },
  label: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  progressSection: { paddingHorizontal: 24, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 16, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  progressBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  progressText: { fontSize: 12, fontWeight: Typography.weights.semibold, color: Colors.primary },
  lessonsContainer: { paddingHorizontal: 24 },
  lessonCard: { position: 'relative', marginBottom: 16 },
  connectingLine: {
    position: 'absolute',
    left: 23,
    top: 48,
    bottom: -16,
    width: 2,
    backgroundColor: Colors.border,
  },
  lessonContent: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.sm,
  },
  numberCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberCircleDone: { backgroundColor: '#E8F5E9' },
  numberText: { fontSize: 20, fontWeight: Typography.weights.bold, color: '#C2185B' },
  lessonInfo: { flex: 1, paddingRight: 8 },
  lessonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  lessonIcon: { marginRight: 6 },
  lessonTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  lessonDescription: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  bottomInfo: { paddingHorizontal: 24, marginTop: 24 },
  infoCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
