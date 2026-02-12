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
 * Check if user has completed onboarding
 */
export const hasUserCompletedOnboarding = async (userId: string): Promise<boolean> => {
  try {
    const data = await getUserOnboardingData(userId);
    // Consider onboarding complete if user_type exists (minimum required field)
    return data !== null && data.user_type !== null;
  } catch (error) {
    if (__DEV__) console.error('Error checking onboarding status:', error);
    return false;
  }
};
