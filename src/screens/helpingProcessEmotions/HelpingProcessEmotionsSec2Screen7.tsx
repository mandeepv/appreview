import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen7'>;

export const HelpingProcessEmotionsSec2Screen7: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={4}
        totalQuestions={6}
        question="What would most likely happen if Dad jumped straight to advice?"
        options={[
          {
            label: 'She would feel relieved',
            isCorrect: false,
          },
          {
            label: 'She would feel understood',
            isCorrect: false,
          },
          {
            label: 'She would feel dismissed',
            isCorrect: true,
          },
          {
            label: 'She would calm down faster',
            isCorrect: false,
          },
        ]}
        feedback="Right. Jumping to solutions before processing emotions usually makes people feel unheard."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
