import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/lesson5Progress';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen8'>;

export const Lesson5Sec3Screen8: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('3');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={1}
          question="True or False: We should try to use words like 'happy,' 'mad,' 'sad,' and 'bad' when labeling emotions."
          options={[
            { label: 'True', isCorrect: false },
            { label: 'False', isCorrect: true },
          ]}
          feedback="These broad words don't help us understand the specific emotions underneath. Use more precise emotion words instead."
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
