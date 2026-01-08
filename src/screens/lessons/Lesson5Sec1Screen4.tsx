import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen4'>;

export const Lesson5Sec1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec1Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🧑‍⚕️</Text>
        </View>

        <Text style={styles.headline}>What Psychologists Know</Text>

        <View style={styles.attributionBox}>
          <Text style={styles.attributionText}>
            That story was told by Michael Miller on SixSeconds.org.
          </Text>
        </View>

        <Text style={styles.body}>
          It wouldn't surprise any good psychologists, because naming the emotions of their clients is one of the most common practices in therapy.
        </Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            Why is it important to label our feelings?
          </Text>
          <Text style={styles.questionText}>
            How does it actually help?
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Next →"
          onPress={handleNext}
          variant="gradient"
        />
      </View>
    </LessonContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 48,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  attributionBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.sm,
    padding: 12,
    marginBottom: 24,
  },
  attributionText: {
    fontSize: 14,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  questionBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: 20,
    gap: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
