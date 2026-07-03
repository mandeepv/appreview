import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { useOnboardingStore } from '../../store/onboardingStore';
import { UserType } from '../../types/onboarding';
import { trackOnboardingStepCompleted } from '../../lib/analytics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'UserType'>;

const OPTIONS: { value: UserType; label: string; emoji: string }[] = [
  { value: 'mother', label: 'Mother', emoji: '🌷' },
  { value: 'father', label: 'Father', emoji: '🌳' },
  { value: 'other', label: 'Someone else who cares', emoji: '💛' },
];

export const UserTypeScreenB: React.FC<Props> = ({ navigation }) => {
  const { userType, updateUserType } = useOnboardingStore();

  const handleContinue = () => {
    if (userType) {
      trackOnboardingStepCompleted('UserType', userType);
      navigation.navigate('NameAge');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View>
          <Text style={styles.tag}>VARIANT B · STEP 1</Text>
          <Text style={styles.title}>Tell us who you are</Text>
          <Text style={styles.subtitle}>
            One quick question so we can personalize what comes next.
          </Text>

          <View style={styles.optionsRow}>
            {OPTIONS.map((opt) => {
              const isSelected = userType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  activeOpacity={0.8}
                  onPress={() => updateUserType(opt.value)}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !userType && styles.continueBtnDisabled]}
          disabled={!userType}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E7C86',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  tag: {
    fontSize: 12,
    letterSpacing: 3,
    color: '#B4F0F5',
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#DFF7F9',
    marginBottom: 32,
    lineHeight: 22,
  },
  optionsRow: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#0A5C64',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#B4F0F5',
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionLabelSelected: {
    color: '#0E7C86',
  },
  continueBtn: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0E7C86',
  },
});
