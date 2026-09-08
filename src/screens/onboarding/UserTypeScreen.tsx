/**
 * Screen 12 in the design canvas — "STEP 1 OF 8".
 *
 * Single-select: circles, no count line.
 *
 * The canvas offers five roles where the data model has three
 * (`'father' | 'mother' | 'other'`). Grandparent / Guardian / Someone else all
 * store as `'other'` — the redesign is a visual pass, so the saved value and
 * the analytics payload stay byte-identical to what v1.2.0 shipped. Widening
 * `UserType` would change the Supabase write and the PostHog property, which
 * is a data decision, not a design one.
 *
 * `roleChoice` keeps the finer-grained pick in local state only, so the
 * selected row stays lit while the user is on the screen.
 */

import React, { useState } from 'react';
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

type RoleChoice = 'mother' | 'father' | 'grandparent' | 'guardian' | 'someone-else';

const ROLES: { key: RoleChoice; label: string; stored: UserType }[] = [
  { key: 'mother', label: 'Mum', stored: 'mother' },
  { key: 'father', label: 'Dad', stored: 'father' },
  { key: 'grandparent', label: 'Grandparent', stored: 'other' },
  { key: 'guardian', label: 'Guardian or carer', stored: 'other' },
  { key: 'someone-else', label: 'Someone else who shows up', stored: 'other' },
];

export const UserTypeScreen: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  // Seed from the store so going back re-lights a row. A stored 'other' can't
  // tell us which of the three 'other' rows was picked, so it stays unlit —
  // harmless, and better than lighting the wrong one.
  const [roleChoice, setRoleChoice] = useState<RoleChoice | null>(() => {
    if (userType === 'mother') return 'mother';
    if (userType === 'father') return 'father';
    return null;
  });

  const handleSelect = (role: (typeof ROLES)[number]) => {
    setRoleChoice(role.key);
    updateUserType(role.stored);
  };

  const handleContinue = () => {
    if (!userType) return;
    trackOnboardingStepCompleted('UserType', userType);
    navigation.navigate('NameAge');
  };

  return (
    <OnboardingScreen
      step={1}
      headline="Welcome to Kinderwell"
      subtitle="Who are you parenting as?"
      onContinue={handleContinue}
      continueDisabled={!userType}
    >
      <View style={styles.rows}>
        {ROLES.map((role) => (
          <OptionRow
            key={role.key}
            label={role.label}
            mode="single"
            selected={roleChoice === role.key}
            onPress={() => handleSelect(role)}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  rows: { gap: L.rowGap },
});
