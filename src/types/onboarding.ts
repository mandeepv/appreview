export type UserType = 'father' | 'mother' | 'other';

export type ChildGender = 'boy' | 'girl' | 'expecting' | 'prefer-not-to-say';

export type ChildAgeRange = '0-1' | '2-4' | '5-7' | '8-12' | '13-17' | '18+';

export type ImprovementGoal =
  | 'behavior-issues'
  | 'closer-relationship'
  | 'less-fighting'
  | 'improved-parenting-skills'
  | 'quality-time'
  | 'character-traits'
  | 'tantrums';

export type PartnerInvolvement =
  | 'very-involved'
  | 'involved-sometimes'
  | 'rarely-involved'
  | 'not-involved'
  | 'no-partner';

export type LearningGoal = 'casual' | 'regular' | 'serious' | 'tireless';

export type ExperienceLevel = 'new-to-science' | 'somewhat-familiar' | 'know-a-lot';

export type ParentingStyle =
  | 'authoritative'
  | 'gentle'
  | 'positive'
  | 'montessori'
  | 'none';

export type EmotionalChallenge =
  | 'overwhelmed'
  | 'anxious'
  | 'burned-out'
  | 'emotionally-distant'
  | 'okay';

export interface Child {
  // Gender is optional. We used to hardcode 'boy' as the default when creating
  // children in the store, then let the user override it in an "Optional Expand"
  // section on ChildrenCountScreen — but that section was commented out, so
  // every user's children saved as 'boy' regardless of reality. Now we omit
  // gender entirely unless the user explicitly sets it. If we resurrect
  // gender collection in a future release, keep this optional and require an
  // explicit user action to set it.
  gender?: ChildGender;
  ageRange?: ChildAgeRange;
}

export interface OnboardingData {
  // Screen 2
  userType: UserType | null;

  // Screen 3
  name: string;
  age: number | null;

  // Screen 4
  childrenCount: number | null;

  // Screen 5 & 6
  children: Child[];

  // Screen 7
  improvementGoals: ImprovementGoal[];

  // Screen 8
  notificationsEnabled: boolean;

  // Screen 9
  partnerInvolvement: PartnerInvolvement | null;

  // Screen 10
  partnerInvited: boolean;

  // Screen 11
  learningGoal: LearningGoal | null;

  // Screen 12
  experienceLevel: ExperienceLevel | null;

  // Screen 13
  familiarParentingStyles: ParentingStyle[];

  // Screen 15
  emotionalChallenges: EmotionalChallenge[];

  // Screen 16
  authMethod: 'google' | 'apple' | 'demo' | null;

  // Screen 20
  selectedPlan: 'free-trial' | 'monthly' | null;

  // SPEC-15 (variant B): answers collected by the variant-B onboarding
  // scaffold, keyed by screen (e.g. 'VariantBQ1'). Single-select screens store
  // a string (option key), multi-select screens store a string[]. Additive and
  // variant-B-only — control users never populate this. Option KEYS only, never
  // free text (PII rule). Included in the persisted ONBOARDING_STATE JSON.
  variantBAnswers: Record<string, string | string[]>;
}

export interface OnboardingStore extends OnboardingData {
  updateUserType: (userType: UserType) => void;
  updateNameAndAge: (name: string, age: number) => void;
  updateChildrenCount: (count: number) => void;
  updateChildGender: (index: number, gender: ChildGender) => void;
  updateChildAgeRange: (index: number, ageRange: ChildAgeRange) => void;
  toggleImprovementGoal: (goal: ImprovementGoal) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  updatePartnerInvolvement: (involvement: PartnerInvolvement) => void;
  setPartnerInvited: (invited: boolean) => void;
  updateLearningGoal: (goal: LearningGoal) => void;
  updateExperienceLevel: (level: ExperienceLevel) => void;
  toggleParentingStyle: (style: ParentingStyle) => void;
  toggleEmotionalChallenge: (challenge: EmotionalChallenge) => void;
  setAuthMethod: (method: 'google' | 'apple' | 'demo') => void;
  setSelectedPlan: (plan: 'free-trial' | 'monthly') => void;
  // SPEC-15: record a variant-B screen's answer under its screen key.
  setVariantBAnswer: (screen: string, answer: string | string[]) => void;
  reset: () => void;
  // Persistence methods
  saveState: () => Promise<void>;
  loadState: () => Promise<any>;
  clearState: () => Promise<void>;
  setLastScreen: (screenName: string) => Promise<void>;
  getLastScreen: () => Promise<string | null>;
  markAuthReached: () => Promise<void>;
  hasReachedAuth: () => Promise<boolean>;
}
