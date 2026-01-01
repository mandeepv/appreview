import { create } from 'zustand';
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
}));
