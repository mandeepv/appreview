import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { LearningGoal } from '../../types/onboarding';
import { Colors } from '../../constants/theme';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'GoalSelection'>;

export const GoalSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { learningGoal, updateLearningGoal } = useOnboardingStore();

  const handleContinue = () => {
    if (learningGoal) {
      trackOnboardingStepCompleted('GoalSelection', learningGoal);
      navigation.navigate('ExperienceLevel');
    }
  };

  const goals: { value: LearningGoal; label: string; subtitle: string; icon: string }[] = [
    { value: 'casual', label: 'Casual', subtitle: '5 min/day', icon: '🌱' },
    { value: 'regular', label: 'Regular', subtitle: '10 min/day', icon: '🌿' },
    { value: 'serious', label: 'Serious', subtitle: '15 min/day', icon: '🌳' },
    { value: 'tireless', label: 'Tireless', subtitle: '20 min/day', icon: '🚀' },
  ];

  return (
    <OnboardingContainer
      screenName="GoalSelection"
      title="Pick a goal"
      subtitle="How would you like to grow as a parent?"
      currentStep={10}
      onBack={() => navigation.goBack()}
      scrollable={true}
    >
      <View style={styles.container}>
        <View>
          {goals.map((goal) => (
            <SelectableCard
              key={goal.value}
              title={goal.label}
              subtitle={goal.subtitle}
              icon={goal.icon}
              selected={learningGoal === goal.value}
              onPress={() => updateLearningGoal(goal.value)}
            />
          ))}
        </View>

        <View>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!learningGoal}
          />
          <Text style={styles.reassurance}>You can change this anytime.</Text>
        </View>
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
  reassurance: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 12,
  },
});
