import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingContainer } from '../../components/OnboardingContainer';
import { Button } from '../../components/Button';
import { useOnboardingStore } from '../../store/onboardingStore';
import { Colors } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'InvitePartner'>;

export const InvitePartnerScreen: React.FC<Props> = ({ navigation }) => {
  const { setPartnerInvited } = useOnboardingStore();

  const handleInvite = () => {
    setPartnerInvited(true);
    navigation.navigate('GoalSelection');
  };

  const handleSkip = () => {
    setPartnerInvited(false);
    navigation.navigate('GoalSelection');
  };

  return (
    <OnboardingContainer
      screenName="InvitePartner"
      currentStep={9}
      onBack={() => navigation.goBack()}
      showSkipButton
      onSkip={handleSkip}
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>👨‍👩‍👧‍👦</Text>
          </View>

          <Text style={styles.title}>Want to grow together?</Text>

          <Text style={styles.description}>
            Sync your lessons and track milestones together.{' '}
            <Text style={styles.bold}>85% of users</Text> say learning together builds stronger habits!
          </Text>
        </View>

        <View>
          <Button title="INVITE PARTNER" onPress={handleInvite} />
          <Button
            title="MAYBE LATER"
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
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 256,
    height: 256,
    backgroundColor: Colors.primaryBg,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationEmoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  highlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  bold: {
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
  },
});
