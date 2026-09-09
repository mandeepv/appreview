import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../navigation/OnboardingNavigator';
import { Colors, Typography, BorderRadius, Shadows } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { reportError } from '../config/sentry';
import { useOnboardingStore } from '../store/onboardingStore';

export const DevMenuScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<OnboardingStackParamList>>();

  const { clearState, updateUserType, updateChildrenCount, updateChildAgeRange, toggleImprovementGoal } =
    useOnboardingStore();

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
   */
  const handleRunPlanTheater = () => {
    updateUserType('mother');
    updateChildrenCount(2);
    updateChildAgeRange(0, '2-4');
    updateChildAgeRange(1, '5-7');
    toggleImprovementGoal('tantrums');
    toggleImprovementGoal('less-fighting');
    navigation.navigate('Loading');
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
    <View style={styles.container}>
      <View style={styles.content}>
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
            onPress={() => navigation.navigate('LessonPreview', { slug: 'sprinklers' })}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F2F1' }]}>
              <Ionicons name="flask-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Preview: Sprinklers (data engine)</Text>
              <Text style={styles.buttonDescription}>Data-driven Sprinklers — compare vs the live version</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('LessonPreview', { slug: 'recordingDeepBondMoments' })}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#E8F2F1' }]}>
              <Ionicons name="flask-outline" size={32} color={Colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Preview: Recording Moments (data engine)</Text>
              <Text style={styles.buttonDescription}>2nd data-driven lesson — proves the engine generalizes</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGray,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  variantBtn: {
    flex: 1,
    paddingVertical: 12,
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
