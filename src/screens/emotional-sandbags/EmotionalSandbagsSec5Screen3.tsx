import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen3'>;

export const EmotionalSandbagsSec5Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={5}
        question="Next, what should you say to your partner?"
        options={[
          {
            label: '"What\'s wrong with you?"',
            isCorrect: false,
          },
          {
            label: '"What\'s your problem?!?!"',
            isCorrect: false,
          },
          {
            label: '"You look like something\'s up. What\'s going on?"',
            isCorrect: true,
          },
        ]}
        feedback="Warm, neutral phrasing shows concern without judgment."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
