import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec8Screen3'>;

export const CommunicationMistakesSec8Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('8');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question='When someone is upset and we remind them that "other people have bigger problems," does that typically make them feel better?'
        options={[
          {
            label: 'Yes, it helps them feel more grateful',
            isCorrect: false,
          },
          {
            label: 'No, it makes them feel guilty or dismissed',
            isCorrect: true,
          },
          {
            label: 'Yes, it gives them perspective',
            isCorrect: false,
          },
          {
            label: 'It depends on the person',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Pain isn't reduced by comparison — it just makes people feel like they shouldn't have felt anything in the first place."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
