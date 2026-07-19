// SPEC-17 R3 — analytics step-name regression.
//
// The SPEC-15 A/B funnel keys off the `step` argument of
// trackOnboardingStepCompleted(step, answer). SPEC-17 migrated the presentation
// of every question screen but MUST keep firing the same step names — a renamed
// step silently breaks the funnel. Screens pull native deps and can't render
// under jest-node, so this pins the historical step-name set as the contract and
// couples it to the flow arrays: every counted flow screen must fire a known
// step name, and the set must not drift.
//
// If a real screen's step name ever changes, update BOTH the screen and this
// list in the same PR — that coupling is the guard.

import { FLOWS } from '../flows';

// The exact step names the shipped screens pass today (grep the screens:
// trackOnboardingStepCompleted('<Name>', ...)). Order-independent.
const HISTORICAL_STEP_NAMES = [
  'UserType',
  'NameAge',
  'ChildrenCount',
  'ImprovementGoals',
  'PartnerInvolvement',
  'ExperienceLevel',
  'EmotionalChallenges',
  // off-active-path screens that still fire their historical step:
  'GoalSelection',
  'ParentingStyles',
  // variant B (full long-form onboarding). Most fire step === screenName; the
  // two that REUSE a variant-A screen fire that screen's historical step (mapped
  // in STEP_FOR_SCREEN below) so both arms share one per-step funnel row.
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

// Screens whose analytics step name differs from their screenName. VBRole/VBKids
// reuse variant A's role/children screens and deliberately fire the SAME step
// name so the funnel unifies both arms; everything else fires step===screenName.
const STEP_FOR_SCREEN: Record<string, string> = {
  VBRole: 'UserType',
  VBKids: 'ChildrenCount',
};

describe('onboarding analytics step names (SPEC-15 funnel contract)', () => {
  it('the historical step-name set is exactly what the funnel expects', () => {
    // A hard snapshot: adding/removing/renaming a step must be a deliberate edit.
    expect([...HISTORICAL_STEP_NAMES].sort()).toEqual(
      [
        'ChildrenCount',
        'EmotionalChallenges',
        'ExperienceLevel',
        'GoalSelection',
        'ImprovementGoals',
        'NameAge',
        'ParentingStyles',
        'PartnerInvolvement',
        'UserType',
        'VBAllIn',
        'VBBenefit',
        'VBChallenges',
        'VBCommit',
        'VBGoals',
        'VBHowItWorks',
        'VBMirror',
        'VBMood',
        'VBRating',
        'VBReady',
        'VBReminders',
        'VBSnapshot',
        'VBWhenHardest',
      ].sort()
    );
  });

  it('every counted flow screen that fires analytics has a known step name', () => {
    // Educational is the only counted variant-A screen with no analytics step
    // (it is an info page, historically). Every OTHER flow screen must map to a
    // historical step name — either directly (step === screenName) or via the
    // reuse map for VBRole/VBKids.
    const NON_ANALYTICS = new Set(['Educational']);
    const flowScreens = Object.values(FLOWS).flatMap((f) => [...f]);
    flowScreens
      .filter((s) => !NON_ANALYTICS.has(s))
      .forEach((screen) => {
        const step = STEP_FOR_SCREEN[screen] ?? screen;
        expect(HISTORICAL_STEP_NAMES).toContain(step);
      });
  });
});
