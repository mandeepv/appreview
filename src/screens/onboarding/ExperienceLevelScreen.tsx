import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ExperienceLevel } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExperienceLevel'>;

// SPEC-17: single-select → auto-advance, no Continue button. Same values,
// analytics step, and screenName as before.
const OPTIONS: Option<ExperienceLevel>[] = [
  {
    value: 'new-to-science',
    label: "I'm completely new to parenting science",
    subtitle: 'Start from the basics',
    imageSource: require('../../../assets/onboarding/experience_level_new.png'),
  },
  {
    value: 'somewhat-familiar',
    label: 'I am somewhat familiar with it',
    subtitle: "I've read a few books or blogs",
    imageSource: require('../../../assets/onboarding/experience_level_somewhat.png'),
  },
  {
    value: 'know-a-lot',
    label: 'I know a lot about parenting science',
    subtitle: 'Advanced concepts and techniques',
    imageSource: require('../../../assets/onboarding/experience_level_expert.png'),
  },
];

export const ExperienceLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { experienceLevel, updateExperienceLevel } = useOnboardingStore();

  const handleAdvance = (value: ExperienceLevel) => {
    trackOnboardingStepCompleted('ExperienceLevel', value);
    navigation.navigate('EmotionalChallenges');
  };

  return (
    <QuestionScreen
      screenName="ExperienceLevel"
      title="How familiar are you with modern parenting ideas?"
      onBack={() => navigation.goBack()}
    >
      <OptionList
        mode="single"
        options={OPTIONS}
        selected={experienceLevel}
        onSelect={updateExperienceLevel}
        onAdvance={handleAdvance}
      />
    </QuestionScreen>
  );
};
