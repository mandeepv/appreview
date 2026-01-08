import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { QuizQuestion } from '../../components/QuizQuestion';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen9'>;

export const EmotionalSandbagsSec3Screen9: React.FC<Props> = ({ navigation }) => {
  const handleCorrect = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen10');
  };

  return (
    <LessonContainer
      currentStep={9}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <QuizQuestion
          questionNumber={4}
          totalQuestions={4}
          question="When helping someone unload emotional sandbags, what is your main responsibility?"
          options={[
            { label: 'Fix the situation', isCorrect: false },
            { label: 'Make them feel better quickly', isCorrect: false },
            { label: 'Give advice', isCorrect: false },
            { label: 'Help them process and release emotions', isCorrect: true },
          ]}
          feedback="Your role is not to fix — it's to help them process."
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
