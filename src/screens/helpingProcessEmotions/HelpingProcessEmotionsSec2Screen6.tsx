import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'HelpingProcessEmotionsSec2Screen6'>;

export const HelpingProcessEmotionsSec2Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('HelpingProcessEmotionsSec2Screen7');
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            You Can't Skip the Feeling Part
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              People don't need solutions when they're overwhelmed.{'\n'}
              They need:
            </Text>

            <View style={styles.needsCard}>
              <View style={styles.needItem}>
                <Text style={styles.needText}>To feel heard</Text>
              </View>
              <View style={styles.needItem}>
                <Text style={styles.needText}>To feel understood</Text>
              </View>
              <View style={styles.needItem}>
                <Text style={styles.needText}>To feel safe</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Once emotions are processed, problem-solving becomes much easier.
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
  needsCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  needItem: {
    alignItems: 'center',
  },
  needText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 24,
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
