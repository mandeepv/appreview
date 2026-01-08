import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec1Screen4'>;

export const ServeReturnSec1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('1');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question={`What is a "serve"?`}
        options={[
          {
            label: 'Giving advice',
            isCorrect: false,
          },
          {
            label: 'Expressing emotion or interest',
            isCorrect: true,
          },
          {
            label: 'Fixing the problem',
            isCorrect: false,
          },
          {
            label: 'Ending the conversation',
            isCorrect: false,
          },
        ]}
        feedback="Correct. A serve is an emotional cue or expression of interest that invites connection."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
