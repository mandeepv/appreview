import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NotificationPermission'>;

export const NotificationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const { setNotificationsEnabled } = useOnboardingStore();

  const handleEnable = async () => {
    setNotificationsEnabled(true);
    navigation.navigate('PartnerInvolvement');
  };

  const handleSkip = () => {
    setNotificationsEnabled(false);
    navigation.navigate('PartnerInvolvement');
  };

  return (
    <OnboardingContainer
      currentStep={7}
      onBack={() => navigation.goBack()}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔔</Text>
          </View>

          <Text style={styles.title}>Enable Notifications</Text>

          <Text style={styles.description}>
            Get daily reminders for your parenting lessons and track your progress with timely nudges.
          </Text>
        </View>

        <View>
          <Button title="Enable Notifications" onPress={handleEnable} />
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
    backgroundColor: '#FCE7F3',
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  secondaryButton: {
    marginTop: 12,
  },
});
