import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec2Screen2'>;

export const Lesson5Sec2Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec2Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>🚁</Text>
        </View>

        <Text style={styles.headline}>Helicopter Parent</Text>

        <Text style={styles.bodyQuestion}>
          Have you ever heard of a "helicopter parent"?
        </Text>

        <View style={styles.definitionBox}>
          <Text style={styles.definitionText}>
            The term "helicopter parent" was invented in the 1980s to describe parents who are always "hovering" over their children.
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
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  bodyQuestion: {
    fontSize: 19,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  definitionBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.md,
    padding: 20,
  },
  definitionText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
