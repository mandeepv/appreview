import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { LESSON_NAV } from '../navigation/lessonRoutes';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { useLessonGate } from '../hooks/useLessonGate';

interface LearningModule {
  id: string;
  icon: string;
  label: string;
  title: string;
  description: string;
  color: string;
}

const learningModules: LearningModule[] = [
  {
    id: '1',
    icon: '❤️',
    label: 'FOUNDATION',
    title: 'What changed parenting Science?',
    description: 'Learn how to deeply fuel their correcting behavior.',
    color: Colors.primaryTint, // All lessons use Soft Sage Teal tint
  },
  {
    id: '2',
    icon: '😊',
    label: 'WELLNESS',
    title: 'Happiness Chemicals',
    description: 'Happiness is really a set of chemicals in our body that we need to understand if we want to increase long term well being.',
    color: Colors.primaryTint,
  },
  {
    id: '3',
    icon: '🧠',
    label: 'HEALTH',
    title: 'The Long-Term Unhappiness Chemical',
    description: 'Which chemical should we focus on decreasing in ourselves and our children.',
    color: Colors.primaryTint,
  },
  {
    id: '4',
    icon: '💝',
    label: 'WELLNESS',
    title: 'The Long-Term Happiness Chemical',
    description: 'Which chemical should we focus on increasing in ourselves and our children?',
    color: Colors.primaryTint,
  },
  {
    id: '5',
    icon: '🏷️',
    label: 'FOUNDATION',
    title: 'The Importance of Labeling Emotions',
    description: 'This lesson will teach you why it is important to learn to label emotions and how to do it.',
    color: Colors.primaryTint,
  },
  {
    id: '6',
    icon: '📝',
    label: 'SKILL',
    title: 'Naming our Emotions',
    description: 'In this exercise you will recall past situations, name your emotions during that situation and explain the reasons you might have felt that way. Think of specific events, not general time periods of life.',
    color: Colors.primaryTint,
  },
  {
    id: '7',
    icon: '💧',
    label: 'FOUNDATION',
    title: 'Sprinklers: Building Deep Bonds',
    description: 'This lesson will teach you how to build deep bonds with loved ones by recognizing "sprinklers".',
    color: Colors.primaryTint,
  },
  {
    id: '8',
    icon: '🛡️',
    label: 'SKILL',
    title: 'Emotional Sandbags',
    description: 'Now that we know the importance of labeling emotions, how do we use this knowledge to help our relationships?',
    color: Colors.primaryTint,
  },
  {
    id: '9',
    icon: '⚠️',
    label: 'SKILL',
    title: 'Communication Mistakes',
    description: 'This lesson will give you examples of how NOT to build a deep bond with your loved one.',
    color: Colors.primaryTint,
  },
  {
    id: '10',
    icon: '🤲',
    label: 'SKILL',
    title: 'Helping Someone Process Emotions',
    description: 'How should we help our upset loved ones?',
    color: Colors.primaryTint,
  },
  {
    id: '11',
    icon: '🌫️',
    label: 'FOUNDATION',
    title: 'Dissociation',
    description: 'This lesson will train you in an important concept called dissociation. This frequently happens with our loved ones.',
    color: Colors.primaryTint,
  },
  {
    id: '12',
    icon: '🔄',
    label: 'SKILL',
    title: 'Serve and Return',
    description: 'This lesson will teach you a simple communication technique that improves well-being.',
    color: Colors.primaryTint,
  },
  {
    id: '13',
    icon: '📸',
    label: 'WELLNESS',
    title: 'Recording Deep Bond Moments',
    description: 'This lesson will change the way you think about recording memories.',
    color: Colors.primaryTint,
  },
];

// LESSON_NAV (lesson ID → navigation target) now lives in
// src/navigation/lessonRoutes.ts so it can be unit-tested without importing
// this component. Behavior here is unchanged — same lookup, same targets.

export default function LearnScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const posthog = usePostHog();
  const { gateToLesson } = useLessonGate();

  const handleModulePress = (moduleId: string) => {
    const module = learningModules.find((m) => m.id === moduleId);
    const props = {
      lesson_id: moduleId,
      lesson_title: module?.title ?? null,
      lesson_label: module?.label ?? null,
    };

    // Two events, two questions.
    //   lesson_tapped fires on TAP — the honest top-of-funnel signal
    //   (how many people even try to open this lesson).
    //   lesson_started fires only after gateToLesson lets us through
    //   — the honest "content actually opened" metric.
    // Prior code fired lesson_started on tap, so paywall bounces
    // counted as lesson starts. Funnel analysis was misleading.
    // Fable review #8.
    posthog.capture('lesson_tapped', props);

    gateToLesson(`learn_module_${moduleId}`, () => {
      const target = LESSON_NAV[moduleId];
      if (!target) return;
      posthog.capture('lesson_started', props);
      if (target.kind === 'data') {
        // Flow lessons (1-4): launch the generic data-driven lesson directly.
        // Single section, first screen; return to MainTabs on completion.
        navigation.navigate('LessonScreen', {
          lessonId: target.lessonId,
          sectionIndex: 0,
          screenIndex: 0,
          returnTo: 'MainTabs',
        });
      } else {
        navigation.navigate(target.name);
      }
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What You'll Learn</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder}>
          <Text style={styles.illustrationEmoji}>👨‍👩‍👧‍👦</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Growth Path</Text>
        <Text style={styles.subtitle}>
          Short, 5-minute daily lessons designed for busy parents.
        </Text>
      </View>

      <View style={styles.modulesContainer}>
        {learningModules.map((module) => {
          // SPEC-13 R3: every lesson is launchable — the old always-true
          // 13-clause `isClickable` chain (and its dead disabled / "Coming Soon"
          // branches) is removed. Every card is a tappable TouchableOpacity.
          return (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: module.color }]}>
                <Text style={styles.moduleIcon}>{module.icon}</Text>
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleLabel}>{module.label}</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Content is educational and based on child development research. Not medical or therapeutic advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  illustrationContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  illustrationPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 80,
  },
  titleSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modulesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  moduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  moduleIcon: {
    fontSize: 24,
  },
  moduleContent: {
    flex: 1,
  },
  moduleLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  disclaimerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.7,
  },
});
