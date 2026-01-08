import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Screen11'>;

export const Lesson3Screen11: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson3Screen12');
  };

  return (
    <LessonContainer
      currentStep={11}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Cortisol Can Be Reduced
          </Text>

          <Text style={styles.body}>
            Research shows that when parents:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Learn to spot cortisol triggers</Text>
            <Text style={styles.bullet}>• Reduce emotional unpredictability</Text>
          </View>

          <Text style={styles.body}>
            Children's cortisol levels can drop — and some negative effects can even be reversed.
          </Text>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              You don't need to be perfect.{'\n'}
              You need to be predictably safe.
            </Text>
          </View>
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
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  bulletList: {
    gap: 12,
    paddingHorizontal: 12,
  },
  bullet: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'left',
  },
  highlightBox: {
    backgroundColor: Colors.successBg,
    padding: 20,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  highlightText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
