/**
 * The Learn path — canvas artboard 29b, with the 30c ending.
 *
 * A single rail of every section in every lesson, 49 nodes deep. The lesson
 * layer is gone from navigation: a node opens its section directly, so the hub
 * screen is no longer on the happy path.
 *
 * Geometry is 29b's: a 22px gutter holding a 1px rail, 9px hollow dots for
 * finished nodes, a 12px filled dot beside tonight's card, 7px faint dots
 * ahead. No left-hand number gutter — the rail is the only left edge.
 *
 * WHAT THE RAIL SHOWS
 *   finished   title + check, scroll back to re-read
 *   tonight    a forest card: eyebrow, title, description, Start
 *   ahead      the next three, named but not openable
 *   beyond     dots only — the rail continues, the titles do not
 *
 * The ending is 30c's: the rail arrives somewhere rather than trailing into a
 * dashed panel or a numbered future. It must never look like something is
 * missing.
 *
 * LOCKED, SEQUENTIALLY. Only a finished node or tonight's opens. Finishing
 * tonight's immediately opens the next — there is no daily drip, so a parent
 * with a free evening can keep going.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useLessonGate } from '../hooks/useLessonGate';
import { safeCapture } from '../lib/analytics';
import { getCompletedPathKeys } from '../lessons/pathProgress';
import { getStreak } from '../lessons/streak';
import { getLesson } from '../lessons/registry';
import {
  visibleNodes,
  nodeState,
  canOpen,
  pathProgress,
  PATH_NODES,
  type PathNode,
} from '../lessons/units';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingRadius as R,
  oInk,
  oCream,
  oClay,
} from '../constants/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Check() {
  return (
    <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={oInk(0.4)}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * The line under tonight's title. Pulled from the section's own first real
 * paragraph, so the card describes the actual content rather than a generic
 * promise that content may not keep.
 */
function describeSection(node: PathNode): string {
  const lesson = getLesson(node.lessonSlug);
  const section = lesson?.sections[node.sectionIndex];
  if (!section) return '';
  for (const screen of section.screens) {
    // A section can end on a `sectionComplete` screen, which carries no blocks.
    if (screen.kind !== 'content') continue;
    for (const block of screen.blocks) {
      // A paragraph's text can be a rich run-array rather than a string; only
      // the plain form is usable as a one-line description.
      if (block.type === 'paragraph' && typeof block.text === 'string') {
        const text = block.text.trim().replace(/\s+/g, ' ');
        if (text.length > 20) {
          return text.length > 120 ? `${text.slice(0, 117).trimEnd()}…` : text;
        }
      }
    }
  }
  return lesson?.title ?? '';
}

