import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1QuizQ3'>;

export const Lesson1QuizQ3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson1Complete');
  };

  return (
    <LessonContainer
      currentStep={15}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={3}
          totalQuestions={3}
          question="A child throws a tantrum because playtime ended. Which response best fits modern parenting principles?"
          options={[
            { label: 'Punish the behavior immediately', isCorrect: false },
            { label: 'Ignore the child completely', isCorrect: false },
            { label: 'Acknowledge feelings while holding the boundary', isCorrect: true },
            { label: 'Give in to stop the tantrum', isCorrect: false },
          ]}
          feedback="Acknowledging feelings while maintaining boundaries helps children learn emotional regulation."
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
