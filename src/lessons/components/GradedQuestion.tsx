/**
 * One graded question, three content shapes.
 *
 * The lesson content has three question blocks — `quiz` (single answer),
 * `multiSelectQuiz` (check all that apply) and `interactiveQuiz` (single answer
 * inside a content screen) — and they used to be three components with three
 * looks and three rules. This is one component with one rule:
 *
 *   ANSWER ONCE, THEN SEE THE ANSWER.
 *
 * The old single-answer quiz flashed "Try again" for 800ms and cleared the
 * pick, so a parent guessed until they hit the right one without ever being
 * told why the others were wrong. The multi-select version was worse: two of
 * three right answers painted BOTH correct picks in the error colour and then
 * wiped every box — punishing the answers they had got right and teaching
 * nothing. Guess-until-correct measures persistence, not understanding.
 *
 * Now the first answer is final: the parent's pick is marked, the right
 * answer is shown, the explanation appears, and Continue lights up. A miss is
 * never red — this is a parenting app, and getting a question about your own
 * child "wrong" at 9pm is tender, not a failure state. The miss is a quiet
 * outline; the answer is the thing in colour.
 *
 * Content's `isCorrect` flags and single feedback string are used as-is; the
 * feedback is written as an explanation of the answer, which reads correctly
 * whichever way the parent answered.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useScrollLessonToEnd } from './LessonShell';
import {
  OnboardingColors as C,
  OnboardingFonts as F,
  OnboardingType as T,
  OnboardingRadius as R,
  OnboardingLayout as L,
  oInk,
  oCream,
  oForest,
} from '../../constants/theme';

type Option = { label: string; isCorrect: boolean };

/**
 * About 35 feedback strings open with a verdict — "Correct!", "Exactly.",
 * "Right." — written when the only way to see feedback was to answer
 * correctly. Under answer-once, a parent who missed would read "NOT QUITE"
 * over "Correct! …". The verdict line above the text says right or wrong now,
 * so the leading word is dropped here rather than contradicting it. (The
 * content can lose these words too; see the content review.) Punctuation is
 * required, so a sentence that merely starts "Right after…" is untouched.
 */
