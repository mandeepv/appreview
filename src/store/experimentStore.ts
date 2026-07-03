import { create } from 'zustand';
import { OnboardingVariant, resolveOnboardingVariant } from '../lib/experiments';

interface ExperimentState {
  onboardingVariant: OnboardingVariant;
  isResolved: boolean;
  resolveVariant: () => Promise<void>;
  setVariant: (variant: OnboardingVariant) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  onboardingVariant: 'control',
  isResolved: false,

  resolveVariant: async () => {
    const variant = await resolveOnboardingVariant();
    set({ onboardingVariant: variant, isResolved: true });
  },

  setVariant: (variant) => set({ onboardingVariant: variant }),
}));
