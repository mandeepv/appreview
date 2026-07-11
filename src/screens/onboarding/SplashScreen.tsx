import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SplashScreenNative from 'expo-splash-screen';
import type { OnboardingStackParamList } from '../../navigation/types';
import { Heading1, Subtitle } from '../../components/Typography';
import { Colors, Spacing, Animation } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { trackOnboardingStarted } from '../../lib/analytics';
import { SPLASH_MIN_DWELL_MS, shouldRouteFromSplash } from '../../lib/splashDwell';

/**
 * SplashScreen is the mandatory first-launch surface. It is the JS
 * continuation of the NATIVE splash: its first painted frame is a cream field
 * (`Colors.background`) with the centered glyph at the same optical
 * size/position as the native `splash.png`, so the native→JS handoff is
 * seamless — no "green flash" (SPEC-16 R1). The entrance animation plays FROM
 * that identical frame (wordmark + subtitle fade in beneath a stationary glyph
 * that is already at opacity 1); it never fades the whole screen up from zero,
 * which would blink at the handoff.
 *
 * It hides the native splash (`SplashScreen.hideAsync`) from `onLayout` on its
 * root view — i.e. only once its own first frame is committed — so the OS keeps
 * the native splash up until there's a matching JS frame to reveal.
 *
 * Routing waits for auth to hydrate from AsyncStorage AND a minimum brand-
 * moment dwell (`SPLASH_MIN_DWELL_MS`), then routes (see shouldRouteFromSplash).
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
  // The glyph is NOT animated in — it must be visible at opacity 1 on frame one
  // to match the native splash at the handoff. Only the wordmark + subtitle
  // fade in beneath it, so the entrance reads as text appearing under a
  // stationary logo rather than the whole screen fading up (which would blink).
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const { user, isLoading } = useAuthStore();
  const { loadState, getLastScreen, hasReachedAuth } = useOnboardingStore();

  // Minimum brand-moment dwell has elapsed. Routing waits on this AND auth
  // hydration (see shouldRouteFromSplash) so a fast hydration can't flash the
  // splash for a single frame, and a slow one isn't padded to a flat 2s.
  const [minDwellElapsed, setMinDwellElapsed] = useState(false);

  // Hide the NATIVE splash once THIS screen has painted its first frame. Called
  // from onLayout (below) so the OS keeps its splash up until there's a matching
  // JS frame to reveal — the controlled handoff that kills the flash. try/catch
  // via .catch: a splash API failure must never crash launch.
  const hideNativeSplash = () => {
    SplashScreenNative.hideAsync().catch(() => {
      /* non-fatal — native splash will have auto-hidden or will on next frame */
    });
  };

  useEffect(() => {
    // Text-only entrance from the identical first frame.
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: Animation.duration.slow,
      useNativeDriver: true,
    }).start();

    const dwellTimer = setTimeout(() => setMinDwellElapsed(true), SPLASH_MIN_DWELL_MS);
    return () => clearTimeout(dwellTimer);
  }, []);

  // Route as soon as auth has hydrated AND the minimum dwell has elapsed.
  // Variant resolution runs in parallel and does NOT block routing.
  useEffect(() => {
    if (shouldRouteFromSplash(!isLoading, minDwellElapsed)) {
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
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [navigation, user, isLoading, minDwellElapsed]);

  return (
    // Root is a cream field (Colors.background) matching the native splash's
    // backgroundColor — no teal gradient anywhere. onLayout fires once the
    // first frame is committed; that's when we hand off from the native splash.
    <SafeAreaView style={styles.container} onLayout={hideNativeSplash}>
      <View style={styles.content}>
        {/* Glyph: opacity 1 on frame one (NOT animated) so it's identical to
            the native splash at the handoff instant. */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/splash.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* Only the text fades in, beneath the stationary glyph. */}
        <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center', gap: Spacing.xs }}>
          <Heading1 style={styles.title}>Kinderwell</Heading1>
          <Subtitle style={styles.subtitle}>Your parenting journey starts here</Subtitle>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  logoContainer: {
    width: 220,
    height: 220,
    borderRadius: 40,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: Colors.textPrimary,
    marginTop: Spacing['2xl'],
  },
  subtitle: {
    color: Colors.textSecondary,
    opacity: 0.95,
  },
});
