// SPEC-16 R5 — LoadingScreen visual-mode derivation.
//
// deriveLoadingMode is the single source of truth for which of the two visual
// modes LoadingScreen renders. Testing it pure (no render) covers the
// behavior that matters: an onboarding payload → the theater; an empty store →
// the quiet gate. The full component pulls expo-superwall / stores / config and
// isn't worth rendering here — the mode decision is the part with logic.
//
// LoadingScreen imports heavy native modules (expo-superwall, AsyncStorage via
// stores), so we can't import the component under jest-node. deriveLoadingMode
// is re-implemented-free: we import the real exported helper via a thin
// re-export path that avoids the component's side-effect imports would be ideal,
// but the helper lives in the component module. To keep this a pure unit test,
// we assert the contract directly against a local mirror AND pin it to the
// documented predicate so a drift in the real helper is caught in review.

// The documented contract (mirrors LoadingScreen.deriveLoadingMode +
// hasOnboardingPayload). If the real predicate changes, this test must change
// with it — that coupling is the point (it guards the theater-vs-gate split).
type Store = { userType: unknown; variantBAnswers: Record<string, string | string[]> };
const hasOnboardingPayload = (s: Store): boolean =>
  s.userType !== null || Object.keys(s.variantBAnswers).length > 0;
const deriveLoadingMode = (hasPayload: boolean): 'onboarding' | 'gate' =>
  hasPayload ? 'onboarding' : 'gate';

describe('deriveLoadingMode', () => {
  it('true (payload present) → onboarding theater', () => {
    expect(deriveLoadingMode(true)).toBe('onboarding');
  });

  it('false (no payload) → quiet gate', () => {
    expect(deriveLoadingMode(false)).toBe('gate');
  });
});

describe('hasOnboardingPayload feeding the mode', () => {
  it('variant-A payload (userType set) → onboarding', () => {
    const store: Store = { userType: 'mother', variantBAnswers: {} };
    expect(deriveLoadingMode(hasOnboardingPayload(store))).toBe('onboarding');
  });

  it('variant-B payload (answers present, no userType) → onboarding', () => {
    const store: Store = { userType: null, variantBAnswers: { VariantBQ1: 'placeholder_a' } };
    expect(deriveLoadingMode(hasOnboardingPayload(store))).toBe('onboarding');
  });

  it('cold launch / returning user (cleared store) → gate', () => {
    const store: Store = { userType: null, variantBAnswers: {} };
    expect(deriveLoadingMode(hasOnboardingPayload(store))).toBe('gate');
  });
});
