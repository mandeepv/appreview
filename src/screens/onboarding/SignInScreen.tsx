import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { usePostHog } from 'posthog-react-native';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { signInWithGoogle, signInWithApple } from '../../services/authService';
import { hasUserCompletedOnboarding } from '../../services/onboardingService';
import { Colors } from '../../constants/theme';
import { trackAuthAttempted, trackAuthAbandoned } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuthMethod } = useOnboardingStore();
  const { setUser, setSession } = useAuthStore();
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      setAuthMethod('google');
      trackAuthAttempted('google', 'returning_user');

      const session = await signInWithGoogle();

      if (session) {
        setUser(session.user);
        setSession(session);

        // Check if user has completed onboarding
        const hasOnboarding = await hasUserCompletedOnboarding(session.user.id);

        posthog.identify(session.user.id, {
          $set: { email: session.user.email ?? null },
        } as Record<string, unknown> as never);
        posthog.capture('user_signed_in', {
          auth_method: 'google',
          user_type: hasOnboarding ? 'returning' : 'new',
        });

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
        trackAuthAbandoned('google', 'returning_user', 'no_session_returned');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Google sign-in error:', error);
      trackAuthAbandoned('google', 'returning_user', 'error');
      posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
        auth_method: 'google',
        screen: 'SignInScreen',
      });
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
      trackAuthAttempted('apple', 'returning_user');

      const session = await signInWithApple();

      if (session) {
        setUser(session.user);
        setSession(session);

        // Check if user has completed onboarding
        const hasOnboarding = await hasUserCompletedOnboarding(session.user.id);

        posthog.identify(session.user.id, {
          $set: { email: session.user.email ?? null },
        } as Record<string, unknown> as never);
        posthog.capture('user_signed_in', {
          auth_method: 'apple',
          user_type: hasOnboarding ? 'returning' : 'new',
        });

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
        trackAuthAbandoned('apple', 'returning_user', 'no_session_returned');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Apple sign-in error:', error);
      trackAuthAbandoned('apple', 'returning_user', 'error');
      posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
        auth_method: 'apple',
        screen: 'SignInScreen',
      });
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

          {loadingProvider === 'apple' ? (
            <View style={styles.appleLoadingContainer}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}
        </View>

        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text onPress={() => Linking.openURL('https://mandeepv.github.io/kinderwell-legal/terms.html')} style={{ textDecorationLine: 'underline' }}>Terms</Text>
          {' '}and{' '}
          <Text onPress={() => Linking.openURL('https://mandeepv.github.io/kinderwell-legal/privacy.html')} style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
        </Text>
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
    width: '100%',
    height: 56,
  },
  appleLoadingContainer: {
    width: '100%',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
