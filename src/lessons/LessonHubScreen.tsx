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
import type { Lesson } from './schema';

export interface LessonHubMeta {
  emoji: string;
  label: string;
  description: string;
}

interface LessonHubScreenProps {
  lesson: Lesson;
  meta: LessonHubMeta;
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
  const [completed, setCompleted] = useState<string[]>([]);
  const store = React.useMemo(() => createProgressStore(lesson.storageKey), [lesson.storageKey]);

  useFocusEffect(
    useCallback(() => {
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
            <Text style={styles.mainIcon}>{meta.emoji}</Text>
          </View>
          <Text style={styles.label}>{meta.label}</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{meta.description}</Text>
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
                      <Ionicons name="checkmark" size={24} color={Colors.surface} />
                    ) : (
                      <Text style={styles.numberText}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{section.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
    alignItems: 'center',
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
  numberCircleDone: { backgroundColor: Colors.success },
  numberText: { fontSize: 20, fontWeight: Typography.weights.bold, color: '#C2185B' },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
});
