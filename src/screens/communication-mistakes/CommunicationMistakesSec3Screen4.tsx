import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen4'>;

export const CommunicationMistakesSec3Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec3Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💡</Text>
          </View>

          <Text style={styles.title}>
            Why this backfires
          </Text>

          <View style={styles.insightCard}>
            <Text style={styles.intro}>
              When someone is upset, trying to understand "the other side" too early feels like betrayal.
            </Text>

            <Text style={styles.subheading}>
              Even if your intentions are good, it sounds like:
            </Text>

            <View style={styles.quoteList}>
              <View style={styles.quoteItem}>
                <Text style={styles.quoteMark}>"</Text>
                <Text style={styles.quoteText}>You're wrong</Text>
                <Text style={styles.quoteMark}>"</Text>
              </View>

              <View style={styles.quoteItem}>
                <Text style={styles.quoteMark}>"</Text>
                <Text style={styles.quoteText}>Your feelings aren't valid</Text>
                <Text style={styles.quoteMark}>"</Text>
              </View>

              <View style={styles.quoteItem}>
                <Text style={styles.quoteMark}>"</Text>
                <Text style={styles.quoteText}>I'm not on your side</Text>
                <Text style={styles.quoteMark}>"</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

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
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  content: {
    gap: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 20,
    width: '100%',
  },
  intro: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 4,
  },
  quoteList: {
    gap: 12,
    marginTop: 8,
  },
  quoteItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  quoteMark: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
