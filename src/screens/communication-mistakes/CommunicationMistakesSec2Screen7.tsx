import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen7'>;

export const CommunicationMistakesSec2Screen7: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec2Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question="Why does siding with the enemy hurt relationships?"
        options={[
          {
            label: 'It discourages honesty',
            isCorrect: false,
          },
          {
            label: 'It makes people dependent',
            isCorrect: false,
          },
          {
            label: 'It prevents emotional safety',
            isCorrect: true,
          },
          {
            label: 'It avoids accountability',
            isCorrect: false,
          },
        ]}
        feedback="Before someone can hear feedback or perspective, they need to feel emotionally supported.\n\nSafety first. Perspective later."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
