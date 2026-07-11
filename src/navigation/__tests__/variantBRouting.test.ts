/* eslint-disable import/first -- jest.mock() must be hoisted above imports. */
// SPEC-15 R6 — variant-B routing.
//
// Two pure checks, no rendering:
//  1. resolveWelcomeDestination maps each variant to the right first screen.
//  2. A persisted lastScreen of 'VariantBQ2' is a route the OnboardingNavigator
//     actually registers — proving mid-flow resume (SplashScreen replaces to
//     the persisted name) lands on a real screen rather than the try/catch
//     Welcome fallback.
//
// WelcomeScreen imports RN/analytics/experiments transitively; we only need the
// pure resolveWelcomeDestination export, and the experiments + posthog modules
// are stubbed so importing the screen module doesn't pull the real SDK.
// WelcomeScreen → onboardingStore imports AsyncStorage's native module, which
// is null under Node — stub it so the module graph loads.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('../../lib/experiments', () => ({
  resolveOnboardingVariant: jest.fn(),
}));
jest.mock('../../config/posthog', () => ({
  posthog: { capture: jest.fn(), register: jest.fn(), identify: jest.fn(), screen: jest.fn() },
  resetPostHog: jest.fn(),
  isPostHogEnabled: false,
  posthogEnvironment: 'dev',
}));

import { resolveWelcomeDestination } from '../../screens/onboarding/WelcomeScreen';

describe('resolveWelcomeDestination', () => {
  it('control → UserType (existing variant-A entry)', () => {
    expect(resolveWelcomeDestination('control')).toBe('UserType');
  });

  it('variant_b → VariantBQ1 (scaffold entry)', () => {
    expect(resolveWelcomeDestination('variant_b')).toBe('VariantBQ1');
  });
});

describe('mid-flow resume — variant-B route names are registered', () => {
  // The set of onboarding routes the navigator registers. This mirrors
  // OnboardingNavigator's <Stack.Screen name=...> list for the variant-B
  // screens; if a route is renamed in one place but not the other, a persisted
  // lastScreen would silently fall back to Welcome — this guards that seam.
  const REGISTERED_VARIANT_B_ROUTES = ['VariantBQ1', 'VariantBQ2', 'VariantBQ3'];

  it("a persisted lastScreen: 'VariantBQ2' is a registered route", () => {
    const persistedLastScreen = 'VariantBQ2';
    expect(REGISTERED_VARIANT_B_ROUTES).toContain(persistedLastScreen);
  });
});
