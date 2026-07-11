import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { LearningGoal } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'GoalSelection'>;

// SPEC-17: single-select → auto-advance. The old "You can change this anytime"
// reassurance lived under the Continue button; with auto-advance there's no
// button, so it folds into the subtitle.
const OPTIONS: Option<LearningGoal>[] = [
  { value: 'casual', label: 'Casual', subtitle: '5 min/day', icon: '🌱' },
  { value: 'regular', label: 'Regular', subtitle: '10 min/day', icon: '🌿' },
  { value: 'serious', label: 'Serious', subtitle: '15 min/day', icon: '🌳' },
  { value: 'tireless', label: 'Tireless', subtitle: '20 min/day', icon: '🚀' },
];

export const GoalSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { learningGoal, updateLearningGoal } = useOnboardingStore();

  const handleAdvance = (value: LearningGoal) => {
    trackOnboardingStepCompleted('GoalSelection', value);
    navigation.navigate('ExperienceLevel');
  };

  return (
    <QuestionScreen
      screenName="GoalSelection"
      title="Pick a goal"
      subtitle="How would you like to grow as a parent? You can change this anytime."
      onBack={() => navigation.goBack()}
    >
      <OptionList
        mode="single"
        options={OPTIONS}
        selected={learningGoal}
        onSelect={updateLearningGoal}
        onAdvance={handleAdvance}
      />
    </QuestionScreen>
  );
};
