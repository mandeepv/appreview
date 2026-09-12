/**
 * The tab bar — restyled onto the cream/forest system (canvas 29b).
 *
 * It was white with a hot-pink active tint (#E94B8F) that belonged to neither
 * the old teal palette nor the new one, sitting directly under a cream screen.
 *
 * "Learn" is now "Path", matching what the screen actually is and what the
 * canvas labels it.
 *
 * The canvas also shows a third tab, "Saved". There is nothing to save in the
 * app yet, so it is deliberately NOT here — a tab that opens an empty screen is
 * worse than one that doesn't exist. Add it when bookmarking does.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path as SvgPath, Circle } from 'react-native-svg';
import LearnScreen from '../screens/LearnScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { MainTabParamList } from './types';
import { OnboardingColors as C, OnboardingFonts as F, oInk } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** A winding road — the path, drawn rather than an icon-font glyph. */
function PathIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <SvgPath
        d="M6 21V9a4 4 0 018 0v6a4 4 0 008 0V3"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A person — account and settings. */
function YouIcon({ color }: { color: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={2.2} />
      <SvgPath
        d="M4 21c0-4 3.6-6 8-6s8 2 8 6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          const Icon = route.name === 'Learn' ? PathIcon : YouIcon;
          return <Icon color={color} />;
        },
        tabBarActiveTintColor: C.forest,
        tabBarInactiveTintColor: oInk(0.45),
        tabBarStyle: {
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: oInk(0.12),
          paddingTop: 11,
          height: 84,
        },
        tabBarLabelStyle: {
          fontFamily: F.sansSemi,
          fontSize: 11,
          marginTop: 5,
        },
        headerShown: false,
      })}
      initialRouteName="Learn"
    >
      {/* Route name stays "Learn" — it is referenced by MainTabParamList and by
          navigation calls elsewhere. Only the label the user reads changes. */}
      <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarLabel: 'Path' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'You' }} />
    </Tab.Navigator>
  );
}
