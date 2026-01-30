import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { ProgressBar } from '../../components/ProgressBar';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useOnboardingStore } from '../../store/onboardingStore';
import { saveUserOnboardingData } from '../../services/onboardingService';
import { usePlacement, useUser } from 'expo-superwall';
import { SKIP_PAYWALL } from '@env';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Loading'>;

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));
  const { user } = useAuthStore();
  const onboardingStore = useOnboardingStore();
  const { identify } = useUser();
  const { registerPlacement } = usePlacement({
    onPresent: (paywallInfo) => {
      console.log('✅ Paywall presented:', paywallInfo.name);
    },
    onDismiss: (paywallInfo, result) => {
      console.log('👋 Paywall dismissed:', result.type);
      navigation.replace('Root');
    },
    onSkip: (reason) => {
      console.log('⏭️ Paywall skipped:', reason.type);
      navigation.replace('Root');
    },
    onError: (error) => {
      console.error('❌ Paywall error:', error);
      navigation.replace('Root');
    },
  });

  // Save onboarding data to Supabase on mount
  useEffect(() => {
    const saveOnboardingData = async () => {
      if (user?.id) {
        try {
          const onboardingData = {
            userType: onboardingStore.userType,
            name: onboardingStore.name,
            age: onboardingStore.age,
            childrenCount: onboardingStore.childrenCount,
            children: onboardingStore.children,
            improvementGoals: onboardingStore.improvementGoals,
            notificationsEnabled: onboardingStore.notificationsEnabled,
            partnerInvolvement: onboardingStore.partnerInvolvement,
            partnerInvited: onboardingStore.partnerInvited,
            learningGoal: onboardingStore.learningGoal,
            experienceLevel: onboardingStore.experienceLevel,
            familiarParentingStyles: onboardingStore.familiarParentingStyles,
            emotionalChallenges: onboardingStore.emotionalChallenges,
            authMethod: onboardingStore.authMethod,
            selectedPlan: onboardingStore.selectedPlan,
          };

          await saveUserOnboardingData(user.id, onboardingData);

          // Clear local onboarding state after saving to Supabase
          await onboardingStore.clearState();
        } catch (error) {
          console.error('Error saving onboarding data:', error);
          // Continue anyway - don't block user from entering app
        }
      }
    };

    saveOnboardingData();
  }, [user]);

  const showPaywall = async () => {
    const shouldSkipPaywall = SKIP_PAYWALL === 'true';

    console.log('=== 🚀 SHOWING PAYWALL ===');
    console.log('SKIP_PAYWALL:', SKIP_PAYWALL);
    console.log('User ID:', user?.id);

    if (shouldSkipPaywall) {
      console.log('⏩ Skipping paywall');
      navigation.replace('Root');
      return;
    }

    try {
      // Identify user with Superwall
      if (user?.id) {
        console.log('👤 Identifying user:', user.id);
        await identify(user.id);
      }

      console.log('📱 Registering placement: show_paywall');
      await registerPlacement({
        placement: 'show_paywall',
      });

      console.log('✅ Placement registered');
    } catch (error) {
      console.error('❌ Error showing paywall:', error);
      navigation.replace('Root');
    }
  };


  useEffect(() => {
    // Gentle continuous breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slower, more deliberate progress (4 seconds total)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // After loading completes, show paywall
            showPaywall();
          }, 600);
          return 100;
        }
        return prev + 1.25;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [navigation]);

  const getMessage = () => {
    if (progress < 25) return 'Analyzing your family profile...';
    if (progress < 50) return 'Tailoring lessons for your needs...';
    if (progress < 75) return 'Balancing science with real-life...';
    if (progress < 95) return 'Finalizing your journey...';
    return 'Almost ready!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <Text style={styles.title}>
          Designing your parenting journey
        </Text>

        <Text style={styles.description}>
          Creating a personalized program tailored to your family
        </Text>

        <View style={styles.progressContainer}>
          <ProgressBar current={progress} total={100} style={styles.progressBar} />
        </View>

        <Text style={styles.status}>{getMessage()}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['4xl'],
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: Spacing['5xl'],
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F8F8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['5xl'],
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
    paddingHorizontal: Spacing.md,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  progressBar: {
    height: 6,
  },
  status: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
  },
});
