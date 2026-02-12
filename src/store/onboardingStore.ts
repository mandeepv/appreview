import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OnboardingStore,
  UserType,
  ChildGender,
  ChildAgeRange,
  ImprovementGoal,
  PartnerInvolvement,
  LearningGoal,
  ExperienceLevel,
  ParentingStyle,
  EmotionalChallenge,
} from '../types/onboarding';

const ONBOARDING_STORAGE_KEY = '@kinderwell_onboarding_state';
const LAST_SCREEN_KEY = '@kinderwell_last_onboarding_screen';
const HAS_REACHED_AUTH_KEY = '@kinderwell_has_reached_auth';

const initialState = {
  userType: null,
  name: '',
  age: null,
  childrenCount: null,
  children: [],
  improvementGoals: [],
  notificationsEnabled: false,
  partnerInvolvement: null,
  partnerInvited: false,
  learningGoal: null,
  experienceLevel: null,
  familiarParentingStyles: [],
  emotionalChallenges: [],
  authMethod: null,
  selectedPlan: null,
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  updateUserType: (userType: UserType) => set({ userType }),

  updateNameAndAge: (name: string, age: number) => set({ name, age }),

  updateChildrenCount: (count: number) =>
    set((state) => ({
      childrenCount: count,
      children: Array.from({ length: count }, (_, i) => state.children[i] || { gender: 'boy' as ChildGender }),
    })),

  updateChildGender: (index: number, gender: ChildGender) =>
    set((state) => {
      const newChildren = [...state.children];
      newChildren[index] = { ...newChildren[index], gender };
      return { children: newChildren };
    }),

  updateChildAgeRange: (index: number, ageRange: ChildAgeRange) =>
    set((state) => {
      const newChildren = [...state.children];
      newChildren[index] = { ...newChildren[index], ageRange };
      return { children: newChildren };
    }),

  toggleImprovementGoal: (goal: ImprovementGoal) =>
    set((state) => ({
      improvementGoals: state.improvementGoals.includes(goal)
        ? state.improvementGoals.filter((g) => g !== goal)
        : [...state.improvementGoals, goal],
    })),

  setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),

  updatePartnerInvolvement: (involvement: PartnerInvolvement) =>
    set({ partnerInvolvement: involvement }),

  setPartnerInvited: (invited: boolean) => set({ partnerInvited: invited }),

  updateLearningGoal: (goal: LearningGoal) => set({ learningGoal: goal }),

  updateExperienceLevel: (level: ExperienceLevel) => set({ experienceLevel: level }),

  toggleParentingStyle: (style: ParentingStyle) =>
    set((state) => ({
      familiarParentingStyles: state.familiarParentingStyles.includes(style)
        ? state.familiarParentingStyles.filter((s) => s !== style)
        : [...state.familiarParentingStyles, style],
    })),

  toggleEmotionalChallenge: (challenge: EmotionalChallenge) =>
    set((state) => ({
      emotionalChallenges: state.emotionalChallenges.includes(challenge)
        ? state.emotionalChallenges.filter((c) => c !== challenge)
        : [...state.emotionalChallenges, challenge],
    })),

  setAuthMethod: (method: 'google' | 'apple') => set({ authMethod: method }),

  setSelectedPlan: (plan: 'free-trial' | 'monthly') => set({ selectedPlan: plan }),

  reset: () => set(initialState),

  // Persistence methods
  saveState: async () => {
    try {
      const state = useOnboardingStore.getState();
      const stateToSave = {
        userType: state.userType,
        name: state.name,
        age: state.age,
        childrenCount: state.childrenCount,
        children: state.children,
        improvementGoals: state.improvementGoals,
        notificationsEnabled: state.notificationsEnabled,
        partnerInvolvement: state.partnerInvolvement,
        partnerInvited: state.partnerInvited,
        learningGoal: state.learningGoal,
        experienceLevel: state.experienceLevel,
        familiarParentingStyles: state.familiarParentingStyles,
        emotionalChallenges: state.emotionalChallenges,
        authMethod: state.authMethod,
        selectedPlan: state.selectedPlan,
      };
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      if (__DEV__) console.error('Error saving onboarding state:', error);
    }
  },

  loadState: async () => {
    try {
      const savedState = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        set(parsedState);
        return parsedState;
      }
      return null;
    } catch (error) {
      if (__DEV__) console.error('Error loading onboarding state:', error);
      return null;
    }
  },

  clearState: async () => {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_STORAGE_KEY,
        LAST_SCREEN_KEY,
        HAS_REACHED_AUTH_KEY,
      ]);
      set(initialState);
    } catch (error) {
      if (__DEV__) console.error('Error clearing onboarding state:', error);
    }
  },

  setLastScreen: async (screenName: string) => {
    try {
      await AsyncStorage.setItem(LAST_SCREEN_KEY, screenName);
    } catch (error) {
      if (__DEV__) console.error('Error saving last screen:', error);
    }
  },

  getLastScreen: async () => {
    try {
      return await AsyncStorage.getItem(LAST_SCREEN_KEY);
    } catch (error) {
      if (__DEV__) console.error('Error getting last screen:', error);
      return null;
    }
  },

  markAuthReached: async () => {
    try {
      await AsyncStorage.setItem(HAS_REACHED_AUTH_KEY, 'true');
    } catch (error) {
      if (__DEV__) console.error('Error marking auth reached:', error);
    }
  },

  hasReachedAuth: async () => {
    try {
      const value = await AsyncStorage.getItem(HAS_REACHED_AUTH_KEY);
      return value === 'true';
    } catch (error) {
      if (__DEV__) console.error('Error checking auth reached:', error);
      return false;
    }
  },
}));
