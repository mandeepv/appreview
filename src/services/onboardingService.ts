import { supabase } from '../lib/supabase';
import { OnboardingData } from '../types/onboarding';
import type { Database, Json } from '../types/supabase';

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];

/**
 * Save user's onboarding data to Supabase
 *
 * Defense-in-depth against the "'Parent' clobbers Apple name" bug (Fable
 * review #5): NameAgeScreen defaults `name` to the literal `'Parent'` when
 * the user leaves the field blank, and this used to be upserted verbatim,
 * overwriting the real name signInWithApple had just saved from
 * credential.fullName. LoadingScreen now filters this out before calling us,
 * but we also filter here so no future caller can accidentally reintroduce
 * the bug through a different code path. Extra belt for the suspenders.
 */
export const saveUserOnboardingData = async (userId: string, onboardingData: Partial<OnboardingData>) => {
  try {
    // Build the payload conditionally. Only include `name` if it's a real
    // user-provided value — not the 'Parent' fallback, not empty/null.
    const trimmedName = onboardingData.name?.trim();
    const shouldSaveName = !!trimmedName && trimmedName !== 'Parent';

    // UserProfileInsert is derived from the DB schema (see
    // src/types/supabase.ts). If a column gets renamed or removed and you
    // forget to update this payload, `npm run gen:supabase-types` + tsc
    // will surface the mismatch as a compile error instead of a silent
    // "wrote to a nonexistent column" runtime bug (Fable review 🟡
    // highest-ROI quality item).
    const payload: UserProfileInsert = {
      id: userId,
      user_type: onboardingData.userType,
      age: onboardingData.age,
      children_count: onboardingData.childrenCount,
      // Child[] is JSON-serializable at runtime but the generated Json type
      // requires an explicit index signature we don't want on the domain
      // type. Cast at the DB boundary.
      children: onboardingData.children as Json | undefined,
      improvement_goals: onboardingData.improvementGoals,
      notifications_enabled: onboardingData.notificationsEnabled,
      partner_involvement: onboardingData.partnerInvolvement,
      partner_invited: onboardingData.partnerInvited,
      learning_goal: onboardingData.learningGoal,
      experience_level: onboardingData.experienceLevel,
      familiar_parenting_styles: onboardingData.familiarParentingStyles,
      emotional_challenges: onboardingData.emotionalChallenges,
      updated_at: new Date().toISOString(),
    };

    if (shouldSaveName) {
      payload.name = trimmedName;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) throw error;

    if (__DEV__) console.log('Onboarding data saved to Supabase successfully');
    return data;
  } catch (error) {
    if (__DEV__) console.error('Error saving onboarding data to Supabase:', error);
    throw error;
  }
};

/**
 * Get user's onboarding data from Supabase
 */
export const getUserOnboardingData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If no data found (404), return null instead of throwing
      if (error.code === 'PGRST116') {
        if (__DEV__) console.log('No onboarding data found for user');
        return null;
      }
      throw error;
    }

    if (__DEV__) console.log('Onboarding data loaded from Supabase');
    return data;
  } catch (error) {
    if (__DEV__) console.error('Error loading onboarding data from Supabase:', error);
    throw error;
  }
};

/**
 * Result of the onboarding-completed check.
 *
 * Three distinct outcomes — the reason this is a union and not a boolean:
 * a transient network error MUST NOT be indistinguishable from "user has no
 * onboarding data." Fable review #2 caught this — the old
 * `catch { return false }` classified a network blip as "never onboarded"
 * and re-onboarded real users, letting a re-run overwrite their real data.
 * Same error-swallowed-to-default class as the v1.0.0 paywall bypass.
 */
export type OnboardingCheckResult =
  | { status: 'has_onboarding' }
  | { status: 'no_onboarding' }
  | { status: 'error'; error: Error };

/**
 * Check if user has completed onboarding.
 *
 * Callers MUST handle the 'error' status explicitly — do not silently route
 * to signup on error, or you're back to the bug this fix closes. Show the
 * user a "couldn't verify your account, please retry" message and let them
 * try again rather than re-run onboarding over their real data.
 */
export const hasUserCompletedOnboarding = async (
  userId: string,
): Promise<OnboardingCheckResult> => {
  try {
    const data = await getUserOnboardingData(userId);
    // Consider onboarding complete if user_type exists (minimum required field)
    if (data !== null && data.user_type !== null) {
      return { status: 'has_onboarding' };
    }
    return { status: 'no_onboarding' };
  } catch (error) {
    if (__DEV__) console.error('Error checking onboarding status:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
};
