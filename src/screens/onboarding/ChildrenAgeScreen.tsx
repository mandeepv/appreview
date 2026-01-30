import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildAgeRange } from '../../types/onboarding';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenAge'>;

export const ChildrenAgeScreen: React.FC<Props> = ({ navigation }) => {
  const { children, updateChildAgeRange } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ImprovementGoals');
  };

  const ageRanges: { value: ChildAgeRange; label: string }[] = [
    { value: '0-1', label: '0-1 years' },
    { value: '2-4', label: '2-4 years' },
    { value: '5-7', label: '5-7 years' },
    { value: '8-12', label: '8-12 years' },
    { value: '13-17', label: '13-17 years' },
    { value: '18+', label: '18+' },
  ];

  return (
    <OnboardingContainer
      screenName="ChildrenAge"
      title="How old are your children?"
      subtitle="Select the age ranges that apply"
      currentStep={5}
      onBack={() => navigation.goBack()}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {children.map((child, index) => (
          <View key={index} style={styles.childSection}>
            <Text style={styles.childLabel}>Child {index + 1}</Text>
            {ageRanges.map((range) => (
              <SelectableCard
                key={range.value}
                title={range.label}
                selected={child.ageRange === range.value}
                onPress={() => updateChildAgeRange(index, range.value)}
                variant="small"
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Continue" onPress={handleContinue} />
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  childSection: {
    marginBottom: 24,
  },
  childLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
