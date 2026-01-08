import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen8'>;

export const HelpingProcessEmotionsSec2Screen8: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={5}
        totalQuestions={6}
        question="True or False: Helping someone process emotions means agreeing with them."
        options={[
          {
            label: 'True',
            isCorrect: false,
          },
          {
            label: 'False',
            isCorrect: true,
          },
        ]}
        feedback="Correct. You can validate someone's feelings without agreeing with their perspective."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
