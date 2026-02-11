import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { NotificationIllustration } from '../../components/illustrations';
import { Heading2, Subtitle } from '../../components/Typography';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Spacing, Animation, Shadows } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NotificationPermission'>;

export const NotificationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const { setNotificationsEnabled } = useOnboardingStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
  }, []);

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
      screenName="NotificationPermission"
      currentStep={7}
      onBack={() => navigation.goBack()}
      scrollable={true}
    >
      <View style={styles.container}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}>
          <NotificationIllustration width={140} height={140} />

          <Heading2 center style={styles.title}>
            Your daily 5-minute reminder
          </Heading2>

          <Subtitle center style={styles.description}>
            We’ll remind you once a day — no spam, no pressure.
          </Subtitle>
        </Animated.View>

        <View style={styles.buttonContainer}>
          <Button title="Enable Notifications" onPress={handleEnable} variant="gradient" />
          <Button
            title="I’ll set this up later"
            onPress={handleSkip}
            variant="secondary"
            style={styles.secondaryButton}
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
    paddingVertical: Spacing['2xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing['2xl'],
  },
  title: {
    marginTop: Spacing.md,
  },
  description: {
    paddingHorizontal: Spacing.lg,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  secondaryButton: {
    ...Shadows.none,
  },
});
