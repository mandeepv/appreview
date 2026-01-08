import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen2'>;

export const EmotionalSandbagsSec6Screen2: React.FC<Props> = ({ navigation }) => {
  const handleNext = () => {
    navigation.navigate('EmotionalSandbagsSec6Screen3');
  };

  return (
    <LessonContainer
      currentStep={2}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📡</Text>
          </View>

          <Text style={styles.header}>
            The most important habit
          </Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              See if you can develop a radar for when a loved one's sandbags are full.
            </Text>

            <View style={styles.signalsBox}>
              <Text style={styles.signalsTitle}>Small signals matter:</Text>
              <View style={styles.signalsList}>
                <Text style={styles.signalItem}>• Short answers</Text>
                <Text style={styles.signalItem}>• Changes in tone</Text>
                <Text style={styles.signalItem}>• Withdrawal or irritation</Text>
              </View>
            </View>

            <View style={styles.messageBox}>
              <Text style={styles.messageText}>
                Simply noticing sends a powerful message:{'\n'}
                <Text style={styles.messageBold}>"I see you. I care."</Text>
              </Text>
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
    marginBottom: 4,
  },
  icon: {
    fontSize: 56,
  },
  header: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  bodyContainer: {
    gap: 20,
    width: '100%',
  },
  bodyText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  signalsBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 12,
  },
  signalsTitle: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  signalsList: {
    gap: 8,
  },
  signalItem: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  messageBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  messageBold: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
