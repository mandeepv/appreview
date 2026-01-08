import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec4Screen2'>;

export const CommunicationMistakesSec4Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec4Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={4}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>
            What the Upset Person Actually Hears
          </Text>

          <View style={styles.contentSection}>
            <Text style={styles.bodyText}>
              Instead of feeling understood, the person hears:
            </Text>

            <View style={styles.hearsCard}>
              <View style={styles.hearsItem}>
                <Text style={styles.hearsText}>"Your feelings are too much"</Text>
              </View>
              <View style={styles.hearsItem}>
                <Text style={styles.hearsText}>"You shouldn't feel this upset"</Text>
              </View>
              <View style={styles.hearsItem}>
                <Text style={styles.hearsText}>"This doesn't matter as much as you think it does"</Text>
              </View>
            </View>

            <Text style={styles.bodyText}>
              Even if the facts are true,{'\n'}
              the emotion still feels dismissed.
            </Text>

            <View style={styles.takeawayBox}>
              <Text style={styles.takeawayText}>
                When feelings are minimized, people don't calm down —{'\n'}
                they shut down or push back.
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
  hearsCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  hearsItem: {
    paddingVertical: 8,
  },
  hearsText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  takeawayBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: 8,
  },
  takeawayText: {
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
