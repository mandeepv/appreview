import React, { useEffect, useRef, useState } from 'react';
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

/**
 * LoadingScreen is the subscription gate. Every route to Root passes through
 * this screen. It has two responsibilities:
 *
 *   1. Save onboarding data to Supabase (first-time flow, guarded by
 *      onboardingStore having non-null answers).
 *   2. Present the mandatory paywall unless the user is already entitled
 *      (`isSubscribed` in device-local memory, OR isDemoUser for App Review).
 *
 * Hard-paywall model (2026-07-05):
 *   - Entitled users (subscribed or demo) → skip paywall, go straight to Root.
 *   - Unentitled users → paywall shows. Dismiss is undismissable in the
 *     Superwall template (no X, no "Not now"). If Superwall's SDK reports a
 *     dismiss anyway (older template, glitch, etc.), we re-present the
 *     paywall rather than navigating away — the app has no free experience.
 *   - Purchase success → Root.
 *   - Superwall unreachable (offline or outage) →
 *       - If user is a confirmed subscriber (isSubscribed already true from a
 *         previous session), fail-open to Root. Their subscription may have
 *         lapsed but we won't kick a paying user offline. Fable review #9.
 *       - Otherwise, sit on the loading state; the retry effect below will
 *         re-attempt registerPlacement periodically until Superwall responds.
 *
 * See docs/PAYWALL_MODEL.md for the full policy and the reasoning behind
 * each branch.
 */
