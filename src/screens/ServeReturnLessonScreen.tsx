import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, BorderRadius } from '../constants/theme';
import { LessonStackParamList } from '../navigation/LessonNavigator';
import { getCompletedSections } from '../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnLesson'>;

interface SubLesson {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  startScreen?: keyof LessonStackParamList;
}

export const ServeReturnLessonScreen: React.FC<Props> = ({ navigation }) => {
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
      title: 'What Is Serve & Return?',
      description: 'Understanding the back-and-forth of connection',
      icon: 'chatbubble-outline',
      startScreen: 'ServeReturnSec1Screen1',
    },
    {
      id: '2',
      number: '2',
      title: 'Why Serve & Return Matters',
      description: 'How responsiveness shapes relationships',
      icon: 'heart-outline',
      startScreen: 'ServeReturnSec2Screen1',
    },
    {
      id: '3',
      number: '3',
      title: 'Serve & Return in Everyday Relationships',
      description: 'Applying it beyond early childhood',
      icon: 'people-outline',
      startScreen: 'ServeReturnSec3Screen1',
    },
  ];

  const handleSubLessonPress = (subLesson: SubLesson) => {
    if (subLesson.startScreen) {
      navigation.navigate(subLesson.startScreen as any);
    }
  };

  const isSubLessonComplete = (subLessonId: string) => {
    return completedSections.includes(subLessonId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🔄</Text>
          </View>
          <Text style={styles.title}>Serve & Return</Text>
          <Text style={styles.subtitle}>
            The back-and-forth that builds all meaningful relationships
          </Text>
        </View>

        <View style={styles.subLessonsContainer}>
          {subLessons.map((subLesson) => {
            const isComplete = isSubLessonComplete(subLesson.id);
            const isAvailable = subLesson.startScreen !== undefined;

            return (
              <TouchableOpacity
                key={subLesson.id}
                style={[
                  styles.subLessonCard,
                  !isAvailable && styles.subLessonCardDisabled,
                ]}
                onPress={() => isAvailable && handleSubLessonPress(subLesson)}
                disabled={!isAvailable}
              >
                <View style={styles.subLessonIconContainer}>
                  <Ionicons
                    name={subLesson.icon}
                    size={28}
                    color={isAvailable ? Colors.primary : Colors.textTertiary}
                  />
                </View>

                <View style={styles.subLessonContent}>
                  <View style={styles.subLessonHeader}>
                    <Text style={styles.subLessonNumber}>
                      Section {subLesson.number}
                    </Text>
                    {isComplete && (
                      <View style={styles.completeBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.success}
                        />
                        <Text style={styles.completeText}>Done</Text>
                      </View>
                    )}
                    {!isAvailable && (
                      <View style={styles.soonBadge}>
                        <Text style={styles.soonText}>Soon</Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.subLessonTitle,
                      !isAvailable && styles.subLessonTitleDisabled,
                    ]}
                  >
                    {subLesson.title}
                  </Text>

                  <Text
                    style={[
                      styles.subLessonDescription,
                      !isAvailable && styles.subLessonDescriptionDisabled,
                    ]}
                  >
                    {subLesson.description}
                  </Text>
                </View>

                {isAvailable && (
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={Colors.textTertiary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: Typography.weights.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  subLessonsContainer: {
    gap: 16,
  },
  subLessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    gap: 16,
  },
  subLessonCardDisabled: {
    opacity: 0.5,
  },
  subLessonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subLessonContent: {
    flex: 1,
    gap: 4,
  },
  subLessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subLessonNumber: {
    fontSize: 12,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  completeText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
  },
  soonBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  soonText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
  },
  subLessonTitle: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  subLessonTitleDisabled: {
    color: Colors.textSecondary,
  },
  subLessonDescription: {
    fontSize: 14,
    fontWeight: Typography.weights.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  subLessonDescriptionDisabled: {
    color: Colors.textTertiary,
  },
});
