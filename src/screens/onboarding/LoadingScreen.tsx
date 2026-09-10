import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { Button } from '../../components/Button';
import { Caption } from '../../components/Typography';
import {
  Spacing,
  Typography,
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  oInk,
  oCream,
} from '../../constants/theme';
import { RichHeadline } from '../../components/onboarding/OnboardingScreen';
import { ProgressRing } from '../../components/onboarding/ProgressRing';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useConfigStore } from '../../store/configStore';
import { resolveGateOutcome } from '../../navigation/routingPolicy';
import { saveUserOnboardingData } from '../../services/onboardingService';
import { restorePurchases } from '../../services/purchaseService';
import { usePlacement, useUser, useSuperwallEvents } from 'expo-superwall';
import Constants from 'expo-constants';
import { safeCapture } from '../../lib/analytics';
import { reportError, addGateBreadcrumb } from '../../config/sentry';

// Support address for the escape-hatch "Contact support" action. Matches
// SettingsScreen's handleContactSupport so support routing stays consistent
// (SPEC-01 R3, DECISION(owner)).
const SUPPORT_EMAIL = 'support@example.com';

// Number of failed gate attempts before we surface the escape hatch. At 3
// retries (the retry interval is 3s) the user has been stuck ~9s+ — long
// enough that "Superwall is unreachable" is a real possibility, not a blip.
const ESCAPE_HATCH_AFTER_ATTEMPTS = 3;

// Development-only multiplier on the plan-building theater's tick. 1 = the
// shipped 4-second run; raise it to inspect the screen. Guarded by __DEV__ so
// production timing can never be affected by a stray edit.
const THEATER_SLOWMO = __DEV__ ? 1 : 1;

