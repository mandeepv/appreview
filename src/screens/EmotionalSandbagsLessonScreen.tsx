import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { getCompletedSections } from '../utils/emotionalSandbagsProgress';
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
    title: 'Introduction',
    description: 'Overview of the emotional sandbags concept',
    icon: 'information-circle-outline',
    startScreen: 'SandbagsSec1Screen1',
  },
  {
    id: '2',
    number: '2',
    title: 'What are emotional sandbags?',
    description: 'Definition and explanation',
    icon: 'help-circle-outline',
    startScreen: 'SandbagsSec2Screen1',
  },
  {
    id: '3',
    number: '3',
    title: 'How to help unload emotional sandbags',
    description: 'Practical techniques and strategies',
    icon: 'hand-left-outline',
    startScreen: 'EmotionalSandbagsSec3Screen1',
  },
  {
    id: '4',
    number: '4',
    title: "Let's review",
    description: 'Recap of key concepts',
    icon: 'refresh-outline',
    startScreen: 'EmotionalSandbagsSec4Screen1',
  },
  {
    id: '5',
    number: '5',
    title: "Let's practice",
    description: 'Application and practice exercises',
    icon: 'fitness-outline',
    startScreen: 'EmotionalSandbagsSec5Screen1',
  },
  {
    id: '6',
    number: '6',
    title: 'Summary',
    description: 'Final integration and takeaways',
    icon: 'bookmark-outline',
    startScreen: 'EmotionalSandbagsSec6Screen1',
  },
];

export default function EmotionalSandbagsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const [completedSections, setCompletedSections] = React.useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        const completed = await getCompletedSections();
        setCompletedSections(completed);
      };
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
            <Text style={styles.mainIcon}>🛡️</Text>
          </View>
          <Text style={styles.label}>SKILL</Text>
          <Text style={styles.title}>Emotional Sandbags</Text>
          <Text style={styles.description}>
            Now that we know the importance of labeling emotions, how do we use this knowledge to help our relationships?
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedSections.length}/6 Complete</Text>
            </View>
          </View>
        </View>

        {/* Sub Lessons */}
        <View style={styles.lessonsContainer}>
          {subLessons.map((lesson, index) => {
            const isCompleted = completedSections.includes(lesson.id);
            const isAvailable = !!lesson.startScreen;

            return (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => isAvailable && gateToLesson(`sandbags_${lesson.id}`, () => navigation.navigate('LessonFlow' as any, { screen: lesson.startScreen } as any))}
                activeOpacity={isAvailable ? 0.7 : 1}
              >
                {/* Connecting Line (for all except the last one) */}
                {index < subLessons.length - 1 && (
                  <View style={[
                    styles.connectingLine,
                    isCompleted && { backgroundColor: '#4CAF50' }
                  ]} />
                )}

                <View style={[
                  styles.lessonContent,
                  !isAvailable && { opacity: 0.6 }
                ]}>
                  {/* Number Circle */}
                  <View style={[
                    styles.numberCircle,
                    isCompleted && { backgroundColor: '#E8F5E9' }
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    ) : (
                      <Text style={[
                        styles.numberText,
                        !isAvailable && { color: Colors.textTertiary }
                      ]}>{lesson.number}</Text>
                    )}
                  </View>

                  {/* Lesson Info */}
                  <View style={styles.lessonInfo}>
                    <View style={styles.lessonHeader}>
                      <Ionicons
                        name={lesson.icon}
                        size={20}
                        color={isCompleted ? '#4CAF50' : Colors.textTertiary}
                        style={styles.lessonIcon}
                      />
                      <Text style={[
                        styles.lessonTitle,
                        isCompleted && { color: '#2E7D32' }
                      ]}>{lesson.title}</Text>
                    </View>
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  </View>

                  {/* Badge */}
                  {!isAvailable && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <View style={styles.completeBadge}>
                      <Text style={styles.completeText}>Done</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Learn practical techniques to support emotional well-being
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
    backgroundColor: Colors.infoBg,
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
    backgroundColor: Colors.infoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#1976D2',
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
  completeBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  completeText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
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
