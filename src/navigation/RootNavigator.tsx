import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import { LessonNavigator } from './LessonNavigator';
import LabelingEmotionsLessonScreen from '../screens/LabelingEmotionsLessonScreen';
import NamingOurEmotionsLessonScreen from '../screens/NamingOurEmotionsLessonScreen';
import SprinklersLessonScreen from '../screens/SprinklersLessonScreen';
import EmotionalSandbagsLessonScreen from '../screens/EmotionalSandbagsLessonScreen';
import CommunicationMistakesLessonScreen from '../screens/CommunicationMistakesLessonScreen';
import HelpingSomeoneProcessEmotionsLessonScreen from '../screens/HelpingSomeoneProcessEmotionsLessonScreen';
import DissociationLessonScreen from '../screens/DissociationLessonScreen';
import ServeAndReturnLessonScreen from '../screens/ServeAndReturnLessonScreen';
import RecordingDeepBondMomentsLessonScreen from '../screens/RecordingDeepBondMomentsLessonScreen';

import type { RootStackParamList } from './types';

// DEPRECATED transitional shim (SPEC-08) — see navigation/types.ts (the single
// composition home). New code imports RootStackParamList from there. Dies with
// the SPEC-09 dead-code pass (plan 5.5).
export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="LessonFlow" component={LessonNavigator} />
      <Stack.Screen name="LabelingEmotionsLesson" component={LabelingEmotionsLessonScreen} />
      <Stack.Screen name="NamingOurEmotionsLesson" component={NamingOurEmotionsLessonScreen} />
      <Stack.Screen name="SprinklersLesson" component={SprinklersLessonScreen} />
      <Stack.Screen name="EmotionalSandbagsLesson" component={EmotionalSandbagsLessonScreen} />
      <Stack.Screen name="CommunicationMistakesLesson" component={CommunicationMistakesLessonScreen} />
      <Stack.Screen name="HelpingSomeoneProcessEmotionsLesson" component={HelpingSomeoneProcessEmotionsLessonScreen} />
      <Stack.Screen name="DissociationLesson" component={DissociationLessonScreen} />
      <Stack.Screen name="ServeAndReturnLesson" component={ServeAndReturnLessonScreen} />
      <Stack.Screen name="RecordingDeepBondMomentsLesson" component={RecordingDeepBondMomentsLessonScreen} />
    </Stack.Navigator>
  );
};
