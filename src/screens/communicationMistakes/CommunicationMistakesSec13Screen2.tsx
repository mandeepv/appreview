import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec13Screen2'>;

export const CommunicationMistakesSec13Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec13Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question="What communication mistake is Dad making here?"
        options={[
          {
            label: 'Listening patiently',
            isCorrect: false,
          },
          {
            label: 'Solving the problem',
            isCorrect: false,
          },
          {
            label: 'Finding the bright side too soon',
            isCorrect: true,
          },
          {
            label: 'Validating her feelings',
            isCorrect: false,
          },
        ]}
        feedback="Correct. While gratitude and perspective can help, forcing it too early dismisses the pain."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
