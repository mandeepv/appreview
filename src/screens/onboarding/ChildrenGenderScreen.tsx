import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ChildGender } from '../../types/onboarding';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenGender'>;

export const ChildrenGenderScreen: React.FC<Props> = ({ navigation }) => {
  const { children, updateChildGender } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ChildrenAge');
  };

  const genderOptions: { value: ChildGender; label: string; icon: string }[] = [
    { value: 'boy', label: 'Boy', icon: '👦' },
    { value: 'girl', label: 'Girl', icon: '👧' },
    { value: 'expecting', label: "I'm expecting", icon: '🤰' },
  ];

  return (
    <OnboardingContainer
      screenName="ChildrenGender"
      title="What are the genders of your children?"
      subtitle="Select for each child"
      currentStep={4}
      onBack={() => navigation.goBack()}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {children.map((child, index) => (
          <View key={index} style={styles.childSection}>
            <Text style={styles.childLabel}>Child {index + 1}</Text>
            <View style={styles.optionsRow}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => updateChildGender(index, option.value)}
                  style={[
                    styles.genderButton,
                    child.gender === option.value ? styles.genderButtonSelected : styles.genderButtonUnselected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.genderIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.genderLabel,
                    child.gender === option.value ? styles.genderLabelSelected : styles.genderLabelUnselected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => updateChildGender(index, 'prefer-not-to-say')}
              style={styles.preferNotToSay}
            >
              <Text style={[
                styles.preferNotToSayText,
                child.gender === 'prefer-not-to-say' && styles.preferNotToSayTextSelected,
              ]}>
                Prefer not to say
              </Text>
            </TouchableOpacity>
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
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  genderIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  genderLabelSelected: {
    color: Colors.surface,
  },
  genderLabelUnselected: {
    color: Colors.textPrimary,
  },
  preferNotToSay: {
    paddingVertical: 8,
  },
  preferNotToSayText: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.textTertiary,
  },
  preferNotToSayTextSelected: {
    color: Colors.primary,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
