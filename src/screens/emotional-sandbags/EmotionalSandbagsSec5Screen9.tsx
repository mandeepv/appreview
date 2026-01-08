import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen9'>;

export const EmotionalSandbagsSec5Screen9: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen10');
  };

  return (
    <LessonContainer
      currentStep={9}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={5}
        totalQuestions={5}
        question="What do you do next?"
        options={[
          {
            label: 'Start trying to fix problems',
            isCorrect: false,
          },
          {
            label: 'Tell your partner about your day',
            isCorrect: false,
          },
          {
            label: 'Tell your partner it\'s time to move on',
            isCorrect: false,
          },
          {
            label: 'Help your partner label their feelings: "Are you feeling…?"',
            isCorrect: true,
          },
        ]}
        feedback="Helping your partner label their emotions — while avoiding common traps — builds deep bonds."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
