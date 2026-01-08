import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen2'>;

export const HelpingProcessEmotionsSec2Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={6}
        question="What is Dad focusing on in this conversation?"
        options={[
          {
            label: 'Solving the sleepover problem',
            isCorrect: false,
          },
          {
            label: 'Making her feel better quickly',
            isCorrect: false,
          },
          {
            label: 'Understanding how she feels',
            isCorrect: true,
          },
          {
            label: 'Teaching her how to respond better',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Dad is listening to understand her emotional experience, not to fix the situation."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
