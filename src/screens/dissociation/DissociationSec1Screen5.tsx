import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen5'>;

export const DissociationSec1Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('DissociationSec1Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question="What is dissociation?"
        options={[
          {
            label: 'When you decide not to associate with a group',
            isCorrect: false,
          },
          {
            label: 'What happens when someone says something that overwhelms you',
            isCorrect: true,
          },
          {
            label: 'The breaking down of memories inside your brain',
            isCorrect: false,
          },
        ]}
        feedback="Exactly. Dissociation is a mental shutdown, not a choice."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
