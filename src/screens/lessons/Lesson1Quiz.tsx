import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LessonContainer } from '../../components/LessonContainer';
import { Button } from '../../components/Button';
import { Colors, Typography, IconSizes } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Quiz'>;

export const Lesson1Quiz: React.FC<Props> = ({ navigation }) => {
  const handleStart = () => {
    navigation.navigate('Lesson1QuizQ1');
  };

  return (
    <LessonContainer
      currentStep={12}
      totalSteps={15}
      onBack={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎯</Text>
          </View>

          <Text style={styles.headline}>
            Quest Time!
          </Text>

          <Text style={styles.subtitle}>
            Let's lock in what you just learned
          </Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Start →"
            onPress={handleStart}
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
    alignItems: 'center',
    gap: 24,
  },
  iconContainer: {
    width: IconSizes.xl,
    height: IconSizes.xl,
    borderRadius: IconSizes.xl / 2,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
  },
  headline: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 46,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 19,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
