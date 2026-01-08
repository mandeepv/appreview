import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ1'>;

export const Lesson4QuizQ1: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4QuizQ2');
  };

  return (
    <LessonContainer
      currentStep={13}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={6}
          question="To increase my child's long-term well-being, I should optimize body chemicals like this:"
          options={[
            { label: 'Increase cortisol, decrease oxytocin, and increase dopamine', isCorrect: false },
            { label: 'Decrease cortisol, decrease oxytocin, and increase dopamine', isCorrect: false },
            { label: 'Decrease cortisol, and increase oxytocin in safe relationships', isCorrect: true },
          ]}
          feedback="Long-term well-being depends more on safety and connection than pleasure."
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
