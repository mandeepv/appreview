import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec11Screen2'>;

export const CommunicationMistakesSec11Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec11Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={3}
        question="Why doesn't this solution work?"
        options={[
          {
            label: 'It ignores the original hurt',
            isCorrect: false,
          },
          {
            label: 'It changes the topic instead of addressing it',
            isCorrect: false,
          },
          {
            label: 'It replaces the pain instead of acknowledging it',
            isCorrect: false,
          },
          {
            label: 'All of the above',
            isCorrect: true,
          },
        ]}
        feedback="Correct. The pain isn't about missing a sleepover — it's about being left out."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
