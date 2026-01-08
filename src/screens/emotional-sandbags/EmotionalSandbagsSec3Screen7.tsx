import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen7'>;

export const EmotionalSandbagsSec3Screen7: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen8');
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={3}
          totalQuestions={4}
          question="Why is it important to put yourself in your partner's shoes before responding?"
          options={[
            { label: 'To better understand their emotions', isCorrect: false },
            { label: 'To avoid minimizing their feelings', isCorrect: false },
            { label: 'To respond with empathy instead of advice', isCorrect: false },
            { label: 'All of the above', isCorrect: true },
          ]}
          feedback="Empathy comes from understanding, not fixing."
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
