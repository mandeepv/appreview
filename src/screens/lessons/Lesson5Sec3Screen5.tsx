import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen5'>;

export const Lesson5Sec3Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>👨‍👦</Text>
        </View>

        <Text style={styles.headline}>Teen Example</Text>

        <Text style={styles.body}>
          Let's look at another situation.
        </Text>

        <View style={styles.scenarioBox}>
          <Text style={styles.scenarioText}>
            A teen failed his driver's license test.
          </Text>
        </View>

        <Text style={styles.body}>
          On the surface, he just seemed sad.
        </Text>

        <View style={styles.deeperBox}>
          <Text style={styles.deeperLabel}>But underneath, he might feel:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>• Overwhelmed by all the errors pointed out</Text>
            <Text style={styles.bullet}>• Disappointed because he was excited to drive his friends</Text>
            <Text style={styles.bullet}>• Nervous about failing again and admitting it</Text>
          </View>
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
  deeperBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  deeperLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  bulletList: {
    gap: 12,
  },
  bullet: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
