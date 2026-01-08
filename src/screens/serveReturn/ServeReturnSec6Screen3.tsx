import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec6Screen3'>;

export const ServeReturnSec6Screen3: React.FC<Props> = ({ navigation }) => {
  const handleContinue = async () => {
    await markSectionComplete('6');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={3}
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
            This week's practice
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.checklistCard}>
              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>Notice serves</Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>Return when possible</Text>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checkmark}>✓</Text>
                <Text style={styles.checklistText}>Acknowledge when you can't</Text>
              </View>
            </View>

            <View style={styles.closingBox}>
              <Text style={styles.closingText}>
                Serve & return is not a technique.{'\n'}
                It's a relationship rhythm.
              </Text>
            </View>

            <View style={styles.transitionBox}>
              <Text style={styles.transitionText}>
                We'll build on this in the next lesson.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="Continue"
            onPress={handleContinue}
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
  checklistCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 24,
    color: '#2E7D32',
    marginRight: 16,
  },
  checklistText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  closingBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 32,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  closingText: {
    fontSize: 19,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 30,
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
