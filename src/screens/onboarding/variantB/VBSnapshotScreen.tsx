import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen, SnapshotCard, SnapshotRow } from '../../../components/onboarding';
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
    // mask: family value = child count + ages (PII). Masked from session replay;
    // label stays visible so the reveal still reads. See INVARIANTS.md / OPS_STATE.
    { label: 'Your family', value: familySummary(childrenCount, ages), icon: 'people-outline', mask: true },
    { label: 'What we’ll focus on', value: challengeSummary(challenges), icon: 'locate-outline' },
    { label: 'Where this is headed', value: goalSummary(goals), icon: 'leaf-outline' },
    // accent = the hero row (the focal point of the reveal).
    { label: 'Your plan', value: `12 lessons, starting with “${firstLesson}”`, icon: 'book-outline', accent: true },
    { label: 'First results in', value: 'About two weeks', icon: 'time-outline' },
  ];

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Snapshot, 'confirmed');
    navigation.navigate('VBHowItWorks');
  };

  return (
    <StoryScreen
      screenName={VB.Snapshot}
      iconName="sparkles-outline"
      title="Here's your plan."
      body={[
        'Built from what you told us. Not a template, not a guess.',
      ]}
      ctaTitle="This is me"
      onContinue={handleContinue}
    >
      <SnapshotCard rows={rows} />
    </StoryScreen>
  );
};
