import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen4'>;

export const HelpingProcessEmotionsSec2Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={6}
        question={`Why didn't Dad immediately suggest solutions?`}
        options={[
          {
            label: `He didn't know what to say`,
            isCorrect: false,
          },
          {
            label: 'He wanted her to figure it out alone',
            isCorrect: false,
          },
          {
            label: `She wasn't emotionally ready yet`,
            isCorrect: true,
          },
          {
            label: `Solutions aren't helpful`,
            isCorrect: false,
          },
        ]}
        feedback="Exactly. She needed to process her emotions first before she could hear any solutions."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
