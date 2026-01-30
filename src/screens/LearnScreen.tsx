import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';

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

export default function LearnScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleModulePress = (moduleId: string) => {
    if (moduleId === '1') {
      // Navigate to Lesson 1
      navigation.navigate('LessonFlow', { screen: 'Lesson1Screen1' });
    } else if (moduleId === '2') {
      // Navigate to Lesson 2
      navigation.navigate('LessonFlow', { screen: 'Lesson2Screen1' });
    } else if (moduleId === '3') {
      // Navigate to Lesson 3
      navigation.navigate('LessonFlow', { screen: 'Lesson3Screen1' });
    } else if (moduleId === '4') {
      // Navigate to Lesson 4
      navigation.navigate('LessonFlow', { screen: 'Lesson4Screen1' });
    } else if (moduleId === '5') {
      // Navigate to Labeling Emotions lesson overview
      navigation.navigate('LabelingEmotionsLesson');
    } else if (moduleId === '6') {
      // Navigate to Naming our Emotions lesson overview
      navigation.navigate('NamingOurEmotionsLesson');
    } else if (moduleId === '7') {
      // Navigate to Sprinklers lesson overview
      navigation.navigate('SprinklersLesson');
    } else if (moduleId === '8') {
      // Navigate to Emotional Sandbags lesson overview
      navigation.navigate('EmotionalSandbagsLesson');
    } else if (moduleId === '9') {
      // Navigate to Communication Mistakes lesson overview
      navigation.navigate('CommunicationMistakesLesson');
    } else if (moduleId === '10') {
      // Navigate to Helping Someone Process Emotions lesson overview
      navigation.navigate('HelpingSomeoneProcessEmotionsLesson');
    } else if (moduleId === '11') {
      // Navigate to Dissociation lesson overview
      navigation.navigate('DissociationLesson');
    } else if (moduleId === '12') {
      // Navigate to Serve and Return lesson overview
      navigation.navigate('ServeAndReturnLesson');
    } else if (moduleId === '13') {
      // Navigate to Recording Deep Bond Moments lesson overview
      navigation.navigate('RecordingDeepBondMomentsLesson');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What You'll Learn</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationPlaceholder}>
          <Text style={styles.illustrationEmoji}>👩‍👦</Text>
        </View>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Growth Path</Text>
        <Text style={styles.subtitle}>
          Short, 5-minute daily lessons designed for busy moms.
        </Text>
      </View>

      <View style={styles.modulesContainer}>
        {learningModules.map((module) => {
          const isClickable = module.id === '1' || module.id === '2' || module.id === '3' || module.id === '4' || module.id === '5' || module.id === '6' || module.id === '7' || module.id === '8' || module.id === '9' || module.id === '10' || module.id === '11' || module.id === '12' || module.id === '13'; // All lessons are clickable
          const CardWrapper = isClickable ? TouchableOpacity : View;

          return (
            <CardWrapper
              key={module.id}
              style={[
                styles.moduleCard,
                !isClickable && styles.moduleCardDisabled
              ]}
              onPress={isClickable ? () => handleModulePress(module.id) : undefined}
              activeOpacity={isClickable ? 0.7 : 1}
            >
              <View style={[styles.iconCircle, { backgroundColor: module.color }]}>
                <Text style={styles.moduleIcon}>{module.icon}</Text>
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleLabel}>{module.label}</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
              {!isClickable && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </CardWrapper>
          );
        })}
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
  moduleCardDisabled: {
    opacity: 0.6,
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
  comingSoonBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.accent, // Muted Sky Blue
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
});
