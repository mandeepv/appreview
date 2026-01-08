import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec5Screen3'>;

export const ServeReturnSec5Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('5');
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
            You don't need to return every serve
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>👨‍👩‍👧</Text>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                Experts estimate that returning about <Text style={styles.statsHighlight}>70% of serves</Text> is enough to support healthy development.
              </Text>
            </View>

            <View style={styles.mattersCard}>
              <Text style={styles.cardTitle}>What matters most:</Text>

              <View style={styles.matterItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.matterText}>Noticing the serve</Text>
              </View>

              <View style={styles.matterItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.matterText}>Acknowledging it</Text>
              </View>

              <View style={styles.matterItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.matterText}>Returning when you can</Text>
              </View>
            </View>

            <View style={styles.reassuranceBox}>
              <Text style={styles.reassuranceText}>
                Missing some serves is normal — and human.
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
    backgroundColor: '#FFF9E6',
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
  statsBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  statsText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  statsHighlight: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  mattersCard: {
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
  matterItem: {
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
  matterText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  reassuranceBox: {
    backgroundColor: '#E3F2FF',
    borderRadius: BorderRadius.lg,
    padding: 24,
  },
  reassuranceText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
