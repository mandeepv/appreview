import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestionMultiSelect } from '../../components/QuizQuestionMultiSelect';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ2'>;

export const Lesson3QuizQ2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3QuizQ3');
  };

  return (
    <LessonContainer
      currentStep={15}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestionMultiSelect
          questionNumber={2}
          totalQuestions={6}
          question="Which are common things parents do that release cortisol in their children?"
          options={[
            { label: 'Let child have too much screen time', isCorrect: false },
            { label: 'Sarcasm', isCorrect: true },
            { label: 'Criticism', isCorrect: true },
            { label: 'Not giving child enough vegetables', isCorrect: false },
            { label: 'Fighting with other family members', isCorrect: true },
          ]}
          feedback="Cortisol is triggered by emotional threat and unpredictability — not nutrition choices."
          onCorrect={handleCorrect}
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
