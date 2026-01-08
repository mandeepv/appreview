import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec4Screen3'>;

export const Lesson5Sec4Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec4Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🎻</Text>
        </View>

        <Text style={styles.headline}>Like Learning an Instrument</Text>

        <View style={styles.analogyBox}>
          <Text style={styles.analogyText}>
            Like learning an instrument, you will only improve if you practice.
          </Text>
        </View>

        <Text style={styles.body}>
          Imagine someone who wanted to learn the violin but only watched a few YouTube videos.
        </Text>

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>
            Do you think they would be any good?
          </Text>
        </View>

        <Text style={styles.answerText}>
          Of course not.
        </Text>
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
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  analogyBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: 20,
    marginBottom: 24,
  },
  analogyText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 27,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 20,
  },
  questionBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    lineHeight: 26,
    textAlign: 'center',
  },
  answerText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
