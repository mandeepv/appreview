import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen2'>;

export const CommunicationMistakesSec5Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec5Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={3}
        question={'When someone tells you,\n\n"It\'s not that big of a deal"\n\nHow does it usually feel?'}
        options={[
          {
            label: 'I feel understood',
            isCorrect: false,
          },
          {
            label: 'I feel calmer immediately',
            isCorrect: false,
          },
          {
            label: 'I feel like I need to explain myself more',
            isCorrect: false,
          },
          {
            label: 'I feel dismissed or unheard',
            isCorrect: true,
          },
        ]}
        feedback="Exactly. When someone minimizes our feelings, it rarely brings comfort — it usually creates distance."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
