import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen, RecapChips } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import {
  VB,
  familySummary,
  challengeSummary,
  goalSummary,
} from './variantBContent';

// ACT 3 — "ready to build your plan?". Mirrors the user's answers back as recap
// chips (ownership before the calculate beat), then hands off to the fake
// "analyzing" screen.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBReady'>;

export const VBReadyScreen: React.FC<Props> = ({ navigation }) => {
  const { name, childrenCount, children, variantBAnswers } = useOnboardingStore();

  const ages = children
    .map((c) => c.ageRange)
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const challenges = Array.isArray(variantBAnswers[VB.Challenges])
    ? (variantBAnswers[VB.Challenges] as string[])
    : [];
  const goals = Array.isArray(variantBAnswers[VB.Goals])
    ? (variantBAnswers[VB.Goals] as string[])
    : [];

  const chips = [
    familySummary(childrenCount, ages),
    `Focus: ${challengeSummary(challenges)}`,
    `Goal: ${goalSummary(goals)}`,
  ];

  const handleContinue = () => {
    trackOnboardingStepCompleted(VB.Ready, 'build');
    navigation.navigate('VBCalculating');
  };

  return (
    <StatementScreen
      screenName={VB.Ready}
      title={`Ready to build your plan, ${name || 'friend'}?`}
      body="We'll match lessons to your family based on everything you just shared."
      onBack={() => navigation.goBack()}
      ctaTitle="Build my plan"
      onContinue={handleContinue}
    >
      <RecapChips chips={chips} />
    </StatementScreen>
  );
};
