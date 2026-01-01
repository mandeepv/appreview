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
    if (partnerInvolvement && partnerInvolvement !== 'no-partner') {
      navigation.navigate('InvitePartner');
    } else {
      navigation.navigate('GoalSelection');
    }
  };

  const involvementLevels: { value: PartnerInvolvement; label: string }[] = [
    { value: 'very-involved', label: 'Very involved' },
    { value: 'moderately-involved', label: 'Moderately involved' },
    { value: 'somewhat-involved', label: 'Somewhat involved' },
    { value: 'not-involved', label: 'Not involved' },
    { value: 'no-partner', label: "I don't have a partner" },
  ];

  return (
    <OnboardingContainer
      title="How involved is your partner?"
      subtitle="This helps us tailor advice and examples"
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
