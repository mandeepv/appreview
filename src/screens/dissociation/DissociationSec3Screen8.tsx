import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen8'>;

export const DissociationSec3Screen8: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('DissociationSec3Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question="What is the most important first step when dissociation starts?"
        options={[
          {
            label: 'Try to force it to stop',
            isCorrect: false,
          },
          {
            label: 'Ignore it',
            isCorrect: false,
          },
          {
            label: 'Notice it and name it',
            isCorrect: true,
          },
          {
            label: 'Avoid difficult topics forever',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Awareness reduces dissociation's power."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
