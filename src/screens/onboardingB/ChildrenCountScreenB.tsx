import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenCount'>;

export const ChildrenCountScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ChildrenCount"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ImprovementGoals')}
  />
);
