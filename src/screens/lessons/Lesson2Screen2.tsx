import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2Screen2'>;

export const Lesson2Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson2Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={16}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Why Happiness Backfires
          </Text>

          <Text style={styles.body}>
            When people try to increase happiness, they usually focus on the wrong chemical.
          </Text>

          <Text style={styles.body}>
            They chase short-term pleasure, novelty, or rewards — believing these will create lasting happiness.
          </Text>

          <Text style={styles.body}>
            But this strategy often leaves people feeling:
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Unsatisfied</Text>
            <Text style={styles.bullet}>• Restless</Text>
            <Text style={styles.bullet}>• Emotionally drained</Text>
          </View>

          <Text style={styles.body}>
            To understand why, we need to look inside the brain.
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
