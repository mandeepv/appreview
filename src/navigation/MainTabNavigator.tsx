/**
 * The tab bar — restyled onto the cream/forest system (canvas 29b).
 *
 * It was white with a hot-pink active tint (#E94B8F) that belonged to neither
 * the old teal palette nor the new one, sitting directly under a cream screen.
 *
 * Tab labels are "Learn" and "Profile". The canvas called the first one "Path",
 * but the word only makes sense once you have seen the screen — "Learn" says
 * what you go there to do. "You" was similarly clever and similarly unclear;
 * "Profile" is the word every other app uses for that tab, and a tab bar is the
 * last place to be original.
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
import { View, StyleSheet } from 'react-native';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  oInk,
  oForest,
} from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** A winding road — the path, drawn rather than an icon-font glyph. */
function PathIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <SvgPath
        d="M6 21V9a4 4 0 018 0v6a4 4 0 008 0V3"
        stroke={color}
        strokeWidth={focused ? 2.8 : 2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** A person — account and settings. */
function YouIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={focused ? 2.8 : 2.1} />
      <SvgPath
        d="M4 21c0-4 3.6-6 8-6s8 2 8 6"
        stroke={color}
        strokeWidth={focused ? 2.8 : 2.1}
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
        // The selected tab used to be marked by COLOUR ALONE, on a 23px
        // outline icon — at a glance the two tabs looked identical, and colour
        // alone is also the one cue a colour-blind user cannot read. Now the
        // active tab sits in a tinted pill, the icon is larger, and its stroke
        // thickens. Three cues instead of one.
        tabBarIcon: ({ color, focused }) => {
          const Icon = route.name === 'Learn' ? PathIcon : YouIcon;
          return (
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Icon color={color} focused={focused} />
            </View>
          );
        },
        tabBarActiveTintColor: C.forest,
        tabBarInactiveTintColor: oInk(0.45),
        tabBarStyle: {
          backgroundColor: C.paper,
          borderTopWidth: 1,
          borderTopColor: oInk(0.12),
          paddingTop: 9,
          height: 88,
        },
        tabBarLabelStyle: {
          fontFamily: F.sansSemi,
          // 11 was small enough to read as a caption rather than a control.
          fontSize: 12,
          marginTop: 4,
        },
        tabBarItemStyle: { paddingTop: 2 },
        headerShown: false,
      })}
      initialRouteName="Learn"
    >
      {/* Route name stays "Learn" — it is referenced by MainTabParamList and by
          navigation calls elsewhere. Only the label the user reads changes. */}
      <Tab.Screen name="Learn" component={LearnScreen} options={{ tabBarLabel: 'Learn' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // The pill behind the active icon. Sized so a 26px icon has breathing room on
  // all four sides; the inactive state keeps the SAME box so nothing shifts
  // when the selection moves — only the background appears.
  iconWrap: {
    width: 62,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: oForest(0.12) },
});
