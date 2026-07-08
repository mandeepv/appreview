import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePostHog } from 'posthog-react-native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { ProgressBar } from '../../components/ProgressBar';
import { Button } from '../../components/Button';
import { Caption } from '../../components/Typography';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useConfigStore } from '../../store/configStore';
import { resolveGateOutcome } from '../../navigation/routingPolicy';
import { saveUserOnboardingData } from '../../services/onboardingService';
import { restorePurchases } from '../../services/purchaseService';
import { usePlacement, useUser, useSuperwallEvents } from 'expo-superwall';
import Constants from 'expo-constants';
import { safeCapture } from '../../lib/analytics';
import { reportError } from '../../config/sentry';

// Support address for the escape-hatch "Contact support" action. Matches
// SettingsScreen's handleContactSupport so support routing stays consistent
// (SPEC-01 R3, DECISION(owner)).
const SUPPORT_EMAIL = 'kinderwellteam@gmail.com';

// Number of failed gate attempts before we surface the escape hatch. At 3
// retries (the retry interval is 3s) the user has been stuck ~9s+ — long
// enough that "Superwall is unreachable" is a real possibility, not a blip.
const ESCAPE_HATCH_AFTER_ATTEMPTS = 3;

// How long to wait for onPresent after asking Superwall to present. If it
// hasn't fired by then, the presentation is considered frozen and we fall
// back to the retry state (SPEC-01 R4).
const PRESENT_WATCHDOG_MS = 5000;

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
  const { signOut } = useAuthStore();

  // R5: the paywall gate must not run until the kill-switch (app_config)
  // check has resolved, and must never run if force-update is active.
  // configStore is the single source of truth shared with App.tsx (which
  // renders the ForceUpdateModal), so the two can't present concurrently.
  const configStatus = useConfigStore(state => state.status);

  // R4: watchdog timer that fires if onPresent doesn't arrive after a
  // present attempt. Held in a ref so runGate can (re)arm it and onPresent /
  // unmount can clear it.
  const presentWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // R3b: how many times the gate has failed to reach Superwall. Drives the
  // escape hatch (shown once attempts >= ESCAPE_HATCH_AFTER_ATTEMPTS). It's a
  // ref because the 3s retry interval reads/increments it without needing a
  // re-render; escapeHatchVisible below is the render-driving mirror.
  const retryAttemptsRef = useRef(0);
  const [escapeHatchVisible, setEscapeHatchVisible] = useState(false);
  // Guards the gate_escape_hatch_shown capture so it fires exactly once per
  // screen mount (first render of the buttons), not on every retry tick.
  const escapeHatchCapturedRef = useRef(false);
  // Inline error under the escape-hatch actions (no Alerts here — the retry
  // screen is already a degraded state, a modal on top would be worse).
  const [escapeError, setEscapeError] = useState<string | null>(null);
  const [isRestoringHatch, setIsRestoringHatch] = useState(false);

  const clearPresentWatchdog = () => {
    if (presentWatchdogRef.current) {
      clearTimeout(presentWatchdogRef.current);
      presentWatchdogRef.current = null;
    }
  };

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

  // ACT on a gate outcome computed by resolveGateOutcome (the pure kernel,
  // SPEC-04 R1). This is the single place the three gate callbacks below turn
  // a decision into navigation/state side effects — the callbacks themselves
  // no longer contain routing conditionals, only analytics + the compute call.
  const applyGateOutcome = (outcome: ReturnType<typeof resolveGateOutcome>) => {
    switch (outcome) {
      case 'enter_root':
        navigation.replace('Root');
        return;
      case 're_present':
        if (__DEV__) console.log('🔒 Paywall dismissed without purchase — re-presenting (hard gate)');
        // Small delay so Superwall's own dismiss animation completes before we
        // ask it to present again. Without the delay, the re-present can
        // no-op silently.
        setTimeout(() => runGate(), 300);
        return;
      case 'retry':
        setGateStatus('retry');
        return;
    }
  };

  const { registerPlacement } = usePlacement({
    onPresent: (paywallInfo) => {
      if (__DEV__) console.log('✅ Paywall presented:', paywallInfo.name);
      // R4: presentation arrived — disarm the frozen-state watchdog.
      clearPresentWatchdog();
      paywallPresentedRef.current = true;
      setGateStatus('presenting');
    },
    onDismiss: (paywallInfo, result) => {
      if (__DEV__) console.log('👋 Paywall dismissed:', result.type);

      // Entitlement side effects (setIsSubscribed + analytics) stay here; the
      // route decision comes from resolveGateOutcome. purchased and restored
      // are both entitlements → enter_root; declined → re_present (hard gate).
      if (result.type === 'purchased') {
        if (__DEV__) console.log('💰 Purchase completed! Updating subscription status...');
        // The App.tsx subscription-status listener will flip isSubscribed →
        // true, but we also set it here so navigation isn't racing that event.
        setIsSubscribed(true);
        safeCapture('subscription_purchased', { paywall_name: paywallInfo.name });
      } else if (result.type === 'restored') {
        // Restore succeeded on the paywall — a real entitlement, same as
        // purchased (SPEC-01 R2; 'restored' used to fall into re-present and
        // trap a legitimately-restored payer). Fire subscription_restored,
        // NOT subscription_purchased — no money changed hands.
        if (__DEV__) console.log('♻️ Purchases restored on paywall — treating as entitlement');
        setIsSubscribed(true);
        safeCapture('subscription_restored', { paywall_name: paywallInfo.name });
      } else {
        // declined — a dismiss without entitlement. Hard-paywall model: the
        // template should have no dismiss control, but if one slips through we
        // re-present rather than let the user past.
        safeCapture('paywall_dismissed', {
          paywall_name: paywallInfo.name,
          dismiss_type: result.type,
        });
      }

      applyGateOutcome(resolveGateOutcome({ kind: 'dismiss', type: result.type }, isSubscribed));
    },
    onSkip: (reason) => {
      // "Skip" fires when Superwall bypasses paywall presentation itself —
      // e.g. the user is already entitled and Superwall's own check catches it
      // before showing the UI. Every skip reason means "let them through."
      if (__DEV__) console.log('⏭️ Paywall skipped by Superwall (user is entitled):', reason.type);
      safeCapture('paywall_skipped_by_superwall', { skip_reason: reason.type });
      applyGateOutcome(resolveGateOutcome({ kind: 'skip', reason: reason.type }, isSubscribed));
    },
    onError: (error) => {
      // Superwall SDK error (network unreachable or template load failure).
      // Policy (Fable review #9): confirmed subscribers fail open to Root;
      // everyone else sits on retry. That mapping now lives in
      // resolveGateOutcome — here we just log/report and apply it.
      if (__DEV__) console.error('❌ Paywall error:', error);
      // R4 (structural): an error means no presentation is coming — disarm
      // the frozen-state watchdog so it can't redundantly re-trigger retry.
      clearPresentWatchdog();
      posthog.captureException(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      reportError(new Error(typeof error === 'string' ? error : 'Paywall error'), {
        screen: 'LoadingScreen',
        context: 'paywall',
      });
      if (isSubscribed && __DEV__) {
        console.log('[LoadingScreen] Superwall unreachable but user is confirmed subscribed — failing open');
      }
      applyGateOutcome(resolveGateOutcome({ kind: 'error' }, isSubscribed));
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
    // R5: force-update wins over the paywall. Do not run the gate until the
    // kill-switch check has resolved, and never run it if a force-update is
    // required. Both would otherwise present full-screen concurrently with
    // the ForceUpdateModal (App.tsx). If we're still 'loading', we simply
    // return; the config-status effect below re-invokes runGate once the
    // check resolves to 'ok'. If 'force_update', the ForceUpdateModal owns
    // the screen and the gate never runs.
    const status = useConfigStore.getState().status;
    if (status === 'loading') {
      if (__DEV__) console.log('⏳ Gate deferred — waiting on app_config check');
      return;
    }
    if (status === 'force_update') {
      if (__DEV__) console.log('🛑 Gate suppressed — force-update is active');
      return;
    }

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

      // R4: watchdog for the frozen "presenting" state. After a
      // dismiss→re-present, if Superwall never fires onPresent, gateStatus
      // would sit on 'presenting' forever (the retry interval only runs on
      // 'retry'). So: reset the presented flag before every attempt, then
      // arm a 5s timer. If onPresent hasn't fired when it expires, drop to
      // the retry state (which re-attempts and, after enough failures,
      // surfaces the escape hatch). onPresent clears the timer; so does
      // unmount.
      paywallPresentedRef.current = false;
      clearPresentWatchdog();
      presentWatchdogRef.current = setTimeout(() => {
        if (!paywallPresentedRef.current) {
          if (__DEV__) console.log('⏱️ onPresent never fired within 5s — treating presentation as frozen, dropping to retry');
          setGateStatus('retry');
        }
      }, PRESENT_WATCHDOG_MS);

      if (__DEV__) console.log('📱 Registering placement: subscription_gate');
      await registerPlacement({
        placement: 'subscription_gate',
      });

      if (__DEV__) console.log('✅ Placement registered');
    } catch (error) {
      // The register attempt failed outright — no presentation is coming, so
      // disarm the watchdog before falling into the retry/fail-open branch.
      clearPresentWatchdog();
      if (__DEV__) console.error('❌ Error running gate:', error);
      // usePlacement's onError only fires for Superwall SDK errors, not for
      // our own await failures — but the decision is the same, so route it
      // through the same kernel outcome (error → fail-open for subscribers,
      // else retry).
      applyGateOutcome(resolveGateOutcome({ kind: 'error' }, isSubscribed));
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

  // R5: if the gate was deferred at mount because the app_config check was
  // still in flight, re-run it as soon as the check resolves to 'ok'. On
  // 'force_update' we do nothing — the ForceUpdateModal owns the screen.
  // Guarded on gateStatus === 'idle' so this only fires the initial deferred
  // run, never re-triggers a gate that's already presenting/retrying.
  useEffect(() => {
    if (configStatus === 'ok' && gateStatus === 'idle') {
      if (__DEV__) console.log('✅ app_config resolved to ok — running deferred gate');
      runGate();
    }
  }, [configStatus]);

  // Auto-retry the gate when it fails to reach Superwall. Runs every 3s
  // while gateStatus === 'retry'. Stops as soon as we successfully
  // present a paywall, navigate away, or detect entitlement. Fine to
  // let this fire forever — the user is stuck on this screen anyway
  // and each retry costs at most one network request.
  //
  // R3b: each retry increments retryAttemptsRef. Once we cross the
  // threshold, surface the escape hatch (Restore / Sign out / Contact
  // support) so a user who can't reach Superwall isn't trapped forever.
  useEffect(() => {
    if (gateStatus !== 'retry') return;
    const retryTimer = setInterval(() => {
      retryAttemptsRef.current += 1;
      if (__DEV__) console.log(`🔁 Retrying gate (attempt ${retryAttemptsRef.current}, Superwall was unreachable)`);
      if (retryAttemptsRef.current >= ESCAPE_HATCH_AFTER_ATTEMPTS && !escapeHatchVisible) {
        setEscapeHatchVisible(true);
      }
      runGate();
    }, 3000);
    return () => clearInterval(retryTimer);
  }, [gateStatus, escapeHatchVisible]);

  // R3b: fire gate_escape_hatch_shown exactly once per screen mount — on the
  // first render of the escape-hatch buttons, not on every retry tick.
  useEffect(() => {
    if (escapeHatchVisible && !escapeHatchCapturedRef.current) {
      escapeHatchCapturedRef.current = true;
      safeCapture('gate_escape_hatch_shown');
    }
  }, [escapeHatchVisible]);

  // R4: make sure the present-watchdog timer never outlives the screen.
  useEffect(() => clearPresentWatchdog, []);

  // R3b escape-hatch action 1: Restore Purchases. Reuses purchaseService
  // (the same StoreKit walk as SettingsScreen — no third copy). On a real
  // restore, flip isSubscribed and advance to Root. On anything else, show
  // an inline error (no Alert — we're already on a degraded screen).
  const handleEscapeRestore = async () => {
    if (isRestoringHatch) return;
    setEscapeError(null);
    setIsRestoringHatch(true);
    safeCapture('gate_escape_restore_tapped');
    try {
      const result = await restorePurchases();
      if (result.outcome === 'restored') {
        setIsSubscribed(true);
        safeCapture('subscription_restored', { paywall_name: 'gate_escape_hatch' });
        navigation.replace('Root');
        return;
      }
      if (result.outcome === 'no_purchases') {
        setEscapeError("No previous purchase was found for this Apple ID. Make sure you're signed in with the Apple ID you used to subscribe.");
      } else if (result.outcome === 'unknown') {
        setEscapeError("We're still checking with the App Store. Please try again in a moment.");
      } else {
        setEscapeError('Something went wrong. Please check your connection and try again.');
      }
    } finally {
      setIsRestoringHatch(false);
    }
  };

  // R3b escape-hatch action 2: Sign out. Mirrors SettingsScreen's sign-out
  // navigation — signOut() clears auth + the persisted subscription flag,
  // and we reset the nav stack to Welcome.
  const handleEscapeSignOut = async () => {
    setEscapeError(null);
    safeCapture('gate_escape_sign_out_tapped');
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    } catch (error) {
      if (__DEV__) console.error('Escape-hatch sign-out failed:', error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        screen: 'LoadingScreen',
        context: 'gate_escape_sign_out',
      });
      setEscapeError('Could not sign out. Please try again.');
    }
  };

  // R3b escape-hatch action 3: Contact support. Opens a mailto in try/catch
  // (Linking.openURL can reject if no mail client is configured).
  const handleEscapeContactSupport = async () => {
    setEscapeError(null);
    safeCapture('gate_escape_contact_support_tapped');
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Kinderwell — trouble reaching the app')}`);
    } catch (error) {
      if (__DEV__) console.error('Escape-hatch mailto failed:', error);
      setEscapeError(`Couldn't open your email app. Please email us at ${SUPPORT_EMAIL}.`);
    }
  };

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

        {/* R3b: escape hatch. Only after the gate has failed to reach
            Superwall enough times (>= ESCAPE_HATCH_AFTER_ATTEMPTS) do we
            offer a way out. Rendered visually subordinate to the spinner
            above — the retry loop keeps running underneath; these are the
            fallback, not the main event. */}
        {escapeHatchVisible && (
          <View style={styles.escapeContainer}>
            <Caption center style={styles.escapeIntro}>
              Still having trouble? You can:
            </Caption>

            <Button
              title="Restore Purchases"
              variant="secondary"
              onPress={handleEscapeRestore}
              loading={isRestoringHatch}
              style={styles.escapeButton}
            />
            <Button
              title="Sign out"
              variant="outline"
              onPress={handleEscapeSignOut}
              disabled={isRestoringHatch}
              style={styles.escapeButton}
            />
            <Button
              title="Contact support"
              variant="outline"
              onPress={handleEscapeContactSupport}
              disabled={isRestoringHatch}
              style={styles.escapeButton}
            />

            {escapeError && (
              <Caption center color={Colors.error} style={styles.escapeError}>
                {escapeError}
              </Caption>
            )}
          </View>
        )}
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
  escapeContainer: {
    width: '100%',
    marginTop: Spacing['3xl'],
  },
  escapeIntro: {
    marginBottom: Spacing.md,
  },
  escapeButton: {
    marginBottom: Spacing.sm,
  },
  escapeError: {
    marginTop: Spacing.sm,
  },
});
