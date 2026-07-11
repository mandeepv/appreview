import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { resolveOnboardingVariant, clearOnboardingVariant } from '../../lib/experiments';
import { reportError, addGateBreadcrumb } from '../../config/sentry';

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

// SPEC-15: "did the user just finish onboarding (so we have data to save +
// should run the progress theater)?" — as opposed to a cold launch of an
// already-onboarded, signed-in user (store already cleared).
//
// Variant A signals this with a non-null userType. Variant B never sets
// userType (it doesn't collect the variant-A profile fields), so it signals
// with a non-empty variantBAnswers instead. Either arm having data means
// "pending onboarding to save." This is the ONE predicate both the save effect
// and the theater effect key off; keep them in lockstep.
const hasOnboardingPayload = (store: {
  userType: unknown;
  variantBAnswers: Record<string, string | string[]>;
}): boolean =>
  store.userType !== null || Object.keys(store.variantBAnswers).length > 0;

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
    // SPEC-15: variant B never sets userType (it collects variantBAnswers
    // instead of the variant-A profile fields), so the "did we just finish
    // onboarding?" signal must also look at variantBAnswers — otherwise a
    // variant-B completer would start at 100 and skip the progress theater
    // that variant A gets. See hasOnboardingPayload() below.
    hasOnboardingPayload(onboardingStore) ? 0 : 100,
  );
  const [scaleAnim] = useState(new Animated.Value(1));
  const [gateStatus, setGateStatus] = useState<'idle' | 'presenting' | 'retry' | 'blocked'>('idle');
  const { identify } = useUser();
  const paywallPresentedRef = useRef(false);
  const { signOut } = useAuthStore();
  // R4 (SPEC-06): track the previous gateStatus so we can breadcrumb each
  // transition as "from → to". Initialized to the mount value.
  const prevGateStatusRef = useRef<typeof gateStatus>(gateStatus);

  // R5: the paywall gate must not run until the kill-switch (app_config)
  // check has resolved, and must never run if force-update is active.
  // configStore is the single source of truth shared with App.tsx (which
  // renders the ForceUpdateModal), so the two can't present concurrently.
  const configStatus = useConfigStore(state => state.status);

  // R4: watchdog timer that fires if onPresent doesn't arrive after a
  // present attempt. Held in a ref so runGate can (re)arm it and onPresent /
  // unmount can clear it.
  const presentWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // SPEC-FIX-01 R1: the two-scheduler trap.
  //
  // Two effects can schedule runGate: the mount effect (200ms cold-launch
  // timer, or the ~4.6s post-onboarding theater) AND the config-status effect
  // (fires when app_config resolves to 'ok'). On the common cold launch,
  // config is ALREADY 'ok' at mount, so the config effect fired immediately
  // WHILE the mount timer was also pending — running the gate twice (double
  // identify() + double registerPlacement, theater bypassed, and the 2nd run
  // resetting paywallPresentedRef so the watchdog could fire a spurious retry
  // behind a healthy paywall).
  //
  // Fix: make deferral EXPLICIT. runGate only sets wasDeferredRef when it
  // actually bails on 'loading'. The config effect then fires runGate ONLY if
  // we truly deferred (wasDeferredRef), then clears the ref. When config is
  // already 'ok' at mount, runGate never hits the 'loading' return, so
  // wasDeferredRef stays false and the config effect does nothing — the mount
  // timer is the single scheduler.
  const wasDeferredRef = useRef(false);
  // Belt-and-braces: true while a gate attempt is in flight OR a paywall is
  // presented. Any extra scheduler call becomes a logged no-op instead of a
  // second registerPlacement.
  const gateInFlightRef = useRef(false);

  // R3b: how many times the gate has failed to reach Superwall.
  //
  // SPEC-FIX-01 R1 minor #1: the escape hatch is now derived from LIVE state
  // (see `showEscapeHatch` in render: gateStatus === 'retry' AND retryCount >=
  // threshold), NOT a latched `escapeHatchVisible` boolean. The old latched
  // boolean stayed true after the gate recovered — so if the gate started
  // presenting a healthy paywall, the escape-hatch buttons could still be
  // mounted behind it. Deriving from live state means the hatch disappears the
  // instant gateStatus leaves 'retry'. `retryCount` is state (drives render);
  // `retryAttemptsRef` mirrors it for the interval's synchronous increment.
  const retryAttemptsRef = useRef(0);
  const [retryCount, setRetryCount] = useState(0);
  // Fire-once guard for the gate_escape_hatch_shown analytics event (kept — the
  // event should fire once per mount even though the UI is now live-derived).
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
    // SPEC-FIX-01 R1: this outcome is the end of the current gate attempt —
    // release the in-flight flag so the legitimate next attempt (re-present /
    // retry) isn't blocked by the idempotence guard. (enter_root unmounts the
    // screen, so clearing is moot but harmless.)
    gateInFlightRef.current = false;
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
      // R5 (SPEC-06): funnel event for the paywall actually rendering. Was
      // previously only a __DEV__ log — now a real event so we can measure
      // gate → paywall-shown → purchase. safeCapture (house pattern).
      safeCapture('paywall_presented', { paywall_name: paywallInfo.name });
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
      // "Skip" fires when Superwall bypasses paywall presentation itself.
      // SPEC-FIX-08 R2: NOT every skip means "entitled." Holdout/NoAudienceMatch
      // are legitimate (entitled or experiment-excluded → enter_root).
      // PlacementNotFound means the dashboard placement is broken/deleted —
      // resolveGateOutcome maps it to 'retry' (fail safe to the gate), and we
      // fire a DISTINCT event so a real dashboard break is immediately visible
      // in analytics rather than hiding inside the generic skip counter.
      if (__DEV__) console.log('⏭️ Paywall skipped by Superwall:', reason.type);
      safeCapture('paywall_skipped_by_superwall', { skip_reason: reason.type });
      if (reason.type === 'PlacementNotFound') {
        // Distinct, alert-worthy signal: the subscription_gate placement is
        // missing/renamed. A spike here = a dashboard misconfig locking users
        // to (or, pre-fix, past) the paywall. See docs/PAYWALL_MODEL.md.
        safeCapture('paywall_placement_not_found', { skip_reason: reason.type });
        reportError(new Error('Superwall PlacementNotFound for subscription_gate'), {
          screen: 'LoadingScreen',
          context: 'paywall_placement_not_found',
        });
      }
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
      // Sentry is the single system of record for FAILURES (SPEC-06 R1) —
      // report to Sentry only, not PostHog. PostHog is for behavior events.
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
    // SPEC-15: variant B has no userType but does have variantBAnswers, so the
    // "is there pending onboarding to save?" check now covers both arms.
    if (!hasOnboardingPayload(onboardingStore)) {
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

            // SPEC-15: the sticky variant assignment lives in AsyncStorage
            // (not the store), so read it back here. resolveOnboardingVariant
            // returns the already-persisted value (never re-resolves mid-flow)
            // and never throws — defaults control. It's stamped on the profile
            // row so we can segment conversion in Supabase as well as PostHog.
            const onboardingVariant = await resolveOnboardingVariant();

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
              onboardingVariant,
              variantBAnswers: onboardingStore.variantBAnswers,
            };

            await saveUserOnboardingData(user.id, onboardingData);
          } else {
            if (__DEV__) console.log('📝 Demo user - skipping Supabase save');
          }

          // Clear local onboarding state after saving. SPEC-15: also clear the
          // sticky variant assignment so a future re-onboard (account deletion
          // → fresh signup) gets a fresh split. clearOnboardingVariant clears
          // the storage key ONLY — the PostHog super-property stays registered
          // so the variant keeps flowing on the post-onboarding paywall/purchase
          // events (the primary metric, which fire AFTER this clear).
          await onboardingStore.clearState();
          await clearOnboardingVariant();
        } catch (error) {
          if (__DEV__) console.error('Error saving onboarding data:', error);
          // Continue anyway - don't block user from entering app
        }
      }
    };

    saveOnboardingData();
  }, [user, isDemoUser]);

  const runGate = async () => {
    // SPEC-FIX-01 R1 (belt-and-braces): if a gate attempt is already in
    // flight or a paywall is already presented, this call is a duplicate
    // scheduler firing — no-op it (logged) instead of running a second
    // registerPlacement. Converts any future two-scheduler regression from
    // revenue-path noise into a harmless logged no-op.
    if (gateInFlightRef.current) {
      if (__DEV__) console.log('🚫 runGate ignored — a gate attempt is already in flight / presented');
      return;
    }

    // R5: force-update wins over the paywall. Do not run the gate until the
    // kill-switch check has resolved, and never run it if a force-update is
    // required. Both would otherwise present full-screen concurrently with
    // the ForceUpdateModal (App.tsx). If we're still 'loading', we mark that
    // we DEFERRED (wasDeferredRef) and return; the config-status effect below
    // re-invokes runGate once the check resolves to 'ok' — but ONLY because
    // we deferred. If 'force_update', the ForceUpdateModal owns the screen
    // and the gate never runs.
    const status = useConfigStore.getState().status;
    if (status === 'loading') {
      if (__DEV__) console.log('⏳ Gate deferred — waiting on app_config check');
      wasDeferredRef.current = true;
      return;
    }
    if (status === 'force_update') {
      if (__DEV__) console.log('🛑 Gate suppressed — force-update is active');
      return;
    }

    // Past the guards — a real gate attempt is now in flight.
    gateInFlightRef.current = true;

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

    // R4 watchdog for the frozen "presenting" state. After a
    // dismiss→re-present, if Superwall never fires onPresent, gateStatus would
    // sit on 'presenting' forever (the retry interval only runs on 'retry').
    // So: reset the presented flag, then arm a 5s timer. If onPresent hasn't
    // fired when it expires, drop to retry.
    //
    // SPEC-FIX-01 R1 minor #2: arm the watchdog BEFORE the `await identify()`,
    // not after. A hung identify() would otherwise stall the gate with NO
    // watchdog running (the timer was armed only after identify resolved), so
    // a Superwall auth hang left the user stuck on the spinner indefinitely.
    // Arming first means a hang in EITHER identify() or registerPlacement is
    // caught by the 5s watchdog → drops to retry.
    paywallPresentedRef.current = false;
    clearPresentWatchdog();
    presentWatchdogRef.current = setTimeout(() => {
      if (!paywallPresentedRef.current) {
        if (__DEV__) console.log('⏱️ onPresent never fired within 5s — treating presentation as frozen, dropping to retry');
        // R4 (SPEC-06): breadcrumb the watchdog firing before dropping to retry.
        addGateBreadcrumb('gate: present watchdog fired (onPresent never arrived, 5s)');
        // The stalled attempt is over — release the in-flight flag so retry
        // can re-attempt (SPEC-FIX-01 R1).
        gateInFlightRef.current = false;
        setGateStatus('retry');
      }
    }, PRESENT_WATCHDOG_MS);

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

  // SPEC-FIX-01 R1 minor #3: the 3s retry interval and the config effect close
  // over `runGate`, which itself closes over `isSubscribed`. Those closures are
  // captured once and go stale — if a subscription-status event flips
  // isSubscribed to true WHILE the user sits on the retry screen, the stale
  // runGate would still treat them as unsubscribed. Route every deferred/
  // interval invocation through this ref, which always points at the freshest
  // runGate, so a mid-retry isSubscribed flip short-circuits to Root correctly.
  const latestRunGateRef = useRef(runGate);
  latestRunGateRef.current = runGate;

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

    if (hasOnboardingPayload(onboardingStore)) {
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

  // R5: re-run the gate when app_config resolves to 'ok' — but ONLY if we
  // actually deferred (wasDeferredRef, set by runGate's 'loading' return).
  //
  // SPEC-FIX-01 R1: gating on wasDeferredRef (not just gateStatus === 'idle')
  // is what fixes the double-fire. On the common cold launch, config is
  // already 'ok' at mount, so runGate never hits the 'loading' return,
  // wasDeferredRef stays false, and this effect does nothing — the mount timer
  // is the single scheduler. Only when the config check was genuinely still in
  // flight at mount does this fire the deferred run.
  useEffect(() => {
    if (configStatus === 'ok' && wasDeferredRef.current) {
      wasDeferredRef.current = false;
      if (__DEV__) console.log('✅ app_config resolved to ok — running deferred gate');
      latestRunGateRef.current();
    }
  }, [configStatus]);

  // Auto-retry the gate when it fails to reach Superwall. Runs every 3s
  // while gateStatus === 'retry'. Stops as soon as we successfully
  // present a paywall, navigate away, or detect entitlement.
  //
  // R3b: each retry increments retryAttemptsRef. Once we cross the threshold,
  // the escape hatch (Restore / Sign out / Contact support) is rendered — but
  // that's computed from live state in render now (SPEC-FIX-01 R1 minor #1),
  // not latched here. This effect only fires the analytics event once.
  //
  // SPEC-FIX-01 R1 minor #3: call through latestRunGateRef so the interval
  // never runs a stale runGate (a mid-retry isSubscribed flip is respected).
  useEffect(() => {
    if (gateStatus !== 'retry') return;
    const retryTimer = setInterval(() => {
      retryAttemptsRef.current += 1;
      setRetryCount(retryAttemptsRef.current); // drive render (escape-hatch derivation)
      if (__DEV__) console.log(`🔁 Retrying gate (attempt ${retryAttemptsRef.current}, Superwall was unreachable)`);
      latestRunGateRef.current();
    }, 3000);
    return () => clearInterval(retryTimer);
  }, [gateStatus]);

  // R4 (SPEC-06): breadcrumb every gateStatus transition (from → to) into
  // Sentry so a later error's timeline shows how the gate flow unfolded. No
  // user data in the message — flow state only.
  useEffect(() => {
    const from = prevGateStatusRef.current;
    if (from !== gateStatus) {
      addGateBreadcrumb(`gate: ${from} → ${gateStatus}`);
      prevGateStatusRef.current = gateStatus;
    }
  }, [gateStatus]);

  // SPEC-FIX-01 R1 minor #1: the escape hatch is derived from LIVE state —
  // visible only while the gate is actually stuck retrying past the threshold.
  // The moment the gate recovers (gateStatus leaves 'retry'), this goes false
  // and the buttons unmount, so they can never sit behind a healthy paywall.
  const showEscapeHatch = gateStatus === 'retry' && retryCount >= ESCAPE_HATCH_AFTER_ATTEMPTS;

  // R3b: fire gate_escape_hatch_shown exactly once per screen mount, the first
  // time the hatch becomes visible. (Fire-once via the ref even though
  // showEscapeHatch may toggle off/on as the gate recovers and re-fails.)
  useEffect(() => {
    if (showEscapeHatch && !escapeHatchCapturedRef.current) {
      escapeHatchCapturedRef.current = true;
      safeCapture('gate_escape_hatch_shown');
      // R4 (SPEC-06): also breadcrumb the escape-hatch rendering.
      addGateBreadcrumb('gate: escape hatch rendered');
    }
  }, [showEscapeHatch]);

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
        // SPEC-FIX-01 R4.3: this restore came from the escape hatch, not a
        // Superwall paywall — so tag it with source: 'escape_hatch' rather
        // than stuffing a synthetic value into paywall_name. paywall_name is
        // reserved for REAL Superwall paywall names (see the onDismiss path),
        // so it stays absent here.
        safeCapture('subscription_restored', { source: 'escape_hatch' });
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
        {showEscapeHatch && (
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
