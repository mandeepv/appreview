import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestionMultiSelect } from '../../components/QuizQuestionMultiSelect';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ2'>;

export const Lesson4QuizQ2: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4QuizQ3');
  };

  return (
    <LessonContainer
      currentStep={14}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestionMultiSelect
          questionNumber={2}
          totalQuestions={6}
          question="Select the dopamine activities below:"
          options={[
            { label: 'Buying a new shirt', isCorrect: true },
            { label: 'Viewing social media', isCorrect: true },
            { label: 'Eating favorite food', isCorrect: true },
            { label: 'Giving a hug', isCorrect: false },
          ]}
          feedback="Dopamine is about reward and novelty, not bonding."
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
