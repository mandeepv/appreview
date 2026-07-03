import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExperienceLevel'>;

export const ExperienceLevelScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ExperienceLevel"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('EmotionalChallenges')}
  />
);
