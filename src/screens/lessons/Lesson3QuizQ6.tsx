import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ6'>;

export const Lesson3QuizQ6: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3Complete');
  };

  return (
    <LessonContainer
      currentStep={19}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={6}
          totalQuestions={6}
          question="True or False: Parents can drastically reduce cortisol in their children."
          options={[
            { label: 'True', isCorrect: true },
            { label: 'False', isCorrect: false },
          ]}
          feedback="Cortisol responds strongly to emotional safety and predictability."
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
