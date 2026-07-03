import AsyncStorage from '@react-native-async-storage/async-storage';
import { posthog } from '../config/posthog';

export type OnboardingVariant = 'control' | 'variant_b';

const ONBOARDING_VARIANT_KEY = '@kinderwell_onboarding_variant';
const FLAG_KEY = 'onboarding_variant';

/**
 * Resolves which onboarding variant this user should see.
 *
 * Order of resolution:
 * 1. Cached decision in AsyncStorage (sticky per install — never flip mid-flow)
 * 2. PostHog feature flag `onboarding_variant`
 * 3. Fallback to 'control' if flag is unavailable
 *
 * The result is cached to AsyncStorage so a user never flips variants
 * during onboarding, even if the PostHog flag config changes.
 */
const FLAG_RESOLUTION_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

export async function resolveOnboardingVariant(): Promise<OnboardingVariant> {
  try {
    const cached = await AsyncStorage.getItem(ONBOARDING_VARIANT_KEY);
    if (cached === 'control' || cached === 'variant_b') {
      if (__DEV__) console.log(`[Experiment] onboarding_variant: ${cached} (cached)`);
      return cached;
    }

    await withTimeout(posthog.reloadFeatureFlagsAsync(), FLAG_RESOLUTION_TIMEOUT_MS, 'reloadFeatureFlagsAsync');
    const flagValue = posthog.getFeatureFlag(FLAG_KEY);
    const resolved: OnboardingVariant = flagValue === 'variant_b' ? 'variant_b' : 'control';

    await AsyncStorage.setItem(ONBOARDING_VARIANT_KEY, resolved);
    posthog.register({ onboarding_variant: resolved });

    if (__DEV__) console.log(`[Experiment] onboarding_variant: ${resolved} (from PostHog flag=${String(flagValue)})`);
    return resolved;
  } catch (error) {
    if (__DEV__) console.warn('[Experiment] Failed to resolve onboarding_variant, defaulting to control', error);
    posthog.register({ onboarding_variant: 'control' });
    return 'control';
  }
}

/**
 * Reads the cached variant without touching PostHog. Fast, sync-friendly path
 * once resolveOnboardingVariant has run at least once this launch.
 */
export async function getCachedOnboardingVariant(): Promise<OnboardingVariant> {
  const cached = await AsyncStorage.getItem(ONBOARDING_VARIANT_KEY);
  return cached === 'variant_b' ? 'variant_b' : 'control';
}

/**
 * Force a specific variant. Debug/QA only. Clears the cache and re-registers.
 */
export async function overrideOnboardingVariant(variant: OnboardingVariant | null): Promise<void> {
  if (variant === null) {
    await AsyncStorage.removeItem(ONBOARDING_VARIANT_KEY);
    if (__DEV__) console.log('[Experiment] onboarding_variant override cleared');
    return;
  }
  await AsyncStorage.setItem(ONBOARDING_VARIANT_KEY, variant);
  posthog.register({ onboarding_variant: variant });
  if (__DEV__) console.log(`[Experiment] onboarding_variant override: ${variant}`);
}
