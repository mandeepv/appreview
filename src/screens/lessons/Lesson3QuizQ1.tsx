import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3QuizQ1'>;

export const Lesson3QuizQ1: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('Lesson3QuizQ2');
  };

  return (
    <LessonContainer
      currentStep={14}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={6}
          question="Which statement is correct?"
          options={[
            { label: 'Cortisol is always bad so ideally my partner and/or child shouldn\'t have any', isCorrect: false },
            { label: 'Cortisol is harmful when it\'s released due to fear that something emotionally upsetting might happen', isCorrect: true },
          ]}
          feedback="Cortisol becomes damaging when the nervous system stays in a constant state of alert."
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
