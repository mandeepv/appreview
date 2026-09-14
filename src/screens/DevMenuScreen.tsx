import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../navigation/OnboardingNavigator';
import { Colors, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { reportError } from '../config/sentry';
import { useOnboardingStore } from '../store/onboardingStore';
import { PATH_NODES } from '../lessons/units';
import { getLesson } from '../lessons/registry';
import { createProgressStore } from '../lessons/progressStore';
import { markLessonCompleted, clearCompletedLessons } from '../lessons/lessonCompletion';
// seedStreakForDev is parked with the streak UI. recordActiveDay and
// clearStreak stay: days keep being recorded while the pill is dark, so the
// reset button still has to be able to wipe them.
import { clearStreak, recordActiveDay } from '../lessons/streak';

export const DevMenuScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  const { clearState, updateUserType, updateChildrenCount, updateChildAgeRange, toggleImprovementGoal } =
    useOnboardingStore();
  const improvementGoals = useOnboardingStore((state) => state.improvementGoals);

  /**
   * Wipes the persisted onboarding state so the next launch behaves like a
   * fresh install.
   *
   * Why this exists: SplashScreen resumes an interrupted signup by replacing
   * itself with the deepest screen reached (SPEC-08), which is correct for
   * users but makes the flow impossible to re-walk while developing — every
   * reload drops you back where you were. clearState() removes the three
   * onboarding keys (state, last screen, has-reached-auth), so Splash takes
   * the first_open branch instead.
   *
   * Note this only clears DEVICE state. A signed-in account with a saved
   * profile row in Supabase still routes to the gate rather than onboarding —
   * sign out as well to walk the whole flow from a clean slate.
   */
  const handleRestartOnboarding = async () => {
    await clearState();
    Alert.alert(
      'Onboarding reset',
      'Device onboarding state cleared. Starting from the beginning.',
      [{ text: 'OK', onPress: () => navigation.replace('Welcome') }],
    );
  };

  /**
   * Runs the plan-building theater, which is otherwise near-impossible to see.
   *
   * LoadingScreen only plays it when `onboardingStore.userType !== null` — the
   * signal that the user just finished onboarding this session. Reaching the
   * screen any other way starts at 100 and goes straight to the gate, which is
   * deliberate: a signed-in user hits this screen on EVERY launch, and a
   * four-second bar each time would be maddening.
   *
   * So this seeds a plausible family first, which also exercises the
   * personalised task copy ("a 4- and 7-year-old", "tantrums and sibling
   * fights") rather than the generic fallbacks.
   *
   * Idempotent: press it as often as you like and the seed stays the same.
   */
  const handleRunPlanTheater = () => {
    updateUserType('mother');
    updateChildrenCount(2);
    updateChildAgeRange(0, '2-4');
    updateChildAgeRange(1, '5-7');
    // toggleImprovementGoal FLIPS, so calling it blind would clear the goals on
    // the second press and the run would fall back to generic copy. Seed only
    // what is missing, so the button can be pressed as many times as you like.
    (['tantrums', 'less-fighting'] as const).forEach((goal) => {
      if (!improvementGoals.includes(goal)) toggleImprovementGoal(goal);
    });
    navigation.navigate('Loading');
  };

  /**
   * Unlock the path up to a given node so the locked rail can be walked.
   *
   * The path is sequentially locked, so inspecting node 20 otherwise means
   * finishing nineteen sections first. This writes real completion through the
   * same per-lesson stores the app reads, rather than a dev-only bypass — what
   * you see afterwards is exactly what a parent at that point would see.
   */
  const unlockPathTo = async (count: number, opts?: { silent?: boolean }) => {
    // Start from a clean slate. Unlocking to 3 after having unlocked to 25 used
    // to leave the earlier 25 written, so the card stayed at 26 and the button
    // looked broken — completion is a SET, and these writes only ever added.
    await resetPathStores();
    const nodes = PATH_NODES.slice(0, count);
    for (const node of nodes) {
      const lesson = getLesson(node.lessonSlug);
      if (lesson?.storageKey) {
        await createProgressStore(lesson.storageKey).markSectionComplete(node.sectionId);
      } else {
        // Flow lessons 1-4 keep completion in the whole-lesson record.
        await markLessonCompleted(node.lessonSlug);
      }
    }
    await recordActiveDay();
    if (opts?.silent) return;
    Alert.alert(
      'Path unlocked',
      `${count} of ${PATH_NODES.length} sections marked complete. Open Learn to see it.`,
      [{ text: 'OK', onPress: () => navigation.navigate('Root') }],
    );
  };

  /** Clear every completion store. Shared by reset and by each unlock. */
  const resetPathStores = async () => {
    for (const slug of new Set(PATH_NODES.map((n) => n.lessonSlug))) {
      const lesson = getLesson(slug);
      if (lesson?.storageKey) {
        await createProgressStore(lesson.storageKey).reset();
      }
    }
    await clearCompletedLessons();
  };

  /**
   * Leave exactly one section unfinished, mid-path.
   *
   * This is the setup for the bug that made the card stick: finish the lesson
   * this drops you on, come back, and the card must have MOVED to the next
   * section. Reaching this state by hand meant walking twenty sections.
   */
  const unlockToPenultimate = async (count: number) => {
    await unlockPathTo(count - 1, { silent: true });
    Alert.alert(
      'Ready',
      `Sections 1-${count - 1} done. Open Learn, finish the card, come back — it must advance to section ${count + 1}.`,
      [{ text: 'OK', onPress: () => navigation.navigate('Root') }],
    );
  };

  /**
   * Completion with GAPS in it — node 1, 9 and 21 done, nothing between.
   *
   * Reachable in the wild through a deep link or an older build. The card must
   * land on the earliest gap (section 2), NOT after the highest finished node,
   * and the rail must still render it.
   */
  const unlockOutOfOrder = async () => {
    await resetPathStores();
    for (const node of [PATH_NODES[0], PATH_NODES[8], PATH_NODES[20]]) {
      const lesson = getLesson(node.lessonSlug);
      if (lesson?.storageKey) {
        await createProgressStore(lesson.storageKey).markSectionComplete(node.sectionId);
      } else {
        await markLessonCompleted(node.lessonSlug);
      }
    }
    Alert.alert(
      'Out-of-order progress written',
      'Sections 1, 9 and 21 are done with gaps between. Learn must offer section 2 — the earliest gap.',
      [{ text: 'OK', onPress: () => navigation.navigate('Root') }],
    );
  };

  /* PARKED FOR v-NEXT — streak seeding, with the pill itself.

  const seedStreak = async (days: number) => {
    await seedStreakForDev(days);
    Alert.alert('Streak seeded', `${days} consecutive days. The pill should show ${days}.`, [
      { text: 'OK', onPress: () => navigation.navigate('Root') },
    ]);
  };

  const seedLapsedStreak = async () => {
    await seedStreakForDev(3, 5);
    Alert.alert(
      'Lapsed streak',
      'Three days finished, then five missed. The pill should show 0 with the flame dimmed.',
      [{ text: 'OK', onPress: () => navigation.navigate('Root') }],
    );
  };
  */

  /** Back to a brand-new user: nothing finished, locked at node 1. */
  const resetPath = async () => {
    await resetPathStores();
    // Active days are still recorded while the streak UI is parked, so they
    // have to be cleared here too — otherwise "brand-new user" leaves a day
    // history behind that would reappear the moment the pill comes back.
    await clearStreak();
    Alert.alert('Path reset', 'Every section is unfinished again.', [
      { text: 'OK', onPress: () => navigation.navigate('Root') },
    ]);
  };

  /**
   * Open the REAL lesson screen, the one a parent gets.
   *
   * These buttons used to go to `LessonPreview` — a SPEC-09 harness that drives
   * the hub and controller itself, outside the navigator. It renders, so the
   * buttons looked fine, but it is not the shipping screen: no real navigation,
   * no gate, and its own back behaviour.
   *
   * DevMenu is in the ONBOARDING stack while LessonScreen lives in
   * RootNavigator, so this has to go through 'Root' and name the nested screen
   * rather than navigating to it directly.
   */
  const openLesson = (slug: string) => {
    navigation.navigate('Root', {
      screen: 'LessonScreen',
      params: { lessonId: slug, sectionIndex: 0, screenIndex: 0, returnTo: 'MainTabs' },
    } as never);
  };

  const handleThrowTestError = () => {
    reportError(new Error(`Sentry test error @ ${new Date().toISOString()}`), {
      source: 'DevMenu',
      trigger: 'manual_test',
    });
    Alert.alert(
      'Test error sent',
      'Check Sentry dashboard — should appear in ~30 seconds. Filter by environment=dev.',
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator
    >
      <View>
        <View style={styles.header}>
          <Text style={styles.emoji}>🛠️</Text>
          <Text style={styles.title}>Developer Menu</Text>
          <Text style={styles.subtitle}>Choose where to start</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Splash')}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Splash Screen</Text>
              <Text style={styles.buttonDescription}>View the app splash/intro screen</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Loading')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="hourglass-outline" size={32} color="#FF9800" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Creating Lessons Screen</Text>
              <Text style={styles.buttonDescription}>Progress bar and lesson creation</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Root')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="book-outline" size={32} color="#4CAF50" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Skip to Main App</Text>
              <Text style={styles.buttonDescription}>Go directly to the learning screen</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* SPEC-09: preview the data-driven lesson engine (Sprinklers pilot)
              side-by-side against the hand-built version. Dev-only. */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => openLesson('sprinklers')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F2F1' }]}>
              <Ionicons name="flask-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Open Sprinklers</Text>
              <Text style={styles.buttonDescription}>The real lesson screen, section 1</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => openLesson('recordingDeepBondMoments')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F2F1' }]}>
              <Ionicons name="flask-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Open Recording Moments</Text>
              <Text style={styles.buttonDescription}>The real lesson screen, section 1</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.variantSection}>
          <Text style={styles.variantHeader}>Onboarding</Text>
          <TouchableOpacity style={styles.variantBtn} onPress={handleRestartOnboarding}>
            <Text style={styles.variantBtnText}>Restart onboarding from screen 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.variantBtn} onPress={handleRunPlanTheater}>
            <Text style={styles.variantBtnText}>Play &quot;building your plan&quot; (4s)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.variantSection}>
          <Text style={styles.variantHeader}>Learn path ({PATH_NODES.length} sections)</Text>
          <TouchableOpacity style={styles.variantBtn} onPress={resetPath}>
            <Text style={styles.variantBtnText}>Reset — locked at section 1</Text>
          </TouchableOpacity>
          {[3, 10, 25, PATH_NODES.length - 1].map((n) => (
            <TouchableOpacity key={n} style={styles.variantBtn} onPress={() => unlockPathTo(n)}>
              <Text style={styles.variantBtnText}>{`Unlock through section ${n}`}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.variantBtn}
            onPress={() => unlockPathTo(PATH_NODES.length)}
          >
            <Text style={styles.variantBtnText}>Finish the whole path</Text>
          </TouchableOpacity>
        </View>

        {/* The states that broke. Each one is a specific regression: the card
            not advancing, the card landing in the wrong place, and the pill
            that could not be seen at all. */}
        <View style={styles.variantSection}>
          <Text style={styles.variantHeader}>Learn path — edge cases</Text>
          <TouchableOpacity style={styles.variantBtn} onPress={() => unlockToPenultimate(20)}>
            <Text style={styles.variantBtnText}>
              One section from 20 — finish it, card must advance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.variantBtn} onPress={unlockOutOfOrder}>
            <Text style={styles.variantBtnText}>Out-of-order (1, 9, 21) — card must be at 2</Text>
          </TouchableOpacity>
          {/* PARKED FOR v-NEXT — the three streak buttons, with the pill.
          <TouchableOpacity style={styles.variantBtn} onPress={() => seedStreak(1)}>
            <Text style={styles.variantBtnText}>Streak 1 day — pill must show 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.variantBtn} onPress={() => seedStreak(7)}>
            <Text style={styles.variantBtnText}>Streak 7 days — pill must show 7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.variantBtn} onPress={seedLapsedStreak}>
            <Text style={styles.variantBtnText}>Lapsed streak — pill must show 0, flame dim</Text>
          </TouchableOpacity>
          */}
        </View>

        <View style={styles.variantSection}>
          <Text style={styles.variantHeader}>Sentry test</Text>
          <TouchableOpacity style={styles.variantBtn} onPress={handleThrowTestError}>
            <Text style={styles.variantBtnText}>Send test error to Sentry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This screen is for development testing only
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  // Content-sized, not centred: the menu outgrew one screen, and centring a
  // taller-than-screen column pushes its ends out of reach.
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    marginTop: 48,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  variantSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  variantHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  // NO flex — these stack in a column, and flex:1 made every button share the
  // leftover height, squeezing each to near-zero and clipping its label away.
  // The style was originally written for a ROW of two.
  variantBtn: {
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
  },
  variantBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
