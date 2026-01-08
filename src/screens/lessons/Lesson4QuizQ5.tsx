import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4QuizQ5'>;

export const Lesson4QuizQ5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson4QuizQ6');
  };

  return (
    <LessonContainer
      currentStep={17}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={5}
          totalQuestions={6}
          question="True or False: Increasing my child's oxytocin levels also increases mine and benefits my long-term well-being."
          options={[
            { label: 'True', isCorrect: true },
            { label: 'False', isCorrect: false },
          ]}
          feedback="Connection is biologically beneficial for both people."
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
