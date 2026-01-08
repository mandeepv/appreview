import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2QuizQ1'>;

export const Lesson2QuizQ1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2QuizQ2');
  };

  return (
    <LessonContainer
      currentStep={14}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={3}
          question="Which body chemical do most people subconsciously try to increase?"
          options={[
            { label: 'Oxytocin', isCorrect: false },
            { label: 'Cortisol', isCorrect: false },
            { label: 'Dopamine', isCorrect: true },
            { label: 'Serotonin', isCorrect: false },
          ]}
          feedback="Correct! Most people chase dopamine without realizing it—through achievements, purchases, social validation, and other quick rewards."
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
