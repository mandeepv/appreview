import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { useLessonGate } from '../hooks/useLessonGate';

interface SubLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  startScreen: any;
}

const subLessons: SubLesson[] = [
  {
    id: '1',
    number: '1',
    title: 'Why Should We Label Emotions',
    description: 'Understand the science behind naming what we feel',
    icon: 'help-circle-outline',
    startScreen: 'Lesson5Sec1Screen1',
  },
  {
    id: '2',
    number: '2',
    title: 'The Power of Giving Something a Name',
    description: 'How language shapes our emotional experience',
    icon: 'flash-outline',
    startScreen: 'Lesson5Sec2Screen1',
  },
  {
    id: '3',
    number: '3',
    title: 'How to Label Emotions',
    description: 'Practical techniques for identifying and naming feelings',
    icon: 'list-outline',
    startScreen: 'Lesson5Sec3Screen1',
  },
  {
    id: '4',
    number: '4',
    title: 'Is Learning Enough?',
    description: 'From knowledge to practice in daily parenting',
    icon: 'checkmark-circle-outline',
    startScreen: 'Lesson5Sec4Screen1',
  },
];

const STORAGE_KEY = STORAGE_KEYS.LESSON5_COMPLETED_SECTIONS;

export default function LabelingEmotionsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  // Load completed sections from storage
  const loadCompletedSections = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompletedSections(JSON.parse(stored));
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading completed sections:', error);
    }
  };

  // Refresh progress when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCompletedSections();
    }, [])
  );

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSectionPress = (lesson: SubLesson) => {
    gateToLesson(`labeling_${lesson.id}`, () => {
      navigation.navigate('LessonFlow', { screen: lesson.startScreen });
    });
  };

  const isSectionCompleted = (sectionId: string) => {
    return completedSections.includes(sectionId);
  };

  const completedCount = completedSections.length;
  const allCompleted = completedCount === 4;

  // Navigate to completion screen if all sections done. Gated even though
  // completing all sections implies prior entitlement — cheap defense against
  // stale state where AsyncStorage says "all done" but the entitlement lapsed.
  useEffect(() => {
    if (allCompleted) {
      gateToLesson('labeling_complete', () => {
        navigation.navigate('LessonFlow', { screen: 'Lesson5Complete' });
      });
    }
  }, [allCompleted, navigation, gateToLesson]);

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
            <Text style={styles.mainIcon}>🏷️</Text>
          </View>
          <Text style={styles.label}>FOUNDATION</Text>
          <Text style={styles.title}>The Importance of{'\n'}Labeling Emotions</Text>
          <Text style={styles.description}>
            This lesson will teach you why it is important to learn to label emotions and how to do it.
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedCount}/4 Complete</Text>
            </View>
          </View>
        </View>

        {/* Sub Lessons */}
        <View style={styles.lessonsContainer}>
          {subLessons.map((lesson, index) => {
            const isCompleted = isSectionCompleted(lesson.id);
            return (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => handleSectionPress(lesson)}
                activeOpacity={0.7}
              >
                {/* Connecting Line (for all except the last one) */}
                {index < subLessons.length - 1 && (
                  <View style={styles.connectingLine} />
                )}

                <View style={[
                  styles.lessonContent,
                  isCompleted && styles.lessonContentCompleted
                ]}>
                  {/* Number Circle */}
                  <View style={[
                    styles.numberCircle,
                    isCompleted && styles.numberCircleCompleted
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.numberText}>{lesson.number}</Text>
                    )}
                  </View>

                  {/* Lesson Info */}
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonHeader}>
                      <Ionicons
                        name={lesson.icon}
                        size={20}
                        color={Colors.textTertiary}
                        style={styles.lessonIcon}
                      />
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    </View>
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  </View>

                  {/* Status Indicator */}
                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Each module takes about 5 minutes to complete
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
  lessonContentCompleted: {
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#C8E6C9',
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
  numberCircleCompleted: {
    backgroundColor: '#2E7D32',
  },
  numberText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
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
  completedBadge: {
    alignSelf: 'flex-start',
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
