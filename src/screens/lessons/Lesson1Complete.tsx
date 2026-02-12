import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Share } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Colors, Typography, Shadows, BorderRadius, IconSizes } from '../../constants/theme';
import { LessonStackParamList } from '../../navigation/LessonNavigator';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<LessonStackParamList, 'Lesson1Complete'>;

export const Lesson1Complete: React.FC<Props> = ({ navigation: lessonNavigation }) => {
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate checkmark
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    // Navigate back to Learn screen in MainTabs
    rootNavigation.navigate('MainTabs');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Great parenting app you might like: https://www.kinderwell.com',
      });
    } catch (error) {
      if (__DEV__) console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.spacer} />

        {/* Checkmark Animation */}
        <Animated.View
          style={[
            styles.checkmarkContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.textContent, { opacity: fadeAnim }]}>
          <Text style={styles.headline}>
            Day 1 complete 🌱
          </Text>

          <Text style={styles.body}>
            You've learned how parenting science changed — and why many old methods failed.
          </Text>

          <Text style={styles.upNext}>
            Up next:
          </Text>
          <Text style={styles.nextLesson}>
            Day 2 · Why children struggle with self-control — and what actually helps
          </Text>

          {/* Progress Badge */}
          <View style={styles.progressBadge}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>1</Text>
            </View>
            <Text style={styles.badgeText}>
              Lesson completed
            </Text>
          </View>
        </Animated.View>

        <View style={styles.spacer} />

        {/* Share Section */}
        <Animated.View style={[styles.shareSection, { opacity: fadeAnim }]}>
          <Text style={styles.sharePrompt}>
            Who'd you like to text this to?
          </Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
          <Button
            title="Continue to Learn →"
            onPress={handleNext}
            variant="gradient"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  checkmarkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkmarkCircle: {
    width: IconSizes.xl,
    height: IconSizes.xl,
    borderRadius: IconSizes.xl / 2,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.success,
  },
  checkmark: {
    fontSize: 48,
    color: Colors.surface,
    fontWeight: Typography.weights.bold,
  },
  textContent: {
    gap: 16,
  },
  headline: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: 46,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: 26,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  upNext: {
    fontSize: 14,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextLesson: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.successBg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.xl,
    marginTop: 16,
    alignSelf: 'center',
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconText: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
    color: Colors.surface,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: Colors.successDark,
  },
  shareSection: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  sharePrompt: {
    fontSize: 16,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  shareButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
