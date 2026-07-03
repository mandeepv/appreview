import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ParentingStyles'>;

export const ParentingStylesScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="ParentingStyles"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('EmotionalChallenges')}
  />
);
