import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec10Screen3'>;

export const CommunicationMistakesSec10Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('10');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question={`When someone is upset, offering a "fix" usually makes them feel:`}
        options={[
          {
            label: 'Relieved',
            isCorrect: false,
          },
          {
            label: 'Grateful',
            isCorrect: false,
          },
          {
            label: 'More understood',
            isCorrect: false,
          },
          {
            label: 'Less in control and less understood',
            isCorrect: true,
          },
        ]}
        feedback="Right. Fixing skips connection — and connection is what people need first."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
