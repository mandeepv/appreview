import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2Screen1'>;

export const Lesson2Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Happiness Chemicals
          </Text>

          <Text style={styles.subheadline}>
            Why does trying to make ourselves happy often backfire?
          </Text>

          <Text style={styles.body}>
            Most people assume happiness comes from getting more of what feels good — but research shows that misunderstanding how happiness works can reduce long-term well-being.
          </Text>

          <Text style={styles.body}>
            In this lesson, you'll learn how three key body chemicals shape short-term and long-term happiness.
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next →"
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
    gap: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 42,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
