import { useCallback } from 'react';
import { usePlacement } from 'expo-superwall';
import { useAuthStore } from '../store/authStore';
import { reportError } from '../config/sentry';
import { safeCapture } from '../lib/analytics';

// Single source of truth for gating access to paid lesson content. Every
// navigation to a lesson-overview screen or LessonFlow route in the app MUST
// go through gateToLesson() — never call navigation.navigate() directly for
// paid content. Grep for "navigate.*LessonFlow" and "navigate.*Lesson"
// (excluding demo-mode paths) should return zero raw calls.
//
// Under the hood, this fires Superwall's `learn_access` placement (see
// dashboard: campaign "Lesson Access Gate", Feature Gating: Gated). For
// entitled users, Superwall skips paywall presentation and fires feature()
// immediately (Superwall handles the fast path natively, no visible flicker).
// For unentitled users, the paywall shows; dismissing it does NOT fire
// feature(), so no code path from tap → lesson content exists without an
// active entitlement.
//
// Demo users (7-tap App Store reviewer mode — see docs/DEMO_MODE.md) bypass
// Superwall entirely and go straight to lesson content.
export function useLessonGate() {
  const isDemoUser = useAuthStore(state => state.isDemoUser);
  // Lightweight mirror of Superwall's last-known subscription status. See
  // App.tsx's onSubscriptionStatusChange listener — set to true when
  // Superwall reports ACTIVE, false on INACTIVE, unchanged on UNKNOWN. Used
  // ONLY as a fail-open fallback if registerPlacement throws (see catch
  // block below). MUST NOT be used to bypass the gate on the happy path —
  // Superwall's native check is authoritative there.
  const isSubscribed = useAuthStore(state => state.isSubscribed);

  const { registerPlacement } = usePlacement({
    onError: (err) => {
      const error = new Error(typeof err === 'string' ? err : 'Paywall error');
      if (__DEV__) console.error('[useLessonGate] paywall error:', err);
      reportError(error, { context: 'lesson_gate' });
    },
  });

  const gateToLesson = useCallback(
    async (source: string, onEntitled: () => void) => {
      // Demo mode short-circuit — Apple reviewers must never see the paywall.
      if (isDemoUser) {
        onEntitled();
        return;
      }

      try {
        await registerPlacement({
          placement: 'learn_access',
          params: { source },
          feature() {
            // Runs only if Superwall confirms an active entitlement
            // (already subscribed OR just purchased via this paywall).
            if (__DEV__) console.log('[useLessonGate] entitlement confirmed, source =', source);
            onEntitled();
          },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('registerPlacement failed');
        if (__DEV__) console.error('[useLessonGate] registerPlacement threw:', error);
        reportError(error, { context: 'lesson_gate_register', source });
        safeCapture('lesson_gate_error', {
          source,
          error: error.message,
          fell_open: isSubscribed,
        });

        // Scoped fail-open for confirmed-paying users only (Fable review #9).
        //
        // Superwall's registerPlacement makes a network call. On outages or
        // during offline cold-start before config caches, that call throws
        // and — pre-fix — the tap silently dropped: paying users saw a
        // dead button.
        //
        // We now let confirmed-subscribed users through when Superwall
        // fails. Confirmation comes from authStore.isSubscribed, which is
        // ONLY flipped to true when Superwall's app-level
        // onSubscriptionStatusChange listener has previously reported
        // ACTIVE. It's a device-local memory of a Superwall-vouched fact,
        // not an independent claim.
        //
        // Unsubscribed users still fail-closed on error — no code path
        // exists to let them through, matching the design of the gate.
        // Demo users are handled above.
        //
        // Trade-off: a user whose subscription lapsed AFTER a Superwall
        // outage started AND before we could confirm INACTIVE would get
        // one final lesson tap through. Rare, and preferable to breaking
        // every paying user's experience during a Superwall incident.
        if (isSubscribed) {
          if (__DEV__) console.log('[useLessonGate] Superwall unreachable but user is confirmed subscribed — failing open. source =', source);
          onEntitled();
        }
        // Else: unsubscribed + Superwall down = tap does nothing. Same as
        // pre-fix. Fine.
      }
    },
    [isDemoUser, isSubscribed, registerPlacement]
  );

  return { gateToLesson };
}
