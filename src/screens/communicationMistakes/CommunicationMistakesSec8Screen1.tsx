import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec8Screen1'>;

export const CommunicationMistakesSec8Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec8Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Comparisons don't comfort
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              A teenager tells their mom about being cut from the soccer team.
            </Text>

            <View style={styles.dialogueCard}>
              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Mom:</Text>
                <Text style={styles.dialogue}>
                  "Yeah, but at least you have friends on the team. Some kids don't have any friends at all."
                </Text>
              </View>

              <View style={styles.dialogueItem}>
                <Text style={styles.speaker}>Teenager:</Text>
                <Text style={styles.dialogue}>*goes quiet*</Text>
              </View>
            </View>

            <View style={styles.helperBox}>
              <Text style={styles.helperText}>
                The comparison didn't help. It made them feel worse.
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
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
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
