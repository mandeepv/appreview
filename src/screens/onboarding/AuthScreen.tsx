import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Auth'>;

export const AuthScreen: React.FC<Props> = ({ navigation }) => {
  const { setAuthMethod } = useOnboardingStore();

  const handleGoogleSignIn = async () => {
    setAuthMethod('google');
    navigation.navigate('Loading');
  };

  const handleAppleSignIn = async () => {
    setAuthMethod('apple');
    navigation.navigate('Loading');
  };

  return (
    <OnboardingContainer
      currentStep={15}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Save your progress</Text>

          <Text style={styles.description}>
            We’ll save your preferences and progress securely.
          </Text>
        </View>

        <View>
          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            style={styles.googleButton}
          />
          <Button
            title="Continue with Apple"
            onPress={handleAppleSignIn}
            variant="primary" // Keeping primary for Apple as per existing, or should I match? User didn't specify styles.
          // I'll make them consistent if possible, or keep as is. Apple usually requires specific styling (Black/White).
          // Current was Primary (Pink?). Apple guidelines? 
          // I'll stick to existing variants but ensure labels are correct.
          />
        </View>
      </View>
    </OnboardingContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 128,
    height: 128,
    backgroundColor: '#EC4899',
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
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  googleButton: {
    marginBottom: 12,
  },
  terms: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
