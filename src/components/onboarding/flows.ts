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
 * deliberately excluded — the bar completes at the last question screen. Some
 * beats (variant B's cold-open/intro/name and its full-screen "calculating"
 * takeover) also render no bar and are intentionally absent from the arrays.
 */

// Variant A — the control flow, in the order the user actually walks it
// (UserType → NameAge → ChildrenCount → ImprovementGoals → Educational →
// PartnerInvolvement → ExperienceLevel → EmotionalChallenges → Auth). The
// `Auth` handoff is not counted; the bar fills at EmotionalChallenges.
//
// ChildrenGender / ChildrenAge / GoalSelection / ParentingStyles were removed
// (screens + navigator + route types deleted) — they had been off the active
// path since before v1.1.0 and never appeared in the funnel. Their store/DB/
// analytics fields are intentionally kept (dropping columns is a separate
// migration). If a future content change adds a new step, add it to this array
// and the bar re-derives itself.
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

// Variant B — the full long-form onboarding (docs/specs/variant-b-onboarding-copy.md).
// This array is the SOURCE OF TRUTH for the progress bar: it lists, in walk
// order, exactly the screens that show a bar. The pre-name intro trio
// (VBWelcome/VBIntro/VBName) deliberately render NO bar (showProgress={false}) —
// the "journey" bar starts at VBRole — and VBCalculating is a full-screen
// takeover with no bar, so neither appears here. Every other B screen derives
// currentStep/totalSteps from its position below; adding/removing a beat updates
// the bar automatically. The Auth handoff is not counted (bar fills at
// VBReminders), mirroring variant A.
export const VARIANT_B_FLOW = [
  'VBRole',
  'VBKids',
  'VBMood',
  'VBChallenges',
  'VBWhenHardest',
  'VBMirror',
  'VBGoals',
  'VBReady',
  'VBSnapshot',
  'VBHowItWorks',
  'VBBenefit',
  'VBCommit',
  'VBAllIn',
  'VBRating',
  'VBReminders',
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

// Onboarding screens a persisted `lastScreen` may safely resume to (SplashScreen
// mid-flow resume). Derived from the declared flow arrays — the exact set that
// QuestionScreen/StatementScreen persist as screenName — plus non-flow screens
// that also persist a lastScreen. Kept here (next to the flow arrays) so it can
// never drift from them, and so it's unit-testable without rendering Splash.
//
// This is the guard for review finding #5: SPEC-09 deleted several onboarding
// screens, so a user parked on one had a persisted lastScreen pointing at a
// now-UNREGISTERED route. React Navigation's replace() to an unregistered route
// is a SILENT no-op (does not throw), so the old try/catch→Welcome never fired
// and the user sat on the splash forever. Callers must check membership here and
// fall back to Welcome for anything not on the list.
const RESUMABLE_EXTRA = ['VBCalculating'] as const; // full-screen beat, not in a flow array

export const RESUMABLE_ONBOARDING_SCREENS: ReadonlySet<string> = new Set<string>([
  ...Object.values(FLOWS).flatMap((f) => [...f]),
  ...RESUMABLE_EXTRA,
]);

/**
 * True if a persisted `lastScreen` points at a live, resumable onboarding
 * screen. A type guard so callers get `string` narrowing in the true branch.
 */
export function isResumableScreen(screenName: string | null | undefined): screenName is string {
  return !!screenName && RESUMABLE_ONBOARDING_SCREENS.has(screenName);
}
