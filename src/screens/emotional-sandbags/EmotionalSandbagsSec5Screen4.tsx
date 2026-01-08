import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen4'>;

export const EmotionalSandbagsSec5Screen4: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec5Screen5');
  };

  return (
    <LessonContainer
      currentStep={4}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.introText}>
            Your partner tells you that while you were at work:
          </Text>

          <View style={styles.issuesList}>
            <View style={styles.issueItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.issueText}>Your daughter got in trouble at school</Text>
            </View>

            <View style={styles.issueItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.issueText}>Your son got punched by a friend</Text>
            </View>

            <View style={styles.issueItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.issueText}>The house is a disaster</Text>
            </View>
          </View>

          <Text style={styles.additionalText}>
            They also mention they have a headache.
          </Text>
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
  },
  introText: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
  },
  issuesList: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 16,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    fontSize: 20,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    lineHeight: 26,
  },
  issueText: {
    flex: 1,
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  additionalText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
