import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec11Screen3'>;

export const CommunicationMistakesSec11Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec11Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={3}
        question="What is the actual problem the daughter is expressing?"
        options={[
          {
            label: 'She wants a sleepover',
            isCorrect: false,
          },
          {
            label: 'She wants different friends',
            isCorrect: false,
          },
          {
            label: 'She wants a better plan',
            isCorrect: false,
          },
          {
            label: 'She feels left out and rejected',
            isCorrect: true,
          },
        ]}
        feedback="Exactly. The emotional wound is rejection — not the event itself."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
