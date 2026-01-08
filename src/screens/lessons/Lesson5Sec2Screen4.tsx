import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/lesson5Progress';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec2Screen4'>;

export const Lesson5Sec2Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('2');
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
          <Text style={styles.emoji}>💡</Text>
        </View>

        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>
            "Giving something a name allows us to make sense of it, and helps us manage it in a healthy way."
          </Text>
          <Text style={styles.quoteAuthor}>
            — Dr. Sarah Watamura
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
  quoteBox: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    borderRadius: BorderRadius.lg,
    padding: 24,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
