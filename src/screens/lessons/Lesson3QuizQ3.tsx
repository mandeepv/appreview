import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ3'>;

export const Lesson3QuizQ3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3QuizQ4');
  };

  return (
    <LessonContainer
      currentStep={16}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={3}
          totalQuestions={6}
          question="Cortisol is only released during a negative experience (e.g. sarcasm)."
          options={[
            { label: 'True', isCorrect: false },
            { label: 'False', isCorrect: true },
          ]}
          feedback="Cortisol is released whenever a child fears a negative experience might happen again."
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
