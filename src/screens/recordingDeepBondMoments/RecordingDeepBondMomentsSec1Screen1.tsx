import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'RecordingDeepBondMomentsSec1Screen1'>;

export const RecordingDeepBondMomentsSec1Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('RecordingDeepBondMomentsSec1Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
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
            What do old family photos get wrong?
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>📷</Text>
          </View>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              This is an early 20th-century family photo.
            </Text>

            <Text style={styles.bodyText}>
              Most people notice one thing immediately:{'\n'}
              <Text style={styles.bodyTextBold}>No one is smiling.</Text>
            </Text>

            <View style={styles.assumptionCard}>
              <Text style={styles.cardText}>
                When we see photos like this, we often assume:{'\n'}
                "Maybe they weren't happy."
              </Text>
            </View>

            <Text style={styles.bodyText}>
              But that assumption can be misleading.
            </Text>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Photos don't just capture moments —{'\n'}
                they shape how we remember our childhood.
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
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  bodyTextBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  assumptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.textTertiary,
  },
  cardText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
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
