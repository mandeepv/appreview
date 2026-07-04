import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePostHog } from 'posthog-react-native';
import { usePlacement } from 'expo-superwall';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { Colors, Typography, Shadows, BorderRadius } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { safeCapture } from '../lib/analytics';
import { reportError } from '../config/sentry';

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

// Mapping of lesson ID to its navigation target. Kept as a plain lookup so the
// handler doesn't need a giant if/else and unit tests can assert coverage.
type LessonNavTarget =
  | { kind: 'flow'; screen: 'Lesson1Screen1' | 'Lesson2Screen1' | 'Lesson3Screen1' | 'Lesson4Screen1' }
  | { kind: 'screen'; name: keyof RootStackParamList };

const LESSON_NAV: Record<string, LessonNavTarget> = {
  '1': { kind: 'flow', screen: 'Lesson1Screen1' },
  '2': { kind: 'flow', screen: 'Lesson2Screen1' },
  '3': { kind: 'flow', screen: 'Lesson3Screen1' },
  '4': { kind: 'flow', screen: 'Lesson4Screen1' },
  '5': { kind: 'screen', name: 'LabelingEmotionsLesson' },
  '6': { kind: 'screen', name: 'NamingOurEmotionsLesson' },
  '7': { kind: 'screen', name: 'SprinklersLesson' },
  '8': { kind: 'screen', name: 'EmotionalSandbagsLesson' },
  '9': { kind: 'screen', name: 'CommunicationMistakesLesson' },
  '10': { kind: 'screen', name: 'HelpingSomeoneProcessEmotionsLesson' },
  '11': { kind: 'screen', name: 'DissociationLesson' },
  '12': { kind: 'screen', name: 'ServeAndReturnLesson' },
  '13': { kind: 'screen', name: 'RecordingDeepBondMomentsLesson' },
};

export default function LearnScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const posthog = usePostHog();
  const isDemoUser = useAuthStore(state => state.isDemoUser);

  // Superwall-owned entitlement gate. usePlacement fires `feature()` ONLY when
  // Superwall confirms the user has the `pro` entitlement (see Superwall
  // dashboard: campaign "Onboarding Paywall", placement "show_paywall",
  // entitlements "Show to unsubscribed users"). Non-entitled users see the
  // paywall; dismissing it does NOT call `feature()`, so there is no way to
  // reach lesson content without an active entitlement.
  const { registerPlacement } = usePlacement({
    onError: (err) => {
      const error = new Error(typeof err === 'string' ? err : 'Paywall error');
      if (__DEV__) console.error('[LearnScreen] paywall error:', err);
      reportError(error, { screen: 'LearnScreen', context: 'lesson_gate' });
    },
  });

  // Navigate to the actual lesson content. Called only after Superwall has
  // confirmed the user is entitled (or after demo-mode short-circuit).
  const navigateToLesson = (moduleId: string) => {
    const target = LESSON_NAV[moduleId];
    if (!target) return;
    if (target.kind === 'flow') {
      navigation.navigate('LessonFlow', { screen: target.screen });
    } else {
      // TypeScript can't narrow the union to a valid navigate() signature here;
      // the lookup table restricts `name` to known screens on RootStackParamList.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigation.navigate(target.name as any);
    }
  };

  const handleModulePress = async (moduleId: string) => {
    const module = learningModules.find((m) => m.id === moduleId);
    posthog.capture('lesson_started', {
      lesson_id: moduleId,
      lesson_title: module?.title ?? null,
      lesson_label: module?.label ?? null,
    });

    // Demo mode short-circuit — Apple reviewers get direct access with no
    // Superwall check. See docs/DEMO_MODE.md.
    if (isDemoUser) {
      navigateToLesson(moduleId);
      return;
    }

    try {
      await registerPlacement({
        placement: 'show_paywall',
        params: { source: 'lesson_tap', lesson_id: moduleId },
        feature() {
          // Runs only if user is entitled (already subscribed OR just purchased).
          // Superwall guarantees this doesn't run on paywall dismiss.
          if (__DEV__) console.log('[LearnScreen] entitlement confirmed, opening lesson', moduleId);
          navigateToLesson(moduleId);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('registerPlacement failed');
      if (__DEV__) console.error('[LearnScreen] registerPlacement threw:', error);
      reportError(error, { screen: 'LearnScreen', context: 'register_placement', lesson_id: moduleId });
      safeCapture('lesson_gate_error', { lesson_id: moduleId, error: error.message });
      // Do NOT navigate on failure. Better UX: user taps again. Better safety:
      // no path to paid content that isn't gated by Superwall.
    }
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
