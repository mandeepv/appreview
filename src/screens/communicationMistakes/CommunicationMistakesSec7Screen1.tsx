import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec7Screen1'>;

export const CommunicationMistakesSec7Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec7Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={2}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Good intentions, bad outcome
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.dialogueCard}>
              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Dad:</Text>
                <Text style={styles.dialogue}>"I think missing the sleepover isn't that big of a deal."</Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Daughter:</Text>
                <Text style={styles.dialogue}>"Okay… that doesn't help anything."</Text>
              </View>
            </View>

            <View style={styles.helperBox}>
              <Text style={styles.helperText}>
                Even when the words are calm, the message can still hurt.
              </Text>
            </View>
          </View>
        </ScrollView>

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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 34,
  },
  contentSection: {
    gap: 24,
  },
  dialogueCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  dialogueItem: {
    gap: 6,
  },
  speaker: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  dialogue: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  helperBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  helperText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
