// SPEC-09 Phase 1 — the generic lesson screen + controller.
//
// ONE screen component drives every data-driven lesson. Given a lesson + a
// (sectionIndex, screenIndex), it renders that screen (its blocks, a question,
// or the end-of-section view) and handles Continue / Back / Close.
//
// No gate/paywall code is touched here.
//
// Progress: writes the SAME AsyncStorage key + JSON format the lesson uses
// today (an array of completed section-id strings), read from the lesson's
// `storageKey`. No data migration; existing users' progress survives.
//
// THE DONE SCREEN (2026-09). Every section now ends on SectionDone, which
// offers Continue (straight into the next node on the path) or Stop for
// tonight. It sits at a VIRTUAL screen index — one past the section's last
// content screen — unless the section's content already ends on an authored
// `sectionComplete` screen, in which case that screen is the done screen and
// its copy is used. Either way the section's progress is written on the Next
// press that LEADS to the done screen, so by the time SectionDone reads the
// path to decide what Continue opens, this section already counts as done.

import React, { useCallback, useRef } from 'react';
import { createProgressStore } from './progressStore';
import { markLessonCompleted } from './lessonCompletion';
import { recordActiveDay } from './streak';
import { safeCapture } from '../lib/analytics';
import { LessonShell } from './components/LessonShell';
import { BlockRenderer } from './components/BlockRenderer';
import { SectionDone } from './components/SectionDone';
import type { PathNode } from './units';
import type { Lesson, LessonScreen, LessonSection } from './schema';

// Route params for the generic lesson route (typed via SPEC-08 in
// navigation/types.ts). Kept as a plain interface so the controller is
// testable without a navigator.
export interface LessonRouteParams {
  lessonId: string;
  sectionIndex: number;
  screenIndex: number;
}

interface LessonControllerProps {
  lesson: Lesson;
  sectionIndex: number;
  screenIndex: number;
  // Navigation actions are injected so the controller has no direct dependency
  // on a specific navigator.
  onAdvance: (next: { sectionIndex: number; screenIndex: number }) => void;
  onBack: () => void;
  // Leave the lesson: back to wherever it was opened from (the path). Used by
  // the close button and by "Stop for tonight".
  onSectionComplete: () => void;
  // Open another node on the path — "Continue" on the done screen.
  onOpenNode: (node: PathNode) => void;
  /**
   * True only when this mount is the parent OPENING the lesson, rather than
   * advancing within it. Comes from the route's `entry` param. It is the whole
   * basis for firing `lesson_started` once per visit — see the effect below.
   */
  isEntry?: boolean;
}

/**
 * Where a section's done screen sits. An authored `sectionComplete` screen at
 * the end IS the done screen; otherwise the done screen is virtual, one past
 * the last content screen.
 */
export function doneScreenIndex(section: LessonSection): number {
  const last = section.screens[section.screens.length - 1];
  return last?.kind === 'sectionComplete' ? section.screens.length - 1 : section.screens.length;
}

// SPEC-13 R1: progress writes go through the ONE chokepoint —
// createProgressStore. The controller has no inline markSectionComplete; the
// factory is the single reader/writer (and, via SPEC-13 R2, the seam where
// account-scoped DB sync is layered in behind it). Byte-compatible key + JSON
// format is unchanged (progressStore.test.ts proves the round-trip).

