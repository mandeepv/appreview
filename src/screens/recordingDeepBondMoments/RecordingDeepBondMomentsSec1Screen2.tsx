import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen2'>;

export const RecordingDeepBondMomentsSec1Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('RecordingDeepBondMomentsSec1Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
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
            Why memories need reminders
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>🧠</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Most people forget large parts of their childhood.{'\n'}
              What fills in the gaps are photos, videos, and stories.
            </Text>

            <View style={styles.warningCard}>
              <Text style={styles.cardTitle}>If those reminders mostly show:</Text>

              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Sad expressions</Text>
              </View>

              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Distant group shots</Text>
              </View>

              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Activities without emotional connection</Text>
              </View>
            </View>

            <Text style={styles.bodyText}>
              Our brain may assume those moments were typical —{'\n'}
              even when they weren't.
            </Text>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                That's why what we record matters as much as that we record.
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
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  warningCard: {
    backgroundColor: '#FFF9E6',
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
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: '#D97706',
    marginRight: 12,
    marginTop: 2,
  },
  listText: {
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
