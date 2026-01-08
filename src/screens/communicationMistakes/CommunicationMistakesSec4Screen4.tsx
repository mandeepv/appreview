import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec4Screen4'>;

export const CommunicationMistakesSec4Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('4');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question='How do you feel when someone says you are "overreacting"?'
        options={[
          {
            label: 'I feel thankful for the feedback',
            isCorrect: false,
          },
          {
            label: 'I feel really smart',
            isCorrect: false,
          },
          {
            label: 'It just makes it worse',
            isCorrect: true,
          },
        ]}
        feedback="Minimizing doesn't reduce emotions — it usually intensifies them. People calm down after they feel understood, not after they are corrected."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
