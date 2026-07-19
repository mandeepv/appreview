import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import {
  QuestionScreen,
  OptionList,
  ContinueButton,
  SelectionCountPill,
  isMultiSelectValid,
} from '../../../components/onboarding';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB, WHEN_HARDEST_OPTIONS } from './variantBContent';

// ACT 2 — the reflection beat: "when it's hardest, what happens?" This is where
// the user self-convinces there's a problem worth solving. Multi-select. The
// 'okay' option is an exclusive escape valve (same domain rule as variant A's
// EmotionalChallenges): choosing it clears the rest, choosing any real answer
// clears 'okay'.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBWhenHardest'>;

const OKAY = 'okay';

export const VBWhenHardestScreen: React.FC<Props> = ({ navigation }) => {
  const { variantBAnswers, setVariantBAnswer } = useOnboardingStore();
  const selected: string[] = Array.isArray(variantBAnswers[VB.WhenHardest])
    ? (variantBAnswers[VB.WhenHardest] as string[])
    : [];

  const toggle = (key: string) => {
    let next: string[];
    if (key === OKAY) {
      // 'okay' is exclusive — selecting it clears everything else; toggling off
      // just removes it.
      next = selected.includes(OKAY) ? [] : [OKAY];
    } else {
      // A real feeling clears the exclusive 'okay', then toggles normally.
      const base = selected.filter((k) => k !== OKAY);
      next = base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
    }
    setVariantBAnswer(VB.WhenHardest, next);
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackOnboardingStepCompleted(VB.WhenHardest, selected);
    navigation.navigate('VBMirror');
  };

  return (
    <QuestionScreen
      screenName={VB.WhenHardest}
      title="When it's hardest, what usually happens?"
      subtitle="No judgment — every parent has these moments."
      onBack={() => navigation.goBack()}
      footer={
        <>
          <SelectionCountPill count={selected.length} noun="answer" />
          <ContinueButton onPress={handleContinue} disabled={!isMultiSelectValid(selected)} />
        </>
      }
    >
      <OptionList
        mode="multi"
        options={WHEN_HARDEST_OPTIONS}
        selected={selected}
        onToggle={toggle}
      />
    </QuestionScreen>
  );
};
