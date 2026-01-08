import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Screen8'>;

export const Lesson3Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson3Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={20}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Why Cortisol Is Like Smoking
          </Text>

          <View style={styles.metaphorBox}>
            <Text style={styles.metaphorText}>
              High cortisol is like smoking.
            </Text>
          </View>

          <Text style={styles.body}>
            One exposure doesn't hurt.{'\n'}
            Neither does a week.{'\n'}
            Sometimes not even months.
          </Text>

          <Text style={styles.body}>
            But over time, it significantly damages:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Emotional regulation</Text>
            <Text style={styles.bullet}>• Mental health</Text>
            <Text style={styles.bullet}>• Decision-making</Text>
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
  metaphorBox: {
    backgroundColor: Colors.primaryBg,
    padding: 20,
    borderRadius: BorderRadius.lg,
  },
  metaphorText: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 30,
    textAlign: 'center',
    fontStyle: 'italic',
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
  buttonContainer: {
    paddingBottom: 20,
  },
});
