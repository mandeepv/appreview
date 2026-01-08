import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec7Screen2'>;

export const CommunicationMistakesSec7Screen2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('7');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={2}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question={`When someone shares an upsetting experience with you, and you say "that's not such a big deal," how does that usually make the person feel?`}
        options={[
          {
            label: 'They feel calmer and ready to move on',
            isCorrect: false,
          },
          {
            label: 'They feel dismissed and hurt',
            isCorrect: true,
          },
          {
            label: 'They feel relieved to hear the truth',
            isCorrect: false,
          },
          {
            label: 'They feel appreciative of the reality check',
            isCorrect: false,
          },
        ]}
        feedback="Right. Minimizing rarely soothes — it makes people feel unheard."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
