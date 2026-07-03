import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/OnboardingNavigator';
import { VariantBPlaceholder } from './VariantBPlaceholder';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'GoalSelection'>;

export const GoalSelectionScreenB: React.FC<Props> = ({ navigation }) => (
  <VariantBPlaceholder
    screenName="GoalSelection"
    onBack={() => navigation.goBack()}
    onContinue={() => navigation.navigate('ExperienceLevel')}
  />
);
