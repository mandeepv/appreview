import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec1Screen4'>;

export const CommunicationMistakesSec1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec1Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={3}
        question="What do you think Dad is most likely to do wrong?"
        options={[
          {
            label: 'Dismiss her feelings',
            isCorrect: false,
          },
          {
            label: 'Jump into problem-solving',
            isCorrect: false,
          },
          {
            label: 'Minimize the situation',
            isCorrect: false,
          },
          {
            label: 'Focus on fixing instead of listening',
            isCorrect: false,
          },
          {
            label: 'All of the above',
            isCorrect: true,
          },
        ]}
        feedback="You're noticing the pattern. In moments like this, the biggest damage usually comes from how we respond — not what we say. We often rush past emotions instead of helping unload them."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
