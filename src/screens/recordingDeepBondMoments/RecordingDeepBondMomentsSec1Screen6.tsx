import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/recordingDeepBondMomentsProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen6'>;

export const RecordingDeepBondMomentsSec1Screen6: React.FC<Props> = ({ navigation }) => {
  const handleFinish = async () => {
    await markSectionComplete('1');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Your takeaway
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Look for moments of real connection:
            </Text>

            <View style={styles.actionsCard}>
              <View style={styles.actionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.actionText}>Capture them if you can</Text>
              </View>

              <View style={styles.actionItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.actionText}>Tell stories about them if you can't</Text>
              </View>
            </View>

            <View style={styles.purposeBox}>
              <Text style={styles.purposeText}>
                Photos, videos, and stories all serve the same goal:
              </Text>
              <Text style={styles.purposeHighlight}>
                reminding your child of the deep bonds they grew up with.
              </Text>
            </View>

            <View style={styles.transitionBox}>
              <Text style={styles.transitionText}>
                You'll carry this idea into future lessons.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Finish lesson"
            onPress={handleFinish}
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
  actionsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 24,
    color: '#2E7D32',
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  purposeBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: 8,
  },
  purposeText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  purposeHighlight: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  transitionBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  transitionText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
