import React from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { SelectableCard } from '../../components/SelectableCard';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { ExperienceLevel } from '../../types/onboarding';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExperienceLevel'>;

export const ExperienceLevelScreen: React.FC<Props> = ({ navigation }) => {
  const { experienceLevel, updateExperienceLevel } = useOnboardingStore();

  const handleContinue = () => {
    if (experienceLevel) {
      navigation.navigate('EmotionalChallenges');
    }
  };

  const levels: { value: ExperienceLevel; label: string; subtitle: string; image: ImageSourcePropType }[] = [
    {
      value: 'new-to-science',
      label: "I'm completely new to parenting science",
      subtitle: 'Start from the basics',
      image: require('../../../assets/onboarding/experience_level_new.png'),
    },
    {
      value: 'somewhat-familiar',
      label: "I am somewhat familiar with it",
      subtitle: "I've read a few books or blogs",
      image: require('../../../assets/onboarding/experience_level_somewhat.png'),
    },
    {
      value: 'know-a-lot',
      label: 'I know a lot about parenting science',
      subtitle: 'Advanced concepts and techniques',
      image: require('../../../assets/onboarding/experience_level_expert.png'),
    },
  ];

  return (
    <OnboardingContainer
      screenName="ExperienceLevel"
      title="How familiar are you with modern parenting ideas?"
      currentStep={11}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          {levels.map((level) => (
            <SelectableCard
              key={level.value}
              title={level.label}
              subtitle={level.subtitle}
              imageSource={level.image}
              selected={experienceLevel === level.value}
              onPress={() => updateExperienceLevel(level.value)}
            />
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!experienceLevel}
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
  cardsContainer: {
    gap: 16,
  },
});
