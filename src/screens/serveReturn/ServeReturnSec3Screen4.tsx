import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec3Screen4'>;

export const ServeReturnSec3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('ServeReturnSec3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question="True or false: A perfect response matters more than a consistent one."
        options={[
          {
            label: 'True',
            isCorrect: false,
          },
          {
            label: 'False',
            isCorrect: true,
          },
        ]}
        feedback="Correct. Consistency matters far more than perfection in building strong relationships."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
