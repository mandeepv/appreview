// SPEC-13 R3 — thin wrapper over the generic LessonHubScreen.
//
// The hand-built hub was replaced by the data-driven LessonHubScreen (fed by
// HUB_META for pixel-parity). This wrapper supplies the lesson + meta and wires
// section taps through the gate — the paywall seam (useLessonGate) is preserved.

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getLesson } from '../lessons/registry';
import { LessonHubScreen } from '../lessons/LessonHubScreen';
import { HUB_META } from '../lessons/hubMeta';
import { useLessonGate } from '../hooks/useLessonGate';

const SLUG = 'dissociation';
const GATE_PREFIX = 'dissociation';
const RETURN_TO = 'DissociationLesson' as const;

export default function DissociationLessonScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { gateToLesson } = useLessonGate();
  const lesson = getLesson(SLUG);
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
