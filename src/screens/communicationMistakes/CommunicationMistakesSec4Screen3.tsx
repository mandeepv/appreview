import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec4Screen3'>;

export const CommunicationMistakesSec4Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec4Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question='When the upset person is told their feelings are "too intense" for the situation, this mistake is called:'
        options={[
          {
            label: 'Honesty',
            isCorrect: false,
          },
          {
            label: 'Minimizing',
            isCorrect: true,
          },
          {
            label: 'Candor',
            isCorrect: false,
          },
          {
            label: 'Putting things in perspective',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Minimizing dismisses the emotional experience, even when the intent is to help."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
