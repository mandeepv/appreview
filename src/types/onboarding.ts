export type UserType = 'father' | 'mother' | 'other';

export type ChildGender = 'boy' | 'girl' | 'expecting' | 'prefer-not-to-say';

export type ChildAgeRange = '0-1' | '2-4' | '5-7' | '8-12' | 'teen';

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

export type ExperienceLevel = 'new-to-science' | 'know-a-lot';

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
  gender: ChildGender;
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
  authMethod: 'google' | 'apple' | null;

  // Screen 20
  selectedPlan: 'free-trial' | 'monthly' | null;
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
  setAuthMethod: (method: 'google' | 'apple') => void;
  setSelectedPlan: (plan: 'free-trial' | 'monthly') => void;
  reset: () => void;
}
