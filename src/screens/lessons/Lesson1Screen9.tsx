import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Screen9'>;

export const Lesson1Screen9: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson1Screen10');
  };

  return (
    <LessonContainer
      currentStep={9}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            What This Looks Like in Real Life
          </Text>

          <Text style={styles.body}>
            When a child has a meltdown:
          </Text>

          <View style={styles.comparisonBox}>
            <Text style={styles.comparisonLabel}>Old approach:</Text>
            <Text style={styles.comparisonText}>
              "Stop crying or you'll be punished."
            </Text>
          </View>

          <View style={styles.comparisonBox}>
            <Text style={styles.comparisonLabelNew}>Modern approach:</Text>
            <Text style={styles.comparisonTextNew}>
              "I see you're overwhelmed. I'm here. We'll handle this together."
            </Text>
          </View>

          <Text style={styles.bodyEmphasized}>
            This doesn't remove limits — it changes the path to learning.
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
  bodyEmphasized: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  comparisonBox: {
    backgroundColor: Colors.backgroundGray,
    borderRadius: BorderRadius.lg,
    padding: 18,
    borderLeftWidth: 3,
    borderLeftColor: Colors.textMuted,
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  comparisonLabelNew: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  comparisonTextNew: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
