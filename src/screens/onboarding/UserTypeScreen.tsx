import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { UserType } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>;

// SPEC-17: migrated to the onboarding UX system. UserType is a single-select
// question, so it auto-advances on tap — the bespoke square-card grid and the
// disabled "Continue →" button (the only screen with an arrow in its label) are
// gone. Same answer values, same analytics step ('UserType'), same screenName.
const OPTIONS: Option<UserType>[] = [
  { value: 'mother', label: 'Mother', imageSource: require('../../../assets/onboarding/mother_illustration.png') },
  { value: 'father', label: 'Father', imageSource: require('../../../assets/onboarding/father_illustration.png') },
  {
    value: 'other',
    label: 'Other / Guardian',
    subtitle: 'Grandparent, caregiver, or guardian',
    imageSource: require('../../../assets/onboarding/guardian_illustration.png'),
  },
];

export const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleAdvance = (value: UserType) => {
    // Answer is already written by onSelect before this fires.
    trackOnboardingStepCompleted('UserType', value);
    navigation.navigate('NameAge');
  };

  return (
    <QuestionScreen
      screenName="UserType"
      title="Welcome to Kinderwell"
      subtitle="Who are you parenting as? The next few questions help us personalize lessons for your family."
      caption="All responses are stored securely and used only to customize your experience."
    >
      <OptionList
        mode="single"
        options={OPTIONS}
        selected={userType}
        onSelect={updateUserType}
        onAdvance={handleAdvance}
      />
    </QuestionScreen>
  );
};
