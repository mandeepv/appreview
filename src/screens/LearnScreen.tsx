import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeCapture } from '../lib/analytics';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { LESSON_NAV } from '../navigation/lessonRoutes';
import { Colors, Typography, Shadows, BorderRadius, Spacing } from '../constants/theme';
import { useLessonGate } from '../hooks/useLessonGate';
import { useAuthStore } from '../store/authStore';
import { getLesson } from '../lessons/registry';
import {
  LESSON_PATH,
  resolveUnlockState,
  resolveLessonTap,
  type LessonUnlockState,
} from '../lessons/unlockPolicy';

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

// LESSON_NAV (lesson ID → navigation target) lives in
// src/navigation/lessonRoutes.ts; LESSON_PATH (canonical slug order) + the
// locking rules live in src/lessons/unlockPolicy.ts. This screen joins the two
// with the display metadata above and renders the resolved state.

// Module id → slug (via LESSON_NAV). The module ids are '1'..'13' in path order,
// so index i of LESSON_PATH corresponds to module id String(i+1).
const SLUG_BY_MODULE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(LESSON_NAV).map(([id, target]) => [id, target.slug]),
);

interface LessonProgress {
  completedBySlug: Record<string, boolean>;
  hasProgressBySlug: Record<string, boolean>;
  // slug → "n/m sections" for the subtle in-progress affordance (partial only).
  partialBySlug: Record<string, { done: number; total: number }>;
}

/**
 * Read every path lesson's completed-section array from AsyncStorage (local-
 * first, no network — same keys the progress factory writes) and derive the maps
 * the policy consumes. Flow lessons now have keys too (SPEC-18 R1), so they
 * participate. Lessons without a storageKey (none, post-R1, on the path) simply
 * report no progress.
 */
async function readLessonProgress(): Promise<LessonProgress> {
  const completedBySlug: Record<string, boolean> = {};
  const hasProgressBySlug: Record<string, boolean> = {};
  const partialBySlug: Record<string, { done: number; total: number }> = {};

  await Promise.all(
    LESSON_PATH.map(async (slug) => {
      const lesson = getLesson(slug);
      if (!lesson?.storageKey) return;
      try {
        const stored = await AsyncStorage.getItem(lesson.storageKey);
        const done: string[] = stored ? JSON.parse(stored) : [];
        const total = lesson.sections.length;
        hasProgressBySlug[slug] = done.length > 0;
        completedBySlug[slug] = done.length >= total;
        if (done.length > 0 && done.length < total) {
          partialBySlug[slug] = { done: done.length, total };
        }
      } catch {
        // A read/parse failure is treated as "no progress" for this lesson —
        // never throws, never blocks the render.
      }
    }),
  );

  return { completedBySlug, hasProgressBySlug, partialBySlug };
}

