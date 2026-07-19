import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../../navigation/OnboardingNavigator';
import { QuestionScreen, ContinueButton } from '../../../components/onboarding';
import { FormInput } from '../../../components/FormInput';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { trackOnboardingStepCompleted } from '../../../lib/analytics';
import { VB } from './variantBContent';

// ACT 1 — name capture. The personalization anchor: later beats address the user
// by name ("You're not alone, {name}"). Free input, so an EXPLICIT Continue
// (auto-advance is single-select only), matching NameAge's grammar.
//
// PII: the name is stored ONLY in the local onboarding store (existing `name`
// field). It is NEVER sent to analytics — the step event records only whether a
// name was given, never the value (INVARIANT: no free-text PII to PostHog).
type Props = NativeStackScreenProps<OnboardingStackParamList, 'VBName'>;

export const VBNameScreen: React.FC<Props> = ({ navigation }) => {
  const { name: storedName, age, updateNameAndAge } = useOnboardingStore();
  const [name, setName] = useState(storedName);

  const handleContinue = () => {
    // Store the real trimmed name, or empty when blank. Do NOT substitute a
    // literal placeholder ('there'/'Parent') here: the name guards in
    // onboardingService + LoadingScreen only strip 'Parent'/empty before the
    // Supabase write, so a 'there' default would slip through and CLOBBER the
    // real Apple name signInWithApple saved (the exact bug those guards exist to
    // prevent). Empty is safe — the guards drop it, and the variant-B display
    // screens already fall back to a friendly word (name || 'friend'/'Hey').
    const finalName = name.trim();
    // Variant B doesn't ask age; preserve whatever's stored (0 if unset — the
    // downstream identify treats it the same as variant A when age is absent).
    updateNameAndAge(finalName, age ?? 0);
    trackOnboardingStepCompleted(VB.Name, { has_name: name.trim().length > 0 });
    // Stay on the variant-B rail — VBRole, NOT variant A's UserType. Routing to
    // UserType here dumped every variant_b user into the control flow (16 of 19
    // B screens unreachable, variantBAnswers empty) while their events were still
    // stamped variant_b — the A/B test would have measured nothing.
    navigation.navigate('VBRole');
  };

  return (
    <QuestionScreen
      screenName={VB.Name}
      title="First, what should we call you?"
      subtitle="So your plan feels like yours."
      onBack={() => navigation.goBack()}
      footer={<ContinueButton onPress={handleContinue} />}
    >
      <FormInput
        label="Your first name"
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        characterLimit={50}
        showCharacterCount={false}
        success={name.trim().length > 0}
      />
    </QuestionScreen>
  );
};
