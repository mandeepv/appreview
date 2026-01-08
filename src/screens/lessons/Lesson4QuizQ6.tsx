import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestionMultiSelect } from '../../components/QuizQuestionMultiSelect';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ6'>;

export const Lesson4QuizQ6: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4Complete');
  };

  return (
    <LessonContainer
      currentStep={18}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestionMultiSelect
          questionNumber={6}
          totalQuestions={6}
          question="Select all the oxytocin-increasing activities below:"
          options={[
            { label: 'Giving a hug', isCorrect: true },
            { label: 'Sitting close with arms or legs touching', isCorrect: true },
            { label: 'Patting your child on the shoulder in passing', isCorrect: true },
            { label: 'Ice cream', isCorrect: false },
            { label: 'Video games', isCorrect: false },
          ]}
          feedback="Physical connection and closeness increase oxytocin, while treats increase dopamine."
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
