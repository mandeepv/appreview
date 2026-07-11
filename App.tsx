// Initialize Sentry BEFORE anything else so we catch import-time crashes.
import { initSentry } from './src/config/sentry';
initSentry();

import * as SplashScreenNative from 'expo-splash-screen';

// SPEC-16 R1: take manual control of the NATIVE splash so the native→JS handoff
// is a controlled instant instead of "auto-hide at the first JS frame." Without
// this, the OS hides its splash the moment React commits a frame — an
// uncontrolled cut from the native asset (cream field + teal glyph) to a JS
// SplashScreen that used to render a totally different full-screen teal
// gradient. That mismatch was the "green flash." preventAutoHideAsync keeps the
// native splash up until SplashScreen.tsx has painted its first (now identical)
// frame and calls hideAsync. Module scope + try/catch: a splash-screen API
// failure must NEVER crash launch — worst case the native splash auto-hides as
// before.
SplashScreenNative.preventAutoHideAsync().catch(() => {
  /* non-fatal: fall back to the OS default auto-hide behavior */
});

import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { PostHogProvider } from 'posthog-react-native';
import { OnboardingNavigator, OnboardingStackParamList } from './src/navigation/OnboardingNavigator';
import { useAuthStore } from './src/store/authStore';
import { SuperwallProvider, useSuperwallEvents } from 'expo-superwall';
import Constants from 'expo-constants';
import { posthog } from './src/config/posthog';
import { hydrateOnboardingVariant } from './src/lib/experiments';
import { useConfigStore } from './src/store/configStore';
import { ForceUpdateModal } from './src/components/ForceUpdateModal';

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  const user = useAuthStore(state => state.user);
  const setIsSubscribed = useAuthStore(state => state.setIsSubscribed);
  const navigationRef = useRef<NavigationContainerRef<OnboardingStackParamList>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  const prevUserRef = useRef(user);
  const isInitialMount = useRef(true);
  const configStatus = useConfigStore(state => state.status);
  const checkConfig = useConfigStore(state => state.checkConfig);
  const maybeRecheckConfig = useConfigStore(state => state.maybeRecheckConfig);

  useEffect(() => {
    if (__DEV__) console.log('🚀 Initializing app...');
    initialize();
    // SPEC-15: re-register the onboarding-variant super-property on app start
    // if this device already has a persisted assignment. resetPostHog() (on
    // logout/delete) wipes super-properties, so without this a relaunch
    // mid-experiment would emit untagged events. Mirrors the environment
    // re-registration in src/config/posthog.ts. Fire-and-forget; never blocks.
    hydrateOnboardingVariant();
  }, []);

  // App-level Superwall subscription-status listener. Keeps `isSubscribed` in
  // sync for UI display only (e.g., hide "Subscribe" button in Settings).
  // Actual paid-content gating is at the Loading gate on entry to Root (the
  // hard paywall) — see docs/PAYWALL_MODEL.md. `useLessonGate` is a no-op seam
  // (SPEC-13). Demo users are not flipped here, see docs/DEMO_MODE.md.
  useSuperwallEvents({
    onSubscriptionStatusChange: (subscriptionStatus) => {
      const { isDemoUser } = useAuthStore.getState();
      if (isDemoUser) return;

      if (__DEV__) console.log('[Subscription]', subscriptionStatus.status);

      if (subscriptionStatus.status === 'ACTIVE') {
        setIsSubscribed(true);
      } else if (subscriptionStatus.status === 'INACTIVE') {
        setIsSubscribed(false);
      }
      // UNKNOWN: leave as-is. Superwall will send a definitive update once
      // it resolves. Gating does not depend on this flag, so a stale UI mirror
      // during a brief unknown window is harmless.
    },
  });

  // Kill switch — fetch app_config on launch, force-upgrade users on bad builds.
  // The check now lives in configStore so LoadingScreen can gate the paywall
  // on it: the gate must not run until the config check resolves, and must
  // never run if force-update is active (SPEC-01 R5 — previously the fetch
  // here and the gate ran concurrently and could both present full-screen at
  // once). configStore silently fails open to 'ok' on any error or after a
  // 3s timeout, so a Supabase outage never locks legit users out.
  useEffect(() => {
    checkConfig();
  }, []);

  // SPEC-07 R3: re-check the kill switch when the app returns to the
  // foreground, if the last check was > 6h ago. Without this, the config
  // check is cold-launch-only, so a resident app (never killed) would never
  // see a forced update. The staleness gate lives in configStore.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        maybeRecheckConfig();
      }
    });
    return () => sub.remove();
  }, []);

  // Listen for auth state changes and navigate accordingly
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserRef.current = user;
      return;
    }

    // User signed out (had user before, now null)
    if (prevUserRef.current && !user && navigationRef.current?.isReady()) {
      if (__DEV__) console.log('User signed out, navigating to Welcome screen');
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }

    prevUserRef.current = user;
  }, [user]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
        if (routeNameRef.current !== currentRouteName && currentRouteName) {
          posthog.screen(currentRouteName);
          routeNameRef.current = currentRouteName;
        }
      }}
    >
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ['testID'],
          maxElementsCaptured: 20,
        }}
      >
        <StatusBar style="dark" />
        <OnboardingNavigator />
        <ForceUpdateModal visible={configStatus === 'force_update'} />
      </PostHogProvider>
    </NavigationContainer>
  );
}

function App() {
  const superwallApiKey = Constants.expoConfig?.extra?.superwallApiKey;

  if (__DEV__) console.log('📝 Superwall API Key:', superwallApiKey ? `${superwallApiKey.substring(0, 10)}...` : 'MISSING');

  return (
    <SuperwallProvider apiKeys={{ ios: superwallApiKey || '' }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppContent />
      </GestureHandlerRootView>
    </SuperwallProvider>
  );
}

// Sentry.wrap sets up an ErrorBoundary around the tree so React render errors
// are captured, plus attaches session tracking. Native iOS/Android crashes are
// captured automatically by initSentry above.
export default Sentry.wrap(App);
