import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';
import { signInWithGoogle, signInWithApple } from '../../services/authService';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuthMethod, markAuthReached } = useOnboardingStore();
  const { setUser, setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  // Mark that user has reached the auth screen (completed onboarding)
  useEffect(() => {
    markAuthReached();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoadingProvider('google');
      setAuthMethod('google');

      const session = await signInWithGoogle();

      if (session) {
        setUser(session.user);
        setSession(session);
        // First-time user completing onboarding - go through Loading screen
        // Loading screen will save onboarding data to Supabase
        navigation.navigate('Loading');
      } else {
        // User cancelled or something went wrong
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
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
        navigation.navigate('Loading');
      } else {
        // User cancelled
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
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
      currentStep={15}
      showBackButton={false}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Save your progress</Text>

          <Text style={styles.description}>
            We’ll save your preferences and progress securely.
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
