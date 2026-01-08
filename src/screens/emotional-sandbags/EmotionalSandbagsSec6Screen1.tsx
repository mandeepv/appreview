import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen1'>;

export const EmotionalSandbagsSec6Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec6Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.header}>
            Let's recap
          </Text>

          <View style={styles.textContainer}>
            <Text style={styles.paragraph}>
              In this lesson, you learned what emotional sandbags are — the heavy emotions our loved ones carry throughout the day.
            </Text>

            <Text style={styles.paragraph}>
              You also learned that most of us can't unload them alone.
            </Text>

            <Text style={styles.paragraph}>
              We need someone we trust to help us.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

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
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  textContainer: {
    gap: 24,
    paddingHorizontal: 8,
  },
  paragraph: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
