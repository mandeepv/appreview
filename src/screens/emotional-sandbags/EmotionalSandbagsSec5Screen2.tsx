import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen2'>;

export const EmotionalSandbagsSec5Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={5}
        question="What should you do first?"
        options={[
          {
            label: 'Walk away — after all, they said "good"',
            isCorrect: false,
          },
          {
            label: 'Ask "what\'s wrong with you?" knowing your day was worse',
            isCorrect: false,
          },
          {
            label: 'Notice: your radar for unhappiness goes off and you notice your partner is upset',
            isCorrect: true,
          },
        ]}
        feedback='Noticing is powerful. It tells your partner: "I see you. You matter."'
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
