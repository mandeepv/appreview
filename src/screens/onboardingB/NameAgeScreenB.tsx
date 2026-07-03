import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NameAge'>;

export const NameAgeScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="NameAge"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ChildrenCount')}
  />
);
