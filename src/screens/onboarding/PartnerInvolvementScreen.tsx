/**
 * Screen 16 in the design canvas — step 5 of 8.
 *
 * Single-select, four options. v1.2.0 had five: "Not involved" and "No
 * partner" both shipped, and in practice they read as the same answer to a
 * parent skimming at 9pm. They are now one row.
 *
 * The stored value stays 'not-involved'. 'no-partner' is still a valid
 * PartnerInvolvement member so existing rows keep resolving, but nothing
 * writes it any more — the two blur together in future breakdowns, which is
 * the accepted cost of the merge.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { PartnerInvolvement } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import { OnboardingLayout as L } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PartnerInvolvement'>;

const OPTIONS: { value: PartnerInvolvement; label: string }[] = [
  { value: 'very-involved', label: 'Very involved' },
  { value: 'involved-sometimes', label: 'Involved sometimes' },
  { value: 'rarely-involved', label: 'Rarely involved' },
  // Covers both "my partner isn't involved" and "there's no partner" — one
  // answer as far as the lessons are concerned.
  { value: 'not-involved', label: "Not involved, or I'm on my own" },
];

export const PartnerInvolvementScreen: React.FC<Props> = ({ navigation }) => {
  const { partnerInvolvement, updatePartnerInvolvement } = useOnboardingStore();

  const handleContinue = () => {
    if (!partnerInvolvement) return;
    trackOnboardingStepCompleted('PartnerInvolvement', partnerInvolvement);
    navigation.navigate('ExperienceLevel');
  };

  return (
    <OnboardingScreen
      step={5}
      headline="How involved is your *partner*?"
      subtitle="So we can tailor advice that fits your family dynamic."
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!partnerInvolvement}
    >
      <View style={styles.rows}>
        {OPTIONS.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            mode="single"
            // A stored 'no-partner' from before the merge still lights the
            // merged row, so going back doesn't look like the answer was lost.
            selected={
              partnerInvolvement === option.value ||
              (option.value === 'not-involved' && partnerInvolvement === 'no-partner')
            }
            onPress={() => updatePartnerInvolvement(option.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
});
