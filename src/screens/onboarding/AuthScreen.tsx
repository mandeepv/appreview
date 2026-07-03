import React, { useState, useEffect, useRef } from 'react';
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
import { Colors } from '../../constants/theme';
import { identifyUserWithOnboarding, trackAuthAttempted, trackAuthAbandoned } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const onboardingStore = useOnboardingStore();
  const { setAuthMethod, markAuthReached } = onboardingStore;
  const { setUser, setSession, setDemoUser } = useAuthStore();
  const posthog = usePostHog();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mark that user has reached the auth screen (completed onboarding)
  useEffect(() => {
    markAuthReached();
    posthog.capture('onboarding_completed');
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      setAuthMethod('google');
      trackAuthAttempted('google', 'new_user');

      const session = await signInWithGoogle();

      if (session) {
        setUser(session.user);
        setSession(session);
        identifyUserWithOnboarding(session.user.id, session.user.email, onboardingStore);
        posthog.capture('user_signed_in', {
          auth_method: 'google',
          user_type: 'new',
        });
        // First-time user completing onboarding - go through Loading screen
        // Loading screen will save onboarding data to Supabase
        navigation.navigate('Loading');
      } else {
        // User cancelled or something went wrong
        trackAuthAbandoned('google', 'new_user', 'no_session_returned');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Google sign-in error:', error);
      trackAuthAbandoned('google', 'new_user', 'error');
      posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
        auth_method: 'google',
        screen: 'AuthScreen',
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
      trackAuthAttempted('apple', 'new_user');

      const session = await signInWithApple();

      if (session) {
        setUser(session.user);
        setSession(session);
        identifyUserWithOnboarding(session.user.id, session.user.email, onboardingStore);
        posthog.capture('user_signed_in', {
          auth_method: 'apple',
          user_type: 'new',
        });
        navigation.navigate('Loading');
      } else {
        // User cancelled
        trackAuthAbandoned('apple', 'new_user', 'no_session_returned');
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      if (__DEV__) console.error('Apple sign-in error:', error);
      trackAuthAbandoned('apple', 'new_user', 'error');
      posthog.captureException(error instanceof Error ? error : new Error(String(error)), {
        auth_method: 'apple',
        screen: 'AuthScreen',
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

  const handleTitlePress = () => {
    // Clear existing timer
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Activate demo mode after 7 taps
    if (newTapCount >= 7) {
      setTapCount(0);
      Alert.alert(
        'Demo Mode Activated',
        'You now have full access to all premium features for review purposes.',
        [
          {
            text: 'Continue',
            onPress: () => {
              setAuthMethod('demo');
              setDemoUser();
              navigation.navigate('Loading');
            },
          },
        ]
      );
    } else {
      // Reset tap count after 3 seconds of inactivity
      tapTimerRef.current = setTimeout(() => {
        setTapCount(0);
      }, 3000);
    }
  };

  return (
    <OnboardingContainer
      currentStep={15}
      showBackButton={false}
      scrollable={true}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={handleTitlePress} activeOpacity={0.8}>
            <Text style={styles.title}>Save your progress</Text>
          </TouchableOpacity>

          <Text style={styles.description}>
            We'll save your preferences and progress securely.
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
                <View style={styles.googleIconContainer}>
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
  iconContainer: {
    width: 128,
    height: 128,
    backgroundColor: Colors.primary,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 64,
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
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  terms: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
