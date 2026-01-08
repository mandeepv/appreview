import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec1Screen4'>;

export const DissociationSec1Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec1Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headline}>
            A simple example
          </Text>

          <View style={styles.scenarioCard}>
            <Text style={styles.scenarioLabel}>Imagine this:</Text>
            <Text style={styles.scenarioText}>
              Your child can only attend one school.{'\n'}
              Someone says to you:
            </Text>
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                "I've heard that school isn't as good as it used to be."
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.comparisonSection}>
            <View style={styles.optionCard}>
              <Text style={styles.optionLabel}>Option A — No dissociation</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionQuote}>
                  "Maybe I should talk to the principal."
                </Text>
                <Text style={styles.optionQuote}>
                  "Let me see if there's a solution."
                </Text>
              </View>
            </View>

            <View style={[styles.optionCard, styles.optionCardAlt]}>
              <Text style={styles.optionLabel}>Option B — Dissociation</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionQuote}>
                  "There's nothing we can do."
                </Text>
                <Text style={styles.optionQuote}>
                  "I don't want to think about this."
                </Text>
                <Text style={[styles.optionQuote, styles.mindBlank]}>
                  (Mind goes blank)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.insightBox}>
            <Text style={styles.insightLabel}>Key insight</Text>
            <Text style={styles.insightText}>
              Dissociation happens when your brain decides
              there is no solution, so it shuts the problem down.
            </Text>
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
    gap: 24,
    paddingBottom: 20,
  },
  headline: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scenarioCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
  },
  scenarioLabel: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  scenarioText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  quoteBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.md,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  divider: {
    height: 2,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  comparisonSection: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  optionCardAlt: {
    backgroundColor: '#FFF4E6',
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  optionContent: {
    gap: 8,
  },
  optionQuote: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  mindBlank: {
    color: Colors.textTertiary,
    marginTop: 4,
  },
  insightBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 12,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  insightText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
