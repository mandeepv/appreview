// Initialize Sentry BEFORE anything else so we catch import-time crashes.
import { initSentry } from './src/config/sentry';
initSentry();

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
import { useConfigStore } from './src/store/configStore';
import { ForceUpdateModal } from './src/components/ForceUpdateModal';
import { useFonts } from 'expo-font';
import {
  Newsreader_300Light,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
} from '@expo-google-fonts/newsreader';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
} from '@expo-google-fonts/figtree';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

function AppContent() {
  // Onboarding fonts (Newsreader / Figtree / IBM Plex Mono).
  //
  // REGISTERED UNDER THEIR POSTSCRIPT NAMES, deliberately — and this is the
  // whole point of the exercise.
  //
  // The expo-font config plugin (app.json) embeds each TTF natively under the
  // name inside the file: "Newsreader-Regular", "Figtree-SemiBold", and so on.
  // These keys must match, because expo-font checks whether a family is already
  // registered before doing anything: key them by the @expo-google-fonts alias
  // ("Newsreader_400Regular") and that check misses on every single face, the
  // full async runtime registration runs anyway, and the first-frame
  // system-font flash the embedding was meant to remove comes straight back.
  // That was the state of this file until the redesign review caught it.
  //
  // So: styles reference the PostScript names (see OnboardingFonts in
  // theme.ts), the plugin embeds those names, and this call finds them already
  // present in a native build and resolves instantly.
  //
  // It stays for one reason: Expo Go and the JS-only dev client have no native
  // build to embed into, so without it the fonts never register there at all.
  //
  // Deliberately NOT a render gate either way. Blocking the tree would put a
  // blank frame in front of the brand splash and change launch timing on the
  // paywall path (INVARIANT #1, SPEC-16).
  useFonts({
    'Newsreader-Light': Newsreader_300Light,
    'Newsreader-Regular': Newsreader_400Regular,
    'Newsreader-Italic': Newsreader_400Regular_Italic,
    'Figtree-Regular': Figtree_400Regular,
    'Figtree-Medium': Figtree_500Medium,
    'Figtree-SemiBold': Figtree_600SemiBold,
    'IBMPlexMono-Regular': IBMPlexMono_400Regular,
    'IBMPlexMono-Medium': IBMPlexMono_500Medium,
  });

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
