import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen5'>;

export const HelpingProcessEmotionsSec2Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={3}
        totalQuestions={6}
        question="What feeling does Dad help her identify?"
        options={[
          {
            label: 'Anger',
            isCorrect: false,
          },
          {
            label: 'Embarrassment',
            isCorrect: true,
          },
          {
            label: 'Jealousy',
            isCorrect: false,
          },
          {
            label: 'Disappointment',
            isCorrect: false,
          },
        ]}
        feedback="Right. By naming the embarrassment, Dad helped her identify what she was really feeling."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
