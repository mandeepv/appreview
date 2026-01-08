import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { markSectionComplete } from '../../utils/emotionalSandbagsProgress';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'EmotionalSandbagsSec6Screen6'>;

export const EmotionalSandbagsSec6Screen6: React.FC<Props> = ({ navigation }) => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleComplete = async () => {
    await markSectionComplete('6');
    // Navigate to Learn screen (main screen)
    rootNavigation.navigate('MainTabs', { screen: 'Learn' });
  };

  const handleReview = () => {
    // Navigate back to Emotional Sandbags overview
    navigation.getParent()?.goBack();
  };

  return (
    <LessonContainer
      currentStep={6}
      totalSteps={6}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🌟</Text>
          </View>

          <Text style={styles.header}>
            You're building a new skill
          </Text>

          <View style={styles.bodyContainer}>
            <Text style={styles.bodyText}>
              Learning to unload emotional sandbags takes practice.
            </Text>

            <View style={styles.affirmationBox}>
              <Text style={styles.affirmationText}>
                The fact that you're here means you're already doing something different — and meaningful.
              </Text>
            </View>

            <Text style={styles.forwardText}>
              In the next lesson, we'll learn how to apply this skill even more effectively in relationships.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Next Lesson"
            onPress={handleComplete}
            variant="gradient"
          />
          <Button
            title="Review Steps"
            onPress={handleReview}
            variant="outline"
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
    fontSize: 64,
  },
  header: {
    fontSize: 26,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  bodyContainer: {
    gap: 20,
    width: '100%',
  },
  bodyText: {
    fontSize: 18,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  affirmationBox: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: 24,
  },
  affirmationText: {
    fontSize: 17,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 26,
    textAlign: 'center',
  },
  forwardText: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
    gap: 12,
  },
});
