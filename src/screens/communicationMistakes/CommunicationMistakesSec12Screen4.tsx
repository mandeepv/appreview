import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec12Screen4'>;

export const CommunicationMistakesSec12Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec12Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={3}
        question="When someone is still upset and another person tries to cheer them up, it often makes the upset person feel:"
        options={[
          {
            label: 'Thankful',
            isCorrect: false,
          },
          {
            label: 'Distracted',
            isCorrect: false,
          },
          {
            label: 'Like the listener is uncomfortable with their negative feelings',
            isCorrect: true,
          },
          {
            label: 'Cheered up',
            isCorrect: false,
          },
        ]}
        feedback="Exactly. It can feel like their pain is too much for the other person to handle."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
