import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { WelcomeIllustration } from '../../components/illustrations';
import { Heading1, Subtitle } from '../../components/Typography';
import { Colors, Spacing, Animation } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: Animation.duration.slow,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: Animation.spring.damping,
        stiffness: Animation.spring.stiffness,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('UserType');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}>
          <WelcomeIllustration width={220} height={220} />
          <Heading1 style={styles.title}>Mamalearn</Heading1>
          <Subtitle style={styles.subtitle}>Your parenting journey starts here</Subtitle>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  title: {
    color: Colors.surface,
    marginTop: Spacing['2xl'],
  },
  subtitle: {
    color: Colors.surface,
    opacity: 0.95,
  },
});
