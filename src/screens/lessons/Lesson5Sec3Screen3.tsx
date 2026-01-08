import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen3'>;

export const Lesson5Sec3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>👩‍👧</Text>
        </View>

        <Text style={styles.headline}>Parent Example</Text>

        <Text style={styles.body}>
          Here's an example.
        </Text>

        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioText}>
            A child just told her mother a lie.
          </Text>
        </View>

        <Text style={styles.body}>
          On the surface, the mom might feel angry.{'\n'}
          She might start yelling or giving out a punishment.
        </Text>

        <View style={styles.insightBox}>
          <Text style={styles.insightText}>
            But the anger is just a symptom of deeper emotions.
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
    marginBottom: 20,
  },
  scenarioBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: 16,
    marginBottom: 20,
  },
  scenarioText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textAlign: 'center',
  },
  insightBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
