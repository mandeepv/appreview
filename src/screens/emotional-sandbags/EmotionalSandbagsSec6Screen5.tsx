import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen5'>;

export const EmotionalSandbagsSec6Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec6Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤔</Text>
          </View>

          <Text style={styles.header}>
            Take a moment to notice
          </Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.introText}>
              In your own life:
            </Text>

            <View style={styles.reflectionBox}>
              <Text style={styles.questionText}>
                How long does it take you to unload emotional sandbags?
              </Text>
              <Text style={styles.questionText}>
                How long does it take your loved ones?
              </Text>
            </View>

            <Text style={styles.noteText}>
              There's no right answer — just awareness.
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
    gap: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 4,
  },
  icon: {
    fontSize: 56,
  },
  header: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  bodyContainer: {
    gap: 20,
    width: '100%',
  },
  introText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  reflectionBox: {
    backgroundColor: '#F3E5F5',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: '#6A1B9A',
    lineHeight: 26,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
