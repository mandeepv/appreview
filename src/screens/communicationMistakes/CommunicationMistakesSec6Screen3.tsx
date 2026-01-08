import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec6Screen3'>;

export const CommunicationMistakesSec6Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('6');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={1}
        totalQuestions={1}
        question={`When someone is told they're "overreacting," what usually happens?`}
        options={[
          {
            label: 'They calm down quickly',
            isCorrect: false,
          },
          {
            label: 'They feel understood',
            isCorrect: false,
          },
          {
            label: 'They feel invalidated and become more defensive',
            isCorrect: true,
          },
          {
            label: 'They appreciate the honesty',
            isCorrect: false,
          },
        ]}
        feedback="Correct. Being told you're overreacting rarely calms anyone down — it usually intensifies defensiveness and makes the situation worse."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
