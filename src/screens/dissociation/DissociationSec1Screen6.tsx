import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen6'>;

export const DissociationSec1Screen6: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('DissociationSec1Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question="True or False: Dissociation happens frequently and we are usually unaware that it occurred."
        options={[
          {
            label: 'True',
            isCorrect: true,
          },
          {
            label: 'False',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Most dissociation happens below awareness, which is why it can quietly affect communication."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
