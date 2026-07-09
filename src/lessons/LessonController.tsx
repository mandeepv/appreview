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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonContainer } from '../components/LessonContainer';
import { Button } from '../components/Button';
import { QuizQuestion } from '../components/QuizQuestion';
import { QuizQuestionMultiSelect } from '../components/QuizQuestionMultiSelect';
import { BlockRenderer } from './components/BlockRenderer';
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

/**
 * Append a section id to the lesson's completed-sections array in AsyncStorage,
 * using the SAME key + JSON format as the current hand-built screens. Idempotent
 * (won't duplicate an already-recorded section).
 */
async function markSectionComplete(storageKey: string, sectionId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const completed: string[] = stored ? JSON.parse(stored) : [];
    if (!completed.includes(sectionId)) {
      completed.push(sectionId);
      await AsyncStorage.setItem(storageKey, JSON.stringify(completed));
    }
  } catch (error) {
    if (__DEV__) console.error('[LessonController] failed to save progress:', error);
  }
}

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

  // Complete the current section: write its progress key, then return to the
  // hub. Called from the LAST screen of a section regardless of screen kind —
  // in the original hand-built lessons, every section's final screen writes
  // the completed-sections key (verified: Sec{1..5} final screens each push
  // their id), so the completion write must NOT be tied to the sparse
  // `sectionComplete` visual (only §1 uses that; §2–5 end on rich `content`
  // screens). Byte-compatible key/format; existing progress survives.
  const completeSection = useCallback(async () => {
    // Flow lessons (numbered 1–4) have no storageKey and don't persist
    // section progress — they just return to MainTabs on completion. Only
    // write progress when the lesson actually has a key (section-based
    // lessons 5–13).
    if (section && lesson.storageKey) {
      await markSectionComplete(lesson.storageKey, section.id);
    }
    onSectionComplete();
  }, [lesson.storageKey, section, onSectionComplete]);

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
