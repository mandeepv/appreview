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
        safeCapture('lesson_gate_error', { source, error: error.message });
        // Do NOT invoke onEntitled on failure — silence is the safe default.
      }
    },
    [isDemoUser, registerPlacement]
  );

  return { gateToLesson };
}
