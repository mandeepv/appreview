import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen5'>;

export const CommunicationMistakesSec3Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('CommunicationMistakesSec3Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <QuizQuestion
        questionNumber={2}
        totalQuestions={2}
        question='When someone is upset, what usually happens when we try to see "both sides" too soon?'
        options={[
          {
            label: 'They feel understood',
            isCorrect: false,
          },
          {
            label: 'They calm down',
            isCorrect: false,
          },
          {
            label: 'They become defensive',
            isCorrect: true,
          },
          {
            label: 'They appreciate the logic',
            isCorrect: false,
          },
        ]}
        feedback="When emotions are high, attempts at fairness or logic trigger defensiveness. People need to feel emotionally safe before they can hear other perspectives."
        onCorrect={handleCorrect}
      />
    </LessonContainer>
  );
};
