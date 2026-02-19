import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson2Complete'>;

export const Lesson2Complete: React.FC<Props> = ({ navigation }) => {
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
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headline}>Quest Complete!</Text>
          <Text style={styles.subheadline}>
            You've mastered happiness chemicals
          </Text>

          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
            <View style={styles.progressBadge}>
              <Text style={styles.progressNumber}>2</Text>
              <Text style={styles.progressTotal}>/8</Text>
            </View>
            <Text style={styles.progressText}>lessons completed</Text>
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
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
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
