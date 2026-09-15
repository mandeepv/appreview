/**
 * Screen 12 in the design canvas — step 1 of 8.
 *
 * Single-select: circles, no count line.
 *
 * The canvas drew five roles (Mum / Dad / Grandparent / Guardian / Someone
 * else). We ship the three v1.2.0 shipped — Mother, Father, Other / Guardian —
 * because the extra two collapsed onto the same stored 'other' anyway, so they
 * lengthened the list without telling us anything new.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { OnboardingScreen } from '../../components/onboarding/OnboardingScreen';
import { OptionRow } from '../../components/onboarding/OptionRow';
import { useOnboardingStore } from '../../store/onboardingStore';
import { UserType } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';
import { OnboardingLayout as L } from '../../constants/theme';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>;

const ROLES: { value: UserType; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'other', label: 'Other / Guardian' },
];

export const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleContinue = () => {
    if (!userType) return;
    trackOnboardingStepCompleted('UserType', userType);
    navigation.navigate('NameAge');
  };

  return (
    <OnboardingScreen
      screenName="UserType"
      step={1}
      headline="Welcome to Kinderwell"
      subtitle="Who are you parenting as?"
      onContinue={handleContinue}
      continueDisabled={!userType}
    >
      <View style={styles.rows}>
        {ROLES.map((role) => (
          <OptionRow
            key={role.value}
            label={role.label}
            mode="single"
            selected={userType === role.value}
            onPress={() => updateUserType(role.value)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
});
