import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { createProgressStore } from '../lessons/progressStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
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

const subLessons: SubLesson[] = [
  {
    id: '1',
    number: '1',
    title: 'Situation: The Sleepover',
    description: 'A real-life scenario to explore communication dynamics',
    icon: 'moon-outline',
    startScreen: 'CommunicationMistakesSec1Screen1',
  },
  {
    id: '2',
    number: '2',
    title: 'Siding with the Enemy',
    description: 'Understanding how this damages relationships',
    icon: 'shield-outline',
    startScreen: 'CommunicationMistakesSec2Screen1',
  },
  {
    id: '3',
    number: '3',
    title: 'Siding with the Enemy: Trying to See Both Sides',
    description: 'Why balanced perspective can backfire',
    icon: 'scale-outline',
    startScreen: 'CommunicationMistakesSec3Screen1',
  },
  {
    id: '4',
    number: '4',
    title: 'How to Make It Worse',
    description: 'Common mistakes that escalate situations',
    icon: 'trending-down-outline',
    startScreen: 'CommunicationMistakesSec4Screen1',
  },
  {
    id: '5',
    number: '5',
    title: 'How We Respond to Minimizing',
    description: 'The emotional impact of minimization',
    icon: 'contract-outline',
    startScreen: 'CommunicationMistakesSec5Screen1',
  },
  {
    id: '6',
    number: '6',
    title: 'A Trigger Phrase',
    description: 'Words that damage emotional connections',
    icon: 'alert-outline',
    startScreen: 'CommunicationMistakesSec6Screen1',
  },
  {
    id: '7',
    number: '7',
    title: 'Another Hidden Example of Minimizing',
    description: 'Subtle ways we dismiss feelings',
    icon: 'eye-off-outline',
    startScreen: 'CommunicationMistakesSec7Screen1',
  },
  {
    id: '8',
    number: '8',
    title: 'Others Have It Worse',
    description: 'Why comparisons hurt instead of help',
    icon: 'people-outline',
    startScreen: 'CommunicationMistakesSec8Screen1',
  },
  {
    id: '9',
    number: '9',
    title: 'Common Minimizing Phrases',
    description: 'Language patterns to avoid',
    icon: 'chatbubbles-outline',
    startScreen: 'CommunicationMistakesSec9Screen1',
  },
  {
    id: '10',
    number: '10',
    title: 'Another Common (but Surprising) Way to Hurt Relationships',
    description: 'An unexpected communication mistake',
    icon: 'help-circle-outline',
    startScreen: 'CommunicationMistakesSec10Screen1',
  },
  {
    id: '11',
    number: '11',
    title: 'More About "Solving" Too Early',
    description: 'Why rushing to fix can damage bonds',
    icon: 'construct-outline',
    startScreen: 'CommunicationMistakesSec11Screen1',
  },
  {
    id: '12',
    number: '12',
    title: "Dad's Final Mistakes",
    description: 'Cumulative errors in the scenario',
    icon: 'close-circle-outline',
    startScreen: 'CommunicationMistakesSec12Screen1',
  },
  {
    id: '13',
    number: '13',
    title: "So What's the Right Way to Do It?",
    description: 'Learning the proper approach',
    icon: 'checkmark-circle-outline',
    startScreen: 'CommunicationMistakesSec13Screen1',
  },
];

export default function CommunicationMistakesLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const [completedSections, setCompletedSections] = React.useState<string[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      const loadProgress = async () => {
        const completed = await createProgressStore(STORAGE_KEYS.COMMUNICATION_MISTAKES_COMPLETED_SECTIONS).getCompletedSections();
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
            <Text style={styles.mainIcon}>⚠️</Text>
          </View>
          <Text style={styles.label}>SKILL</Text>
          <Text style={styles.title}>Communication Mistakes</Text>
          <Text style={styles.description}>
            This lesson will give you examples of how NOT to build a deep bond with your loved one.
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>{completedSections.length}/13 Complete</Text>
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
                onPress={() => isAvailable && gateToLesson(`comms_${lesson.id}`, () => navigation.navigate('LessonScreen', { lessonId: 'communicationMistakes', sectionIndex: Number(lesson.id) - 1, screenIndex: 0, returnTo: 'CommunicationMistakesLesson' }))}
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
            <Ionicons name="school-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Learn from common mistakes to build stronger connections
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
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#E65100',
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
