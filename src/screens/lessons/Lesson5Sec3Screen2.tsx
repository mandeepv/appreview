import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Sec3Screen2'>;

export const Lesson5Sec3Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('Lesson5Sec3Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>⚠️</Text>
        </View>

        <Text style={styles.headline}>Broad Emotions</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningLabel}>TOO BROAD / DON'T USE</Text>
          <View style={styles.emotionsList}>
            <Text style={styles.emotionItem}>Happy</Text>
            <Text style={styles.emotionItem}>Mad</Text>
            <Text style={styles.emotionItem}>Sad</Text>
            <Text style={styles.emotionItem}>Bad</Text>
          </View>
        </View>

        <Text style={styles.body}>
          These emotions are really just symptoms of the more specific emotions below and don't help us really understand what is going on.
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
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginBottom: 24,
  },
  warningLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: '#E65100',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  emotionsList: {
    gap: 12,
  },
  emotionItem: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 12,
  },
});