// Development-only: hold on the finished screen instead of running the gate at
// 100%. The gate presents the paywall or routes to Root, so a replay always
// ends by throwing you off the screen you were trying to look at. With this
// true the theater completes and stays put, and the DevMenu button can be
// pressed repeatedly. NEVER true in production — it would strand every real
// user at 100% and bypass the subscription gate entirely (INVARIANT #1).
const THEATER_HOLD_AT_END = __DEV__ ? false : false;

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
    // The breathing loop that scaled the old centre logo is gone with it — the
    // build theater carries its own motion through the percentage and the
    // tasks checking off.
    const hasOnboardingPayload = onboardingStore.userType !== null;

    if (hasOnboardingPayload) {
      // Post-onboarding: run the 4-second progress theater (the
      // "analyzing your family profile" messaging) so the user sees the
      // app doing something with their answers. Then run the gate.
      // 200 ticks x 50ms = 10s. Was 4s (+1.25/tick), which gave each of the
      // three tasks ~1.4s — too fast to register a subtitle that names your
      // children's ages back to you. At 10s each task holds ~3.3s.
      //
      // This is dead time in front of a paywall, so it is a real trade: the
      // screen has to feel like work being done, not a stall. Watch
      // onboarding_completed against subscription_purchased before keeping it.
      //
      // THEATER_SLOWMO stretches it further in development for inspection.
      const tick = 50 * THEATER_SLOWMO;
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            if (!THEATER_HOLD_AT_END) {
              setTimeout(() => runGate(), 600);
            } else if (__DEV__) {
              console.log('[theater] holding at 100% — THEATER_HOLD_AT_END is on');
            }
            return 100;
          }
          return prev + 0.5;
        });
      }, tick);
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

  // The build theater, written from the parent's own answers.
  //
  // Each task names something only this user told us — the ages of their
  // children, the thing they said was hardest — so the wait reads as work
  // being done for them rather than a spinner. Every part degrades to a
  // truthful generic phrase when an answer is missing (cold launch, resumed
  // session, or a signed-in user whose local store was cleared).
  const { buildTasks, buildSubtitle } = React.useMemo(() => {
    const goalLabels: Record<string, string> = {
      'behavior-issues': 'behaviour',
      'closer-relationship': 'closeness',
      'less-fighting': 'sibling fights',
      'improved-parenting-skills': 'the day-to-day',
      'quality-time': 'time together',
      'character-traits': 'character',
      tantrums: 'tantrums',
    };

    const goals = (onboardingStore.improvementGoals ?? [])
      .map((g) => goalLabels[g])
      .filter(Boolean)
      .slice(0, 2);
    const goalPhrase =
      goals.length === 2 ? `${goals[0]} and ${goals[1]}` : goals.length === 1 ? goals[0] : null;

    // Age bands read as their lower bound ("a 4- and 7-year-old"). We hold a
    // band, not a year, so this is the closest honest phrasing.
    const bands = Array.from(
      new Set((onboardingStore.children ?? []).map((c) => c.ageRange).filter(Boolean)),
    ) as string[];
    const ages = bands
      .slice(0, 2)
      .map((b) => (b === '18+' ? '18+' : b.split('-')[0]));
    const agePhrase =
      ages.length === 2
        ? `a ${ages[0]}- and ${ages[1]}-year-old`
        : ages.length === 1
          ? `a ${ages[0]}-year-old`
          : null;

    // One line under the headline naming this family back to them. Degrades to
    // a true generic when the store is empty (cold launch, resumed session).
    const subtitle =
      agePhrase && goalPhrase
        ? `For ${agePhrase}, in a house where ${goalPhrase} is the hard part.`
        : agePhrase
          ? `For ${agePhrase}, built around what you told us.`
          : goalPhrase
            ? `Built around ${goalPhrase}, and the week you described.`
            : 'Built around the answers you just gave us.';

    return {
      buildSubtitle: subtitle,
      buildTasks: [
        // The task rows are a checklist, not prose: three short states the
        // user can scan. The personalisation lives in the subtitle, which is
        // said ONCE.
        //
        // They used to carry a long personalised label each ("Reading your
        // notes on tantrums and sibling fights") directly under a headline
        // saying the same thing ("Reading your answers"). Both updated on the
        // same tick, so a task change read as text flickering into other text.
        { at: 34, headline: 'Reading your *answers*', label: 'Your answers' },
        { at: 72, headline: 'Matching *techniques*', label: 'Techniques for your family' },
        { at: 100, headline: 'Building your *plan*', label: 'Your plan' },
      ],
    };
  }, [onboardingStore.improvementGoals, onboardingStore.children]);

  // The task currently running drives the headline. Past 100 the last one
  // stays, so the finished screen reads "Building your plan" rather than blank.
  const activeTask =
    buildTasks.find((t) => progress < t.at) ?? buildTasks[buildTasks.length - 1];

  /**
   * Only the retry state has anything left to say.
   *
   * This used to cycle "Analyzing your family profile…", "Tailoring lessons…"
   * and so on beneath the ring — a second running commentary competing with
   * the task list directly above it, saying the same thing in vaguer words.
   * With the task rows naming real answers, the extra line was just more text
   * on screen. The offline warning stays: nothing else tells the user why a
   * finished bar has not moved on.
   */
  const statusMessage = gateStatus === 'retry'
    ? "Checking your subscription — please make sure you're online..."
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.ring}>
          <ProgressRing percent={progress} />
        </View>

        {/* The headline names the task actually running, so the screen reports
            what it is doing rather than repeating one fixed sentence. */}
        <RichHeadline style={styles.title}>{activeTask.headline}</RichHeadline>
        <Text style={styles.subtitle}>{buildSubtitle}</Text>

        {/* Tasks name what THIS parent told us — their children's ages, the
            thing they said was hardest. Generic loading copy is what made the
            old version feel like a stall rather than work. */}
        <View style={styles.tasks}>
          {buildTasks.map((task, i) => {
            const done = progress >= task.at;
            const active = !done && progress >= (buildTasks[i - 1]?.at ?? 0);
            return (
              <View key={task.label} style={styles.task}>
                <View
                  style={[
                    styles.taskDot,
                    active ? styles.taskDotActive : done ? styles.taskDotDone : styles.taskDotIdle,
                  ]}
                />
                <Text
                  style={[
                    styles.taskText,
                    active ? styles.taskTextActive : null,
                    !done && !active ? styles.taskTextIdle : null,
                  ]}
                >
                  {task.label}
                </Text>
              </View>
            );
          })}
        </View>

        {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

        {/* R3b: escape hatch. Only after the gate has failed to reach
            Superwall enough times (>= ESCAPE_HATCH_AFTER_ATTEMPTS) do we
            offer a way out. Rendered visually subordinate to the spinner
            above — the retry loop keeps running underneath; these are the
            fallback, not the main event. */}
        {showEscapeHatch && (
          <View style={styles.escapeContainer}>
            {/* Explicit cream: Caption defaults to dark ink, which is
                invisible on this screen's forestDeep ground. */}
            <Caption center color={C.cream} style={styles.escapeIntro}>
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

            {/* Clay only here. It is the one place on this screen where a
                different colour is the point — an error should not read in the
                same mint as normal progress. */}
            {escapeError && (
              <Caption center color={C.clay} style={styles.escapeError}>
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
    backgroundColor: C.forestDeep,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  // The takeover. This is the one screen where the app stops asking and works,
  // so it goes dark: a scene change, and a second home for forestDeep so the
  // colour is not splash-only. Everything on it is cream-on-green.
  ring: { alignSelf: 'center' },
  title: {
    fontFamily: F.serif,
    fontSize: 31,
    lineHeight: 31 * 1.22,
    color: C.cream,
    marginTop: 38,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: F.sans,
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: oCream(0.75),
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  tasks: { marginTop: 40, alignSelf: 'center' },
  task: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 11 },
  // Rows carry real weight: 10pt dots and 17pt text on a big dark canvas,
  // where 8pt dots and 15pt text disappeared into it.
  taskDot: { width: 10, height: 10, borderRadius: 999 },
  taskDotDone: { backgroundColor: oCream(0.45) },
  // Mint, matching the ring — clay appeared nowhere else in the flow.
  taskDotActive: { backgroundColor: C.mint },
  taskDotIdle: { backgroundColor: oCream(0.2) },
  taskText: { fontFamily: F.sans, fontSize: 17, color: oCream(0.6) },
  taskTextActive: { fontFamily: F.sansSemi, color: C.cream },
  taskTextIdle: { color: oCream(0.42) },
  status: {
    fontFamily: F.sans,
    fontSize: 13,
    lineHeight: 13 * 1.5,
    color: oCream(0.5),
    marginTop: 28,
    textAlign: 'center',
  },
  escapeContainer: {
    width: '100%',
    marginTop: Spacing['3xl'],
    // A hairline separates the fallback from the build above it — the retry
    // loop is still running, and these are the exit, not the main event.
    borderTopWidth: 1,
    borderTopColor: oCream(0.16),
    paddingTop: Spacing.lg,
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
