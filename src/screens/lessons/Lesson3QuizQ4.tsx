import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ4'>;

export const Lesson3QuizQ4: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3QuizQ5');
  };

  return (
    <LessonContainer
      currentStep={17}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={4}
          totalQuestions={6}
          question="Cortisol is a minor problem in families where parents are calm and try to be good parents."
          options={[
            { label: 'True', isCorrect: false },
            { label: 'False', isCorrect: true },
          ]}
          feedback="Almost all families have moments that elevate cortisol — awareness is what matters."
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
