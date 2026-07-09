import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import type { OnboardingStackParamList } from '../navigation/types';

// SPEC-08 R5: was `navigation: any`. PremiumUnlocked is a screen in the
// Onboarding stack (registered in OnboardingNavigator), so use the generated
// screen props for it.
type Props = NativeStackScreenProps<OnboardingStackParamList, 'PremiumUnlocked'>;

export default function PremiumUnlockedScreen({ navigation }: Props) {
  const confettiRef = useRef<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Gentle fade-in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger subtle confetti animation
    if (confettiRef.current) {
      confettiRef.current.start();
    }
  }, []);

  const handleStartLearning = () => {
    navigation.navigate('Root');
  };

  return (
    <View style={styles.container}>
      <ConfettiCannon
        ref={confettiRef}
        count={80}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        colors={[Colors.primary, Colors.primaryLight, Colors.success, Colors.accent]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>Your journey begins now</Text>

        <Text style={styles.description}>
          You're taking an important step toward becoming the parent you want to be.
        </Text>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button onPress={handleStartLearning} title="Start Learning" variant="gradient" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing['4xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['5xl'],
    ...Shadows.primary,
  },
  checkmark: {
    fontSize: 56,
    color: Colors.surface,
    fontWeight: Typography.weights.bold,
  },
  title: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    marginBottom: Spacing['3xl'],
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
    paddingHorizontal: Spacing.md,
    fontWeight: Typography.weights.medium,
  },
  buttonContainer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['5xl'],
  },
});
