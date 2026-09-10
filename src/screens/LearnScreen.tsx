/**
 * The Learn path — canvas artboards 21a / 21b.
 *
 * Replaces a flat list of thirteen lesson cards. A list asks a tired parent to
 * choose; a path asks them to continue. The lessons and their order are
 * unchanged (see src/lessons/units.ts) — the units are a grouping over the
 * existing sequence, and every node still navigates through LESSON_NAV and the
 * paywall gate exactly as the list did.
 *
 * NOTHING IS LOCKED. This is a subscription app: a parent who wants lesson nine
 * tonight gets lesson nine. The path emphasises ONE next step and leaves every
 * other lesson openable. "Next" is an invitation, not a gate — locking content
 * someone has paid for is a support ticket and a refund.
 *
 * Node states, per the canvas:
 *   done       filled forest disc with a check
 *   next       thick forest ring, and the row expands into a forest card
 *   available  thin forest ring (the lesson has been opened, or follows next)
 *   untouched  hairline ink ring
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { LESSON_NAV } from '../navigation/lessonRoutes';
import { useLessonGate } from '../hooks/useLessonGate';
import { safeCapture } from '../lib/analytics';
import { getCompletedLessons } from '../lessons/lessonCompletion';
import { PATH_UNITS, PATH_LESSONS, resolveNextLesson, unitProgress } from '../lessons/units';
import type { PathLesson } from '../lessons/units';
import { getLesson } from '../lessons/registry';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingRadius as R,
  oInk,
  oCream,
} from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Check({ size = 14 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={C.cream}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** "Four sections · about 6 minutes" — read from the lesson's real content. */
function describeLesson(slug: string): string {
  const lesson = getLesson(slug);
  if (!lesson) return '';
  const count = lesson.sections.length;
  const screens = lesson.sections.reduce((n, s) => n + s.screens.length, 0);
  // ~8 screens a minute, rounded to something a parent can plan around. A
  // deliberately soft estimate — "about" is doing real work in that sentence.
  const minutes = Math.max(2, Math.round(screens / 8));
  const sectionWord = count === 1 ? 'One section' : `${count} sections`;
  return `${sectionWord} · about ${minutes} minutes`;
}

