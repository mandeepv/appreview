import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/emotionalSandbagsProgress';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec5Screen10'>;

export const EmotionalSandbagsSec5Screen10: React.FC<Props> = ({ navigation }) => {
  const handleComplete = async () => {
    await markSectionComplete('5');
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={10}
      totalSteps={10}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✨</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              You didn't fix anything.
            </Text>
            <Text style={styles.summaryText}>
              And yet — you did the most important thing.
            </Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.highlightText}>
              You helped your partner unload their emotional sandbags.
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
  summaryBox: {
    gap: 16,
    paddingHorizontal: 12,
  },
  summaryText: {
    fontSize: 20,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 30,
    textAlign: 'center',
  },
  highlightBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: BorderRadius.lg,
    padding: 24,
    width: '100%',
  },
  highlightText: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
