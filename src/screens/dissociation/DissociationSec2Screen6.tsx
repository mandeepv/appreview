import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/dissociationProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec2Screen6'>;

export const DissociationSec2Screen6: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('2');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question="What is the most effective first step to reduce dissociation?"
        options={[
          {
            label: 'Solve the problem immediately',
            isCorrect: false,
          },
          {
            label: 'Avoid overwhelming situations',
            isCorrect: false,
          },
          {
            label: 'Notice it and name it',
            isCorrect: true,
          },
          {
            label: 'Distract yourself',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Naming dissociation creates awareness and space, which helps you regain control and see more options."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
