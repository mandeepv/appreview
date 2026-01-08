import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen3'>;

export const EmotionalSandbagsSec3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={1}
          totalQuestions={4}
          question="True or False: Research shows that most of us are naturally good at noticing when our partner is unhappy."
          options={[
            { label: 'True', isCorrect: false },
            { label: 'False', isCorrect: true },
          ]}
          feedback="Research shows that most of us miss these signals, even when we think we're paying attention. That's why this skill needs to be practiced."
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
