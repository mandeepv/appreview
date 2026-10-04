/**
 * The end of a section — and, when it is the last one, the end of a lesson.
 *
 * WHAT THIS REPLACES. Finishing a section used to do one of two things. One
 * section in forty-nine (Sprinklers §1) ended on a white "Sublesson complete"
 * card; every other section's last Next simply dropped the parent back onto
 * the Learn path mid-thought, where they had to find the card and press Start
 * again to carry on. A whole lesson finished with no moment at all.
 *
 * Now every section ends here, and there are exactly two ways out:
 *
 *   Continue            straight into the next node on the path — no detour
 *                       through Learn when a parent has the evening for more
 *   Stop for tonight    back to the path. A real choice, not a failure: the
 *                       product is five minutes a night, and stopping after
 *                       one section is the design working.
 *
 * Two weights, on purpose. A SECTION is a small beat and stays on paper. A
 * LESSON is a forest takeover — the one place the app changes surface to mark
 * something — with a receipt of the parts the parent just worked through.
 *
 * Progress is already written by the time this renders (the controller writes
 * it before showing this, or on the button press for a content-authored
 * `sectionComplete` screen). This view only reads the path to decide what
 * "Continue" leads to.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LessonShell } from './LessonShell';
import { getCompletedPathKeys } from '../pathProgress';
import { PATH_NODES, canOpen, shortLessonName, type PathNode } from '../units';
import type { Lesson } from '../schema';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  OnboardingLayout as L,
  oInk,
  oCream,
} from '../../constants/theme';

type Props = {
  lesson: Lesson;
  sectionIndex: number;
  /** Content-authored copy, when the section ends on a `sectionComplete`
   *  screen. Absent for sections that end on an ordinary content screen. */
  authored?: { title: string; text: string; nextPreview?: string };
  onBack?: () => void;
  onClose: () => void;
  /** Open the next node on the path. */
  onContinue: (next: PathNode) => void;
  /** Back to the path. */
  onStop: () => void;
};

/** "The Importance of\nLabeling Emotions" — one content title carries a line
 *  break from its old two-line hub layout. */
const oneLine = (s: string) => s.replace(/\s*\n\s*/g, ' ');

export function SectionDone({
  lesson,
  sectionIndex,
  authored,
  onBack,
  onClose,
  onContinue,
  onStop,
}: Props) {
  const section = lesson.sections[sectionIndex];
  const here = PATH_NODES.find(
    (n) => n.lessonSlug === lesson.slug && n.sectionIndex === sectionIndex,
  );
  const nextNode = here ? PATH_NODES[here.index + 1] : undefined;

  // null until read. Reading is one AsyncStorage round-trip per lesson; until
  // it lands the buttons wait rather than offering a Continue that might be
  // taken away a frame later.
  const [completed, setCompleted] = useState<string[] | null>(null);
  useEffect(() => {
    let live = true;
    getCompletedPathKeys()
      .then((keys) => live && setCompleted(keys))
      .catch(() => live && setCompleted([]));
    return () => {
      live = false;
    };
  }, []);

  const loaded = completed !== null;
  const done = new Set(completed ?? []);
  const lessonDone = lesson.sections.every((s) =>
    done.has(`${lesson.slug}#${s.id}`),
  );
  const canContinue = loaded && nextNode !== undefined && canOpen(nextNode, completed ?? []);

  const upNext = canContinue && nextNode ? nextNode : undefined;

  if (loaded && lessonDone) {
    return (
      <LessonComplete
        lesson={lesson}
        next={upNext}
        onContinue={upNext ? () => onContinue(upNext) : undefined}
        onStop={onStop}
      />
    );
  }

  return (
    <LessonShell
      progress={1}
      onBack={onBack}
      onClose={onClose}
      cta={
        !loaded
          ? { label: 'Continue', onPress: () => {}, disabled: true }
          : upNext
            ? { label: 'Continue', onPress: () => onContinue(upNext) }
            : { label: 'Back to my path', onPress: onStop }
      }
      secondary={upNext ? { label: 'Stop for tonight', onPress: onStop } : undefined}
    >
      <View style={styles.tickDisc}>
        <Tick color={C.cream} size={18} />
      </View>
      {/* NO COUNTS. "Part 2 of 5" states the size of a lesson, and lessons are
          being added to and restructured — the same reason the Learn path
          shows no totals. The section's own title is the headline; the one
          authored end screen's title ("Sublesson complete") is jargon, so only
          its body text is used. */}
      <Text style={styles.eyebrow}>{`${shortLessonName(lesson.slug).toUpperCase()} · DONE`}</Text>
      <Text style={styles.headline}>{oneLine(section?.title ?? '')}</Text>
      {authored?.text ? <Text style={styles.body}>{authored.text}</Text> : null}

      {upNext ? (
        <View style={styles.next}>
          <Text style={styles.nextLabel}>
            {upNext.lessonSlug === lesson.slug
              ? 'UP NEXT'
              : `UP NEXT · ${shortLessonName(upNext.lessonSlug).toUpperCase()}`}
          </Text>
          <Text style={styles.nextTitle}>{upNext.title}</Text>
        </View>
      ) : null}
    </LessonShell>
  );
}

