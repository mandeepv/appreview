// SPEC-17 R3 — step-count derivation.
//
// The progress bar derives entirely from the declared flow arrays in flows.ts
// (no per-screen numbers, no `totalSteps = 20`). These tests pin that contract:
// each flow yields a monotonically increasing currentStep with the correct
// totalSteps, and every registered question screen appears in exactly one flow.

import {
  FLOWS,
  VARIANT_A_FLOW,
  VARIANT_B_FLOW,
  stepFor,
  isResumableScreen,
  RESUMABLE_ONBOARDING_SCREENS,
} from '../flows';

describe('stepFor — progress derivation', () => {
  it('variant A: currentStep is 1-based position, totalSteps is flow length', () => {
    VARIANT_A_FLOW.forEach((screen, index) => {
      expect(stepFor(screen)).toEqual({
        currentStep: index + 1,
        totalSteps: VARIANT_A_FLOW.length,
      });
    });
  });

  it('variant B: currentStep is 1-based position, totalSteps is 3', () => {
    VARIANT_B_FLOW.forEach((screen, index) => {
      expect(stepFor(screen)).toEqual({
        currentStep: index + 1,
        totalSteps: VARIANT_B_FLOW.length,
      });
    });
  });

  it('currentStep increases monotonically by 1 across each flow', () => {
    Object.values(FLOWS).forEach((flow) => {
      const steps = flow.map((s) => stepFor(s)!.currentStep);
      steps.forEach((step, i) => expect(step).toBe(i + 1));
    });
  });

  it('the last screen in each flow fills the bar (currentStep === totalSteps)', () => {
    Object.values(FLOWS).forEach((flow) => {
      const last = stepFor(flow[flow.length - 1])!;
      expect(last.currentStep).toBe(last.totalSteps);
    });
  });

  it('returns null for a screen that is in no counted flow', () => {
    expect(stepFor('Auth')).toBeNull();
    expect(stepFor('Loading')).toBeNull();
    expect(stepFor('DoesNotExist')).toBeNull();
  });

  it('the `totalSteps = 20` default is gone — no flow claims 20 steps', () => {
    Object.values(FLOWS).forEach((flow) => {
      expect(flow.length).not.toBe(20);
      expect(flow.length).toBeGreaterThan(0);
    });
  });
});

describe('flow membership', () => {
  it('every registered screen appears in exactly one flow', () => {
    const all = Object.values(FLOWS).flatMap((f) => [...f]);
    const counts = all.reduce<Record<string, number>>((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    }, {});
    Object.entries(counts).forEach(([, count]) => expect(count).toBe(1));
  });

  it('no screen name is duplicated within a single flow', () => {
    Object.values(FLOWS).forEach((flow) => {
      expect(new Set(flow).size).toBe(flow.length);
    });
  });
});

describe('resumable-screen guard (SplashScreen mid-flow resume — review #5)', () => {
  it('every flow screen is resumable', () => {
    Object.values(FLOWS)
      .flatMap((f) => [...f])
      .forEach((screen) => {
        expect(isResumableScreen(screen)).toBe(true);
      });
  });

  it('the full-screen VBCalculating beat is resumable (persists lastScreen, not in a flow array)', () => {
    expect(isResumableScreen('VBCalculating')).toBe(true);
    expect(RESUMABLE_ONBOARDING_SCREENS.has('VBCalculating')).toBe(true);
  });

  it('DELETED screens are NOT resumable — the exact stuck-on-splash bug', () => {
    // These were removed in SPEC-09; a persisted lastScreen pointing at one must
    // NOT be resumed to (replace() would silently no-op → stuck on splash).
    ['ChildrenAge', 'ChildrenGender', 'GoalSelection', 'ParentingStyles'].forEach((deleted) => {
      expect(isResumableScreen(deleted)).toBe(false);
    });
  });

  it('null / empty / garbage lastScreen is not resumable', () => {
    expect(isResumableScreen(null)).toBe(false);
    expect(isResumableScreen(undefined)).toBe(false);
    expect(isResumableScreen('')).toBe(false);
    expect(isResumableScreen('SomeRenamedRoute')).toBe(false);
  });
});
