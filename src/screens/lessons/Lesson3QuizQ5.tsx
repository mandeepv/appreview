import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ5'>;

export const Lesson3QuizQ5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3QuizQ6');
  };

  return (
    <LessonContainer
      currentStep={18}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={5}
          totalQuestions={6}
          question="Children with consistently high cortisol levels are more likely to…"
          options={[
            { label: 'Abuse drugs/alcohol', isCorrect: false },
            { label: 'Make poor life choices', isCorrect: false },
            { label: 'Have less happy lives', isCorrect: false },
            { label: 'Commit crimes', isCorrect: false },
            { label: 'All of the above', isCorrect: true },
          ]}
          feedback="Research shows high cortisol is linked to all of these outcomes."
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