export const LessonController: React.FC<LessonControllerProps> = ({
  lesson,
  sectionIndex,
  screenIndex,
  onAdvance,
  onBack,
  onSectionComplete,
  onOpenNode,
  isEntry = false,
}) => {
  const section = lesson.sections[sectionIndex];
  const doneIndex = section ? doneScreenIndex(section) : 0;
  const screen: LessonScreen | undefined = section?.screens[screenIndex];

  // SPEC-13 R4/R5 — lesson analytics. `lesson_started` fires at the true
  // "opened" moment, ONCE per lesson visit.
  //
  // WHO FIRES IT, and why this changed. It used to be split: flow lessons here,
  // hub lessons in LessonHubScreen, because the hub was where a parent landed
  // first. The path redesign navigates every node straight to LessonScreen, so
  // the hub is off the happy path — and `lesson_started` silently stopped
  // firing for the nine hub lessons while `lesson_tapped` kept flowing and hid
  // the gap. The controller now owns the fire for BOTH kinds.
  //
  // LessonHubScreen still fires its own when reached directly (dev menu, a
  // legacy deep link). It is not double-counting on the path: nothing on the
  // path routes through the hub.
  //
  // ONCE PER VISIT, driven by the `entry` route param.
  //
  // This cannot be deduped inside the component. Every Next press does
  // navigation.push('LessonScreen', ...) (see LessonScreen.onAdvance), which
  // mounts a WHOLE NEW controller — so a ref or state guard starts empty each
  // time and blocks nothing. A first attempt used a ref keyed on the slug and
  // fired on every screen of every lesson, which is a worse number than the
  // under-count it replaced.
  //
  // The honest signal is therefore who navigated here: only an opener (the
  // path, the done screen's Continue into a NEW lesson, the dev menu, a hub)
  // passes `entry: true`; onAdvance's pushes deliberately omit it. That makes
  // "opened the lesson" and "pressed Next" distinguishable without any
  // cross-mount state.
  // Static registry IDs only (slug + title), no content text (INVARIANTS #8).
  React.useEffect(() => {
    if (!isEntry) return;
    safeCapture('lesson_started', {
      lesson_id: lesson.slug,
      lesson_title: lesson.title,
      lesson_label: FLOW_LESSON_LABELS[lesson.slug] ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // SPEC-13 R4/R5 — `lesson_section_started` fires at the entry (screen 0) of
  // EVERY section, for ALL lessons (generalizes the old Sprinklers-hub-only
  // event). Static IDs only.
  React.useEffect(() => {
    if (section && screenIndex === 0) {
      safeCapture('lesson_section_started', {
        lesson_id: lesson.slug,
        section_id: section.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIndex]);

  // One completion per mount. The write is async, and a second tap on the
  // button before navigation lands used to run it twice concurrently: both
  // runs read `before` ahead of either write, both saw the lesson as not yet
  // complete, and both fired `lesson_completed`.
  const completing = useRef(false);

  // Complete the current section: write its progress key. Called from the
  // Next press that leads to the done screen — in the original hand-built
  // lessons every section's final screen wrote the completed-sections key, so
  // the write must NOT be tied to the sparse `sectionComplete` visual (only
  // Sprinklers §1 has one).
  const completeSection = useCallback(async () => {
    if (!section) return;

    // SPEC-FIX-03 R3 — lesson_completed must derive from the completed SET, not
    // the section's POSITION. Firing on `sectionIndex >= length-1` is wrong:
    // completing the last-indexed section first (order-independent) fires a
    // false completion, and re-completing it double-fires. Instead: after the
    // write, fire lesson_completed IFF every section is now done AND this write
    // is the one that made it so (it wasn't already complete).
    //
    // Flow lessons (no storageKey) don't persist a set — they're single-section
    // and linear, so finishing their (only/last) section IS completing the
    // lesson; treat the transition as always-just-happened for them.
    let justCompletedLesson = false;
    if (lesson.storageKey) {
      const store = createProgressStore(lesson.storageKey);
      const before = await store.getCompletedSections();
      const wasComplete = before.length >= lesson.sections.length;
      await store.markSectionComplete(section.id);
      const after = await store.getCompletedSections();
      const nowComplete = after.length >= lesson.sections.length;
      justCompletedLesson = nowComplete && !wasComplete;
    } else {
      // Flow lesson: completing the last section is completing the lesson.
      justCompletedLesson = sectionIndex >= lesson.sections.length - 1;
    }

    // SPEC-13 R4 — a section finished. Static IDs only.
    safeCapture('lesson_section_completed', {
      lesson_id: lesson.slug,
      section_id: section.id,
    });

    // Streak is by DAY, not by section: finishing five tonight is one day.
    // Fire-and-forget — a missed day must never block finishing a lesson.
    void recordActiveDay();
    if (justCompletedLesson) {
      safeCapture('lesson_completed', { lesson_id: lesson.slug });
      // Whole-lesson record for the Learn path. Deliberately NOT derived from
      // `storageKey`: flow lessons 1-4 cannot carry one without changing where
      // lesson_started fires. See src/lessons/lessonCompletion.ts.
      //
      // AWAITED now, where it used to be fire-and-forget: the done screen reads
      // the path straight after this to decide whether Continue can open the
      // next lesson, and for flow lessons this record IS their completion. It
      // cannot block finishing — markLessonCompleted swallows its own errors.
      await markLessonCompleted(lesson.slug);
    }
  }, [lesson, section, sectionIndex]);

  // Advance to the next screen; the press that reaches the done screen writes
  // the section's progress first.
  const goNext = useCallback(async () => {
    if (!section) return;
    const nextIndex = screenIndex + 1;
    if (nextIndex >= doneIndex) {
      if (completing.current) return;
      completing.current = true;
      try {
        await completeSection();
      } catch (e) {
        // The write failed (storage full, a store bug). Still move on: the
        // parent finished the content, and stranding them on the last screen
        // helps no one. The path will show the section as unfinished, which is
        // the truthful state.
        if (__DEV__) console.warn('[LessonController] completeSection failed', e);
      } finally {
        completing.current = false;
      }
    }
    onAdvance({ sectionIndex, screenIndex: nextIndex });
  }, [section, screenIndex, doneIndex, completeSection, onAdvance, sectionIndex]);

  if (!section) return null;

  // --- the done screen ---
  if (screenIndex >= doneIndex) {
    const authored = screen?.kind === 'sectionComplete' ? screen : undefined;
    return (
      <SectionDone
        lesson={lesson}
        sectionIndex={sectionIndex}
        authored={
          authored
            ? { title: authored.title, text: authored.text, nextPreview: authored.nextPreview }
            : undefined
        }
        onBack={onBack}
        onClose={onSectionComplete}
        onContinue={onOpenNode}
        onStop={onSectionComplete}
      />
    );
  }

  if (!screen || screen.kind !== 'content') return null;

  return (
    <ContentScreenView
      screen={screen}
      progress={(screenIndex + 1) / Math.max(1, doneIndex)}
      onBack={onBack}
      onClose={onSectionComplete}
      onNext={goNext}
    />
  );
};

// The block types that own a required input and must gate Continue (it stays
// visible but disabled until satisfied).
const INPUT_BLOCK_TYPES = ['textInput', 'emotionPicker'] as const;
// Question blocks: Continue is disabled until the answer has been revealed.
const QUESTION_BLOCK_TYPES = ['quiz', 'multiSelectQuiz', 'interactiveQuiz'] as const;

// SPEC-FIX-03 R4 — flow lessons (1–4) have no hub, so their `lesson_label`
// isn't carried by hub meta. Kept here (matching LearnScreen's learningModules)
// so the controller's flow-lesson lesson_started has the same-or-richer props
// LearnScreen used to send.
const FLOW_LESSON_LABELS: Record<string, string> = {
  lesson1: 'FOUNDATION',
  lesson2: 'WELLNESS',
  lesson3: 'HEALTH',
  lesson4: 'WELLNESS',
};

// Content screen view — separated so it can hold the per-screen state that
// gates Continue: an unanswered question, an unfilled journaling field, or a
// multi-select waiting to be checked.
const ContentScreenView: React.FC<{
  screen: Extract<LessonScreen, { kind: 'content' }>;
  progress: number;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}> = ({ screen, progress, onBack, onClose, onNext }) => {
  const hasQuestion = screen.blocks.some((b) =>
    (QUESTION_BLOCK_TYPES as readonly string[]).includes(b.type),
  );
  const [answered, setAnswered] = React.useState(false);
  // Stable, because a question's reveal callback depends on it and the
  // multi-select re-publishes its check action whenever that changes — a
  // fresh arrow per render would loop publish → setCheck → render → publish.
  const onAnswered = React.useCallback(() => setAnswered(true), []);

  // A multi-select question's "check" action, published by the block. While
  // one is registered the pill reads "Check answer".
  const [check, setCheck] = React.useState<{ run: () => void; enabled: boolean } | null>(null);
  const registerCheck = React.useCallback((run: (() => void) | null, enabled: boolean) => {
    setCheck(run ? { run, enabled } : null);
  }, []);

  // Input-block gating: track the unsatisfied set by block key (a block
  // reports satisfied=false to add itself, true to remove). Seeded with every
  // input block's key so Continue starts disabled until each reports in.
  const inputKeys = React.useMemo(
    () =>
      screen.blocks
        .map((b, i) => ((INPUT_BLOCK_TYPES as readonly string[]).includes(b.type) ? String(i) : null))
        .filter((k): k is string => k !== null),
    [screen.blocks],
  );
  const [unsatisfied, setUnsatisfied] = React.useState<Set<string>>(() => new Set(inputKeys));
  const onInputValidityChange = React.useCallback((blockKey: string, satisfied: boolean) => {
    setUnsatisfied((prev) => {
      const has = prev.has(blockKey);
      if (satisfied && has) {
        const next = new Set(prev);
        next.delete(blockKey);
        return next;
      }
      if (!satisfied && !has) {
        const next = new Set(prev);
        next.add(blockKey);
        return next;
      }
      return prev;
    });
  }, []);

  // The label content chose, minus a trailing arrow: several screens say
  // "Next →" or "This surprised me →", and an arrow inside a full-width pill
  // is noise the onboarding pills never carry.
  const label = (screen.cta ?? 'Continue').replace(/\s*→\s*$/, '');

  let cta: { label: string; onPress: () => void; disabled?: boolean };
  let footerNote: string | undefined;
  let secondary: { label: string; onPress: () => void } | undefined;

  if (check) {
    cta = { label: 'Check answer', onPress: check.run, disabled: !check.enabled };
  } else if (hasQuestion && !answered) {
    cta = { label, onPress: onNext, disabled: true };
    footerNote = 'Choose an answer to continue.';
  } else if (unsatisfied.size > 0) {
    cta = { label, onPress: onNext, disabled: true };
    // Say what is actually missing: a picker screen asks for a feeling, not
    // for "a line or two".
    const waitingOnPicker = screen.blocks.some(
      (b, i) => b.type === 'emotionPicker' && unsatisfied.has(String(i)),
    );
    footerNote = waitingOnPicker
      ? 'Choose a feeling and say why to continue.'
      : 'Write a line or two to continue.';
    // Journaling is the heaviest ask in the app — write about the last time you
    // were angry — and it used to be a hard wall. A parent who does not want to
    // write tonight should still be able to finish the section.
    secondary = { label: 'Skip this one', onPress: onNext };
  } else {
    cta = { label, onPress: onNext };
  }

  const firstHeading = screen.blocks.findIndex((b) => b.type === 'heading');

  return (
    <LessonShell
      progress={progress}
      label={screen.label}
      onBack={onBack}
      onClose={onClose}
      cta={cta}
      footerNote={footerNote}
      secondary={secondary}
    >
      {screen.blocks.map((block, i) => (
        <BlockRenderer
          key={i}
          block={block}
          blockKey={String(i)}
          onInteractiveAnswered={onAnswered}
          registerCheck={registerCheck}
          onInputValidityChange={onInputValidityChange}
          isTitle={i === firstHeading}
        />
      ))}
    </LessonShell>
  );
};
