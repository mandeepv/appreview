import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1QuizQ1'>;

export const Lesson1QuizQ1: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson1QuizQ2');
  };

  return (
    <LessonContainer
      currentStep={13}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={3}
          question="When a child is emotionally overwhelmed, which part of the brain is least available?"
          options={[
            { label: 'The emotional center', isCorrect: false },
            { label: 'The thinking / reasoning center', isCorrect: true },
            { label: 'The memory center', isCorrect: false },
            { label: 'The language center', isCorrect: false },
          ]}
          feedback="When stress is high, reasoning shuts down — connection comes first."
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
