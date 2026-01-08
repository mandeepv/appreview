import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/communicationMistakesProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec12Screen6'>;

export const CommunicationMistakesSec12Screen6: React.FC<Props> = ({ navigation }) => {
  const handleNext = async () => {
    await markSectionComplete('12');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={6}
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
            Why "cheering up" doesn't work (yet)
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Trying to cheer someone up too early can make them feel like:
            </Text>

            <View style={styles.messageCard}>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>Their feelings are inconvenient</Text>
              </View>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>You want the emotion to go away</Text>
              </View>
              <View style={styles.messageItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.messageText}>You're uncomfortable sitting with them</Text>
              </View>
            </View>

            <View style={styles.insightBox}>
              <Text style={styles.insightText}>
                Sometimes the most supportive thing you can do is nothing—but stay present.
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
  messageCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  messageItem: {
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
  messageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
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
