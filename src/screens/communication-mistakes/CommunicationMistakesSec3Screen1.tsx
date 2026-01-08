import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'CommunicationMistakesSec3Screen1'>;

export const CommunicationMistakesSec3Screen1: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('CommunicationMistakesSec3Screen2');
  };

  return (
    <LessonContainer
      currentStep={1}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>
            Section 3 of 13
          </Text>

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💬</Text>
          </View>

          <Text style={styles.title}>
            Trying to see "both sides"
          </Text>

          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>
              Dad wants to help his daughter understand why Paige didn't invite her to the sleepover.
            </Text>

            <Text style={styles.bodyText}>
              His intention is good — but his timing is not.
            </Text>
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
    gap: 20,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iconContainer: {
    marginVertical: 8,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  bodyCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 16,
    width: '100%',
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
