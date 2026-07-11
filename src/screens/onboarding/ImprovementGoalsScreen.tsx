import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import {
  QuestionScreen,
  OptionList,
  Option,
  RevealFooter,
  ContinueButton,
  SelectionCountPill,
  isMultiSelectValid,
} from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ImprovementGoal } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ImprovementGoals'>;

// SPEC-17: multi-select → Continue REVEALS once ≥1 selected (never a disabled
// button). The hand-rolled scroll-hint animation is gone (the shell scrolls
// internally); the selection-count pill is now the standardized system element.
// Same values, analytics step, screenName.
const OPTIONS: Option<ImprovementGoal>[] = [
  { value: 'behavior-issues', label: 'Behavior issues', imageSource: require('../../../assets/onboarding/behavior_issues_illo.jpg') },
  { value: 'closer-relationship', label: 'Closer relationship', imageSource: require('../../../assets/onboarding/relationship_illo.jpg') },
  { value: 'less-fighting', label: 'Less fighting/tensions', imageSource: require('../../../assets/onboarding/fighting_illo.jpg') },
  { value: 'improved-parenting-skills', label: 'Improved parenting skills', imageSource: require('../../../assets/onboarding/parenting_skills_illo.jpg') },
  { value: 'quality-time', label: 'More quality Time', imageSource: require('../../../assets/onboarding/quality_time_illo.jpg') },
  { value: 'character-traits', label: 'Poor character traits', imageSource: require('../../../assets/onboarding/character_traits_illo.jpg') },
  { value: 'tantrums', label: 'Tantrums/whining', imageSource: require('../../../assets/onboarding/tantrums_illo.jpg') },
];

export const ImprovementGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { improvementGoals, toggleImprovementGoal } = useOnboardingStore();

  const handleContinue = () => {
    trackOnboardingStepCompleted('ImprovementGoals', improvementGoals);
    navigation.navigate('Educational');
  };

  const valid = isMultiSelectValid(improvementGoals);

  return (
    <QuestionScreen
      screenName="ImprovementGoals"
      title="What feels hardest right now?"
      subtitle="Select all that apply"
      onBack={() => navigation.goBack()}
      footer={
        <RevealFooter visible={valid}>
          <SelectionCountPill count={improvementGoals.length} noun="area" />
          <ContinueButton onPress={handleContinue} />
        </RevealFooter>
      }
    >
      <OptionList
        mode="multi"
        options={OPTIONS}
        selected={improvementGoals}
        onToggle={toggleImprovementGoal}
      />
    </QuestionScreen>
  );
};