export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const { user, isDemoUser, isSubscribed, setIsSubscribed } = useAuthStore();
  const onboardingStore = useOnboardingStore();
  // Lazy init — read once at mount to decide the initial progress value.
  // Post-onboarding paths start at 0 (progress theater runs); cold-launch
  // paths start at 100 (no theater, straight to gate). Using a lazy
  // initializer avoids a setState-in-effect cascading render (caught by
  // react-hooks/set-state-in-effect).
  const [progress, setProgress] = useState(() =>
    onboardingStore.userType !== null ? 0 : 100,
  );
  const [scaleAnim] = useState(new Animated.Value(1));
  const [gateStatus, setGateStatus] = useState<'idle' | 'presenting' | 'retry' | 'blocked'>('idle');
  const { identify } = useUser();
  const posthog = usePostHog();
  const paywallPresentedRef = useRef(false);

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
      paywallPresentedRef.current = true;
      setGateStatus('presenting');
    },
    onDismiss: (paywallInfo, result) => {
      if (__DEV__) console.log('👋 Paywall dismissed:', result.type);

      // Purchase completed — advance to Root. The Superwall subscription-
      // status listener in App.tsx will flip isSubscribed → true, but we
      // also set it here so navigation isn't racing that event.
      if (result.type === 'purchased') {
        if (__DEV__) console.log('💰 Purchase completed! Updating subscription status...');
        setIsSubscribed(true);
        safeCapture('subscription_purchased', {
          paywall_name: paywallInfo.name,
        });
        navigation.replace('Root');
        return;
      }

      // Any other dismiss = user tapped X / swiped down / whatever.
      //
      // Hard-paywall model: unentitled users MUST NOT navigate past this
      // screen without a purchase. The Superwall template SHOULD have no
      // dismiss control at all, but if the template ever ships with one
      // (older cached template, dashboard misconfig, etc.) we defensively
      // re-present the paywall rather than falling through to Root.
      //
      // Result: even in the worst case (template has an X button), the
      // user can't bypass — dismissing the paywall just re-shows it.
      safeCapture('paywall_dismissed', {
        paywall_name: paywallInfo.name,
        dismiss_type: result.type,
      });
      if (__DEV__) console.log('🔒 Paywall dismissed without purchase — re-presenting (hard gate)');
      // Small delay so Superwall's own dismiss animation completes before we
      // ask it to present again. Without the delay, the re-present can
      // no-op silently.
      setTimeout(() => runGate(), 300);
    },
    onSkip: (reason) => {
      // "Skip" fires when Superwall bypasses paywall presentation itself —
      // e.g., the user is already entitled and Superwall's own check catches
      // it before showing the UI. That means: they're paying, let them through.
      if (__DEV__) console.log('⏭️ Paywall skipped by Superwall (user is entitled):', reason.type);
      safeCapture('paywall_skipped_by_superwall', {
        skip_reason: reason.type,
      });
      navigation.replace('Root');
    },
    onError: (error) => {
      // Superwall SDK error. Two common causes: network unreachable (user
      // offline OR Superwall down), or the paywall template failed to load.
      //
      // Policy (Fable review #9):
      //   - Confirmed subscribers → fail-open to Root. Don't kick paying
      //     users off just because Superwall can't reach us right now.
      //     Their `isSubscribed` was set to true by a prior authoritative
      //     Superwall event; we trust that until Superwall says otherwise.
      //   - Everyone else → sit on the loading state. The retry hook
      //     below will re-attempt registerPlacement.
      if (__DEV__) console.error('❌ Paywall error:', error);
      posthog.captureException(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      reportError(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      if (isSubscribed) {
        if (__DEV__) console.log('[LoadingScreen] Superwall unreachable but user is confirmed subscribed — failing open');
        navigation.replace('Root');
      } else {
        setGateStatus('retry');
      }
    },
  });

  // Save onboarding data to Supabase on mount — ONLY if we actually have
  // onboarding data to save. Under the hard-paywall model, this screen is
  // hit on every cold-launch of a signed-in user, not just after onboarding
  // completes. The onboardingStore is cleared after a successful save, so
  // a null userType is the signal that "we've been through this before,
  // don't re-upsert an empty payload."
  useEffect(() => {
    const hasOnboardingPayload = onboardingStore.userType !== null;
    if (!hasOnboardingPayload) {
      if (__DEV__) console.log('📝 No onboarding data pending — skipping save (cold-launch path)');
      return;
    }
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

  const runGate = async () => {
    // Entitlement short-circuits — check BEFORE bothering Superwall.
    //
    // Demo users: 7-tap Apple-reviewer bypass. Always let through, always
    // skip Superwall entirely (Superwall would try to authenticate and
    // fail; the reviewer needs to see the paid content without a purchase).
    //
    // Confirmed subscribers: isSubscribed is set to true when Superwall's
    // app-level onSubscriptionStatusChange listener (App.tsx) has
    // previously reported ACTIVE. That flag is authoritative — no need
    // to re-verify with Superwall on this launch. If the subscription
    // has actually lapsed since we cached the flag, the next
    // onSubscriptionStatusChange event will flip it to false and the
    // NEXT launch will hit the paywall. One extra session for a
    // just-lapsed user is an acceptable trade against kicking legit
    // paying users offline.
    if (isDemoUser) {
      if (__DEV__) console.log('⏩ Skipping paywall — demo user');
      navigation.replace('Root');
      return;
    }
    if (isSubscribed) {
      if (__DEV__) console.log('⏩ Skipping paywall — user is a confirmed subscriber');
      navigation.replace('Root');
      return;
    }

    // SKIP_PAYWALL is a dev-only test convenience — it lets us bypass the
    // paywall on the simulator when we're not working on the paywall itself.
    // Fable review #6 flagged that the guard was purely on the env var
    // (Constants.expoConfig.extra.skipPaywall === 'true') with NO build-time
    // check. One copy-paste of "true" into eas.json's production profile
    // would ship a revenue-free App Store build, silently. We now gate on
    // __DEV__ so this bypass is structurally impossible in an App Store
    // build — the JS runtime literal __DEV__ is minified to false at build
    // time by Metro. Belt-and-suspenders: app.config.js also throws at
    // build time if SKIP_PAYWALL=true is paired with the prod Supabase
    // project ref (so a bad eas.json profile blows up in CI, not on device).
    const skipPaywall = Constants.expoConfig?.extra?.skipPaywall;
    const shouldSkipPaywall = __DEV__ && skipPaywall === 'true';
    if (shouldSkipPaywall) {
      if (__DEV__) console.log('⏩ Skipping paywall — SKIP_PAYWALL=true (dev only)');
      navigation.replace('Root');
      return;
    }

    if (__DEV__) console.log('=== 🚀 RUNNING GATE (unsubscribed user) ===');
    if (__DEV__) console.log('User ID:', user?.id);

    try {
      // Identify user with Superwall so subscription state is scoped to
      // this user, not the device. Handles the case of two people sharing
      // a device — each pays for their own subscription.
      if (user?.id) {
        if (__DEV__) console.log('👤 Identifying user with Superwall:', user.id);
        await identify(user.id);
      }

      if (__DEV__) console.log('📱 Registering placement: subscription_gate');
      await registerPlacement({
        placement: 'subscription_gate',
      });

      if (__DEV__) console.log('✅ Placement registered');
    } catch (error) {
      if (__DEV__) console.error('❌ Error running gate:', error);
      // Duplicates onError logic below because usePlacement's onError only
      // fires for Superwall SDK errors, not for our own await failures.
      // Same fail-open policy: confirmed subscribers get through; everyone
      // else stays put and retries.
      if (isSubscribed) {
        navigation.replace('Root');
      } else {
        setGateStatus('retry');
      }
    }
  };


  useEffect(() => {
    // Gentle continuous breathing animation runs on every path.
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

    const hasOnboardingPayload = onboardingStore.userType !== null;

    if (hasOnboardingPayload) {
      // Post-onboarding: run the 4-second progress theater (the
      // "analyzing your family profile" messaging) so the user sees the
      // app doing something with their answers. Then run the gate.
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => runGate(), 600);
            return 100;
          }
          return prev + 1.25;
        });
      }, 50);
      return () => clearInterval(interval);
    }

    // Cold-launch through the gate: progress is already 100 (lazy init).
    // Just a brief spinner state then run the gate. Under the
    // hard-paywall model this screen is hit on every launch of a
    // signed-in user; a 4-second progress bar every time would be
    // needlessly annoying.
    const timer = setTimeout(() => runGate(), 200);
    return () => clearTimeout(timer);
  }, [navigation]);

  // Auto-retry the gate when it fails to reach Superwall. Runs every 3s
  // while gateStatus === 'retry'. Stops as soon as we successfully
  // present a paywall, navigate away, or detect entitlement. Fine to
  // let this fire forever — the user is stuck on this screen anyway
  // and each retry costs at most one network request.
  useEffect(() => {
    if (gateStatus !== 'retry') return;
    const retryTimer = setInterval(() => {
      if (__DEV__) console.log('🔁 Retrying gate (Superwall was unreachable)');
      runGate();
    }, 3000);
    return () => clearInterval(retryTimer);
  }, [gateStatus]);

  const getMessage = () => {
    if (gateStatus === 'retry') return "Checking your subscription — please make sure you're online...";
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
