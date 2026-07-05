import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Heading1, Subtitle } from '../../components/Typography';
import { Colors, Spacing, Animation } from '../../constants/theme';
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
              navigation.replace(lastScreen as any);
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

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/splash.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Heading1 style={styles.title}>Kinderwell</Heading1>
          <Subtitle style={styles.subtitle}>Your parenting journey starts here</Subtitle>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
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
    backgroundColor: Colors.surface,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: Colors.surface,
    marginTop: Spacing['2xl'],
  },
  subtitle: {
    color: Colors.surface,
    opacity: 0.95,
  },
});
