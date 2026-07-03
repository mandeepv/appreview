import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ChildrenGender'>;

export const ChildrenGenderScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ChildrenGender"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ChildrenAge')}
  />
);
