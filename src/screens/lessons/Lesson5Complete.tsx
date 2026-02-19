import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson5Complete'>;

export const Lesson5Complete: React.FC<Props> = ({ navigation }) => {
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
    navigation.getParent()?.navigate('MainTabs', { screen: 'Learn' });
  };

  return (
    <LinearGradient
      colors={['#F0FFF4', '#FFFFFF']}
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
            colors={['#2E7D32', '#66BB6A']}
            style={styles.iconGradient}
          >
            <Text style={styles.iconEmoji}>🏷️</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.headline}>Lesson Complete</Text>

          <View style={styles.learningCard}>
            <Text style={styles.learningTitle}>You learned:</Text>
            <View style={styles.bulletList}>
              <Text style={styles.bullet}>• Why naming emotions calms the brain</Text>
              <Text style={styles.bullet}>• How giving things names creates understanding</Text>
              <Text style={styles.bullet}>• Why specific emotions matter more than broad ones</Text>
              <Text style={styles.bullet}>• Why this skill must be practiced</Text>
            </View>
          </View>

          <View style={styles.nextLessonCard}>
            <Text style={styles.nextLabel}>NEXT:</Text>
            <Text style={styles.nextTitle}>Practicing emotion labeling in real-life moments.</Text>
          </View>

        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue →"
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
  learningCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 8,
  },
  learningTitle: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: '#2E7D32',
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
  nextLessonCard: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
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
