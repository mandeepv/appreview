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
//   onSectionComplete — the section's last screen finished. The controller has
//                already written the progress key (for lessons that have one).
//                We return to wherever the lesson was launched from. The
//                launcher passes `returnTo` in the params: the hub route name
//                for section-based lessons (so completing a section drops back
//                onto that lesson's hub, where the now-completed section shows
//                as done — matching the old getParent()?.goBack()), or
//                'MainTabs' for flow lessons launched directly from the Learn
//                tab (matching the old navigate('MainTabs')). popTo() unwinds
//                the pushed lesson screens back to that route in one step.
//
// NEVER touches gate/paywall code — gating happens at the hub/Learn tap site
// (useLessonGate) before this screen is ever navigated to, exactly as before.

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../constants/theme';
import { getLesson } from './registry';
import { LessonController } from './LessonController';

type LessonScreenNav = NativeStackNavigationProp<RootStackParamList, 'LessonScreen'>;
type LessonScreenRoute = RouteProp<RootStackParamList, 'LessonScreen'>;

export const LessonScreen: React.FC = () => {
  const navigation = useNavigation<LessonScreenNav>();
  const route = useRoute<LessonScreenRoute>();
  const { lessonId, sectionIndex, screenIndex, returnTo } = route.params;

  const lesson = getLesson(lessonId);

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
      onAdvance={onAdvance}
      onBack={onBack}
      onSectionComplete={onSectionComplete}
    />
  );
};

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundGray,
    padding: 24,
  },
  missingText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },
});
