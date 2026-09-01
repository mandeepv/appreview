import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { CalculatingView, AnalyzingStage } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { Colors } from '../../../constants/theme';
import { VB, challengeSummary, goalSummary, familySummary } from './variantBContent';

// ACT 3 — the "building your plan" beat. Pure theater (no gate/paywall/network):
// a ~6s personalized analyzing pass that reflects the user's OWN answers back
// (focus areas, kid age, goal) so the snapshot reveal feels earned. Renders the
// variant-B-only AnalyzingTheater via CalculatingView — the shared PlanTheater /
// real LoadingScreen are untouched. No back button: one-way transition; the
// resume seam still records last-screen so a kill/resume lands sanely.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBCalculating'>;

export const VBCalculatingScreen: React.FC<Props> = ({ navigation }) => {
  const { saveState, setLastScreen, childrenCount, children, variantBAnswers } =
    useOnboardingStore();

  useFocusEffect(
    useCallback(() => {
      return () => {
        saveState();
        setLastScreen(VB.Calculating);
      };
    }, [saveState, setLastScreen])
  );

  // Turn the user's stored answers into human-readable fragments (same helpers
  // VBReady/VBSnapshot use). Keys → text happens here; we never send these to
  // analytics (below we send only the fixed 'complete' action).
  const ages = children
    .map((c) => c.ageRange)
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const challenges = Array.isArray(variantBAnswers[VB.Challenges])
    ? (variantBAnswers[VB.Challenges] as string[])
    : [];
  const goals = Array.isArray(variantBAnswers[VB.Goals])
    ? (variantBAnswers[VB.Goals] as string[])
    : [];

  const focus = challengeSummary(challenges); // e.g. "sleep, defiance"
  const goal = goalSummary(goals); // e.g. "calmer mornings"
  const family = familySummary(childrenCount, ages); // e.g. "1 kid · 5-7" (PII)

  // Personalized stages — each references the user's real answers so it feels
  // like the app is thinking about THEM. `mask` on the family stage (child
  // count/age = PII) hides it from PostHog session replay. See INVARIANTS.
  const stages: AnalyzingStage[] = [
    { at: 22, label: 'Reading your answers' },
    { at: 46, label: `Focusing on ${focus}` },
    { at: 68, label: `Tuning for ${family}`, mask: true },
    { at: 88, label: `Building toward ${goal}` },
    { at: 100, label: 'Finalizing your plan' },
  ];

  const handleDone = () => {
    trackOnboardingStepCompleted(VB.Calculating, 'complete');
    // replace, not navigate: the calculate beat shouldn't be back-reachable.
    navigation.replace('VBSnapshot');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CalculatingView
        stages={stages}
        title="Building your plan"
        subtitle="Turning your answers into a program made for your family"
        onDone={handleDone}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Warm cream canvas to match the rest of variant B (was clinical white).
    backgroundColor: Colors.background,
  },
});
