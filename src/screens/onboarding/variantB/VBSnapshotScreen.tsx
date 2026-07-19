import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen, SnapshotCard, SnapshotRow } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import {
  VB,
  familySummary,
  challengeSummary,
  goalSummary,
} from './variantBContent';

// ACT 3 — the SNAPSHOT reveal (the aha moment). The payoff the user "earned" via
// the calculate beat: their answers reflected back as a concrete, personalized
// plan. No back (it follows a `replace` from the calculate screen).
//
// ⚠︎ "12 lessons" and "~2 weeks" are placeholder-but-hard-hitting proof numbers —
// confirm defensible before ramping the flag (see the copy doc's checklist).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBSnapshot'>;

// Map the user's top challenge to a first-lesson framing (flavor only — not a
// real registry lookup; the actual plan is assembled post-signup).
const FIRST_LESSON: Record<string, string> = {
  tantrums: 'Calm in the Meltdown',
  listening: 'Getting Heard Without Yelling',
  screens: 'Screen-Time Without the Fight',
  sleep: 'Bedtime, Reclaimed',
  defiance: 'Power Struggles, Defused',
  anxiety: 'Soothing Big Worries',
  siblings: 'Sibling Peace',
  bond: 'Reconnecting With Your Child',
};

export const VBSnapshotScreen: React.FC<Props> = ({ navigation }) => {
  const { childrenCount, children, variantBAnswers } = useOnboardingStore();

  const ages = children
    .map((c) => c.ageRange)
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const challenges = Array.isArray(variantBAnswers[VB.Challenges])
    ? (variantBAnswers[VB.Challenges] as string[])
    : [];
  const goals = Array.isArray(variantBAnswers[VB.Goals])
    ? (variantBAnswers[VB.Goals] as string[])
    : [];

  const firstLessonKey = challenges.find((c) => FIRST_LESSON[c]);
  const firstLesson = firstLessonKey ? FIRST_LESSON[firstLessonKey] : 'Your First Win';

  const rows: SnapshotRow[] = [
    { label: 'Your family', value: familySummary(childrenCount, ages) },
    { label: 'Your focus', value: challengeSummary(challenges) },
    { label: 'Your goal', value: goalSummary(goals) },
    { label: 'Matched for you', value: `12 lessons · starting with “${firstLesson}”` },
    { label: 'First results in', value: '~2 weeks' },
  ];

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Snapshot, 'confirmed');
    navigation.navigate('VBHowItWorks');
  };

  return (
    <StatementScreen
      screenName={VB.Snapshot}
      title="Here's your personalized plan."
      ctaTitle="This looks right"
      onContinue={handleContinue}
    >
      <SnapshotCard rows={rows} />
    </StatementScreen>
  );
};
