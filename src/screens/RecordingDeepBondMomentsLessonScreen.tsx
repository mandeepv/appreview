import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { getCompletedSections } from '../utils/recordingDeepBondMomentsProgress';
import { useLessonGate } from '../hooks/useLessonGate';

interface SubLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  // Availability flag only (SPEC-09 Phase 4 — old route type deleted; nav now
  // goes through the generic LessonScreen by slug + sectionIndex).
  startScreen: string;
}

export default function RecordingDeepBondMomentsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const loadProgress = useCallback(async () => {
    const completed = await getCompletedSections();
    setCompletedSections(completed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const subLessons: SubLesson[] = [
    {
      id: '1',
      number: '1',
      title: 'Recording Deep Bond Moments',
      description: 'Rethinking how we capture meaningful moments',
      icon: 'camera-outline',
      startScreen: 'RecordingDeepBondMomentsSec1Screen1',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSubLessonPress = (subLesson: SubLesson) => {
    if (!subLesson.startScreen) return;
    // SPEC-09 Phase 3: launch the generic data-driven lesson (single section,
    // id '1' → sectionIndex 0). Gate + return-to-hub unchanged.
    gateToLesson(`recording_${subLesson.id}`, () => {
      navigation.navigate('LessonScreen', {
        lessonId: 'recordingDeepBondMoments',
        sectionIndex: Number(subLesson.id) - 1,
        screenIndex: 0,
        returnTo: 'RecordingDeepBondMomentsLesson',
      });
    });
  };

  const isSubLessonComplete = (subLessonId: string) => {
    return completedSections.includes(subLessonId);
  };

  const completedCount = completedSections.length;
  const totalCount = subLessons.length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.mainIcon}>📸</Text>
          </View>
          <Text style={styles.label}>WELLNESS</Text>
          <Text style={styles.title}>Recording Deep Bond Moments</Text>
          <Text style={styles.description}>
            This lesson will change the way you think about recording memories.
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedCount}/{totalCount} Complete</Text>
            </View>
          </View>
        </View>

        {/* Sub Lessons */}
        <View style={styles.lessonsContainer}>
          {subLessons.map((lesson) => {
            const isComplete = isSubLessonComplete(lesson.id);
            const isAvailable = lesson.startScreen !== undefined;

            return (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => isAvailable && handleSubLessonPress(lesson)}
                disabled={!isAvailable}
                activeOpacity={0.7}
              >
                <View style={styles.lessonContent}>
                  {/* Number Circle */}
                  <View style={[
                    styles.numberCircle,
                    !isAvailable && styles.numberCircleDisabled
                  ]}>
                    <Text style={[
                      styles.numberText,
                      !isAvailable && styles.numberTextDisabled
                    ]}>{lesson.number}</Text>
                  </View>

                  {/* Lesson Info */}
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonHeader}>
                      <Ionicons
                        name={lesson.icon}
                        size={20}
                        color={isAvailable ? Colors.textSecondary : Colors.textTertiary}
                        style={styles.lessonIcon}
                      />
                      <Text style={[
                        styles.lessonTitle,
                        !isAvailable && styles.lessonTitleDisabled
                      ]}>{lesson.title}</Text>
                    </View>
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  </View>

                  {/* Status Badge */}
                  {isComplete ? (
                    <View style={styles.completeBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Colors.success}
                      />
                      <Text style={styles.completeText}>Done</Text>
                    </View>
                  ) : !isAvailable ? (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="images-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Learn what moments to capture and how they shape lasting memories
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  titleSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.md,
  },
  mainIcon: {
    fontSize: 40,
  },
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
  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  progressBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: 12,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  lessonsContainer: {
    paddingHorizontal: 24,
    gap: 0,
  },
  lessonCard: {
    position: 'relative',
    marginBottom: 16,
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
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberCircleDisabled: {
    backgroundColor: Colors.border,
  },
  numberText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
  },
  numberTextDisabled: {
    color: Colors.textTertiary,
  },
  lessonInfo: {
    flex: 1,
    paddingRight: 8,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lessonIcon: {
    marginRight: 6,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  lessonTitleDisabled: {
    color: Colors.textSecondary,
  },
  lessonDescription: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
    alignSelf: 'flex-start',
  },
  completeText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
  },
  comingSoonBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  bottomInfo: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
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
