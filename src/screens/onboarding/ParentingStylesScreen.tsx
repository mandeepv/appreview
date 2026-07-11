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
import { ParentingStyle } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ParentingStyles'>;

// SPEC-17: multi-select → Continue reveals on ≥1. "Not familiar with any" is
// mutually exclusive with the named styles. Same values/analytics/screenName.
const OPTIONS: Option<ParentingStyle>[] = [
  { value: 'gentle', label: 'Gentle parenting' },
  { value: 'authoritative', label: 'Authoritative parenting' },
  { value: 'montessori', label: 'Montessori' },
  { value: 'positive', label: 'Positive discipline' },
  { value: 'none', label: 'Not familiar with any of these' },
];

export const ParentingStylesScreen: React.FC<Props> = ({ navigation }) => {
  const { familiarParentingStyles, toggleParentingStyle } = useOnboardingStore();

  const handleStyleToggle = (style: ParentingStyle) => {
    if (style === 'none') {
      toggleParentingStyle('none');
    } else {
      if (familiarParentingStyles.includes('none')) {
        toggleParentingStyle('none');
      }
      toggleParentingStyle(style);
    }
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('ParentingStyles', familiarParentingStyles);
    navigation.navigate('EmotionalChallenges');
  };

  const valid = isMultiSelectValid(familiarParentingStyles);

  return (
    <QuestionScreen
      screenName="ParentingStyles"
      title="Have you heard of any of these?"
      subtitle="Totally okay if you haven't."
      onBack={() => navigation.goBack()}
      footer={
        <RevealFooter visible={valid}>
          <SelectionCountPill count={familiarParentingStyles.length} noun="style" />
          <ContinueButton onPress={handleContinue} />
        </RevealFooter>
      }
    >
      <OptionList
        mode="multi"
        options={OPTIONS}
        selected={familiarParentingStyles}
        onToggle={handleStyleToggle}
        variant="compact"
      />
    </QuestionScreen>
  );
};
