import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';

interface SubLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const subLessons: SubLesson[] = [
  {
    id: '1',
    number: '1',
    title: 'Introduction to the lesson',
    description: 'Understanding how to support upset loved ones',
    icon: 'information-circle-outline',
  },
  {
    id: '2',
    number: '2',
    title: 'Scenario - The sleepover - take two',
    description: 'A practical example of effective emotional support',
    icon: 'moon-outline',
  },
];

export default function HelpingSomeoneProcessEmotionsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
            <Text style={styles.mainIcon}>🤲</Text>
          </View>
          <Text style={styles.label}>SKILL</Text>
          <Text style={styles.title}>Helping Someone Process Emotions</Text>
          <Text style={styles.description}>
            How should we help our upset loved ones?
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Lesson Modules</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressText}>0/2 Complete</Text>
            </View>
          </View>
        </View>

        {/* Sub Lessons */}
        <View style={styles.lessonsContainer}>
          {subLessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.lessonCard}>
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
                      color={Colors.textTertiary}
                      style={styles.lessonIcon}
                    />
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  </View>
                  <Text style={styles.lessonDescription}>{lesson.description}</Text>
                </View>

                {/* Coming Soon Badge */}
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <Ionicons name="heart-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Master the art of being present for those you love
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