const VERDICT_PREFIX = /^(correct|exactly|right|that['’]s right)[!.]\s*/i;
export const explanationOf = (feedback: string) => feedback.replace(VERDICT_PREFIX, '');

type Props = {
  mode: 'single' | 'multi';
  /** "QUESTION 1 OF 3" — omitted for the inline (interactiveQuiz) form. */
  eyebrow?: string;
  question: string;
  options: Option[];
  feedback: string;
  /** Fires once, when the answer is revealed. Gates the screen's Continue. */
  onAnswered: () => void;
  /**
   * Multi-select only. The screen's pinned pill doubles as "Check answer"
   * before the reveal (two stacked primary buttons would ask the parent which
   * one to press), so the question hands its check action up to the screen.
   * Called with null once there is nothing left to check.
   */
  registerCheck?: (check: (() => void) | null, canCheck: boolean) => void;
};

export function GradedQuestion({
  mode,
  eyebrow,
  question,
  options,
  feedback,
  onAnswered,
  registerCheck,
}: Props) {
  const [picked, setPicked] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const scrollToEnd = useScrollLessonToEnd();

  const reveal = React.useCallback(() => {
    setRevealed(true);
    onAnswered();
    scrollToEnd();
  }, [onAnswered, scrollToEnd]);

  // Multi-select: publish the check action whenever the selection changes.
  useEffect(() => {
    if (mode !== 'multi' || !registerCheck) return;
    registerCheck(revealed ? null : reveal, picked.length > 0);
  }, [mode, registerCheck, revealed, reveal, picked.length]);

  const press = (i: number) => {
    if (revealed) return;
    if (mode === 'single') {
      setPicked([i]);
      reveal();
      return;
    }
    setPicked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  const correctSet = options.map((o, i) => (o.isCorrect ? i : -1)).filter((i) => i >= 0);
  const gotItRight =
    picked.length === correctSet.length && picked.every((i) => options[i].isCorrect);

  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.question}>{question}</Text>
      {mode === 'multi' ? <Text style={styles.instruction}>Choose all that apply.</Text> : null}

      <View style={styles.options}>
        {options.map((opt, i) => (
          <AnswerRow
            key={i}
            label={opt.label}
            mode={mode}
            state={rowState(opt.isCorrect, picked.includes(i), revealed)}
            note={revealed ? rowNote(mode, opt.isCorrect, picked.includes(i)) : undefined}
            onPress={() => press(i)}
            disabled={revealed}
          />
        ))}
      </View>

      {revealed ? (
        <View style={styles.feedback} accessibilityLiveRegion="polite">
          <Text style={[styles.verdict, { color: gotItRight ? C.forest : C.clayDeep }]}>
            {gotItRight ? 'RIGHT' : mode === 'multi' ? 'NOT ALL OF IT' : 'NOT QUITE'}
          </Text>
          <Text style={styles.feedbackText}>{explanationOf(feedback)}</Text>
        </View>
      ) : null}
    </View>
  );
}

type RowState = 'idle' | 'picked' | 'right' | 'missed' | 'wrong' | 'other';

function rowState(isCorrect: boolean, isPicked: boolean, revealed: boolean): RowState {
  if (!revealed) return isPicked ? 'picked' : 'idle';
  if (isCorrect) return isPicked ? 'right' : 'missed';
  return isPicked ? 'wrong' : 'other';
}

/** The trailing word that says what a revealed row means, so colour is never
 *  the only signal. */
function rowNote(mode: 'single' | 'multi', isCorrect: boolean, isPicked: boolean) {
  if (isCorrect && !isPicked) return mode === 'multi' ? 'Also true' : 'The answer';
  if (!isCorrect && isPicked) return 'Your pick';
  return undefined;
}

function Tick({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AnswerRow({
  label,
  mode,
  state,
  note,
  onPress,
  disabled,
}: {
  label: string;
  mode: 'single' | 'multi';
  state: RowState;
  note?: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const filled = state === 'picked' || state === 'right';
  const shape = mode === 'multi' ? styles.square : styles.circle;

  let indicator: React.ReactNode;
  if (state === 'right') {
    indicator = (
      <View style={[styles.indicator, shape, styles.indicatorOnForest]}>
        <Tick color={C.cream} />
      </View>
    );
  } else if (state === 'missed') {
    indicator = (
      <View style={[styles.indicator, shape, styles.indicatorMissed]}>
        <Tick color={C.forest} />
      </View>
    );
  } else if (state === 'picked') {
    indicator =
      mode === 'multi' ? (
        <View style={[styles.indicator, shape, styles.indicatorOnForest]}>
          <Tick color={C.cream} />
        </View>
      ) : (
        <View style={[styles.indicator, shape, styles.radioOn]} />
      );
  } else {
    indicator = (
      <View
        style={[
          styles.indicator,
          shape,
          { borderWidth: 1.5, borderColor: state === 'idle' ? oInk(0.3) : oInk(0.18) },
        ]}
      />
    );
  }

  const labelColor = filled
    ? C.cream
    : state === 'missed'
      ? C.forest
      : state === 'wrong' || state === 'other'
        ? oInk(0.5)
        : oInk(0.84);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={mode === 'multi' ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: state === 'picked' || state === 'right' || state === 'wrong', disabled }}
      accessibilityLabel={note ? `${label}. ${note}` : label}
      style={({ pressed }) => [
        styles.row,
        state === 'idle' && styles.rowIdle,
        filled && styles.rowFilled,
        state === 'missed' && styles.rowMissed,
        state === 'wrong' && styles.rowWrong,
        state === 'other' && styles.rowOther,
        pressed && !disabled ? { opacity: 0.9 } : null,
      ]}
    >
      {indicator}
      <Text style={[styles.label, filled && styles.labelFilled, { color: labelColor }]}>{label}</Text>
      {note ? (
        <Text style={[styles.note, { color: state === 'missed' ? C.forest : oInk(0.5) }]}>{note}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  eyebrow: {
    fontFamily: F.monoMed,
    fontSize: T.mono,
    letterSpacing: T.mono * 0.08,
    color: C.clayDeep,
    marginBottom: 12,
  },
  question: {
    fontFamily: F.serif,
    fontSize: 25,
    lineHeight: 25 * 1.25,
    letterSpacing: -0.3,
    color: C.ink,
  },
  instruction: { fontFamily: F.sans, fontSize: T.uiSm, color: oInk(0.6), marginTop: 8 },
  options: { gap: L.rowGap, marginTop: 22 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: R.row,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  rowIdle: { backgroundColor: C.wash },
  rowFilled: { backgroundColor: C.forest },
  rowMissed: { backgroundColor: oForest(0.08), borderColor: C.forest },
  rowWrong: { borderColor: oInk(0.22) },
  rowOther: { backgroundColor: oInk(0.04) },

  indicator: {
    width: L.checkbox,
    height: L.checkbox,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: { borderRadius: 999 },
  square: { borderRadius: 7 },
  indicatorOnForest: { backgroundColor: oCream(0.22) },
  indicatorMissed: { borderWidth: 1.5, borderColor: C.forest },
  radioOn: { borderWidth: 6.5, borderColor: C.cream, backgroundColor: C.forest },

  label: { flex: 1, fontFamily: F.sansMed, fontSize: T.ui, lineHeight: T.ui * 1.35 },
  labelFilled: { fontFamily: F.sansSemi },
  note: { fontFamily: F.sansMed, fontSize: T.meta, flexShrink: 0 },

  feedback: {
    marginTop: 18,
    backgroundColor: C.wash,
    borderRadius: R.callout,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 8,
  },
  verdict: { fontFamily: F.monoMed, fontSize: T.mono, letterSpacing: T.mono * 0.08 },
  feedbackText: {
    fontFamily: F.serif,
    fontSize: T.body,
    lineHeight: T.body * 1.55,
    color: oInk(0.84),
  },
});
