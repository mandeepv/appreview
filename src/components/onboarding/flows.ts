/**
 * SPEC-17 — Accurate progress derives from a single declared step list per flow.
 *
 * Before this, every screen hand-passed `currentStep` (1…~13) against a
 * `totalSteps = 20` default that no screen ever reached — the bar never filled.
 * Now each flow declares its ordered screen list ONCE here; a screen's
 * `currentStep` / `totalSteps` derive from its position in that list, so the
 * bar starts near 0 and lands full on the last question, and adding/removing a
 * screen updates the bar automatically (no per-screen number to keep in sync).
 *
 * The arrays are the source of truth for the step-count regression test
 * (R3): every registered question screen must appear in exactly one flow array.
 *
 * These are the *presentation* step lists (what the progress bar counts), NOT
 * the navigation graph. `Auth`/`Loading`/`Root` are not questions and are
 * deliberately excluded — the bar completes at the last question screen.
 */

// Variant A — the control flow, in the order the user actually walks it
// (UserType → NameAge → ChildrenCount → ImprovementGoals → Educational →
// PartnerInvolvement → ExperienceLevel → EmotionalChallenges → Auth). The
// `Auth` handoff is not counted; the bar fills at EmotionalChallenges.
//
// ChildrenGender / ChildrenAge / GoalSelection / ParentingStyles remain
// registered in the navigator but sit off the active path today; they are
// intentionally NOT in this array so they don't inflate the visible step
// count. If a future content change threads one back into the flow, add it
// here and the bar re-derives itself.
export const VARIANT_A_FLOW = [
  'UserType',
  'NameAge',
  'ChildrenCount',
  'ImprovementGoals',
  'Educational',
  'PartnerInvolvement',
  'ExperienceLevel',
  'EmotionalChallenges',
] as const;

// Variant B — the SPEC-15 scaffold: three question screens before Auth.
export const VARIANT_B_FLOW = [
  'VariantBQ1',
  'VariantBQ2',
  'VariantBQ3',
] as const;

export type VariantAScreen = (typeof VARIANT_A_FLOW)[number];
export type VariantBScreen = (typeof VARIANT_B_FLOW)[number];
export type FlowScreen = VariantAScreen | VariantBScreen;

/**
 * All declared flows, keyed by id. `stepFor` scans these to resolve a screen's
 * position; keeping them in one map lets the R3 test assert "every screen
 * appears in exactly one flow".
 */
export const FLOWS = {
  variantA: VARIANT_A_FLOW,
  variantB: VARIANT_B_FLOW,
} as const;

export interface FlowStep {
  /** 1-based position of the screen in its flow (for the progress bar). */
  currentStep: number;
  /** Total question screens in the flow (bar denominator). */
  totalSteps: number;
}

/**
 * Derive the progress-bar position for a screen from the declared flow arrays.
 *
 * Returns `null` when the screen isn't part of any counted flow (e.g. an
 * off-path screen or a non-question screen) — callers then render no bar rather
 * than a misleading one. A screen must never live in two flows; if it does this
 * returns the FIRST match and the R3 test will have already failed the build.
 */
export function stepFor(screenName: string): FlowStep | null {
  for (const flow of Object.values(FLOWS)) {
    const index = (flow as readonly string[]).indexOf(screenName);
    if (index !== -1) {
      return { currentStep: index + 1, totalSteps: flow.length };
    }
  }
  return null;
}
