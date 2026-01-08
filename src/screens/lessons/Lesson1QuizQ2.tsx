import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1QuizQ2'>;

export const Lesson1QuizQ2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson1QuizQ3');
  };

  return (
    <LessonContainer
      currentStep={14}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={2}
          totalQuestions={3}
          question="According to modern parenting science, the primary goal of discipline is:"
          options={[
            { label: 'Immediate obedience', isCorrect: false },
            { label: 'Preventing future mistakes', isCorrect: false },
            { label: 'Skill-building over time', isCorrect: true },
            { label: 'Maintaining authority', isCorrect: false },
          ]}
          feedback="Discipline is about teaching skills children don't yet have."
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
