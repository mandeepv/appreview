import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec2Screen5'>;

export const DissociationSec2Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('DissociationSec2Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question="Why is dissociating or avoidance usually a bad reaction?"
        options={[
          {
            label: 'It makes us feel helpless',
            isCorrect: false,
          },
          {
            label: 'It prevents us from working on solutions',
            isCorrect: false,
          },
          {
            label: 'It keeps the problem emotionally unresolved',
            isCorrect: false,
          },
          {
            label: 'All of the above',
            isCorrect: true,
          },
        ]}
        feedback="Correct. Dissociation creates helplessness, blocks solutions, and leaves emotional weight unresolved — making things worse over time."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
