import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ParentingStyle } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ParentingStyles'>;

export const ParentingStylesScreen: React.FC<Props> = ({ navigation }) => {
  const { familiarParentingStyles, toggleParentingStyle } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('EmotionalChallenges');
  };

  const styles_list: { value: ParentingStyle; label: string }[] = [
    { value: 'gentle', label: 'Gentle parenting' },
    { value: 'authoritative', label: 'Authoritative parenting' },
    { value: 'montessori', label: 'Montessori' },
    { value: 'positive', label: 'Positive discipline' },
    { value: 'none', label: "Not familiar with any of these" },
  ];

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

  return (
    <OnboardingContainer
      screenName="ParentingStyles"
      title="Have you heard of any of these?"
      subtitle="Totally okay if you haven't."
      currentStep={12}
      onBack={() => navigation.goBack()}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {styles_list.map((style) => (
            <SelectableCard
              key={style.value}
              title={style.label}
              selected={familiarParentingStyles.includes(style.value)}
              onPress={() => handleStyleToggle(style.value)}
            />
          ))}
        </View>
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
  cardsContainer: {
    paddingBottom: 16,
  },
  buttonContainer: {
    paddingVertical: 16,
  },
});
