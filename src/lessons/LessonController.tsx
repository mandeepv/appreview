// SPEC-09 Phase 1 — the generic lesson screen + controller.
//
// ONE screen component drives every data-driven lesson. Given a lesson + a
// (sectionIndex, screenIndex), it renders that screen (its blocks, a quiz, or
// the section-complete card) and handles Next / Back / section-complete.
//
// Phase 1 scope: the controller exists and type-checks against the schema and
// the block templates. It is NOT yet registered in the navigator, and no
// lesson content has been converted — that's the Phase 2 pilot (Sprinklers)
// and Phase 3 mass conversion, each behind an owner checkpoint. No
// gate/paywall code is touched here.
//
// Progress: writes the SAME AsyncStorage key + JSON format the lesson uses
// today (an array of completed section-id strings), read from the lesson's
// `storageKey`. No data migration; existing users' progress survives.

import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LessonContainer } from '../components/LessonContainer';
import { Button } from '../components/Button';
import { QuizQuestion } from '../components/QuizQuestion';
import { QuizQuestionMultiSelect } from '../components/QuizQuestionMultiSelect';
import { BlockRenderer } from './components/BlockRenderer';
import { createProgressStore } from './progressStore';
import { isFlowLesson } from './registry';
import { safeCapture } from '../lib/analytics';
import { Colors, Typography, Shadows } from '../constants/theme';
import type { Lesson, LessonScreen } from './schema';

// Route params for the generic lesson route (typed via SPEC-08 when wired into
// the navigator in Phase 2/3). Kept as a plain interface in Phase 1 so the
// controller is testable and reviewable before it's registered.
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
  // on a specific navigator (kept testable + wiring-agnostic in Phase 1).
  onAdvance: (next: { sectionIndex: number; screenIndex: number }) => void;
  onBack: () => void;
  // Called when the final screen of the last-in-section completes — returns to
  // the lesson hub. (In Phase 2/3 this is navigate back to the hub screen.)
  onSectionComplete: () => void;
}

// SPEC-13 R1: progress writes go through the ONE chokepoint —
// createProgressStore. The controller no longer has its own inline
// markSectionComplete; the factory is the single reader/writer (and, via
// SPEC-13 R2, the seam where account-scoped DB sync is layered in behind it).
// Byte-compatible key + JSON format is unchanged (progressStore.test.ts proves
// the round-trip).

