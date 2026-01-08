import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/lesson5Progress';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec4Screen4'>;

export const Lesson5Sec4Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('4');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>✨</Text>
        </View>

        <Text style={styles.headline}>The Truth About Skills</Text>

        <View style={styles.keyBox}>
          <Text style={styles.keyText}>
            Certain skills need real practice or no progress is made.
          </Text>
        </View>

        <View style={styles.conclusionBox}>
          <Text style={styles.conclusionText}>
            Emotion labeling is one of them.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue →"
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
    justifyContent: 'center',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 56,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 32,
    textAlign: 'center',
  },
  keyBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    marginBottom: 20,
  },
  keyText: {
    fontSize: 19,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  conclusionBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    borderRadius: BorderRadius.lg,
    padding: 24,
  },
  conclusionText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
