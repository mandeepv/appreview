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
import { EmotionalChallenge } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmotionalChallenges'>;

// SPEC-17: multi-select → Continue reveals on ≥1. Same values, analytics step,
// screenName. The "okay" option is mutually exclusive with the others (selecting
// it clears the rest; selecting any other clears "okay") — that domain rule is
// preserved verbatim below.
const OPTIONS: Option<EmotionalChallenge>[] = [
  { value: 'overwhelmed', label: 'Feeling overwhelmed', imageSource: require('../../../assets/onboarding/emotional_overwhelmed.png') },
  { value: 'anxious', label: 'Feeling anxious', imageSource: require('../../../assets/onboarding/emotional_anxious.png') },
  { value: 'burned-out', label: 'Feeling burned out', imageSource: require('../../../assets/onboarding/emotional_burned_out.png') },
  { value: 'emotionally-distant', label: 'Feeling emotionally distant', imageSource: require('../../../assets/onboarding/emotional_distant.png') },
  { value: 'okay', label: "I’m doing okay right now", imageSource: require('../../../assets/onboarding/emotional_okay.png') },
];

export const EmotionalChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { emotionalChallenges, toggleEmotionalChallenge } = useOnboardingStore();

  const handleChallengeToggle = (challenge: EmotionalChallenge) => {
    if (challenge === 'okay') {
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      } else {
        // "I'm okay" is exclusive — clear every other selection first.
        emotionalChallenges.forEach((c) => toggleEmotionalChallenge(c));
        toggleEmotionalChallenge('okay');
      }
    } else {
      // Picking a real feeling clears the exclusive "okay".
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      }
      toggleEmotionalChallenge(challenge);
    }
  };

  const handleContinue = () => {
    trackOnboardingStepCompleted('EmotionalChallenges', { challenges: emotionalChallenges, skipped: false });
    navigation.navigate('Auth');
  };

  const valid = isMultiSelectValid(emotionalChallenges);

  return (
    <QuestionScreen
      screenName="EmotionalChallenges"
      title="How have you been feeling lately?"
      subtitle="Stored securely to personalize your lessons."
      onBack={() => navigation.goBack()}
      footer={
        <RevealFooter visible={valid}>
          <SelectionCountPill count={emotionalChallenges.length} noun="feeling" />
          <ContinueButton onPress={handleContinue} />
        </RevealFooter>
      }
    >
      <OptionList
        mode="multi"
        options={OPTIONS}
        selected={emotionalChallenges}
        onToggle={handleChallengeToggle}
      />
    </QuestionScreen>
  );
};
