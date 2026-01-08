import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen5'>;

export const CommunicationMistakesSec5Screen5: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec5Screen6');
  };

  return (
    <LessonContainer
      currentStep={5}
      totalSteps={7}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            Feelings don't need to be proven
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              The child isn't saying:
            </Text>

            <View style={styles.notSayingBox}>
              <Text style={styles.notSayingText}>
                "This is objectively the worst thing ever."
              </Text>
            </View>

            <Text style={styles.bodyText}>
              They're saying:
            </Text>

            <View style={styles.actuallyBox}>
              <Text style={styles.actuallyText}>
                "This really matters to me."
              </Text>
            </View>

            <Text style={styles.bodyText}>
              You don't have to agree with the intensity{'\n'}
              to acknowledge the emotion.
            </Text>

            <View style={styles.keyInsightCard}>
              <Text style={styles.keyInsightTitle}>Acknowledging ≠ Agreeing</Text>
              <Text style={styles.keyInsightText}>
                It simply means:{'\n\n'}
                "I see you."
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
    gap: 20,
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  notSayingBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  notSayingText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textTertiary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actuallyBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  actuallyText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  keyInsightCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    marginTop: 8,
  },
  keyInsightTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
  },
  keyInsightText: {
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
