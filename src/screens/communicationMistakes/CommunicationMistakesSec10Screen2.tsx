import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec10Screen2'>;

export const CommunicationMistakesSec10Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec10Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question="Why does this response make things worse?"
        options={[
          {
            label: 'It solves the problem too quickly',
            isCorrect: false,
          },
          {
            label: 'It ignores how embarrassing this feels',
            isCorrect: false,
          },
          {
            label: 'It takes control away from the upset person',
            isCorrect: false,
          },
          {
            label: 'All of the above',
            isCorrect: true,
          },
        ]}
        feedback="Correct. The fix might work, but it skips the emotional need, which is to be heard and validated first."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
