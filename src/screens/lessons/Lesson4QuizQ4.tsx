import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ4'>;

export const Lesson4QuizQ4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4QuizQ5');
  };

  return (
    <LessonContainer
      currentStep={16}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={4}
          totalQuestions={6}
          question="What is the BEST way for a parent to increase their child's oxytocin levels?"
          options={[
            { label: 'Frequently sitting next to the child', isCorrect: false },
            { label: 'Hugging the child', isCorrect: false },
            { label: 'Smiling at the child', isCorrect: false },
            { label: 'Building a deep bond with the child', isCorrect: true },
          ]}
          feedback="Physical touch helps, but deep emotional safety matters most."
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
