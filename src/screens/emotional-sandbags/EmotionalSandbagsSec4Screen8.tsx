import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/emotionalSandbagsProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec4Screen8'>;

export const EmotionalSandbagsSec4Screen8: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('4');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={8}
      totalSteps={8}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🌱</Text>
          </View>

          <Text style={styles.headline}>
            You're building a powerful relationship skill
          </Text>

          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              This may feel awkward at first — that's normal.
            </Text>
            <Text style={styles.messageText}>
              With practice, it becomes second nature.
            </Text>
          </View>

          <View style={styles.forwardBox}>
            <Text style={styles.forwardLabel}>Next lesson:</Text>
            <Text style={styles.forwardText}>
              Continue building emotional connection
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Complete"
            onPress={handleComplete}
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
    fontSize: 64,
  },
  headline: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  messageBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
    gap: 12,
    width: '100%',
  },
  messageText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  forwardBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 20,
    gap: 8,
    width: '100%',
  },
  forwardLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  forwardText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: '#2E7D32',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
