// SPEC-09 Phase 3 — dev-only route wrapper for the lesson preview.
//
// Registered in OnboardingNavigator ONLY under `__DEV__`, so it is stripped
// from production builds (zero risk to the shipping app / gate). Lets you open
// a data-driven lesson from the DevMenu to eyeball fidelity on device.

import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../navigation/types';
import { LessonPreviewScreen } from './LessonPreviewScreen';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LessonPreview'>;

export const LessonPreviewRoute: React.FC<Props> = ({ navigation, route }) => (
  <LessonPreviewScreen slug={route.params?.slug ?? 'sprinklers'} onExit={() => navigation.goBack()} />
);
