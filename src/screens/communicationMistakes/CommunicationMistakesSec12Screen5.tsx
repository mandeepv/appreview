import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec12Screen5'>;

export const CommunicationMistakesSec12Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec12Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={3}
        totalQuestions={3}
        question="When is it okay to try and cheer someone up?"
        options={[
          {
            label: 'Never',
            isCorrect: false,
          },
          {
            label: 'After you have helped them process their feelings',
            isCorrect: true,
          },
          {
            label: 'As soon as possible',
            isCorrect: false,
          },
        ]}
        feedback="Right. Timing is everything. Connection first, then solutions or positivity."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
