import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen4'>;

export const CommunicationMistakesSec5Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec5Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={3}
        question="This communication mistake is called:"
        options={[
          {
            label: 'Being honest',
            isCorrect: false,
          },
          {
            label: 'Reality checking',
            isCorrect: false,
          },
          {
            label: 'Invalidating feelings',
            isCorrect: true,
          },
          {
            label: 'Teaching perspective',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Invalidating feelings means dismissing someone's emotional experience by arguing whether it's justified."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
