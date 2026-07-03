import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenAge'>;

export const ChildrenAgeScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ChildrenAge"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ImprovementGoals')}
  />
);
