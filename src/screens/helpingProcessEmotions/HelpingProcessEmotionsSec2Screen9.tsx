import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen9'>;

export const HelpingProcessEmotionsSec2Screen9: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen10');
  };

  return (
    <LessonContainer
      currentStep={9}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={6}
        totalQuestions={6}
        question="What is Dad actually building in this conversation?"
        options={[
          {
            label: 'Conflict resolution skills',
            isCorrect: false,
          },
          {
            label: 'Emotional resilience',
            isCorrect: false,
          },
          {
            label: 'A deeper bond',
            isCorrect: true,
          },
          {
            label: 'Independence',
            isCorrect: false,
          },
        ]}
        feedback="Exactly. By being emotionally present, Dad is building trust and deepening their connection."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