export default function LearnScreen() {
  const navigation = useNavigation<Nav>();
  const { gateToLesson } = useLessonGate();
  const [completed, setCompleted] = useState<string[]>([]);

  // Re-read on focus: a lesson finished and backed out of must show its check
  // immediately, not after a relaunch.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getCompletedLessons().then((slugs) => {
        if (!cancelled) setCompleted(slugs);
      });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const next = resolveNextLesson(completed);
  const doneCount = completed.filter((s) => PATH_LESSONS.some((l) => l.slug === s)).length;

  const openLesson = (lesson: PathLesson) => {
    const target = LESSON_NAV[lesson.id];
    if (!target) return;

    // Analytics unchanged from the list this screen replaces. SPEC-FIX-03 R4:
    // send the registry SLUG as `lesson_id` so the tapped → started funnel
    // joins (engine events key on the slug); the numeric id rides along as
    // `lesson_number`.
    //
    // lesson_tapped is the INTENT event and fires on tap. `lesson_started` is
    // fired by the engine at the true "opened" moment (LessonHubScreen for hub
    // lessons, LessonController for flow lessons) — firing it here too would
    // double-count paywall bounces as lesson starts, which is the exact bug
    // Fable review #8 fixed. SPEC-13 R5.
    safeCapture('lesson_tapped', {
      lesson_id: target.slug,
      lesson_number: lesson.id,
      lesson_title: lesson.title,
    });

    // The gate placement key must stay `learn_module_<id>` — it is a Superwall
    // placement identifier configured in the dashboard, not a local string.
    gateToLesson(`learn_module_${lesson.id}`, () => {
      if (target.kind === 'data') {
        // Flow lessons (1-4): the generic data-driven lesson, first screen.
        // returnTo is load-bearing — without it the lesson has nowhere to
        // return on completion.
        navigation.navigate('LessonScreen', {
          lessonId: target.lessonId,
          sectionIndex: 0,
          screenIndex: 0,
          returnTo: 'MainTabs',
        });
      } else {
        navigation.navigate(target.name);
      }
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your path</Text>
        <Text style={styles.headerCount}>{`${doneCount} of ${PATH_LESSONS.length} done`}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {PATH_UNITS.map((unit, unitIndex) => {
          const progress = unitProgress(unit, completed);
          return (
            <View key={unit.id} style={unitIndex > 0 ? styles.unitSpacer : undefined}>
              <View style={styles.unitHeader}>
                <Text style={styles.unitName}>{`Unit ${unitIndex + 1} · ${unit.name}`}</Text>
                <View style={styles.unitRule} />
                <Text
                  style={[
                    styles.unitCount,
                    progress.done > 0 ? styles.unitCountActive : null,
                  ]}
                >
                  {`${progress.done}/${progress.total}`}
                </Text>
              </View>

              <View style={styles.rail}>
                {/* The connecting line. Sits behind the nodes and stops short
                    of the last one so the path does not trail into nothing. */}
                <View style={styles.railLine} />

                {unit.lessons.map((lesson) => {
                  const isDone = completed.includes(lesson.slug);
                  const isNext = lesson.slug === next?.slug;

                  return (
                    <View key={lesson.id} style={styles.node}>
                      <View
                        style={[
                          styles.dot,
                          isDone
                            ? styles.dotDone
                            : isNext
                              ? styles.dotNext
                              : styles.dotIdle,
                        ]}
                      >
                        {isDone ? <Check /> : null}
                      </View>

                      {isNext ? (
                        <Pressable
                          onPress={() => openLesson(lesson)}
                          accessibilityRole="button"
                          accessibilityLabel={`Continue: ${lesson.title}`}
                          style={({ pressed }) => [
                            styles.nextCard,
                            pressed ? { opacity: 0.9 } : null,
                          ]}
                        >
                          <Text style={styles.nextEyebrow}>PICK UP HERE</Text>
                          <Text style={styles.nextTitle}>{lesson.title}</Text>
                          <Text style={styles.nextMeta}>{describeLesson(lesson.slug)}</Text>
                          <View style={styles.nextButton}>
                            <Text style={styles.nextButtonLabel}>Continue</Text>
                          </View>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => openLesson(lesson)}
                          accessibilityRole="button"
                          accessibilityLabel={lesson.title}
                          style={({ pressed }) => [
                            styles.row,
                            pressed ? { opacity: 0.6 } : null,
                          ]}
                        >
                          <Text style={[styles.rowTitle, isDone ? styles.rowTitleDone : null]}>
                            {lesson.title}
                          </Text>
                          <Text style={styles.rowMeta}>
                            {isDone ? 'Done' : describeLesson(lesson.slug)}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const DOT = 26;
const RAIL_INSET = 40;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTitle: { fontFamily: F.serif, fontSize: 27, letterSpacing: -0.4, color: C.ink },
  headerCount: { fontFamily: F.sansMed, fontSize: 14, color: C.forestDeep },

  scroll: { flex: 1 },
  scrollInner: { paddingHorizontal: 30, paddingBottom: 40 },
  unitSpacer: { marginTop: 22 },

  unitHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14 },
  unitName: { fontFamily: F.serif, fontSize: 19, color: oInk(0.74) },
  unitRule: { flex: 1, height: 1, backgroundColor: oInk(0.14) },
  unitCount: { fontFamily: F.sansMed, fontSize: 13, color: oInk(0.72) },
  unitCountActive: { color: C.forestDeep },

  rail: { position: 'relative', paddingLeft: RAIL_INSET },
  railLine: {
    position: 'absolute',
    left: DOT / 2 - 1,
    top: 4,
    bottom: 18,
    width: 2,
    backgroundColor: oInk(0.12),
  },

  node: { position: 'relative', paddingBottom: 20 },
  dot: {
    position: 'absolute',
    left: -RAIL_INSET,
    top: 0,
    width: DOT,
    height: DOT,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.paper,
  },
  dotDone: { backgroundColor: C.forest },
  // The next node's ring is thick so it reads as the one live thing on screen
  // even before the card beneath it registers.
  dotNext: { borderWidth: 3, borderColor: C.forest, top: 22 },
  dotIdle: { borderWidth: 1.5, borderColor: oInk(0.26) },

  row: { paddingRight: 4 },
  rowTitle: { fontFamily: F.serif, fontSize: 19, lineHeight: 19 * 1.35, color: C.ink },
  rowTitleDone: { color: oInk(0.7) },
  rowMeta: { fontFamily: F.sansMed, fontSize: 14, color: oInk(0.72), marginTop: 3 },

  nextCard: { backgroundColor: C.forest, borderRadius: R.card, padding: 22, marginTop: 4 },
  nextEyebrow: {
    fontFamily: F.monoMed,
    fontSize: 12,
    letterSpacing: 12 * 0.05,
    color: C.mint,
  },
  nextTitle: {
    fontFamily: F.serif,
    fontSize: 24,
    lineHeight: 24 * 1.28,
    color: C.cream,
    marginTop: 10,
  },
  nextMeta: {
    fontFamily: F.serif,
    fontSize: 17,
    lineHeight: 17 * 1.5,
    color: oCream(0.9),
    marginTop: 8,
  },
  nextButton: {
    height: 48,
    borderRadius: 999,
    backgroundColor: C.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  nextButtonLabel: { fontFamily: F.sansSemi, fontSize: 17, color: C.forestDeep },
});
