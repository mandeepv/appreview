import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ImprovementGoal } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ImprovementGoals'>;

export const ImprovementGoalsScreen: React.FC<Props> = ({ navigation }) => {
  const { improvementGoals, toggleImprovementGoal } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('ExpertEndorsement');
  };

  const goals: { value: ImprovementGoal; label: string; icon: string }[] = [
    { value: 'behavior-issues', label: 'Behavior issues', icon: '🧩' },
    { value: 'closer-relationship', label: 'Closer relationship', icon: '❤️' },
    { value: 'less-fighting', label: 'Less fighting/tensions', icon: '🕊️' },
    { value: 'improved-parenting-skills', label: 'Improved parenting skills', icon: '📚' },
    { value: 'quality-time', label: 'More quality Time', icon: '⏳' },
    { value: 'character-traits', label: 'Poor character traits', icon: '🌱' },
    { value: 'tantrums', label: 'Tantrums/whining', icon: '😫' },
  ];

  return (
    <OnboardingContainer
      title="What feels hardest right now?"
      subtitle="Select all that apply"
      currentStep={6}
      onBack={() => navigation.goBack()}
      centerTitle={true}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {goals.map((goal) => (
            <SelectableCard
              key={goal.value}
              title={goal.label}
              icon={goal.icon}
              selected={improvementGoals.includes(goal.value)}
              onPress={() => toggleImprovementGoal(goal.value)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={improvementGoals.length === 0}
        />
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
