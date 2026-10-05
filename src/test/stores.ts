// Seed the app's zustand stores to a known state (SPEC-20 R2). Kept apart
// from factories.ts because importing the stores pulls in their whole import
// graph (all of it faked by setup.ts, but still heavier than plain data).

import { useAuthStore } from '../store/authStore';
import { useConfigStore } from '../store/configStore';
import { useOnboardingStore } from '../store/onboardingStore';

type AuthState = ReturnType<typeof useAuthStore.getState>;
type ConfigState = ReturnType<typeof useConfigStore.getState>;
type OnboardingState = ReturnType<typeof useOnboardingStore.getState>;

// Each store's data as it is at import — i.e. a fresh launch. Functions are
// left out so seeding never replaces the store's own actions.
function dataOnly<T extends object>(state: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(state).filter(([, value]) => typeof value !== 'function'),
  ) as Partial<T>;
}
const AUTH_INITIAL = dataOnly(useAuthStore.getState());
const CONFIG_INITIAL = dataOnly(useConfigStore.getState());
const ONBOARDING_INITIAL = dataOnly(useOnboardingStore.getState());

/** Fresh-launch auth state (isLoading false — the app has finished starting), plus overrides. */
export function seedAuthStore(overrides: Partial<AuthState> = {}): void {
  useAuthStore.setState({ ...AUTH_INITIAL, isLoading: false, ...overrides });
}

/** Config check resolved to 'ok' by default — the common launch. */
export function seedConfigStore(overrides: Partial<ConfigState> = {}): void {
  useConfigStore.setState({
    ...CONFIG_INITIAL,
    status: 'ok',
    hasStarted: true,
    lastCheckedAt: Date.now(),
    ...overrides,
  });
}

/** Empty questionnaire by default (a returning user's launch), plus overrides. */
export function seedOnboardingStore(overrides: Partial<OnboardingState> = {}): void {
  useOnboardingStore.setState({ ...ONBOARDING_INITIAL, ...overrides });
}
