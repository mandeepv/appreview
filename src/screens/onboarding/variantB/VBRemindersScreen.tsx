import React from 'react';
import * as Notifications from 'expo-notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { StoryScreen } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 3 — notification priming (re-engagement hook), the last beat before Auth.
//
// PERMISSION WIRED, SEQUENCE NOT (2026-07-21). This is the FIRST place in the
// whole app that a notification preference is collected — variant A never had a
// reminders screen, so `notificationsEnabled` was always its default (false).
//
// What this screen does now:
//   - "Enable reminders" → requests the OS notification permission on tap
//     (highest-intent moment) and stores the ACTUAL grant result, so the flag
//     reflects reality: tapping Enable but denying at the OS prompt stores false.
//   - "Not now" → stores false, no OS prompt.
//
// What this screen deliberately does NOT do: schedule anything. The reminder
// SEQUENCE — frequency, time-of-day, copy, tap deep-link — is an UNDECIDED
// product call (owner: "decide later"). Until that's defined and a scheduling
// layer is built on top of this grant, a user who enables reminders will
// receive NOTHING. Tracked in BACKLOG #13 + parked SPEC-11 / OPS_STATE.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBReminders'>;

export const VBRemindersScreen: React.FC<Props> = ({ navigation }) => {
  const { setNotificationsEnabled } = useOnboardingStore();

  // Rejoin the shared tail at Auth (signup mode, same as variant A). Factored
  // so every path lands here exactly once regardless of permission outcome —
  // navigation must never depend on the OS prompt result.
  const goToAuth = (granted: boolean) => {
    setNotificationsEnabled(granted);
    trackOnboardingStepCompleted(VB.Reminders, granted ? 'enabled' : 'skipped');
    navigation.navigate('Auth');
  };

  const onEnable = async () => {
    let granted = false;
    try {
      // getPermissions first: if already granted from a prior run, don't fire a
      // redundant request. Otherwise request once (this is the real OS dialog).
      const existing = await Notifications.getPermissionsAsync();
      if (existing.granted) {
        granted = true;
      } else if (existing.canAskAgain) {
        const result = await Notifications.requestPermissionsAsync();
        granted = result.granted;
      }
      // If canAskAgain is false and not granted, iOS won't show a dialog —
      // granted stays false and we advance without blocking (user can enable
      // later in Settings once the reminder feature actually ships).
    } catch (e) {
      // Permission API failure must never block onboarding — treat as not granted.
      if (__DEV__) console.warn('[VBReminders] permission request failed:', e);
    }
    goToAuth(granted);
  };

  return (
    <StoryScreen
      screenName={VB.Reminders}
      iconName="notifications-outline"
      title="One small nudge, on the days it counts."
      body={[
        'New habits slip when life gets loud. A quick reminder keeps you going. That’s all we’ll send. No spam, no guilt trips.',
      ]}
      onBack={() => navigation.goBack()}
      ctaTitle="Enable reminders"
      onContinue={onEnable}
      secondaryTitle="Not now"
      onSecondary={() => goToAuth(false)}
    />
  );
};
