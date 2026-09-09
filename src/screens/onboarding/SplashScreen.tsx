import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import { KinderwellMark } from '../../components/onboarding/KinderwellMark';
import {
  Animation,
  OnboardingColors as C,
  OnboardingFonts as F,
} from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { trackOnboardingStarted } from '../../lib/analytics';

/**
 * SplashScreen is the mandatory first-launch surface. It fires the entrance
 * animation, waits for auth to hydrate from AsyncStorage, then routes.
 *
 * Post-2026-07-05 hard-paywall model: signed-in users are NOT sent
 * straight to Root anymore. Every launch of a signed-in user routes
 * through Loading, which is responsible for the subscription gate:
 *   - if the user is subscribed (or demo)   → Loading forwards to Root
 *   - if the user is not subscribed         → Loading presents the
 *                                             mandatory paywall (no
 *                                             dismiss, no bypass)
 * That means "close app, reopen" always shows Splash → Paywall for an
 * unsubscribed signed-in user, which is exactly the mandatory-gate UX
 * we ship. See docs/PAYWALL_MODEL.md for the full policy.
 */

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { user, isLoading } = useAuthStore();
  const { loadState, getLastScreen, hasReachedAuth } = useOnboardingStore();

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: Animation.spring.damping,
        stiffness: Animation.spring.stiffness,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wait for auth to finish loading, then navigate.
  // Variant resolution runs in parallel and does NOT block routing.
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(async () => {
        if (user) {
          // User is signed in. Route through Loading, which is the
          // subscription-gate checkpoint. Loading examines isSubscribed +
          // isDemoUser and either presents the mandatory paywall or
          // forwards to Root. Prior code sent signed-in users directly
          // to Root, which bypassed the gate and let unsubscribed users
          // reach LearnScreen after a force-quit / cold launch — the
          // exact scenario the hard-paywall model closes.
          if (__DEV__) console.log('User already authenticated, navigating to Loading (gate)');
          navigation.replace('Loading');
        } else {
          // User not logged in - check onboarding state
          const hasReachedAuthScreen = await hasReachedAuth();
          const lastScreen = await getLastScreen();

          if (hasReachedAuthScreen) {
            // User completed onboarding before, go to Auth screen
            if (__DEV__) console.log('User has completed onboarding, navigating to Auth');
            await loadState(); // Load their saved onboarding data
            trackOnboardingStarted('resumed', 'Auth');
            navigation.replace('Auth');
          } else if (lastScreen) {
            // User was in middle of onboarding, resume where they left off
            if (__DEV__) console.log('Resuming onboarding at:', lastScreen);
            await loadState(); // Load their saved answers
            trackOnboardingStarted('resumed', lastScreen);
            try {
              // SPEC-08 FLAG: `lastScreen` is a persisted string from
              // AsyncStorage (getLastScreen(): Promise<string | null>), so it
              // is NOT type-guaranteed to be a real onboarding route — a stale
              // or renamed key could be anything. We narrow to the ParamList
              // key type for the call, but keep the existing try/catch that
              // falls back to 'Welcome' if replace() throws on an unknown
              // route. This is a runtime string → route-name boundary; the
              // cast is the honest type for "we can't prove this at compile
              // time." Not a lazy `as any` — it's `keyof` + a runtime guard.
              navigation.replace(lastScreen as keyof OnboardingStackParamList);
            } catch {
              navigation.replace('Welcome');
            }
          } else {
            // Brand new user, show welcome screen
            if (__DEV__) console.log('New user, showing Welcome screen');
            trackOnboardingStarted('first_open');
            navigation.replace('Welcome');
          }
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [navigation, user, isLoading]);

  // Screen 10 in the design canvas — the forestDeep takeover. Only the visual
  // layer changed here: the routing effect above (auth hydration, resume, the
  // Loading gate) is untouched, because it is the launch path INVARIANT #1
  // depends on.
  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <KinderwellMark size={106} color={C.cream} />
          <Text style={styles.title}>Kinderwell</Text>
          <Text style={styles.subtitle}>The manual you never got.</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.forestDeep },
  container: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 44, paddingBottom: 92, alignItems: 'flex-start' },
  title: {
    fontFamily: F.serif,
    fontSize: 44,
    letterSpacing: -1.3,
    color: C.cream,
    marginTop: 38,
  },
  subtitle: {
    fontFamily: F.serifItalic,
    fontSize: 18,
    lineHeight: 18 * 1.5,
    color: C.mint,
    marginTop: 12,
  },
});
