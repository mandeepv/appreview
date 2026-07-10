// SPEC-09 Phase 3 — dev-only preview harness.
//
// A single self-contained screen that drives the generic hub + controller for
// one lesson, managing hub↔lesson view state internally. This lets you
// device-check a data-driven lesson (via DevMenu) WITHOUT changing the real
// navigator or touching the gate/paywall routes. The real cutover (replacing
// the hand-built routes with the generic ones) is a later push once fidelity
// is confirmed.

import React, { useState } from 'react';
import { getLesson } from './registry';
import { LessonHubScreen } from './LessonHubScreen';
import { HUB_META } from './hubMeta';
import { LessonController } from './LessonController';

type View =
  | { kind: 'hub' }
  | { kind: 'lesson'; sectionIndex: number; screenIndex: number };

interface LessonPreviewScreenProps {
  // The lesson slug to preview (defaults to sprinklers — the only converted
  // lesson at this checkpoint).
  slug?: string;
  onExit: () => void;
}

export const LessonPreviewScreen: React.FC<LessonPreviewScreenProps> = ({
  slug = 'sprinklers',
  onExit,
}) => {
  const lesson = getLesson(slug);
  const [view, setView] = useState<View>({ kind: 'hub' });

  if (!lesson) return null;
  // Every hub lesson has a HUB_META entry; flow lessons (previewed by slug in
  // dev) fall back to a minimal meta with no section extras / bottom card.
  const meta = HUB_META[slug] ?? {
    emoji: '📘',
    label: 'LESSON',
    description: lesson.title,
    sections: lesson.sections.map(() => ({ icon: 'ellipse-outline' as const, description: '' })),
    bottomInfo: { icon: 'book-outline' as const, text: lesson.title },
  };

  if (view.kind === 'hub') {
    return (
      <LessonHubScreen
        lesson={lesson}
        meta={meta}
        onBack={onExit}
        onOpenSection={(sectionIndex) => setView({ kind: 'lesson', sectionIndex, screenIndex: 0 })}
      />
    );
  }

  return (
    <LessonController
      lesson={lesson}
      sectionIndex={view.sectionIndex}
      screenIndex={view.screenIndex}
      onAdvance={(next) => setView({ kind: 'lesson', ...next })}
      onBack={() => {
        // Back one screen, or to the hub from the first screen of a section.
        if (view.screenIndex > 0) {
          setView({ kind: 'lesson', sectionIndex: view.sectionIndex, screenIndex: view.screenIndex - 1 });
        } else {
          setView({ kind: 'hub' });
        }
      }}
      onSectionComplete={() => setView({ kind: 'hub' })}
    />
  );
};
