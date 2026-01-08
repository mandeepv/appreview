import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec1Screen6'>;

export const Lesson5Sec1Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec1Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🔬</Text>
        </View>

        <Text style={styles.headline}>Research Proof</Text>

        <Text style={styles.body}>
          By giving the emotion a name, the logical brain can step in and calm the other parts down.
        </Text>

        <View style={styles.researchBox}>
          <Text style={styles.researchLabel}>UCLA BRAIN MAPPING CENTER</Text>
          <Text style={styles.researchText}>
            They have special machines that can literally watch how our brain calms down when naming emotions.
          </Text>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "In the same way you hit the brake when you see a yellow light, when you put feelings into words you seem to be hitting the brakes on your emotional responses."
          </Text>
          <Text style={styles.quoteAuthor}>
            — Matthew Lieberman, UCLA
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
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    marginBottom: 24,
  },
  researchBox: {
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 24,
  },
  researchLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#1976D2',
    letterSpacing: 1,
    marginBottom: 8,
  },
  researchText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  quoteBox: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    borderRadius: BorderRadius.md,
    padding: 20,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
