import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec2Screen5'>;

export const CommunicationMistakesSec2Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec2Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={2}
        question="What did Dad do wrong here?"
        options={[
          {
            label: 'He tried to be honest',
            isCorrect: false,
          },
          {
            label: 'He helped her see the other side',
            isCorrect: false,
          },
          {
            label: 'He sided against her while she was upset',
            isCorrect: true,
          },
          {
            label: 'He encouraged accountability',
            isCorrect: false,
          },
        ]}
        feedback="When someone is emotionally overwhelmed, trying to explain the other person's perspective feels like betrayal—even if it's accurate."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
