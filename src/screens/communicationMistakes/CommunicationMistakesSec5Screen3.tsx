import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec5Screen3'>;

export const CommunicationMistakesSec5Screen3: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec5Screen4');
  };

  return (
    <LessonContainer
      currentStep={3}
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
            Why this makes things worse
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              When someone is upset, their goal usually isn't to debate facts.
            </Text>

            <Text style={styles.bodyText}>
              They want to know:
            </Text>

            <View style={styles.questionCard}>
              <Text style={styles.questionText}>"Do you see how this feels to me?"</Text>
              <Text style={styles.questionText}>"Does this matter to you because it matters to me?"</Text>
            </View>

            <Text style={styles.bodyText}>
              When we argue whether their reaction is reasonable, we unintentionally send this message:
            </Text>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>"Your feelings don't make sense."</Text>
            </View>

            <Text style={styles.bodyText}>
              That almost always leads to:
            </Text>

            <View style={styles.outcomeCard}>
              <View style={styles.outcomeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.outcomeText}>Defensiveness</Text>
              </View>
              <View style={styles.outcomeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.outcomeText}>Stronger emotions</Text>
              </View>
              <View style={styles.outcomeItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.outcomeText}>More arguing, not less</Text>
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
  questionCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  messageBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  messageText: {
    fontSize: 17,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  outcomeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginRight: 12,
    marginTop: 2,
  },
  outcomeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
