import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { signInWithGoogle, signInWithApple } from '../../services/authService';
import { hasUserCompletedOnboarding } from '../../services/onboardingService';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuthMethod } = useOnboardingStore();
  const { setUser, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      setAuthMethod('google');

      const session = await signInWithGoogle();

      if (session) {
        setUser(session.user);
        setSession(session);

        // Check if user has completed onboarding
        const hasOnboarding = await hasUserCompletedOnboarding(session.user.id);

        if (hasOnboarding) {
          // Returning user with onboarding data - go directly to app
          if (__DEV__) console.log('Returning user with onboarding data, navigating to Root');
          navigation.replace('Root');
        } else {
          // User has no onboarding data - force them through onboarding
          if (__DEV__) console.log('User has no onboarding data, starting onboarding');
          navigation.replace('UserType');
        }
      } else {
        // User cancelled or something went wrong
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Google sign-in error:', error);
      setIsLoading(false);
      setLoadingProvider(null);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Could not sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('apple');
      setAuthMethod('apple');

      const session = await signInWithApple();

      if (session) {
        setUser(session.user);
        setSession(session);

        // Check if user has completed onboarding
        const hasOnboarding = await hasUserCompletedOnboarding(session.user.id);

        if (hasOnboarding) {
          // Returning user with onboarding data - go directly to app
          if (__DEV__) console.log('Returning user with onboarding data, navigating to Root');
          navigation.replace('Root');
        } else {
          // User has no onboarding data - force them through onboarding
          if (__DEV__) console.log('User has no onboarding data, starting onboarding');
          navigation.replace('UserType');
        }
      } else {
        // User cancelled
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Apple sign-in error:', error);
      setIsLoading(false);
      setLoadingProvider(null);
      Alert.alert(
        'Sign In Failed',
        error.message || 'Could not sign in with Apple. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <OnboardingContainer
      currentStep={1}
      onBack={() => navigation.goBack()}
      scrollable={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.description}>
            Sign in to continue your parenting journey.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {loadingProvider === 'google' ? (
              <ActivityIndicator color="#DB4437" />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <AntDesign name="google" size={22} color="#DB4437" />
                </View>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.appleButton, isLoading && styles.buttonDisabled]}
            onPress={handleAppleSignIn}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {loadingProvider === 'apple' ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  content: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
    paddingHorizontal: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F1F1F',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
