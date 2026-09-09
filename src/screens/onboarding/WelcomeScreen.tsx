/**
 * Screen 11 in the design canvas — "one way forward, one quiet way back in".
 *
 * The mark sits top-left rather than centred, the promise carries the screen,
 * and the two proof lines are checks rather than badges. "Get started" is the
 * only filled control; signing in is a quiet underline underneath, because
 * returning users are the minority and a second pill would split the decision.
 *
 * Both navigation paths are unchanged from v1.2.0: Get started → UserType
 * (with the restart-tracking branch), Sign in → Auth in signin mode.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';
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

const PROOF = ['Written by child psychologists', 'Used the same evening you read it'];

function CheckMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={C.forest}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

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
            The hardest job in the world came with *no manual*.
          </RichHeadline>
          <Text style={styles.lede}>
            Kinderwell is the manual. Six questions, five minutes, and a plan built around your
            family.
          </Text>

          <View style={styles.proof}>
            {PROOF.map((line, i) => (
              <View
                key={line}
                style={[styles.proofRow, i < PROOF.length - 1 ? styles.proofRule : null]}
              >
                <CheckMark />
                <Text style={styles.proofText}>{line}</Text>
              </View>
            ))}
          </View>

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
  proof: { marginTop: 30 },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 12 },
  proofRule: { borderBottomWidth: 1, borderBottomColor: oInk(0.09) },
  proofText: { flex: 1, fontFamily: F.serif, fontSize: T.body, color: C.ink },
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
