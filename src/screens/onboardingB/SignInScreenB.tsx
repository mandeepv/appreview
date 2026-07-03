import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignIn'>;

export const SignInScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="SignIn"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('UserType')}
  />
);
