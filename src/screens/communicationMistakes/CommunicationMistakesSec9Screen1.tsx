import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec9Screen1'>;

export const CommunicationMistakesSec9Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('9');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={1}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            When help misses the point
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Sometimes we try to help by moving forward too quickly.{'\n\n'}
              We offer fixes, alternatives, or "better ideas" —{'\n'}
              without first acknowledging how the other person feels.
            </Text>

            <Text style={styles.bodyText}>
              When this happens, the person may feel:
            </Text>

            <View style={styles.feelingsCard}>
              <Text style={styles.feelingText}>Unheard</Text>
              <Text style={styles.feelingText}>Dismissed</Text>
              <Text style={styles.feelingText}>Like their feelings don't matter</Text>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Before solutions, people usually want connection.
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
  feelingsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  feelingText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  insightText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
