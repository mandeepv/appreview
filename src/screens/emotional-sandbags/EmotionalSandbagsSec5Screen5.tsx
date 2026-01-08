import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen5'>;

export const EmotionalSandbagsSec5Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={3}
        totalQuestions={5}
        question="What should you do next?"
        options={[
          {
            label: 'Start thinking of ways to solve the problems',
            isCorrect: false,
          },
          {
            label: 'Try to put yourself in your partner\'s shoes and feel what they are feeling',
            isCorrect: true,
          },
          {
            label: 'Prepare to tell your partner about your bad day',
            isCorrect: false,
          },
        ]}
        feedback="Empathy comes before solutions."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
