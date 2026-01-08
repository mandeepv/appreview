import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen3'>;

export const CommunicationMistakesSec3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec3Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question="How do you think this made the daughter feel?"
        options={[
          {
            label: 'Like her feelings don\'t matter',
            isCorrect: false,
          },
          {
            label: 'Like her dad is defending the other girl',
            isCorrect: false,
          },
          {
            label: 'Like she is being blamed',
            isCorrect: false,
          },
          {
            label: 'All of the above',
            isCorrect: true,
          },
        ]}
        feedback="All of these feelings are valid. When someone is upset, trying to understand 'the other side' too early can trigger all of these emotional responses at once."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
