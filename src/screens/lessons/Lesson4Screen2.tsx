import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4Screen2'>;

export const Lesson4Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson4Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            The Chemical With the Biggest Long-Term Impact
          </Text>

          <Text style={styles.bodyEmphasized}>
            Oxytocin has the strongest link to long-term well-being — but only when it's increased in safe relationships.
          </Text>

          <Text style={styles.body}>
            Think of oxytocin like:
          </Text>

          <View style={styles.analogyBox}>
            <Text style={styles.analogyItem}>Eating healthy</Text>
            <Text style={styles.analogyItem}>Exercising</Text>
          </View>

          <Text style={styles.body}>
            You don't feel the effects immediately.{'\n'}
            But over time, it changes everything.
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
  analogyBox: {
    backgroundColor: Colors.primaryBg,
    padding: 20,
    borderRadius: BorderRadius.lg,
    gap: 12,
  },
  analogyItem: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
