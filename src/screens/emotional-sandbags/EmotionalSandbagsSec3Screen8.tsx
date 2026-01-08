import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius, Spacing } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec3Screen8'>;

export const EmotionalSandbagsSec3Screen8: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec3Screen9');
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🏷️</Text>
          </View>

          <Text style={styles.headline}>
            Step 4: Help them name their emotions
          </Text>

          <Text style={styles.body}>
            Finally, gently help your loved one label their emotions.
          </Text>

          <Text style={styles.bodyBold}>
            Try to name at least three emotions, and why they might be feeling them.
          </Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>For example:</Text>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>
                "It sounds like you're <Text style={styles.emotionHighlight}>frustrated</Text> because your idea wasn't heard."
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>
                "Maybe you're <Text style={styles.emotionHighlight}>disappointed</Text> after putting so much effort into it."
              </Text>
            </View>
            <View style={styles.exampleItem}>
              <Text style={styles.exampleText}>
                "And maybe a bit <Text style={styles.emotionHighlight}>embarrassed</Text>, too."
              </Text>
            </View>
          </View>

          <Text style={styles.footer}>
            This helps their emotions move out of the sandbags — and out of their system.
          </Text>
        </View>

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
    paddingVertical: Spacing.lg,
  },
  content: {
    gap: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  bodyBold: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  exampleBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  exampleItem: {
    paddingLeft: 8,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  emotionHighlight: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  footer: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
