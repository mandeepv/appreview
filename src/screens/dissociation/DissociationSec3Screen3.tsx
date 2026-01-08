import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec3Screen3'>;

export const DissociationSec3Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec3Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
      totalSteps={9}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageContainer}>
            <Text style={styles.emoji}>🔢</Text>
          </View>

          <Text style={styles.header}>
            2. Count things around you
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.description}>
              Actively observing your environment keeps dissociation from deepening.
            </Text>

            <View style={styles.stepsCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Name 5 things you can see</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Then 5 things of a different color</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Keep switching categories if needed</Text>
              </View>
            </View>

            <View style={styles.whyBox}>
              <Text style={styles.whyLabel}>Why it works</Text>
              <Text style={styles.whyText}>
                Your brain can't "check out" while it's actively noticing details.
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
  },
  contentSection: {
    gap: 20,
  },
  description: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  stepsCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  whyBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
    marginTop: 4,
  },
  whyLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  whyText: {
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
