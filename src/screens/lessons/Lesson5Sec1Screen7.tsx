import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/lesson5Progress';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen7'>;

export const Lesson5Sec1Screen7: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = async () => {
    await markSectionComplete('1');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={7}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={1}
          question="Why is it important to name our emotions?"
          options={[
            { label: 'It lets our logical brain help process them', isCorrect: false },
            { label: 'It helps us hit the brakes and consider how best to respond', isCorrect: false },
            { label: 'It helps us understand what we are feeling', isCorrect: false },
            { label: 'All of the above', isCorrect: true },
          ]}
          feedback="Naming emotions activates our logical brain, helps us pause before reacting, and deepens our self-understanding."
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
