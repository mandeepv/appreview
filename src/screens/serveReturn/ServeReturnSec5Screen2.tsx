import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec5Screen2'>;

export const ServeReturnSec5Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec5Screen3');
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
            Serve & return builds the brain
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>🧠</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Each serve-and-return interaction strengthens neural connections.
            </Text>

            <View style={styles.skillsCard}>
              <Text style={styles.cardTitle}>Over time, this builds:</Text>

              <View style={styles.skillItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.skillText}>Language skills</Text>
              </View>

              <View style={styles.skillItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.skillText}>Emotional intelligence</Text>
              </View>

              <View style={styles.skillItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.skillText}>Social understanding</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                These connections are built through repetition, not perfection.
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
    lineHeight: 34,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.lg,
    padding: 40,
    marginBottom: 32,
  },
  imageEmoji: {
    fontSize: 80,
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
  skillsCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    marginRight: 12,
    marginTop: 2,
  },
  skillText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
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
