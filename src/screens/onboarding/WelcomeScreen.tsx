import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Colors, Spacing, Typography, Animation, BorderRadius } from '../../constants/theme';
import { trackWelcomeCtaTapped, trackOnboardingRestarted } from '../../lib/analytics';
import { useOnboardingStore } from '../../store/onboardingStore';
import { resolveOnboardingVariant, warmOnboardingFlag, type OnboardingVariant } from '../../lib/experiments';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

// SPEC-15: pure Welcome→first-onboarding-screen mapping, extracted so the
// branch is unit-testable without rendering the screen (R6). Control enters the
// existing variant-A flow at UserType; variant_b enters the variant-B scaffold
// at VariantBQ1. Both arms converge again at Auth → Loading → paywall.
export const resolveWelcomeDestination = (
  variant: OnboardingVariant,
): 'UserType' | 'VariantBQ1' => (variant === 'variant_b' ? 'VariantBQ1' : 'UserType');

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { getLastScreen } = useOnboardingStore();

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

    // SPEC-15 + SPEC-FIX-11 R4: warm the FLAG CACHE on mount without assigning.
    // The old mount call to resolveOnboardingVariant() persisted an assignment
    // (+ event + super-property) the instant Welcome rendered — so a user who
    // bounced or tapped "already have an account" without ever entering
    // onboarding still got counted into the experiment. An assignment must exist
    // ONLY for devices that actually enter onboarding (handleGetStarted).
    // warmOnboardingFlag primes PostHog's flag cache (so the Get Started tap is
    // still instant) but never persists, never fires the event. Never throws.
    warmOnboardingFlag();
  }, []);

  const handleGetStarted = async () => {
    trackWelcomeCtaTapped('get_started');
    // If user had progress from a prior session, tapping Get Started here is a restart
    const priorLastScreen = await getLastScreen();
    if (priorLastScreen && priorLastScreen !== 'Welcome') {
      trackOnboardingRestarted(priorLastScreen);
    }
    // SPEC-15: resolve the onboarding variant and branch. Already warm from the
    // mount effect ⇒ instant; a cold/slow first launch is capped at the 2s
    // timeout inside the accessor, then falls back to control. Only fresh
    // onboarding is split — the "already have an account" path below is
    // untouched.
    const variant = await resolveOnboardingVariant();
    navigation.navigate(resolveWelcomeDestination(variant));
  };

  const handleSignIn = () => {
    trackWelcomeCtaTapped('sign_in');
    // Enter Auth in signin mode — same auth code path, different copy and
    // post-signin routing. See OnboardingStackParamList.Auth for details.
    navigation.navigate('Auth', { mode: 'signin' });
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/splash.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>Kinderwell</Text>
          <Text style={styles.subtitle}>
            Science-backed parenting guidance for your family's unique journey
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: Spacing.xl,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginBottom: Spacing['2xl'],
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.surface,
    opacity: 0.95,
    textAlign: 'center',
    marginBottom: Spacing['5xl'],
    lineHeight: Typography.sizes.lg * Typography.lineHeights.normal,
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.lg,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  linkText: {
    fontSize: Typography.sizes.base,
    color: Colors.surface,
    opacity: 0.9,
    textDecorationLine: 'underline',
  },
});
