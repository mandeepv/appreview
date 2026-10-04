// SPEC-09 Phase 3 — the generic lesson route.
//
// ONE navigator screen renders every data-driven lesson. It reads
// { lessonId, sectionIndex, screenIndex } from the route, resolves the lesson
// via the registry, and hands off to the generic LessonController. Navigation
// is injected so the controller stays wiring-agnostic (see LessonController):
//
//   onAdvance  — push a new LessonScreen with the next indices. Pushing (not
//                replacing) preserves the per-screen Back behaviour the
//                hand-built screens had (each Next was a navigate(), so Back
//                walked back one screen at a time).
//   onBack     — pop one screen (goBack), same as the old per-screen Back.
//   onSectionComplete — leave the lesson: "Stop for tonight" on the done
//                screen, or the close button on any screen. Progress for a
//                finished section is already written by then (for lessons that
//                have a store). We return to wherever the lesson was launched
//                from. The
//                launcher passes `returnTo` in the params: the hub route name
//                for section-based lessons (so completing a section drops back
//                onto that lesson's hub, where the now-completed section shows
//                as done — matching the old getParent()?.goBack()), or
//                'MainTabs' for flow lessons launched directly from the Learn
//                tab (matching the old navigate('MainTabs')). popTo() unwinds
//                the pushed lesson screens back to that route in one step.
//
//   onOpenNode — "Continue" on the done screen: open the next node on the path
//                without a detour through Learn. Goes through the same
//                gateToLesson seam as a tap on the path (INVARIANTS #13).
//
// NEVER touches gate/paywall code — gating happens at the tap site
// (useLessonGate) before a lesson is navigated to, exactly as before.

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { OnboardingColors as C, OnboardingFonts as F, oInk } from '../constants/theme';
import { useLessonGate } from '../hooks/useLessonGate';
import { safeCapture } from '../lib/analytics';
import { getLesson } from './registry';
import { LessonController } from './LessonController';
import type { PathNode } from './units';

type LessonScreenNav = NativeStackNavigationProp<RootStackParamList, 'LessonScreen'>;
type LessonScreenRoute = RouteProp<RootStackParamList, 'LessonScreen'>;

export const LessonScreen: React.FC = () => {
  const navigation = useNavigation<LessonScreenNav>();
  const route = useRoute<LessonScreenRoute>();
  // `entry` marks an OPEN of this lesson rather than an advance within it —
  // onAdvance's pushes below deliberately omit it, which is what keeps
  // lesson_started at once per visit. See LessonController.
  const { lessonId, sectionIndex, screenIndex, returnTo, entry } = route.params;

  const lesson = getLesson(lessonId);
  const { gateToLesson } = useLessonGate();

  const onAdvance = useCallback(
    (next: { sectionIndex: number; screenIndex: number }) => {
      // Push the next screen so Back walks the lesson one screen at a time.
      navigation.push('LessonScreen', {
        lessonId,
        sectionIndex: next.sectionIndex,
        screenIndex: next.screenIndex,
        returnTo,
      });
    },
    [navigation, lessonId, returnTo],
  );

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onSectionComplete = useCallback(() => {
    // Return to the launcher in one step. `returnTo` is a hub route (drop back
    // onto the lesson's hub) or 'MainTabs' (flow lessons). popTo unwinds the
    // pushed lesson screens back to that route without re-mounting intervening
    // ones. Falls back to popToTop if returnTo is somehow absent.
    if (returnTo) {
      // returnTo is always a param-less launcher route (a lesson hub or
      // MainTabs). The popTo overloads are keyed per-route, so a route-name
      // typed as the whole union doesn't match a single overload; the cast
      // targets the param-less form. Runtime value is just the route name.
      navigation.popTo(returnTo as 'MainTabs');
    } else {
      navigation.popToTop();
    }
  }, [navigation, returnTo]);

  const onOpenNode = useCallback(
    (node: PathNode) => {
      // Same event and shape as a tap on the path, so the tapped → started
      // funnel still joins; `source` tells the two doors apart.
      safeCapture('lesson_tapped', {
        lesson_id: node.lessonSlug,
        section_id: node.sectionId,
        path_index: node.index,
        source: 'section_done',
      });
      gateToLesson(`learn_module_${node.lessonSlug}`, () => {
        // Unwind this lesson's pushed screens first, so Back from the next
        // section returns to the path rather than into the one just finished.
        if (returnTo) navigation.popTo(returnTo as 'MainTabs');
        else navigation.popToTop();
        navigation.navigate('LessonScreen', {
          lessonId: node.lessonSlug,
          sectionIndex: node.sectionIndex,
          screenIndex: 0,
          returnTo,
          // An OPEN only when it is a different lesson. Carrying on into the
          // next section of the same one is the same visit, and must not
          // re-fire lesson_started (see LessonController).
          entry: node.lessonSlug !== lessonId,
        });
      });
    },
    [navigation, gateToLesson, lessonId, returnTo],
  );

  if (!lesson) {
    // Defensive: an unknown slug should never reach here (the launch sites use
    // known slugs), but fail visibly in dev rather than crash.
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Lesson not found: {lessonId}</Text>
      </View>
    );
  }

  return (
    <LessonController
      lesson={lesson}
      sectionIndex={sectionIndex}
      screenIndex={screenIndex}
      isEntry={entry === true}
      onAdvance={onAdvance}
      onBack={onBack}
      onSectionComplete={onSectionComplete}
      onOpenNode={onOpenNode}
    />
  );
};

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.paper,
    padding: 24,
  },
  missingText: { fontFamily: F.sans, fontSize: 16, color: oInk(0.7), textAlign: 'center' },
});
