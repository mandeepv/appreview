/**
 * Screen 16 in the design canvas — "STEP 5 OF 8".
 *
 * Single-select. The canvas note: "No partner" sits apart, not at the bottom
 * of a ranking — the first four rows are a scale of involvement, and leaving
 * the fifth inside that list reads as "least involved" rather than "different
 * situation". A rule and a gap separate it.
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
import { OnboardingLayout as L, oInk } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PartnerInvolvement'>;

const SCALE: { value: PartnerInvolvement; label: string }[] = [
  { value: 'very-involved', label: 'Very involved' },
  { value: 'involved-sometimes', label: 'Involved sometimes' },
  { value: 'rarely-involved', label: 'Rarely involved' },
  { value: 'not-involved', label: 'Not involved' },
];

const APART: { value: PartnerInvolvement; label: string } = {
  value: 'no-partner',
  label: 'No partner',
};

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
        {SCALE.map((option) => (
          <OptionRow
            key={option.value}
            label={option.label}
            mode="single"
            selected={partnerInvolvement === option.value}
            onPress={() => updatePartnerInvolvement(option.value)}
          />
        ))}
      </View>

      <View style={styles.divider} />

      <OptionRow
        label={APART.label}
        mode="single"
        selected={partnerInvolvement === APART.value}
        onPress={() => updatePartnerInvolvement(APART.value)}
      />
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
  divider: { height: 1, backgroundColor: oInk(0.12), marginVertical: 18 },
});
