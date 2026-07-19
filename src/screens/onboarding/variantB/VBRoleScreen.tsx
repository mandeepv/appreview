import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { UserType } from '../../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 2 — role. Same question and store field (`userType`) as variant A's
// UserType, so downstream personalization/identify is identical across arms; only
// the copy and the next-target differ (B has its own flow). Reuses variant A's
// illustration assets. Keeps the App Store 5.1.1 "stored securely / used only to
// personalize" reassurance in the subtitle (auto-advance layout has no body slot).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBRole'>;

const OPTIONS: Option<UserType>[] = [
  { value: 'mother', label: 'Mother', imageSource: require('../../../../assets/onboarding/mother_illustration.png') },
  { value: 'father', label: 'Father', imageSource: require('../../../../assets/onboarding/father_illustration.png') },
  {
    value: 'other',
    label: 'Other / Guardian',
    subtitle: 'Grandparent, caregiver, or guardian',
    imageSource: require('../../../../assets/onboarding/guardian_illustration.png'),
  },
];

export const VBRoleScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleAdvance = (value: UserType) => {
    // Same analytics step name as variant A so the per-step funnel unifies both
    // arms (the arm itself rides on the variant super-property).
    trackOnboardingStepCompleted('UserType', value);
    navigation.navigate('VBKids');
  };

  return (
    <QuestionScreen
      screenName={VB.Role}
      title="Who are you parenting as?"
      subtitle="Your answers are stored securely and used only to personalize your lessons."
      onBack={() => navigation.goBack()}
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
