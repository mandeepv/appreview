import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'ServeReturnSec5Screen1'>;

export const ServeReturnSec5Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('ServeReturnSec5Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={3}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Section 5 of 6</Text>
          </View>

          <Text style={styles.header}>
            Serve & return builds safety
          </Text>

          <View style={styles.imageContainer}>
            <Text style={styles.imageEmoji}>🤗</Text>
          </View>

          <View style={styles.contentSection}>
            <View style={styles.learningCard}>
              <Text style={styles.cardTitle}>When a child's serve is returned, they learn:</Text>

              <View style={styles.learningItem}>
                <Text style={styles.quote}>"I matter"</Text>
              </View>

              <View style={styles.learningItem}>
                <Text style={styles.quote}>"I'm seen"</Text>
              </View>

              <View style={styles.learningItem}>
                <Text style={styles.quote}>"It's safe to reach out"</Text>
              </View>
            </View>

            <View style={styles.foundationCard}>
              <Text style={styles.foundationTitle}>This safety becomes the foundation for:</Text>

              <View style={styles.foundationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.foundationText}>Confidence</Text>
              </View>

              <View style={styles.foundationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.foundationText}>Emotional regulation</Text>
              </View>

              <View style={styles.foundationItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.foundationText}>Trust in relationships</Text>
              </View>
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: '#E8F5E9',
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
  learningCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  learningItem: {
    paddingLeft: 12,
  },
  quote: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  foundationCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  foundationTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  foundationItem: {
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
  foundationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
