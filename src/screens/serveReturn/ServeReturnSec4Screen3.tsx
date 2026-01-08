import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/serveReturnProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec4Screen3'>;

export const ServeReturnSec4Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('4');
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
            When serve & return breaks
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>📱</Text>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.warningCard}>
              <Text style={styles.cardTitle}>Serve & return breaks when:</Text>

              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>The serve is ignored</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>The response is delayed without acknowledgment</Text>
              </View>

              <View style={styles.exampleItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.exampleText}>The interaction feels dismissive</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                This isn't about blame.{'\n'}
                It's about awareness.
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
  warningCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  exampleItem: {
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
  exampleText: {
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
