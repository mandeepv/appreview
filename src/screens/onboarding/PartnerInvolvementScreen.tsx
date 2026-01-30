import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { PartnerInvolvement } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PartnerInvolvement'>;

export const PartnerInvolvementScreen: React.FC<Props> = ({ navigation }) => {
  const { partnerInvolvement, updatePartnerInvolvement } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ExperienceLevel');
  };

  const involvementLevels: { value: PartnerInvolvement; label: string }[] = [
    { value: 'very-involved', label: 'Very involved' },
    { value: 'involved-sometimes', label: 'Involved sometimes' },
    { value: 'rarely-involved', label: 'Rarely involved' },
    { value: 'not-involved', label: 'Not involved' },
    { value: 'no-partner', label: 'No partner' },
  ];

  return (
    <OnboardingContainer
      screenName="PartnerInvolvement"
      title="How involved is your partner?"
      subtitle="So we can tailor advice that fits your family dynamic."
      currentStep={8}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <View>
          {involvementLevels.map((level) => (
            <SelectableCard
              key={level.value}
              title={level.label}
              selected={partnerInvolvement === level.value}
              onPress={() => updatePartnerInvolvement(level.value)}
            />
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!partnerInvolvement}
        />
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
});
