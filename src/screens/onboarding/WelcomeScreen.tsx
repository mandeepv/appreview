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
import { KinderwellMark } from '../../components/onboarding/KinderwellMark';
import { RichHeadline, ContinuePill } from '../../components/onboarding/OnboardingScreen';
import { trackWelcomeCtaTapped, trackOnboardingRestarted } from '../../lib/analytics';
import { useOnboardingStore } from '../../store/onboardingStore';
import {
  Animation,
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingLayout as L,
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
          <KinderwellMark size={46} color={C.forest} />

          <View style={styles.grow} />

          <RichHeadline style={styles.headline}>
            Become a better parent, *five minutes a day*.
          </RichHeadline>
          <Text style={styles.lede}>
            Short daily lessons from child psychologists, built around your kids.
          </Text>

          <View style={styles.grow} />

          <View>
            <ContinuePill label="Get started" onPress={handleGetStarted} />
            <View style={styles.signInRow}>
              <Text style={styles.signInLead}>Already have an account?</Text>
              <Pressable onPress={handleSignIn} hitSlop={10}>
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            </View>
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
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  signInLead: { fontFamily: F.sans, fontSize: 16, color: oInk(0.74) },
  signInLink: {
    fontFamily: F.sansSemi,
    fontSize: 16,
    color: C.forestDeep,
    borderBottomWidth: 1.5,
    borderBottomColor: oForest(0.5),
    paddingBottom: 1,
  },
});
