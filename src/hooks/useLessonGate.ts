import { useCallback } from 'react';

/**
 * Historical shape of the lesson gate.
 *
 * From 2026-06 to 2026-07-05 this hook fired Superwall's `learn_access`
 * placement on every lesson tap. That existed as a per-lesson gate because
 * v1.0.0's dismissable `show_paywall` allowed unsubscribed users to reach
 * LearnScreen and then tap into lesson content — the exact bypass the
 * Fable review flagged.
 *
 * 2026-07-05 — hard-paywall model. The app's entry-level gate in
 * LoadingScreen is now mandatory: unsubscribed users cannot reach
 * LearnScreen at all. By the time `gateToLesson` runs, the caller is by
 * definition entitled (subscribed or demo). Per-lesson gating became
 * redundant.
 *
 * Rather than delete the hook and touch all 16 callsites, we keep the
 * seam and short-circuit to `onEntitled()` immediately. Two upsides:
 *
 *   1. Zero-diff callsites. Every lesson-nav site still calls
 *      `gateToLesson('module_x', () => nav.navigate(...))` — no risk of
 *      one site accidentally becoming a direct navigation.
 *   2. If we ever reintroduce per-lesson gating (individual chapters
 *      priced separately, freemium tier for select modules), the seam
 *      is here and the callsites don't need re-plumbing.
 *
 * Anything more sophisticated — telemetry, defensive re-verification —
 * belongs in the entry gate (LoadingScreen), not per-tap.
 *
 * See docs/PAYWALL_MODEL.md for the full policy.
 */
export function useLessonGate() {
  const gateToLesson = useCallback(
    (_source: string, onEntitled: () => void) => {
      onEntitled();
    },
    []
  );

  return { gateToLesson };
}
