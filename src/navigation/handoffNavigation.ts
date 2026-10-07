// SPEC-21 purchase handoff — the app-level wiring that brings HandoffScreen
// up when a handoff link opens the app. Mounted once by App.tsx (through
// OnboardingNavigator's re-export — see there), kept here so it is testable
// without rendering the whole app.

import { useEffect } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { SuperwallExpoModule } from 'expo-superwall';
import type { OnboardingStackParamList } from './types';
import { shouldOpenHandoff, shouldResetToWelcomeOnSignOut } from './routingPolicy';
import { useHandoffStore } from '../store/handoffStore';
import { listenForHandoffLinks } from '../lib/handoffSources';
import { reportError } from '../config/sentry';

type Navigation = NavigationContainerRef<OnboardingStackParamList>;

/**
 * If a handoff key is waiting and the current screen won't pick it up by
 * itself, bring HandoffScreen up in its place. Called when a link arrives and
 * again once navigation is ready (a cold-start link can beat the navigator).
 *
 * THE PAYWALL. The buyer most likely to tap their link from Mail is the one
 * stuck on the paywall — signed in with Apple's Hide My Email, a second
 * account with no purchase. The paywall is Superwall's own modal over the
 * Loading screen, so a navigation reset alone would leave it on top. So the
 * reset comes FIRST (Loading unmounts, and with it the gate's paywall
 * callbacks), and only then is the paywall dismissed: the other way round,
 * the gate would hear the dismiss as "declined" and re-present the paywall
 * 300ms later, over HandoffScreen.
 */
export function openHandoffIfPending(navigation: Navigation | null): void {
  if (!navigation?.isReady() || !useHandoffStore.getState().pendingKey) return;
  const current = navigation.getCurrentRoute()?.name;
  if (!shouldOpenHandoff(current)) return;
  navigation.reset({ index: 0, routes: [{ name: 'Handoff' }] });
  if (current === 'Loading') {
    SuperwallExpoModule.dismiss().catch((error: unknown) => {
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: 'handoff_dismiss_paywall',
      });
    });
  }
}

/** Listen for handoff links for as long as the app runs. */
export function useHandoffLinks(navigationRef: { current: Navigation | null }): void {
  useEffect(
    () => listenForHandoffLinks(() => openHandoffIfPending(navigationRef.current)),
    [navigationRef],
  );
}

/**
 * Should a sign-out send the app back to Welcome? Yes, except while
 * HandoffScreen is the one signing out (see shouldResetToWelcomeOnSignOut).
 */
export function resetToWelcomeOnSignOut(navigation: Navigation | null): boolean {
  return shouldResetToWelcomeOnSignOut(navigation?.getCurrentRoute()?.name);
}
