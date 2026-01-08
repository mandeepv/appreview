import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4Quiz'>;

export const Lesson4Quiz: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson4QuizQ1');
  };

  return (
    <LessonContainer
      currentStep={12}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.icon}>🎯</Text>

          <Text style={styles.headline}>
            Quest Time
          </Text>

          <Text style={styles.body}>
            These questions help reinforce what you've learned across the last three lessons.
          </Text>

          <Text style={styles.bodySecondary}>
            No pressure — just learning.
          </Text>

          <Text style={styles.bodyTertiary}>
            6 quick questions ahead
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Start Quiz →"
            onPress={handleNext}
            variant="gradient"
          />
        </View>
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bodyTertiary: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
