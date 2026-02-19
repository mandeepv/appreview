import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson3Complete'>;

export const Lesson3Complete: React.FC<Props> = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    // Navigate back to the Learn screen
    navigation.getParent()?.navigate('MainTabs', { screen: 'Learn' });
  };

  return (
    <LinearGradient
      colors={['#FFF5F7', '#FFFFFF']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, '#FF6B9D']}
            style={styles.iconGradient}
          >
            <Text style={styles.iconEmoji}>🌿</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headline}>Lesson Complete</Text>
          <Text style={styles.subheadline}>
            You've learned about cortisol and how to create emotional safety
          </Text>

          <View style={styles.learningCard}>
            <Text style={styles.learningTitle}>What You've Learned:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bullet}>• What cortisol is</Text>
              <Text style={styles.bullet}>• Why anticipation is more damaging than events</Text>
              <Text style={styles.bullet}>• How common and reversible this problem is</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressNumber}>3</Text>
              <Text style={styles.progressTotal}>/8</Text>
            </View>
            <Text style={styles.progressText}>lessons completed</Text>
          </View>

          <View style={styles.nextLessonCard}>
            <Text style={styles.nextLabel}>NEXT:</Text>
            <Text style={styles.nextTitle}>Oxytocin — the chemical that builds emotional safety, bonding, and resilience.</Text>
          </View>

        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Start Next Lesson →"
          onPress={handleNext}
          variant="gradient"
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  iconEmoji: {
    fontSize: 48,
  },
  headline: {
    fontSize: 32,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: -8,
    paddingHorizontal: 12,
  },
  learningCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 8,
  },
  learningTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  bulletList: {
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    ...Shadows.md,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  progressTotal: {
    fontSize: 24,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
  },
  progressText: {
    fontSize: 15,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  nextLessonCard: {
    backgroundColor: Colors.successBg,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.success,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  nextTitle: {
    fontSize: 15,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    marginTop: 8,
  },
  shareText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  buttonContainer: {
    paddingTop: 20,
  },
});
