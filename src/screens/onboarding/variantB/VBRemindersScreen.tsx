import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StatementScreen } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — notification priming (re-engagement hook), the last beat before Auth.
// Sets the existing `notificationsEnabled` store flag exactly as the app already
// tracks it (identify/onboardingService read this field). The app defers the
// actual OS permission request, so this screen only records intent — no native
// permission dialog here (parity with current behavior; a dialog mid-flow would
// be a separate, deliberate change). Both arms converge at Auth next.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBReminders'>;

export const VBRemindersScreen: React.FC<Props> = ({ navigation }) => {
  const { setNotificationsEnabled } = useOnboardingStore();

  const finish = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    trackOnboardingStepCompleted(VB.Reminders, enabled ? 'enabled' : 'skipped');
    // Rejoin the shared tail at Auth (signup mode, same as variant A).
    navigation.navigate('Auth');
  };

  return (
    <StatementScreen
      screenName={VB.Reminders}
      title="Can we keep you on track?"
      body="A gentle nudge on the days it matters — no spam."
      onBack={() => navigation.goBack()}
      ctaTitle="Enable reminders"
      onContinue={() => finish(true)}
      secondaryTitle="Not now"
      onSecondary={() => finish(false)}
    />
  );
};
