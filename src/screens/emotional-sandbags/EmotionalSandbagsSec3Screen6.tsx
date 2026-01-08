import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen6'>;

export const EmotionalSandbagsSec3Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👟</Text>
          </View>

          <Text style={styles.headline}>
            Step 3: Put yourself in their shoes
          </Text>

          <Text style={styles.body}>
            To really help someone unload their emotional sandbags, we need to feel what they might be feeling.
          </Text>

          <Text style={styles.bodyBold}>
            Imagine their situation.
          </Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>For example:</Text>
            <Text style={styles.exampleText}>
              Your partner shares an idea at work — something they were excited about — and a colleague quickly dismisses it.
            </Text>
          </View>

          <Text style={styles.body}>
            Pause and ask yourself:
          </Text>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>How would you feel?</Text>
            <Text style={styles.emotionOption}>Embarrassed?</Text>
            <Text style={styles.emotionOption}>Disappointed?</Text>
            <Text style={styles.emotionOption}>Frustrated?</Text>
          </View>

          <Text style={styles.footer}>
            It's okay if this takes a few minutes.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Next"
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
    paddingVertical: Spacing.lg,
  },
  content: {
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  bodyBold: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  exampleBox: {
    backgroundColor: '#FFF4E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 8,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  questionBox: {
    gap: 12,
    paddingLeft: 16,
  },
  questionText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emotionOption: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    lineHeight: 26,
  },
  footer: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
