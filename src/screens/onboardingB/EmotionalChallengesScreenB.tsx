import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmotionalChallenges'>;

export const EmotionalChallengesScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="EmotionalChallenges"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('Auth')}
  />
);
