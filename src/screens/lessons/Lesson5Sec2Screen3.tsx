import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec2Screen3'>;

export const Lesson5Sec2Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson5Sec2Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={1}
          question="After the term 'helicopter parent' was invented, what do you think happened to instances of helicopter parenting?"
          options={[
            { label: 'It went up', isCorrect: false },
            { label: 'It stayed the same', isCorrect: false },
            { label: 'It went down', isCorrect: true },
          ]}
          feedback="When we name a behavior, we become more aware of it and can better recognize and avoid it."
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
