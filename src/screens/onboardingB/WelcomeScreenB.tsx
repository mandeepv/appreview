import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { trackWelcomeCtaTapped, trackOnboardingRestarted } from '../../lib/analytics';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export const WelcomeScreenB: React.FC<Props> = ({ navigation }) => {
  const { getLastScreen } = useOnboardingStore();

  const handleGetStarted = async () => {
    trackWelcomeCtaTapped('get_started');
    const priorLastScreen = await getLastScreen();
    if (priorLastScreen && priorLastScreen !== 'Welcome') {
      trackOnboardingRestarted(priorLastScreen);
    }
    navigation.navigate('UserType');
  };

  const handleSignIn = () => {
    trackWelcomeCtaTapped('sign_in');
    navigation.navigate('SignIn');
  };

  return (
    <LinearGradient
      colors={['#0E7C86', '#065A62']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.tag}>VARIANT B</Text>
          <Text style={styles.title}>Welcome to Kinderwell</Text>
          <Text style={styles.subtitle}>
            A new way to raise confident, connected kids. Placeholder copy for
            variant B — replace later.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGetStarted}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Let's begin</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7}>
              <Text style={styles.linkText}>Have an account? Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  tag: {
    fontSize: 12,
    letterSpacing: 3,
    color: '#B4F0F5',
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: '#DFF7F9',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0E7C86',
  },
  linkText: {
    fontSize: 15,
    color: '#B4F0F5',
    textDecorationLine: 'underline',
  },
});
