import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec2Screen4'>;

export const ServeReturnSec2Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('2');
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
        question="Which is most harmful over time?"
        options={[
          {
            label: 'Occasionally missing a cue',
            isCorrect: false,
          },
          {
            label: 'Being distracted once in a while',
            isCorrect: false,
          },
          {
            label: 'Chronic lack of responsiveness',
            isCorrect: true,
          },
          {
            label: 'Encouraging independence',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Chronic lack of responsiveness weakens trust and emotional safety over time."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
