import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec12Screen3'>;

export const CommunicationMistakesSec12Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec12Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={3}
        question="When you try to make an upset person happy, this is called:"
        options={[
          {
            label: 'Fixing it',
            isCorrect: false,
          },
          {
            label: 'Trying to cheer them up',
            isCorrect: true,
          },
          {
            label: 'Finding the bright side',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Cheering someone up is a natural instinct, but timing matters."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
