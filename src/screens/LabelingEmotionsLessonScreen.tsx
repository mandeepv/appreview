// SPEC-13 R3 — thin wrapper over the generic LessonHubScreen.
//
// Like the other hubs, this delegates rendering to LessonHubScreen (fed by
// HUB_META) and wires section taps through the gate. It ALSO keeps this
// lesson's one bespoke behaviour: when all 4 sections are complete, redirect to
// the Lesson5Complete congrats screen (gated — completing all sections implies
// entitlement, but the gate is a cheap defence against stale AsyncStorage).

import React, { useCallback, useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getLesson } from '../lessons/registry';
import { LessonHubScreen } from '../lessons/LessonHubScreen';
import { HUB_META } from '../lessons/hubMeta';
import { createProgressStore } from '../lessons/progressStore';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { useLessonGate } from '../hooks/useLessonGate';

const SLUG = 'labelingEmotions';
const GATE_PREFIX = 'labeling';
const RETURN_TO = 'LabelingEmotionsLesson' as const;

export default function LabelingEmotionsLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const lesson = getLesson(SLUG);
  const [completedCount, setCompletedCount] = useState(0);

  // Read progress on focus for the all-complete redirect. The hub itself also
  // reads progress for its badges (via the factory) — this is a small extra
  // read for the completion gate only.
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      createProgressStore(STORAGE_KEYS.LESSON5_COMPLETED_SECTIONS)
        .getCompletedSections()
        .then((c) => {
          if (alive) setCompletedCount(c.length);
        });
      return () => {
        alive = false;
      };
    }, []),
  );

  const allCompleted = lesson ? completedCount === lesson.sections.length : false;
  useFocusEffect(
    useCallback(() => {
      if (allCompleted) {
        gateToLesson('labeling_complete', () => {
          navigation.navigate('Lesson5Complete');
        });
      }
    }, [allCompleted, navigation, gateToLesson]),
  );

  if (!lesson) return null;

  return (
    <LessonHubScreen
      lesson={lesson}
      meta={HUB_META[SLUG]}
      onBack={() => navigation.goBack()}
      onOpenSection={(sectionIndex) => {
        const section = lesson.sections[sectionIndex];
        gateToLesson(`${GATE_PREFIX}_${section.id}`, () => {
          navigation.navigate('LessonScreen', {
            lessonId: SLUG,
            sectionIndex,
            screenIndex: 0,
            returnTo: RETURN_TO,
          });
        });
      }}
    />
  );
}
