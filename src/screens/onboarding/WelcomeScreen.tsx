/**
 * Screen 11 in the design canvas — "one way forward, one quiet way back in".
 *
 * The mark sits top-left rather than centred, and the promise carries the
 * screen. "Get started" is the only filled control; signing in is a quiet
 * underline underneath, because returning users are the minority and a second
 * pill would split the decision.
 *
 * Two proof rows ("Written by child psychologists", "Used the same evening you
 * read it") used to sit under the lede. They were cut: the lede now names the
 * psychologists and the five minutes itself, so the rows repeated it in a
 * second visual register.
 *
 * Both navigation paths are unchanged from v1.2.0: Get started → UserType
 * (with the restart-tracking branch), Sign in → Auth in signin mode.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { RichHeadline, ContinuePill } from '../../components/onboarding/OnboardingScreen';
import { trackWelcomeCtaTapped, trackOnboardingRestarted } from '../../lib/analytics';
import { useOnboardingStore } from '../../store/onboardingStore';
import {
  Animation,
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
  OnboardingRadius as R,
  oInk,
  oForest,
} from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { getLastScreen } = useOnboardingStore();

  useEffect(() => {
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

  const handleGetStarted = async () => {
    trackWelcomeCtaTapped('get_started');
    // If user had progress from a prior session, tapping Get Started here is a restart
    const priorLastScreen = await getLastScreen();
    if (priorLastScreen && priorLastScreen !== 'Welcome') {
      trackOnboardingRestarted(priorLastScreen);
    }
    navigation.navigate('UserType');
  };

  const handleSignIn = () => {
    trackWelcomeCtaTapped('sign_in');
    // Enter Auth in signin mode — same auth code path, different copy and
    // post-signin routing. See OnboardingStackParamList.Auth for details.
    navigation.navigate('Auth', { mode: 'signin' });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.grow} />

          <Text style={styles.wordmark}>Kinderwell</Text>

          <RichHeadline style={styles.headline}>
            Become a better parent, *five minutes a day*.
          </RichHeadline>
          <Text style={styles.lede}>
            Short daily lessons from child psychologists, built around your kids.
          </Text>

          <View style={styles.grow} />

          {/* Sign in is a real (outline) button, not a text link (2026-10).
              Parents who bought on kinderwell.app now arrive here on purpose,
              told to tap Sign in — and a new buyer's thumb goes to the biggest
              thing on the screen, which sent them through the whole
              questionnaire again. Get started keeps the weight; Sign in is
              unmissable beneath it.

              The three labels "Get started", "Already have an account?" and
              "Sign in" are quoted word for word by the website's /welcome
              page, receipt and reminder emails (INVARIANTS) — change both in
              the same release. And nothing here mentions the website, web
              purchases or prices: every organic App Store user sees this
              screen. */}
          <View>
            <ContinuePill label="Get started" onPress={handleGetStarted} />
            <Text style={styles.signInLead}>Already have an account?</Text>
            <Pressable
              onPress={handleSignIn}
              accessibilityRole="button"
              style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed]}
            >
              <Text style={styles.signInLabel}>Sign in</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: L.screenPad, paddingTop: 34, paddingBottom: 34 },
  // Wordmark rather than the drawn mark: the glyph read as a stray element
  // here, and the name in the brand serif does the same job with less.
  //
  // Deliberately SMALLER than the headline. The wordmark answers "what app is
  // this?" in a glance; the headline does the persuading. At 34 it outranked
  // the 30pt promise, which is the wrong way round on a screen selling the
  // promise to someone who does not know the name yet. Presence comes from
  // the tracking, not the size.
  //
  // Left-aligned on the same 30px gutter as the headline and lede — the shared
  // edge is what makes the three read as one block; centring it would orphan
  // it again, and centred type reads ceremonial where this flow is editorial.
  wordmark: {
    fontFamily: F.serif,
    fontSize: 22,
    letterSpacing: 0.3,
    color: C.forest,
    marginBottom: 22,
  },
  grow: { flex: 1, minHeight: 20 },
  headline: {
    fontFamily: F.serif,
    fontSize: T.h1,
    lineHeight: T.h1 * 1.22,
    letterSpacing: -0.45,
    color: C.ink,
  },
  lede: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.62,
    color: oInk(0.78),
    marginTop: 14,
    maxWidth: 310,
  },
  signInLead: {
    fontFamily: F.sans,
    fontSize: 16,
    color: oInk(0.74),
    textAlign: 'center',
    marginTop: 22,
  },
  // The Get started pill's geometry (ContinuePill: buttonHeight, full round),
  // outlined in forest on the paper canvas: secondary by weight, not by size.
  signInButton: {
    width: '100%',
    height: L.buttonHeight,
    borderRadius: R.pill,
    borderWidth: 1.5,
    borderColor: C.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  signInButtonPressed: { backgroundColor: oForest(0.08) },
  signInLabel: { fontFamily: F.sansSemi, fontSize: T.ui, color: C.forest },
});
