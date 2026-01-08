import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2QuizQ2'>;

export const Lesson2QuizQ2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2QuizQ3');
  };

  return (
    <LessonContainer
      currentStep={15}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={2}
          totalQuestions={3}
          question="Why doesn't maximizing dopamine increase long-term happiness?"
          options={[
            { label: 'Dopamine is toxic in large amounts', isCorrect: false },
            { label: 'Dopamine always fades back to baseline', isCorrect: true },
            { label: 'Dopamine only works for children', isCorrect: false },
            { label: 'Dopamine requires medical supervision', isCorrect: false },
          ]}
          feedback="Correct! Dopamine is designed to fade quickly, no matter the source. Your brain always returns to baseline, which is why chasing it leads to constant craving rather than lasting satisfaction."
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