/** The streak pill's flame. Clay, the one warm accent in the system. */
function Flame() {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3c.6 3-1.8 4.2-2.6 6.3-.8 2.2.5 3.7.5 3.7s-2-.4-2.4-2.4C6.2 12.9 5.5 14.6 5.5 16a6.5 6.5 0 0013 0c0-4.6-4-6.8-6.5-13z"
        stroke={C.clay}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function LearnScreen() {
  const navigation = useNavigation<Nav>();
  const { gateToLesson } = useLessonGate();
  const [completed, setCompleted] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Scroll the current card into view once the rail is taller than the screen.
  //
  // Finished rows accumulate above it, so by section 10 the one thing the
  // screen exists for has scrolled off the top. `cardY` is captured from the
  // card's own layout rather than computed from row heights, which vary with
  // how many lines a title wraps to.
  const nodes = visibleNodes(completed);
  const progress = pathProgress(completed);
  const allDone = progress.done >= PATH_NODES.length;

  const openNode = (node: PathNode) => {
    if (!canOpen(node, completed)) return;

    // Analytics keep the established shape: slug as lesson_id so the tapped →
    // started funnel joins the engine's events. `lesson_started` is still fired
    // by the engine, never here — firing it on tap counted paywall bounces as
    // lesson starts (Fable review #8, SPEC-13 R5).
    safeCapture('lesson_tapped', {
      lesson_id: node.lessonSlug,
      section_id: node.sectionId,
      path_index: node.index,
    });

    // The gate placement key stays `learn_module_<lessonSlug>` — a Superwall
    // dashboard identifier, not a local string.
    gateToLesson(`learn_module_${node.lessonSlug}`, () => {
      navigation.navigate('LessonScreen', {
        lessonId: node.lessonSlug,
        sectionIndex: node.sectionIndex,
        screenIndex: 0,
        returnTo: 'MainTabs',
      });
    });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Kinderwell</Text>
        {/* The pill appears only from two days. At 0 or 1 there is no streak to
            speak of, and showing "1" or "0" to a parent who missed a night
            turns a neutral screen into a scoreboard. */}
        {streak >= 2 ? (
          <View style={styles.streakPill}>
            <Flame />
            <Text style={styles.streakCount}>{streak}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        {nodes.map((node) => {
          const state = nodeState(node, completed);

          if (state === 'current') {
            return (
              <View key={node.key} style={styles.row}>
                <View style={styles.gutter}>
                  <View style={styles.railLine} />
                  <View style={styles.dotCurrent} />
                </View>
                <View style={styles.cardWrap}>
                  <Pressable
                    onPress={() => openNode(node)}
                    accessibilityRole="button"
                    accessibilityLabel={`Tonight: ${node.title}`}
                    style={({ pressed }) => [styles.card, pressed ? { opacity: 0.92 } : null]}
                  >
                    <Text style={styles.cardEyebrow}>TONIGHT · FIVE MINUTES</Text>
                    <Text style={styles.cardTitle}>{node.title}</Text>
                    <Text style={styles.cardBody}>{describeSection(node)}</Text>
                    <View style={styles.cardButton}>
                      <Text style={styles.cardButtonLabel}>Start</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            );
          }

          if (state === 'done') {
            return (
              <Pressable
                key={node.key}
                onPress={() => openNode(node)}
                accessibilityRole="button"
                accessibilityLabel={node.title}
                style={({ pressed }) => [styles.row, pressed ? { opacity: 0.6 } : null]}
              >
                <View style={styles.gutter}>
                  <View style={styles.railLine} />
                  <View style={styles.dotDone} />
                </View>
                <View style={styles.doneRow}>
                  <Text style={styles.doneTitle}>{node.title}</Text>
                  <Check />
                </View>
              </Pressable>
            );
          }

          // 'ahead' is named but inert; 'locked' is the rail continuing with no
          // title at all. Neither is pressable — a locked node that swallows a
          // tap is worse than one that plainly does not invite it.
          return (
            <View key={node.key} style={styles.row}>
              <View style={styles.gutter}>
                <View style={styles.railLineFaint} />
                <View style={styles.dotAhead} />
              </View>
              <View style={styles.aheadRow}>
                {state === 'ahead' ? <Text style={styles.aheadTitle}>{node.title}</Text> : null}
              </View>
            </View>
          );
        })}

        {/* The rail arriving somewhere — 30c. Not a dashed panel, not a
            numbered future; both read as unfinished. */}
        <View style={styles.endRow}>
          <View style={styles.gutter} />
          <View style={styles.end}>
            <Text style={styles.endText}>
              {allDone ? "You've finished every one." : 'The rest gets written as you go.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const GUTTER = 22;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: oInk(0.1),
  },
  // Serif, sentence case — the masthead of a book rather than a product label.
  wordmark: { fontFamily: F.serif, fontSize: 26, letterSpacing: -0.4, color: C.ink },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: oClay(0.12),
  },
  streakCount: { fontFamily: F.sansSemi, fontSize: 14, color: C.clayDeep },

  scroll: { flex: 1 },
  // flexGrow + centred: on day one the rail is a handful of rows and pinning
  // it to the top left the card stranded under the masthead with the screen
  // empty beneath. Once the rail outgrows the viewport this has no effect and
  // it scrolls normally from the top.
  scrollInner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingBottom: 40,
  },

  row: { flexDirection: 'row' },
  gutter: { width: GUTTER, flexShrink: 0, position: 'relative' },
  railLine: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: oInk(0.2),
  },
  railLineFaint: {
    position: 'absolute',
    left: 5,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: oInk(0.14),
  },

  dotDone: {
    position: 'absolute',
    left: 1.5,
    top: 24,
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: oInk(0.4),
  },
  dotCurrent: {
    position: 'absolute',
    left: 0,
    top: 30,
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: C.forest,
  },
  dotAhead: {
    position: 'absolute',
    left: 2.5,
    top: 26,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: oInk(0.22),
  },

  doneRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
    paddingLeft: 14,
  },
  doneTitle: { flex: 1, fontFamily: F.serif, fontSize: 17, lineHeight: 17 * 1.4, color: oInk(0.7) },

  aheadRow: { flex: 1, paddingVertical: 19, paddingLeft: 14, minHeight: 20 },
  aheadTitle: { fontFamily: F.serif, fontSize: 17, lineHeight: 17 * 1.4, color: oInk(0.62) },

  cardWrap: { flex: 1, paddingVertical: 8, paddingLeft: 14 },
  card: {
    backgroundColor: C.forest,
    borderRadius: R.card,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
  },
  cardEyebrow: {
    fontFamily: F.monoMed,
    fontSize: 11,
    letterSpacing: 11 * 0.1,
    color: oCream(0.72),
  },
  cardTitle: {
    fontFamily: F.sansSemi,
    fontSize: 25,
    lineHeight: 25 * 1.22,
    letterSpacing: -0.65,
    color: C.cream,
    marginTop: 12,
  },
  cardBody: {
    fontFamily: F.serif,
    fontSize: 16,
    lineHeight: 16 * 1.55,
    color: oCream(0.82),
    marginTop: 9,
  },
  cardButton: {
    height: 50,
    borderRadius: 999,
    backgroundColor: C.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  cardButtonLabel: { fontFamily: F.sansSemi, fontSize: 16, color: C.forest },

  endRow: { flexDirection: 'row' },
  end: { flex: 1, paddingLeft: 14, paddingTop: 14 },
  endText: { fontFamily: F.serifItalic, fontSize: 15, lineHeight: 15 * 1.5, color: oInk(0.5) },
});
