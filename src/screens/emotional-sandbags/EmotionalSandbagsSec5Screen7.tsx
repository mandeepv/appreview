import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen7'>;

export const EmotionalSandbagsSec5Screen7: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={4}
        totalQuestions={5}
        question="What are three feelings your partner might be feeling?"
        options={[
          {
            label: 'Overwhelmed, Stressed, Worried',
            isCorrect: true,
          },
          {
            label: 'Guilty, Embarrassed, Small',
            isCorrect: false,
          },
          {
            label: 'Jealous, Betrayed, Confused',
            isCorrect: false,
          },
        ]}
        feedback="These emotions match the situation without exaggerating or mislabeling."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
