import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec6Screen2'>;

export const ServeReturnSec6Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec6Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
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
            When you can't return right now
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              If you're busy, a return can still sound like:
            </Text>

            <View style={styles.scriptCard}>
              <View style={styles.scriptItem}>
                <Text style={styles.scriptQuote}>"I hear you."</Text>
              </View>

              <View style={styles.scriptItem}>
                <Text style={styles.scriptQuote}>"I can't help right now, but I see you."</Text>
              </View>

              <View style={styles.scriptItem}>
                <Text style={styles.scriptQuote}>"Let's talk in a few minutes."</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Even this kind of response maintains the connection.
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
  scriptCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 20,
  },
  scriptItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  scriptQuote: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
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