export const LessonController: React.FC<LessonControllerProps> = ({
  lesson,
  sectionIndex,
  screenIndex,
  onAdvance,
  onBack,
  onSectionComplete,
}) => {
  const section = lesson.sections[sectionIndex];
  const screen: LessonScreen | undefined = section?.screens[screenIndex];

  const isLastScreenInSection = section
    ? screenIndex >= section.screens.length - 1
    : true;

  // SPEC-13 R4/R5 — lesson analytics. `lesson_started` fires at the true
  // "opened" moment, ONCE per lesson visit. That moment differs by lesson kind:
  //   - Flow lessons (1–4): the controller mount IS the opening, so the
  //     controller fires it (below).
  //   - Hub lessons (5–13): the user lands on the hub first, so LessonHubScreen
  //     owns the fire (see there). Firing here too would double-count, so the
  //     controller SKIPS hub lessons.
  // SPEC-FIX-11 R2: the flow/hub split is now the registry's FLOW_LESSON_SLUGS
  // (via isFlowLesson), NOT `!lesson.storageKey` — SPEC-18 R1 gave flow lessons
  // storage keys, which silently broke the old check and stopped lesson_started
  // firing for lessons 1–4. Static registry IDs only, no content text (INV #8).
  React.useEffect(() => {
    if (isFlowLesson(lesson.slug) && sectionIndex === 0 && screenIndex === 0) {
      safeCapture('lesson_started', {
        lesson_id: lesson.slug,
        lesson_title: lesson.title,
        lesson_label: FLOW_LESSON_LABELS[lesson.slug] ?? null,
      });
    }
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

  // Complete the current section: write its progress key, then return to the
  // hub. Called from the LAST screen of a section regardless of screen kind —
  // in the original hand-built lessons, every section's final screen writes
  // the completed-sections key (verified: Sec{1..5} final screens each push
  // their id), so the completion write must NOT be tied to the sparse
  // `sectionComplete` visual (only §1 uses that; §2–5 end on rich `content`
  // screens). Byte-compatible key/format; existing progress survives.
  const completeSection = useCallback(async () => {
    if (!section) {
      onSectionComplete();
      return;
    }

    // SPEC-FIX-03 R3 — lesson_completed must derive from the completed SET, not
    // the section's POSITION. Firing on `sectionIndex >= length-1` is wrong:
    // completing the last-indexed section first (order-independent) fires a
    // false completion, and re-completing it double-fires. Instead: after the
    // write, fire lesson_completed IFF every section is now done AND this write
    // is the one that made it so (it wasn't already complete).
    //
    // SPEC-FIX-11 R2/R6: every registered lesson now has a storageKey (SPEC-18
    // R1 added them to flow lessons 1–4), so the storageKey branch runs for ALL
    // lessons — and flow lessons being single-section means finishing their one
    // section trips nowComplete correctly. The keyless `else` is now unreachable
    // for registered lessons; it's kept only as a defensive fallback.
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
      // Defensive fallback (no registered lesson hits this today): treat
      // finishing the last section as completing the lesson.
      justCompletedLesson = sectionIndex >= lesson.sections.length - 1;
    }

    // SPEC-13 R4 — a section finished. Static IDs only.
    safeCapture('lesson_section_completed', {
      lesson_id: lesson.slug,
      section_id: section.id,
    });
    if (justCompletedLesson) {
      safeCapture('lesson_completed', { lesson_id: lesson.slug });
    }

    onSectionComplete();
  }, [lesson, section, sectionIndex, onSectionComplete]);

  // Advance to the next screen, or complete the section on the last screen.
  const goNext = useCallback(() => {
    if (!section) return;
    if (!isLastScreenInSection) {
      onAdvance({ sectionIndex, screenIndex: screenIndex + 1 });
    } else {
      // Last screen of the section (content OR sectionComplete) → write
      // progress + return to hub.
      completeSection();
    }
  }, [section, isLastScreenInSection, sectionIndex, screenIndex, onAdvance, completeSection]);

  const handleSectionCompleteContinue = completeSection;

  if (!screen) return null;

  // Progress chrome: step within the current section.
  const totalSteps = section ? section.screens.length : 1;
  const currentStep = screenIndex + 1;

  // --- sectionComplete screen ---
  if (screen.kind === 'sectionComplete') {
    return (
      <LessonContainer currentStep={currentStep} totalSteps={totalSteps} onBack={onBack}>
        <View style={styles.container}>
          <View style={styles.completeContent}>
            <SectionCompleteBody title={screen.title} text={screen.text} nextPreview={screen.nextPreview} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title={screen.cta} onPress={handleSectionCompleteContinue} variant="gradient" />
          </View>
        </View>
      </LessonContainer>
    );
  }

  // --- content screen ---
  // A quiz block owns its own advance (onCorrect), so if the screen is a single
  // quiz we render the QuizQuestion directly (matches the hand-built quiz
  // screens). Otherwise render the block list + a Next button.
  const quizBlock = screen.blocks.find((b) => b.type === 'quiz');
  const isQuizScreen = screen.blocks.length === 1 && quizBlock?.type === 'quiz';

  if (isQuizScreen && quizBlock?.type === 'quiz') {
    return (
      <LessonContainer
        currentStep={currentStep}
        totalSteps={totalSteps}
        label={screen.label}
        onBack={onBack}
      >
        <View style={styles.container}>
          <QuizQuestion
            questionNumber={quizBlock.questionNumber}
            totalQuestions={quizBlock.totalQuestions}
            question={quizBlock.question}
            options={quizBlock.options}
            feedback={quizBlock.feedback}
            onCorrect={goNext}
          />
        </View>
      </LessonContainer>
    );
  }

  // A lone multiSelectQuiz block renders the QuizQuestionMultiSelect component
  // (check-all-that-apply), parallel to the single-answer quiz branch above.
  const msqBlock = screen.blocks.find((b) => b.type === 'multiSelectQuiz');
  const isMultiSelectScreen = screen.blocks.length === 1 && msqBlock?.type === 'multiSelectQuiz';
  if (isMultiSelectScreen && msqBlock?.type === 'multiSelectQuiz') {
    return (
      <LessonContainer
        currentStep={currentStep}
        totalSteps={totalSteps}
        label={screen.label}
        onBack={onBack}
      >
        <View style={styles.container}>
          <QuizQuestionMultiSelect
            questionNumber={msqBlock.questionNumber}
            totalQuestions={msqBlock.totalQuestions}
            question={msqBlock.question}
            options={msqBlock.options}
            feedback={msqBlock.feedback}
            onCorrect={goNext}
          />
        </View>
      </LessonContainer>
    );
  }

  // interactiveQuiz screens hide the Next button until an answer is revealed
  // (matches the hand-built screens). Any other screen shows Next immediately.
  const hasInteractiveQuiz = screen.blocks.some((b) => b.type === 'interactiveQuiz');
  return (
    <ContentScreenView
      screen={screen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      onNext={goNext}
      gateNextOnInteractive={hasInteractiveQuiz}
    />
  );
};

// The block types that own a required input and must gate the Next button
// (Next stays visible but disabled until satisfied — mirrors the hand-built
// journaling screens' `disabled={value.trim().length === 0}`).
const INPUT_BLOCK_TYPES = ['textInput', 'emotionPicker'] as const;

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

// Content screen view — separated so it can hold the "interactive answered"
// state that gates the Next button.
const ContentScreenView: React.FC<{
  screen: Extract<LessonScreen, { kind: 'content' }>;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  gateNextOnInteractive: boolean;
}> = ({ screen, currentStep, totalSteps, onBack, onNext, gateNextOnInteractive }) => {
  const [answered, setAnswered] = React.useState(false);

  // Input-block gating: Next is shown but DISABLED until every required input
  // block on this screen reports satisfied. Track the unsatisfied set by block
  // key (a block reports satisfied=false to add itself, true to remove). We
  // seed the set with every input block's key so Next starts disabled until
  // each reports in.
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

  const showNext = !gateNextOnInteractive || answered;
  const nextDisabled = unsatisfied.size > 0;
  return (
    <LessonContainer
      currentStep={currentStep}
      totalSteps={totalSteps}
      label={screen.label}
      onBack={onBack}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {screen.blocks.map((block, i) => (
            <BlockRenderer
              key={i}
              block={block}
              blockKey={String(i)}
              onInteractiveAnswered={() => setAnswered(true)}
              onInputValidityChange={onInputValidityChange}
            />
          ))}
        </View>
        {showNext && (
          <View style={styles.buttonContainer}>
            <Button
              title={screen.cta ?? 'Next'}
              onPress={onNext}
              variant="gradient"
              disabled={nextDisabled}
            />
          </View>
        )}
      </View>
    </LessonContainer>
  );
};

// The section-complete visual (checkmark card + preview) lives in the block
// renderer family conceptually, but it's screen-level chrome so it's rendered
// here. Kept as a small local component for clarity.
const SectionCompleteBody: React.FC<{ title: string; text: string; nextPreview?: string }> = ({
  title,
  text,
  nextPreview,
}) => (
  <>
    <View style={styles.completionCard}>
      <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
      <Text style={styles.completionTitle}>{title}</Text>
      <Text style={styles.completionText}>{text}</Text>
    </View>
    {nextPreview && (
      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>NEXT:</Text>
        <Text style={styles.previewTitle}>{nextPreview}</Text>
      </View>
    )}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingTop: 10,
    gap: 24,
    justifyContent: 'center',
  },
  completeContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    paddingBottom: 20,
    width: '100%',
  },
  completionCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    ...Shadows.md,
    gap: 16,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  completionText: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: '#F5F5F5',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
});
