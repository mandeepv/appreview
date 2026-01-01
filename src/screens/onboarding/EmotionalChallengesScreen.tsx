import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { EmotionalChallenge } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmotionalChallenges'>;

export const EmotionalChallengesScreen: React.FC<Props> = ({ navigation }) => {
  const { emotionalChallenges, toggleEmotionalChallenge } = useOnboardingStore();

  const handleContinue = () => {
    navigation.navigate('Auth');
  };

  const handleSkip = () => {
    navigation.navigate('Auth');
  };

  const challenges: { value: EmotionalChallenge; label: string; icon: string }[] = [
    { value: 'overwhelmed', label: 'Feeling overwhelmed', icon: '�' },
    { value: 'anxious', label: 'Feeling anxious', icon: '�' },
    { value: 'burned-out', label: 'Feeling burned out', icon: '�' },
    { value: 'emotionally-distant', label: 'Feeling emotionally distant', icon: '�' },
    { value: 'okay', label: "I’m doing okay right now", icon: '�' },
  ];

  const handleChallengeToggle = (challenge: EmotionalChallenge) => {
    if (challenge === 'okay') {
      // If selecting 'okay', clear others (handled by store usually just toggle, so we might need reset? 
      // Since I cannot change store easily here, I will assume toggleEmotionalChallenge works by strictly toggling.
      // So to clear others, I need to know what's selected. 
      // I can iterate and toggle off everything else?
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      } else {
        // Deselect all current
        emotionalChallenges.forEach(c => toggleEmotionalChallenge(c));
        // Select okay
        toggleEmotionalChallenge('okay');
      }
    } else {
      if (emotionalChallenges.includes('okay')) {
        toggleEmotionalChallenge('okay');
      }
      toggleEmotionalChallenge(challenge);
    }
  };

  return (
    <OnboardingContainer
      title="How have you been feeling lately?"
      subtitle="This stays private. It helps us support you better."
      currentStep={14}
      onBack={() => navigation.goBack()}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.cardsContainer}>
          {challenges.map((challenge) => (
            <SelectableCard
              key={challenge.value}
              title={challenge.label}
              icon={challenge.icon}
              selected={emotionalChallenges.includes(challenge.value)}
              onPress={() => handleChallengeToggle(challenge.value)}
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
