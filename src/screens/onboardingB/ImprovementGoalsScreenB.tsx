import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ImprovementGoals'>;

export const ImprovementGoalsScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ImprovementGoals"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('Educational')}
  />
);
