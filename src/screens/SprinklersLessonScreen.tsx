import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { usePostHog } from 'posthog-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { useLessonGate } from '../hooks/useLessonGate';

interface SubLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  startScreen?: string;
}

const subLessons: SubLesson[] = [
  {
    id: '1',
    number: '1',
    title: 'How do we really bond with our loved ones?',
    description: 'Introduction to the concept of bonding',
    icon: 'heart-outline',
    startScreen: 'SprinklersSec1Screen1',
  },
  {
    id: '2',
    number: '2',
    title: 'What NOT to do when loved ones are upset',
    description: 'Common mistakes to avoid',
    icon: 'close-circle-outline',
    startScreen: 'SprinklersSec2Screen1',
  },
  {
    id: '3',
    number: '3',
    title: 'What TO DO when loved ones are upset',
    description: 'Effective strategies for supporting upset loved ones',
    icon: 'checkmark-circle-outline',
    startScreen: 'SprinklersSec3Screen1',
  },
  {
    id: '4',
    number: '4',
    title: 'Three things to remember',
    description: 'Key takeaways and principles',
    icon: 'list-outline',
    startScreen: 'SprinklersSec4Screen1',
  },
  {
    id: '5',
    number: '5',
    title: 'Summary',
    description: 'Lesson recap and integration',
    icon: 'bookmark-outline',
    startScreen: 'SprinklersSec5Screen1',
  },
];

const STORAGE_KEY = STORAGE_KEYS.SPRINKLERS_COMPLETED_SECTIONS;

export default function SprinklersLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const posthog = usePostHog();
  const { gateToLesson } = useLessonGate();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedSections(JSON.parse(stored));
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading progress:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

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
            <Text style={styles.mainIcon}>💧</Text>
          </View>
          <Text style={styles.label}>FOUNDATION</Text>
          <Text style={styles.title}>Sprinklers: Building Deep Bonds</Text>
          <Text style={styles.description}>
            This lesson will teach you how to build deep bonds with loved ones by recognizing "sprinklers".
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedSections.length}/5 Complete</Text>
            </View>
          </View>
        </View>

        {/* Sub Lessons */}
        <View style={styles.lessonsContainer}>
          {subLessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              style={styles.lessonCard}
              onPress={() => {
                if (!lesson.startScreen) return;
                posthog.capture('lesson_section_started', {
                  lesson_name: 'Sprinklers: Building Deep Bonds',
                  section_id: lesson.id,
                  section_title: lesson.title,
                  section_number: lesson.number,
                });
                gateToLesson(`sprinklers_${lesson.id}`, () => {
                  navigation.navigate('LessonFlow', { screen: lesson.startScreen });
                });
              }}
              activeOpacity={0.7}
            >
              {/* Connecting Line (for all except the last one) */}
              {index < subLessons.length - 1 && (
                <View style={styles.connectingLine} />
              )}

              <View style={styles.lessonContent}>
                {/* Number Circle */}
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{lesson.number}</Text>
                </View>

                {/* Lesson Info */}
                <View style={styles.lessonInfo}>
                  <View style={styles.lessonHeader}>
                    <Ionicons
                      name={lesson.icon}
                      size={20}
                      color={completedSections.includes(lesson.id) ? Colors.success : Colors.textTertiary}
                      style={styles.lessonIcon}
                    />
                    <Text style={[
                      styles.lessonTitle,
                      completedSections.includes(lesson.id) && { color: Colors.success }
                    ]}>
                      {lesson.title}
                    </Text>
                  </View>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>
                </View>

                {/* Coming Soon Badge */}
                {!lesson.startScreen && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}

                {/* Chevron for available lessons */}
                {lesson.startScreen && (
                  <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="water-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Learn to recognize and respond to "sprinklers" for deeper connections
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
    backgroundColor: Colors.primaryBg,
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
  numberText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#C2185B',
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
  lessonDescription: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 18,
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
