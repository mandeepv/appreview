import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen4'>;

export const Lesson5Sec3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🔍</Text>
        </View>

        <Text style={styles.headline}>Deeper Emotions</Text>

        <Text style={styles.body}>
          The parent might actually be feeling:
        </Text>

        <View style={styles.emotionsBox}>
          <View style={styles.emotionItem}>
            <Text style={styles.emotionLabel}>FRUSTRATION</Text>
            <Text style={styles.emotionDescription}>
              that the child would lie when she has been taught that lying is wrong
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.emotionItem}>
            <Text style={styles.emotionLabel}>WORRY</Text>
            <Text style={styles.emotionDescription}>
              that this may be an indication that she isn't a good enough mom
            </Text>
          </View>
        </View>

        <View style={styles.conclusionBox}>
          <Text style={styles.conclusionText}>
            The specific emotions of frustration and worry came out as the surface emotion of anger.
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
  emotionsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 20,
  },
  emotionItem: {
    gap: 8,
  },
  emotionLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  emotionDescription: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  conclusionBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  conclusionText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
