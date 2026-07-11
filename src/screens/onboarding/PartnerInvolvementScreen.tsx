import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { QuestionScreen, OptionList, Option } from '../../components/onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { PartnerInvolvement } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PartnerInvolvement'>;

// SPEC-17: single-select → auto-advance (compact text rows, no images).
const OPTIONS: Option<PartnerInvolvement>[] = [
  { value: 'very-involved', label: 'Very involved' },
  { value: 'involved-sometimes', label: 'Involved sometimes' },
  { value: 'rarely-involved', label: 'Rarely involved' },
  { value: 'not-involved', label: 'Not involved' },
  { value: 'no-partner', label: 'No partner' },
];

export const PartnerInvolvementScreen: React.FC<Props> = ({ navigation }) => {
  const { partnerInvolvement, updatePartnerInvolvement } = useOnboardingStore();

  const handleAdvance = (value: PartnerInvolvement) => {
    trackOnboardingStepCompleted('PartnerInvolvement', value);
    navigation.navigate('ExperienceLevel');
  };

  return (
    <QuestionScreen
      screenName="PartnerInvolvement"
      title="How involved is your partner?"
      subtitle="So we can tailor advice that fits your family dynamic."
      onBack={() => navigation.goBack()}
    >
      <OptionList
        mode="single"
        options={OPTIONS}
        selected={partnerInvolvement}
        onSelect={updatePartnerInvolvement}
        onAdvance={handleAdvance}
        variant="compact"
      />
    </QuestionScreen>
  );
};
