import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { ProgressBar } from '../../components/ProgressBar';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { saveUserOnboardingData } from '../../services/onboardingService';
import { usePlacement, useUser, useSuperwallEvents } from 'expo-superwall';
import Constants from 'expo-constants';
import { safeCapture } from '../../lib/analytics';
import { reportError } from '../../config/sentry';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Loading'>;

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const { user, isDemoUser, setIsSubscribed } = useAuthStore();
  const onboardingStore = useOnboardingStore();
  const { identify } = useUser();
  const posthog = usePostHog();

  // NOTE: onSubscriptionStatusChange is now handled at the app level in App.tsx
  // so it survives across screen mounts / unmounts. LoadingScreen only listens
  // to paywall-flow analytics events here.
  useSuperwallEvents({
    onSuperwallEvent: (eventInfo) => {
      // Fires when user taps a plan on the paywall (before App Store sheet appears).
      // safeCapture swallows any error — analytics must never break the paywall flow.
      if (eventInfo.event.event === 'transactionStart') {
        safeCapture('paywall_option_selected', {
          product_id: eventInfo.params?.product_id,
          paywall_name: eventInfo.params?.paywall_name,
        });
      } else if (eventInfo.event.event === 'transactionAbandon') {
        safeCapture('paywall_purchase_abandoned', {
          product_id: eventInfo.params?.product_id,
          paywall_name: eventInfo.params?.paywall_name,
        });
      } else if (eventInfo.event.event === 'transactionFail') {
        safeCapture('paywall_purchase_failed', {
          product_id: eventInfo.params?.product_id,
          paywall_name: eventInfo.params?.paywall_name,
          error: eventInfo.params?.error_message,
        });
      }
    },
  });

  const { registerPlacement } = usePlacement({
    onPresent: (paywallInfo) => {
      if (__DEV__) console.log('✅ Paywall presented:', paywallInfo.name);
    },
    onDismiss: (paywallInfo, result) => {
      if (__DEV__) console.log('👋 Paywall dismissed:', result.type);

      // Check if user completed a purchase
      if (result.type === 'purchased') {
        if (__DEV__) console.log('💰 Purchase completed! Updating subscription status...');
        setIsSubscribed(true);
        safeCapture('subscription_purchased', {
          paywall_name: paywallInfo.name,
        });
      } else {
        safeCapture('paywall_dismissed', {
          paywall_name: paywallInfo.name,
          dismiss_type: result.type,
        });
      }

      navigation.replace('Root');
    },
    onSkip: (reason) => {
      if (__DEV__) console.log('⏭️ Paywall skipped:', reason.type);
      safeCapture('paywall_dismissed', {
        dismiss_type: 'skipped',
        skip_reason: reason.type,
      });
      navigation.replace('Root');
    },
    onError: (error) => {
      if (__DEV__) console.error('❌ Paywall error:', error);
      posthog.captureException(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      reportError(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      navigation.replace('Root');
    },
  });

  // Save onboarding data to Supabase on mount
  useEffect(() => {
    const saveOnboardingData = async () => {
      if (user?.id) {
        try {
          // Skip Supabase save for demo users
          if (!isDemoUser) {
            // Name deserves special handling. NameAgeScreen falls back to the
            // literal string 'Parent' when the user leaves the field blank
            // (see NameAgeScreen.tsx:32). If we include that fallback in the
            // upsert, it clobbers any real name already stored — including
            // the one signInWithApple just saved from credential.fullName on
            // brand-new Apple users (authService.ts:191-220). Fable review #5.
            //
            // So: only include name in the payload if the user actually
            // typed something. Undefined values are safe (Supabase's upsert
            // doesn't overwrite columns for fields that aren't in the
            // payload). The 'Parent' literal stays out of the DB entirely.
            const typedName = onboardingStore.name?.trim();
            const nameToSave = typedName && typedName !== 'Parent'
              ? typedName
              : undefined;

            const onboardingData = {
              userType: onboardingStore.userType,
              name: nameToSave,
              age: onboardingStore.age,
              childrenCount: onboardingStore.childrenCount,
              children: onboardingStore.children,
              improvementGoals: onboardingStore.improvementGoals,
              notificationsEnabled: onboardingStore.notificationsEnabled,
              partnerInvolvement: onboardingStore.partnerInvolvement,
              partnerInvited: onboardingStore.partnerInvited,
              learningGoal: onboardingStore.learningGoal,
              experienceLevel: onboardingStore.experienceLevel,
              familiarParentingStyles: onboardingStore.familiarParentingStyles,
              emotionalChallenges: onboardingStore.emotionalChallenges,
              authMethod: onboardingStore.authMethod,
              selectedPlan: onboardingStore.selectedPlan,
            };

            await saveUserOnboardingData(user.id, onboardingData);
          } else {
            if (__DEV__) console.log('📝 Demo user - skipping Supabase save');
          }

          // Clear local onboarding state after saving
          await onboardingStore.clearState();
        } catch (error) {
          if (__DEV__) console.error('Error saving onboarding data:', error);
          // Continue anyway - don't block user from entering app
        }
      }
    };

    saveOnboardingData();
  }, [user, isDemoUser]);

  const showPaywall = async () => {
    // SKIP_PAYWALL is a dev-only test convenience — it lets us bypass the
    // paywall on the simulator when we're not working on the paywall itself.
    // Fable review #6 flagged that the guard was purely on the env var
    // (Constants.expoConfig.extra.skipPaywall === 'true') with NO build-time
    // check. One copy-paste of "true" into eas.json's production profile
    // would ship a revenue-free App Store build, silently. We now gate on
    // __DEV__ so this bypass is structurally impossible in an App Store
    // build — the JS runtime literal __DEV__ is minified to false at build
    // time by Metro. Belt-and-suspenders: app.config.js also throws at
    // build time if SKIP_PAYWALL=true is paired with the prod bundle ID
    // (so a bad eas.json profile blows up in CI, not on device).
    const skipPaywall = Constants.expoConfig?.extra?.skipPaywall;
    const shouldSkipPaywall = __DEV__ && skipPaywall === 'true';

    if (__DEV__) console.log('=== 🚀 SHOWING PAYWALL ===');
    if (__DEV__) console.log('SKIP_PAYWALL:', skipPaywall);
    if (__DEV__) console.log('Is Demo User:', isDemoUser);
    if (__DEV__) console.log('User ID:', user?.id);

    if (shouldSkipPaywall || isDemoUser) {
      if (__DEV__) console.log('⏩ Skipping paywall', isDemoUser ? '(Demo User)' : '(SKIP_PAYWALL)');
      navigation.replace('Root');
      return;
    }

    try {
      // Identify user with Superwall
      if (user?.id) {
        if (__DEV__) console.log('👤 Identifying user:', user.id);
        await identify(user.id);
      }

      if (__DEV__) console.log('📱 Registering placement: show_paywall');
      await registerPlacement({
        placement: 'show_paywall',
      });

      if (__DEV__) console.log('✅ Placement registered');
    } catch (error) {
      if (__DEV__) console.error('❌ Error showing paywall:', error);
      navigation.replace('Root');
    }
  };


  useEffect(() => {
    // Gentle continuous breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slower, more deliberate progress (4 seconds total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // After loading completes, show paywall
            showPaywall();
          }, 600);
          return 100;
        }
        return prev + 1.25;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigation]);

  const getMessage = () => {
    if (progress < 25) return 'Analyzing your family profile...';
    if (progress < 50) return 'Tailoring lessons for your needs...';
    if (progress < 75) return 'Balancing science with real-life...';
    if (progress < 95) return 'Finalizing your journey...';
    return 'Almost ready!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>
          Designing your parenting journey
        </Text>

        <Text style={styles.description}>
          Creating a personalized program tailored to your family
        </Text>

        <View style={styles.progressContainer}>
          <ProgressBar current={progress} total={100} style={styles.progressBar} />
        </View>

        <Text style={styles.status}>{getMessage()}</Text>
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
    paddingHorizontal: Spacing['4xl'],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing['5xl'],
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F8F8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['5xl'],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
    paddingHorizontal: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  progressBar: {
    height: 6,
  },
  status: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});
