import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestionMultiSelect } from '../../components/QuizQuestionMultiSelect';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ3'>;

export const Lesson4QuizQ3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4QuizQ4');
  };

  return (
    <LessonContainer
      currentStep={15}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestionMultiSelect
          questionNumber={3}
          totalQuestions={6}
          question="Which activities trigger harmful cortisol?"
          options={[
            { label: 'Sarcasm / criticism', isCorrect: true },
            { label: 'Teasing', isCorrect: true },
            { label: 'Frequent angry outbursts at family members', isCorrect: true },
            { label: 'Calmly asking a child to do homework', isCorrect: false },
          ]}
          feedback="Cortisol comes from emotional threat and unpredictability."
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
