import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec3Screen3'>;

export const ServeReturnSec3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec3Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={5}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            The Real Goal
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Connection isn't built by being perfect. It's built by being responsive.
            </Text>

            <Text style={styles.bodyText}>
              The more often someone's emotional cues are noticed and acknowledged, the stronger the relationship becomes.
            </Text>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                "Responsiveness is the foundation of trust."
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
  quoteBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 32,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: 8,
  },
  quoteText: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
