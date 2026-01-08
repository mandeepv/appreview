import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson4Screen10'>;

export const Lesson4Screen10: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson4Screen11');
  };

  return (
    <LessonContainer
      currentStep={10}
      totalSteps={19}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            It's Never Too Late
          </Text>

          <Text style={styles.body}>
            Just like it's never too late to:
          </Text>

          <View style={styles.analogyBox}>
            <Text style={styles.analogyItem}>Eat healthier</Text>
            <Text style={styles.analogyItem}>Exercise</Text>
          </View>

          <Text style={styles.body}>
            It's never too late to:
          </Text>

          <View style={styles.actionBox}>
            <Text style={styles.actionItem}>Build deeper bonds</Text>
            <Text style={styles.actionItem}>Increase oxytocin</Text>
            <Text style={styles.actionItem}>Improve long-term happiness</Text>
          </View>

          <Text style={styles.bodyEmphasized}>
            Small changes compound.
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
  analogyBox: {
    backgroundColor: Colors.backgroundGray,
    padding: 16,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  analogyItem: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  actionBox: {
    backgroundColor: Colors.successBg,
    padding: 16,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  actionItem: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    lineHeight: 24,
    textAlign: 'center',
  },
  bodyEmphasized: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
