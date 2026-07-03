import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PartnerInvolvement'>;

export const PartnerInvolvementScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="PartnerInvolvement"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ExperienceLevel')}
  />
);
