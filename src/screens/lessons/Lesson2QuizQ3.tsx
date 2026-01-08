import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2QuizQ3'>;

export const Lesson2QuizQ3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2Complete');
  };

  return (
    <LessonContainer
      currentStep={16}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={3}
          totalQuestions={3}
          question="Which of the following best describes dopamine?"
          options={[
            { label: 'The enemy of happiness', isCorrect: false },
            { label: 'A short-term reward chemical', isCorrect: true },
            { label: 'The key to lasting well-being', isCorrect: false },
            { label: 'A chemical only released by exercise', isCorrect: false },
          ]}
          feedback="Correct! Dopamine is a short-term reward chemical that helps with motivation and small wins. It's not bad—it's just not designed to provide long-term happiness."
          onCorrect={handleNext}
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
