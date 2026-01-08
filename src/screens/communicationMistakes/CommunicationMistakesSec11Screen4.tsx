import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec11Screen4'>;

export const CommunicationMistakesSec11Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('11');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={3}
        totalQuestions={3}
        question="What would help most in this moment?"
        options={[
          {
            label: 'Offering another idea',
            isCorrect: false,
          },
          {
            label: `Explaining why it's not a big deal`,
            isCorrect: false,
          },
          {
            label: `Reassuring her it'll be okay`,
            isCorrect: false,
          },
          {
            label: 'Acknowledging how painful it feels to be left out',
            isCorrect: true,
          },
        ]}
        feedback={`Right. Validation first. Solutions later — if needed at all.`}
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
