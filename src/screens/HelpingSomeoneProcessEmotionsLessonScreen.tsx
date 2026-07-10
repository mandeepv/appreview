// SPEC-13 R3 — thin wrapper over the generic LessonHubScreen.
//
// NOTE: this hub is DISPLAY-ONLY, preserving its pre-existing behaviour. The
// hand-built version rendered its sub-lesson cards as plain (non-tappable)
// views — the lesson content was never reachable from this hub in the shipped
// app (a pre-existing state, not changed by SPEC-13). We keep that: onOpenSection
// is a no-op, so tapping a section does nothing (no navigation, no gate call).
// Minor visual delta vs. the old plain-View cards: LessonHubScreen uses
// TouchableOpacity, so a tap shows a brief opacity flash but goes nowhere.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getLesson } from '../lessons/registry';
import { LessonHubScreen } from '../lessons/LessonHubScreen';
import { HUB_META } from '../lessons/hubMeta';

const SLUG = 'helpingProcessEmotions';

export default function HelpingSomeoneProcessEmotionsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const lesson = getLesson(SLUG);
  if (!lesson) return null;

  return (
    <LessonHubScreen
      lesson={lesson}
      meta={HUB_META[SLUG]}
      onBack={() => navigation.goBack()}
      // Display-only: sections are not launchable (pre-existing behaviour).
      onOpenSection={() => {}}
    />
  );
}
