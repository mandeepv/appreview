import { supabase } from '../lib/supabase';
import { OnboardingData } from '../types/onboarding';

/**
 * Save user's onboarding data to Supabase
 */
export const saveUserOnboardingData = async (userId: string, onboardingData: Partial<OnboardingData>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        user_type: onboardingData.userType,
        name: onboardingData.name,
        age: onboardingData.age,
        children_count: onboardingData.childrenCount,
        children: onboardingData.children,
        improvement_goals: onboardingData.improvementGoals,
        notifications_enabled: onboardingData.notificationsEnabled,
        partner_involvement: onboardingData.partnerInvolvement,
        partner_invited: onboardingData.partnerInvited,
        learning_goal: onboardingData.learningGoal,
        experience_level: onboardingData.experienceLevel,
        familiar_parenting_styles: onboardingData.familiarParentingStyles,
        emotional_challenges: onboardingData.emotionalChallenges,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

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
