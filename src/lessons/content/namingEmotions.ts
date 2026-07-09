// SPEC-09 — Naming our Emotions lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 24 hand-built Naming Emotions screen
// files in src/screens/naming-emotions/ (Sub1..4, Screen1..6). Text,
// punctuation, quotes (straight ASCII, as in the source), the U+2026 ellipsis
// glyph, and block order reproduce the existing screens exactly. No redesign,
// no typo fixes — observed issues are logged in docs/spec-09/CONTENT_ERRATA.md.
//
// Structural mapping (progress byte-compatibility): the four SUBLESSONS are
// modelled as four sections with ids '1'..'4' — the same values the source
// stores via markSubLessonComplete('1'..'4') into
// '@naming_emotions_completed_sublessons'. The controller writes the section id
// on the LAST screen of each section, reproducing the identical ['1','2','3','4']
// array. Section titles use the sublesson topic wording from the lesson hub
// (Happy/Sad/Mad/Bad Situation).
//
// Fidelity notes: Screens 2/4/5 of every sublesson are interactive — Screen 2
// is a `textInput` (free-text journaling) and Screens 4/5 are `emotionPicker`
// blocks (the shared EmotionPicker modal + conditional "why" field). These
// blocks were added to the engine for this lesson (SPEC-09 Phase 3) so the
// interactivity is reproduced, not dropped; the user's input is ephemeral
// (never persisted), matching the hand-built screens. The Screen-3 emotion
// "chip" carries one-off per-sublesson border/text colours (now supported via
// the chip item's color/borderColor/textColor fields). See CONTENT_ERRATA.md.

import type { Lesson } from '../schema';

export const namingEmotions: Lesson = {
  slug: 'namingEmotions',
  title: 'Naming our Emotions',
  storageKey: '@naming_emotions_completed_sublessons',
  sections: [
    // =====================================================================
    // Section 1 — Sublesson 1 (Happy)
    // =====================================================================
    {
      id: '1',
      title: 'Happy Situation',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Let\'s start with a happy moment', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Think of a specific moment from your past where you felt genuinely good.',
            },
            {
              type: 'paragraph',
              text: 'It doesn\'t need to be a big achievement — even a small moment is enough.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'textInput',
              headline: 'What happened?',
              placeholder: 'Describe the moment briefly. Where were you? Who was involved?',
              required: true,
              minHeight: 140,
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Let\'s explore',
          blocks: [
            { type: 'heading', text: 'At the surface, this felt like…', size: 'lg' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { iconKind: 'ionicon', title: 'HAPPY', color: '#FFFBEB', borderColor: '#F59E0B', textColor: '#D97706' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'That\'s okay — we start here.',
                'But "happy" is usually made up of several more specific emotions underneath.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'What was one deeper emotion you felt?',
              helper: 'Choose the emotion that fits best, not perfectly.',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'Was there another emotion present?',
              helper: '(optional)',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Continue to next situation',
          blocks: [
            { type: 'heading', text: 'What just happened in your brain', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'By naming these emotions, you helped your logical brain organize the experience — the same process that helps reduce cortisol and increase oxytocin.',
                'This is the exact skill you\'ll soon help your child learn.',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2 — Sublesson 2 (Sad)
    // =====================================================================
    {
      id: '2',
      title: 'Sad Situation',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Now let\'s look at a sad moment', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Sadness often hides emotions like disappointment, loneliness, or worry. We\'re going to gently uncover those.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'textInput',
              headline: 'What happened?',
              placeholder: 'Describe the moment briefly. Where were you? Who was involved?',
              required: true,
              minHeight: 140,
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Let\'s explore',
          blocks: [
            { type: 'heading', text: 'At the surface, this felt like…', size: 'lg' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { iconKind: 'ionicon', title: 'SAD', color: '#EFF6FF', borderColor: '#3B82F6', textColor: '#2563EB' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                '"Sad" is a signal — not the full story.',
                'Most people feel 2–3 emotions at the same time, even when they look calm.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'What was one deeper emotion you felt?',
              helper: 'Choose the emotion that fits best, not perfectly.',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'Was there another emotion present?',
              helper: '(optional)',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Continue to next situation',
          blocks: [
            { type: 'heading', text: 'What just happened in your brain', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'By naming these emotions, you helped your logical brain organize the experience — the same process that helps reduce cortisol and increase oxytocin.',
                'This is the exact skill you\'ll soon help your child learn.',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3 — Sublesson 3 (Mad)
    // =====================================================================
    {
      id: '3',
      title: 'Mad Situation',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Now let\'s look at a "mad" moment', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Anger is almost never the root emotion. It\'s often protecting something more vulnerable underneath — like fear, shame, or hurt.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'textInput',
              headline: 'What happened?',
              placeholder: 'Describe the moment briefly. Where were you? Who was involved?',
              required: true,
              minHeight: 140,
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Let\'s explore',
          blocks: [
            { type: 'heading', text: 'At the surface, this felt like…', size: 'lg' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { iconKind: 'ionicon', title: 'MAD', color: '#FEF2F2', borderColor: '#EF4444', textColor: '#DC2626' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Anger feels powerful.',
                'But it\'s usually covering up emotions we don\'t want to feel — like helplessness, betrayal, or disappointment.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'What was one deeper emotion you felt?',
              helper: 'Choose the emotion that fits best, not perfectly.',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'Was there another emotion present?',
              helper: '(optional)',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Continue to next situation',
          blocks: [
            { type: 'heading', text: 'What just happened in your brain', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'By naming these emotions, you helped your logical brain organize the experience — the same process that helps reduce cortisol and increase oxytocin.',
                'This is the exact skill you\'ll soon help your child learn.',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4 — Sublesson 4 (Bad)
    // =====================================================================
    {
      id: '4',
      title: 'Bad Situation',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Finally, let\'s look at a "just bad" moment', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Sometimes it just feels "bad." That\'s okay. Naming even vague discomfort helps.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'textInput',
              headline: 'What happened?',
              placeholder: 'Describe the moment briefly. Where were you? Who was involved?',
              required: true,
              minHeight: 140,
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Let\'s explore',
          blocks: [
            { type: 'heading', text: 'At the surface, this felt like…', size: 'lg' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { iconKind: 'ionicon', title: 'BAD', color: '#F3F4F6', borderColor: '#6B7280', textColor: '#4B5563' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'When you\'re not sure what you feel, your brain defaults to "bad."',
                'But there\'s always something underneath.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'What was one deeper emotion you felt?',
              helper: 'Choose the emotion that fits best, not perfectly.',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'emotionPicker',
              headline: 'What was another emotion present?',
              helper: 'Try to identify at least one more.',
              buttonPlaceholder: 'Select an emotion',
              whyLabel: 'Why did you feel {emotion}?',
              whyPlaceholder: 'Share why you felt this way...',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Complete lesson',
          blocks: [
            { type: 'heading', text: 'You\'ve just learned a skill you\'ll use with your child', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'You just practiced naming emotions in four different situations — happy, sad, mad, and bad.',
                'This is the exact process you\'ll soon help your child learn. By naming emotions together, you\'ll help them feel understood, reduce stress, and build emotional awareness for life.',
              ],
            },
          ],
        },
      ],
    },
  ],
};
