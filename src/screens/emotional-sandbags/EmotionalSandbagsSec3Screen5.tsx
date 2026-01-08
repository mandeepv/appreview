import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen5'>;

export const EmotionalSandbagsSec3Screen5: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={2}
          totalQuestions={4}
          question="Why is showing concern so important?"
          options={[
            { label: 'It tells them they are important to us', isCorrect: false },
            { label: 'It helps them feel emotionally safe', isCorrect: false },
            { label: 'It shows we are paying attention', isCorrect: false },
            { label: 'All of the above', isCorrect: true },
          ]}
          feedback="Showing concern helps our loved ones feel seen, valued, and emotionally supported."
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
