// Initialize Sentry BEFORE anything else so we catch import-time crashes.
import { initSentry } from './src/config/sentry';
initSentry();

import React, { useEffect, useRef, useState } from 'react';
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
import { fetchAppConfig, isBelowMinimumBuild } from './src/lib/appConfig';
import { ForceUpdateModal } from './src/components/ForceUpdateModal';

function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  const user = useAuthStore(state => state.user);
  const setIsSubscribed = useAuthStore(state => state.setIsSubscribed);
  const navigationRef = useRef<NavigationContainerRef<OnboardingStackParamList>>(null);
  const routeNameRef = useRef<string | undefined>(undefined);
  const prevUserRef = useRef(user);
  const isInitialMount = useRef(true);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    if (__DEV__) console.log('🚀 Initializing app...');
    initialize();
  }, []);

  // App-level Superwall subscription-status listener. Keeps `isSubscribed` in
  // sync for UI display only (e.g., hide "Subscribe" button in Settings).
  // Actual paid-content gating is done via usePlacement()/feature() at the
  // point of access — see LearnScreen.tsx. Demo users are not flipped here,
  // see docs/DEMO_MODE.md.
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
  // Silently defaults to "not required" on any error, so a Supabase outage
  // never locks legit users out.
  useEffect(() => {
    (async () => {
      const config = await fetchAppConfig();
      if (isBelowMinimumBuild(config)) {
        if (__DEV__) console.log('[appConfig] current build is below minimum — forcing update');
        setForceUpdate(true);
      }
    })();
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
        <ForceUpdateModal visible={forceUpdate} />
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