/** The forest takeover. */
function LessonComplete({
  lesson,
  next,
  onContinue,
  onStop,
}: {
  lesson: Lesson;
  next?: PathNode;
  onContinue?: () => void;
  onStop: () => void;
}) {
  const insets = useSafeAreaInsets();
  const parts = lesson.sections.length > 1 ? lesson.sections : [];

  return (
    <View style={[styles.takeover, { paddingTop: insets.top + 40 }]}>
      <StatusBar style="light" />
      {/* A one-section lesson has no receipt, and with the title pinned to the
          top the field below it was a large empty green block. Without a
          receipt the title group sits in the middle instead.
          Scrollable, because Communication Mistakes' receipt is thirteen rows
          and with the tonight panel below it the body outgrows the phone. */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.takeoverBody, parts.length === 0 && styles.takeoverBodyCentred]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tkDisc}>
          <Tick color={C.forestDeep} size={22} />
        </View>
        <Text style={styles.tkEyebrow}>LESSON COMPLETE</Text>
        <Text style={styles.tkTitle}>{oneLine(lesson.title)}</Text>

        {/* The receipt: what the parent actually worked through, not a
            generic "Great job". Single-section lessons skip it — a list of one
            item that repeats the title above it says nothing. */}
        {parts.length > 0 ? (
          <View style={styles.receipt}>
            {parts.map((s) => (
              <View key={s.id} style={styles.receiptRow}>
                <Tick color={C.mint} size={14} />
                <Text style={styles.receiptText}>{oneLine(s.title)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* The one thing to try tonight. Every lesson carries one (owner rule,
            2026-09): understanding alone fades by breakfast, a small action is
            what makes a lesson stick. It sits in the takeover rather than on a
            content screen so it lands in the same place for every lesson, at
            the moment the parent has just finished. */}
        {lesson.tonight ? (
          <View style={styles.tonight}>
            <Text style={styles.tonightLabel}>TRY THIS TONIGHT</Text>
            <Text style={styles.tonightText}>{lesson.tonight}</Text>
          </View>
        ) : null}
      </ScrollView>

      {next ? (
        <View style={styles.tkNext}>
          <Text style={styles.tkNextLabel}>
            {`UP NEXT · ${shortLessonName(next.lessonSlug).toUpperCase()}`}
          </Text>
          <Text style={styles.tkNextTitle}>{next.title}</Text>
        </View>
      ) : null}

      <View style={[styles.tkFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable
          onPress={onContinue ?? onStop}
          accessibilityRole="button"
          style={({ pressed }) => [styles.tkPill, pressed ? { opacity: 0.88 } : null]}
        >
          <Text style={styles.tkPillLabel}>{onContinue ? 'Keep going' : 'Back to my path'}</Text>
        </Pressable>
        {onContinue ? (
          <Pressable onPress={onStop} hitSlop={10} accessibilityRole="button" style={styles.tkSecondary}>
            <Text style={styles.tkSecondaryLabel}>Stop for tonight</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function Tick({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  tickDisc: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: C.forest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  eyebrow: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.08,
    color: C.clayDeep,
    marginBottom: -10,
  },
  headline: {
    fontFamily: F.serif,
    fontSize: T.h1,
    lineHeight: T.h1 * 1.2,
    letterSpacing: -0.45,
    color: C.ink,
  },
  body: { fontFamily: F.serif, fontSize: 18, lineHeight: 18 * 1.6, color: oInk(0.8) },
  next: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: oInk(0.14),
    paddingTop: 18,
    gap: 6,
  },
  nextLabel: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.08,
    color: oInk(0.5),
  },
  nextTitle: { fontFamily: F.serif, fontSize: 20, lineHeight: 20 * 1.35, color: C.ink },

  takeover: { flex: 1, backgroundColor: C.forestDeep },
  flex: { flex: 1 },
  takeoverBody: { flexGrow: 1, paddingHorizontal: L.screenPad, paddingBottom: 24, gap: 18 },
  takeoverBodyCentred: { justifyContent: 'center' },
  tkDisc: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tkEyebrow: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.1,
    color: C.mint,
  },
  tkTitle: {
    fontFamily: F.serif,
    fontSize: 36,
    lineHeight: 36 * 1.15,
    letterSpacing: -0.6,
    color: C.cream,
  },
  receipt: { gap: 12, marginTop: 8 },
  receiptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  receiptText: {
    flex: 1,
    fontFamily: F.serif,
    fontSize: 17,
    lineHeight: 17 * 1.45,
    color: oCream(0.86),
    marginTop: -3,
  },
  tonight: {
    marginTop: 14,
    backgroundColor: oCream(0.08),
    borderRadius: R.callout,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 8,
  },
  tonightLabel: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.08,
    color: C.mint,
  },
  tonightText: { fontFamily: F.serif, fontSize: 18, lineHeight: 18 * 1.45, color: C.cream },
  tkNext: {
    marginHorizontal: L.screenPad,
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: oCream(0.16),
    paddingTop: 18,
    gap: 6,
  },
  tkNextLabel: {
    fontFamily: F.monoMed,
    fontSize: 11.5,
    letterSpacing: 11.5 * 0.08,
    color: oCream(0.6),
  },
  tkNextTitle: { fontFamily: F.serif, fontSize: 20, lineHeight: 20 * 1.35, color: C.cream },
  tkFooter: { paddingHorizontal: L.screenPad, paddingTop: 10 },
  tkPill: {
    height: L.buttonHeight,
    borderRadius: R.pill,
    backgroundColor: C.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tkPillLabel: { fontFamily: F.sansSemi, fontSize: T.ui, color: C.forestDeep },
  tkSecondary: { alignSelf: 'center', marginTop: 16, paddingVertical: 4 },
  tkSecondaryLabel: { fontFamily: F.sansMed, fontSize: T.uiSm, color: oCream(0.72) },
});
