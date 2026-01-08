import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'DissociationSec2Screen4'>;

export const DissociationSec2Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('DissociationSec2Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
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
            The solution is simpler than it sounds
          </Text>

          <View style={styles.contentSection}>
            <View style={styles.goodNewsBox}>
              <Text style={styles.goodNewsLabel}>The good news is this:</Text>
              <Text style={styles.goodNewsText}>
                You don't need to solve the problem immediately.
              </Text>
            </View>

            <Text style={styles.bodyText}>
              Simply noticing dissociation when it happens{'\n'}
              and giving it a name already reduces its power.
            </Text>

            <Text style={styles.subheading}>
              You might say to yourself:
            </Text>

            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                "I'm dissociating right now.{'\n'}
                I'm overwhelmed and feel stuck.{'\n'}
                I'll come back to this tomorrow{'\n'}
                when I can think clearly."
              </Text>
            </View>

            <View style={styles.insightCard}>
              <View style={styles.insightRow}>
                <Text style={styles.insightText}>
                  Naming it creates space.
                </Text>
              </View>

              <View style={styles.insightRow}>
                <Text style={styles.insightText}>
                  Space creates options.
                </Text>
              </View>
            </View>

            <View style={styles.closingBox}>
              <Text style={styles.closingText}>
                That's how we see more solutions{'\n'}
                and make better choices —{'\n'}
                for ourselves and our loved ones.
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
    marginBottom: 24,
  },
  contentSection: {
    gap: 20,
  },
  goodNewsBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 12,
  },
  goodNewsLabel: {
    fontSize: 15,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    textAlign: 'center',
  },
  goodNewsText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  quoteBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  quoteText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
  },
  insightRow: {
    alignItems: 'center',
  },
  insightText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  closingBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    marginTop: 8,
  },
  closingText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
