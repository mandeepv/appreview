import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec3Screen1'>;

export const ServeReturnSec3Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec3Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
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
            Not Just for Kids
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Serve and return isn't limited to early childhood—it's how all meaningful relationships work.
            </Text>

            <View style={styles.examplesCard}>
              <Text style={styles.cardTitle}>Adults serve too:</Text>

              <View style={styles.exampleItem}>
                <Text style={styles.exampleText}>"I'm feeling stressed about work."</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.exampleText}>"Did you see this article?"</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.exampleText}>"I miss spending time together."</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                And adults need returns too.
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
  examplesCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  exampleItem: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 16,
  },
  exampleText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
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
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