export default function LearnScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const { user, isDemoUser } = useAuthStore();

  const [progress, setProgress] = useState<LessonProgress>({
    completedBySlug: {},
    hasProgressBySlug: {},
    partialBySlug: {},
  });

  // Recompute on every focus: AsyncStorage reads are local-first, so returning
  // to the path after finishing a lesson unlocks the next one with no restart
  // (the SPEC-18 device-test contract). Guard setState against an unmount.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      readLessonProgress().then((p) => {
        if (active) setProgress(p);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const unlockState = resolveUnlockState({
    signupDateIso: user?.created_at ?? null,
    isDemoUser,
    completedBySlug: progress.completedBySlug,
    hasProgressBySlug: progress.hasProgressBySlug,
  });

  const handleModulePress = (moduleId: string, state: LessonUnlockState) => {
    const module = learningModules.find((m) => m.id === moduleId);
    const target = LESSON_NAV[moduleId];
    const slug = target?.slug ?? moduleId;

    const action = resolveLessonTap(slug, state);
    if (action.kind === 'blocked') {
      // Locked cards do NOT navigate. Fire the demand signal (how hard users
      // push on the lock) and give gentle in-place feedback — never a paywall,
      // never a dead tap. blocking_lesson_id names the predecessor gating it.
      safeCapture('lesson_locked_tapped', { lesson_id: slug, blocking_lesson_id: action.blockingSlug });
      shake();
      return;
    }

    // SPEC-FIX-03 R4: send the registry SLUG as `lesson_id` so the tapped →
    // started funnel joins (engine events also key on the slug). The numeric
    // module id is kept as a secondary `lesson_number` so nothing is lost.
    const props = {
      lesson_id: slug,
      lesson_number: moduleId,
      lesson_title: module?.title ?? null,
      lesson_label: module?.label ?? null,
    };

    // Two events, two questions. lesson_tapped fires on TAP (honest top of
    // funnel); lesson_started fires from the engine at the true "opened" moment.
    // Firing it here too would double-count, so it's not fired here.
    safeCapture('lesson_tapped', props);

    gateToLesson(`learn_module_${moduleId}`, () => {
      if (!target) return;
      if (target.kind === 'data') {
        // Flow lessons (1-4): launch the generic data-driven lesson directly.
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

  // A single shared shake animation reused for whichever locked card was tapped
  // — a subtle "nope" nudge rather than navigating. Transform only. Held in
  // useState (created once) rather than a ref so it can be read during render
  // and passed to a child without tripping react-hooks/refs.
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const shake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>What You'll Learn</Text>
      </View>

      <View style={styles.titleSection}>
        <Text style={styles.title}>Your Growth Path</Text>
        <Text style={styles.subtitle}>
          Short, 5-minute daily lessons designed for busy parents.
        </Text>
      </View>

      <View style={styles.modulesContainer}>
        {learningModules.map((module, index) => {
          const slug = SLUG_BY_MODULE_ID[module.id] ?? module.id;
          const state: LessonUnlockState = unlockState[slug] ?? 'unlocked';
          const locked = state === 'locked';
          const completed = state === 'completed';
          // The lesson that gates a locked card is its immediate predecessor.
          const blockingTitle = locked && index > 0 ? learningModules[index - 1].title : null;
          const partial = progress.partialBySlug[slug];

          return (
            <LessonCard
              key={module.id}
              module={module}
              state={state}
              locked={locked}
              completed={completed}
              blockingTitle={blockingTitle}
              partial={partial}
              shakeAnim={shakeAnim}
              onPress={() => handleModulePress(module.id, state)}
            />
          );
        })}

        {/* "More lessons coming" — a terminal path node styled as a FUTURE step,
            not an empty/error state. The path continues; the app is not done. */}
        <View style={styles.comingCard}>
          <View style={styles.comingIconCircle}>
            <Ionicons name="add" size={22} color={Colors.primary} />
          </View>
          <View style={styles.moduleContent}>
            <Text style={styles.comingLabel}>MORE ON THE WAY</Text>
            <Text style={styles.comingTitle}>New lessons are on the way</Text>
            <Text style={styles.comingDescription}>
              We add to your path regularly — check back for the next step in your journey.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>
          Content is educational and based on child development research. Not medical or therapeutic advice.
        </Text>
      </View>
    </ScrollView>
  );
}

interface LessonCardProps {
  module: LearningModule;
  state: LessonUnlockState;
  locked: boolean;
  completed: boolean;
  blockingTitle: string | null;
  partial?: { done: number; total: number };
  shakeAnim: Animated.Value;
  onPress: () => void;
}

const LessonCard: React.FC<LessonCardProps> = ({
  module,
  locked,
  completed,
  blockingTitle,
  partial,
  shakeAnim,
  onPress,
}) => {
  const translateX = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-6, 6] });

  const card = (
    <TouchableOpacity
      style={[styles.moduleCard, locked && styles.moduleCardLocked, completed && styles.moduleCardCompleted]}
      onPress={onPress}
      activeOpacity={locked ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: false }}
      accessibilityLabel={
        locked
          ? `${module.title}, locked. ${blockingTitle ? `Finish ${blockingTitle} to unlock.` : ''}`
          : module.title
      }
    >
      <View style={[styles.iconCircle, { backgroundColor: locked ? Colors.borderLight : module.color }]}>
        {locked ? (
          <Ionicons name="lock-closed" size={20} color={Colors.textMuted} />
        ) : completed ? (
          <Ionicons name="checkmark" size={22} color={Colors.primary} />
        ) : (
          <Text style={styles.moduleIcon}>{module.icon}</Text>
        )}
      </View>
      <View style={styles.moduleContent}>
        <Text style={[styles.moduleLabel, locked && styles.mutedText]}>{module.label}</Text>
        <Text style={[styles.moduleTitle, locked && styles.mutedTitle]}>{module.title}</Text>
        <Text style={[styles.moduleDescription, locked && styles.mutedText]}>{module.description}</Text>

        {/* State affordances */}
        {completed && (
          <View style={styles.stateRow}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
            <Text style={styles.completedText}>Completed · tap to replay</Text>
          </View>
        )}
        {!completed && !locked && partial && (
          <View style={styles.stateRow}>
            <Text style={styles.continueText}>Continue · {partial.done}/{partial.total} sections</Text>
          </View>
        )}
        {locked && blockingTitle && (
          <View style={styles.stateRow}>
            <Ionicons name="lock-closed" size={12} color={Colors.textMuted} />
            <Text style={styles.lockedHint}>Finish "{blockingTitle}" to unlock</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Only the (shared) shake wrapper animates; unlocked cards render statically.
  if (locked) {
    return <Animated.View style={{ transform: [{ translateX }] }}>{card}</Animated.View>;
  }
  return card;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  contentContainer: {
    paddingBottom: Spacing['3xl'],
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  titleSection: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modulesContainer: {
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.lg,
  },
  moduleCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadows.md,
  },
  moduleCardCompleted: {
    borderWidth: 1.5,
    borderColor: Colors.primaryAccent,
  },
  moduleCardLocked: {
    backgroundColor: Colors.backgroundGray,
    // Locked cards read as inert: no elevation, muted surface, subtle border.
    ...Shadows.none,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  moduleIcon: {
    fontSize: Typography.sizes['2xl'],
  },
  moduleContent: {
    flex: 1,
  },
  moduleLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  mutedText: {
    color: Colors.textMuted,
  },
  mutedTitle: {
    color: Colors.textMuted,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  completedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  continueText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  lockedHint: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  comingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primaryAccent,
    backgroundColor: 'transparent',
  },
  comingIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
    backgroundColor: Colors.primaryBg,
  },
  comingLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  comingTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  comingDescription: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  disclaimerContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
    opacity: 0.7,
  },
});
