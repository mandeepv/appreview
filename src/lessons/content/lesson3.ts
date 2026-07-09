// SPEC-09 — Flow Lesson 3 content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 20 hand-built Lesson 3 flow screens
// (Lesson3Screen1..12 + Lesson3Quiz + Lesson3QuizQ1..6 + Lesson3Complete) in
// src/screens/lessons/. Text, punctuation, quotes (straight ASCII, as in the
// source), emoji, and block order reproduce the existing screens exactly. No
// redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Flow lesson: SINGLE-SECTION, linear, no persisted progress — `storageKey` is
// OMITTED (controller skips the progress write). Modelled as ONE section (id
// '1'). Title uses the lesson-hub wording from LearnScreen.tsx (id '3').
//
// NOTE: QuizQ2 uses the `QuizQuestionMultiSelect` component (multiple correct
// answers). The schema `quiz` block maps 1:1 to the single-answer
// `QuizQuestion`; QuizQ2 is transcribed as a `quiz` block preserving every
// option + isCorrect flag, but the multi-select interaction is not reproduced.
// See CONTENT_ERRATA.md.

import type { Lesson } from '../schema';

export const lesson3: Lesson = {
  slug: 'lesson3',
  title: 'The Long-Term Unhappiness Chemical',
  sections: [
    {
      id: '1',
      title: 'The Long-Term Unhappiness Chemical',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'DAY 4 · FOUNDATIONS' },
            { type: 'heading', text: 'The Long-Term Unhappiness Chemical', size: 'xl' },
            { type: 'paragraph', text: 'Some chemicals give short bursts of pleasure.' },
            { type: 'paragraph', text: 'Others quietly shape who we become over years.' },
            {
              type: 'heading',
              text: 'This lesson is about cortisol — the chemical most linked to long-term unhappiness when it stays high for too long.',
              size: 'lg',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Cortisol Isn\'t the Enemy', size: 'xl' },
            { type: 'paragraph', text: 'Cortisol is a stress hormone.' },
            { type: 'paragraph', text: 'A small amount is healthy and necessary:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'It helps us wake up' },
                { icon: '•', iconKind: 'emoji', title: 'It motivates action' },
                { icon: '•', iconKind: 'emoji', title: 'It prepares us for challenges' },
              ],
            },
            {
              type: 'heading',
              text: 'The problem isn\'t cortisol itself — it\'s chronic cortisol.',
              size: 'lg',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Real Problem: Constant Alert', size: 'xl' },
            {
              type: 'paragraph',
              text: 'High cortisol in children usually doesn\'t come from one big traumatic event.',
            },
            {
              type: 'heading',
              text: 'It comes from being on edge — from feeling that something emotionally upsetting might happen at any moment.',
              size: 'lg',
            },
            {
              type: 'paragraph',
              text: 'This state is far more damaging than occasional stress.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Where High Cortisol Often Comes From', size: 'xl' },
            { type: 'paragraph', text: 'This may be uncomfortable to hear:' },
            {
              type: 'heading',
              text: 'High cortisol in children is most often caused unintentionally by parents.',
              size: 'lg',
            },
            { type: 'paragraph', text: 'Not through abuse — but through unpredictability.' },
            { type: 'paragraph', text: 'Examples include:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Sudden anger' },
                { icon: '•', iconKind: 'emoji', title: 'Sarcasm or teasing' },
                { icon: '•', iconKind: 'emoji', title: 'Comparisons to other children' },
                { icon: '•', iconKind: 'emoji', title: 'Emotional withdrawal' },
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'KEY INSIGHT' },
            { type: 'heading', text: 'It\'s Not the Event — It\'s the Anticipation', size: 'xl' },
            {
              type: 'paragraph',
              text: 'It\'s not the criticism itself that raises cortisol most.',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['It\'s the fear that it could happen again.'],
            },
            {
              type: 'paragraph',
              text: 'Even if nothing happens today, the child\'s nervous system stays on high alert.',
            },
            {
              type: 'heading',
              text: 'This is how cortisol stays elevated without you realizing it.',
              size: 'lg',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why You Might Not Notice It', size: 'xl' },
            { type: 'paragraph', text: 'Many children with high cortisol:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Behave well' },
                { icon: '•', iconKind: 'emoji', title: 'Perform fine in school' },
                { icon: '•', iconKind: 'emoji', title: 'Show no obvious problems' },
              ],
            },
            { type: 'heading', text: 'Cortisol damage is often delayed.', size: 'lg' },
            { type: 'paragraph', text: 'The effects appear months — or years — later.' },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What Research Shows', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Hundreds of studies on children\'s cortisol levels show that consistently high cortisol is linked to:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Substance abuse' },
                { icon: '•', iconKind: 'emoji', title: 'Poor life decisions' },
                { icon: '•', iconKind: 'emoji', title: 'Criminal behavior' },
                { icon: '•', iconKind: 'emoji', title: 'Lower long-term happiness' },
              ],
            },
            { type: 'paragraph', text: 'A study in Child Development also found links to:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Learning deficits' },
                { icon: '•', iconKind: 'emoji', title: 'Cognitive delays' },
              ],
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Cortisol Is Like Smoking', size: 'xl' },
            {
              type: 'callout',
              variant: 'insight',
              lines: ['High cortisol is like smoking.'],
            },
            {
              type: 'paragraph',
              text: 'One exposure doesn\'t hurt.\nNeither does a week.\nSometimes not even months.',
            },
            { type: 'paragraph', text: 'But over time, it significantly damages:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Emotional regulation' },
                { icon: '•', iconKind: 'emoji', title: 'Mental health' },
                { icon: '•', iconKind: 'emoji', title: 'Decision-making' },
              ],
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What Chronic Cortisol Does to a Person', size: 'xl' },
            {
              type: 'paragraph',
              text: 'People with chronically high cortisol are more likely to feel:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Anxious' },
                { icon: '•', iconKind: 'emoji', title: 'Depressed' },
                { icon: '•', iconKind: 'emoji', title: 'Angry' },
                { icon: '•', iconKind: 'emoji', title: 'Easily triggered' },
              ],
            },
            {
              type: 'heading',
              text: 'This isn\'t a personality flaw — it\'s a nervous system stuck in survival mode.',
              size: 'lg',
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'IMPORTANT' },
            { type: 'heading', text: 'This Is Not About Blame', size: 'xl' },
            { type: 'paragraph', text: 'Most parents increase cortisol without knowing it.' },
            {
              type: 'paragraph',
              text: 'Even calm, loving parents can do this unintentionally.',
            },
            {
              type: 'heading',
              text: 'The good news:\nCortisol is highly responsive to changes in the environment.',
              size: 'lg',
            },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Cortisol Can Be Reduced', size: 'xl' },
            { type: 'paragraph', text: 'Research shows that when parents:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Learn to spot cortisol triggers' },
                { icon: '•', iconKind: 'emoji', title: 'Reduce emotional unpredictability' },
              ],
            },
            {
              type: 'paragraph',
              text: 'Children\'s cortisol levels can drop — and some negative effects can even be reversed.',
            },
            {
              type: 'callout',
              variant: 'insight',
              lines: ['You don\'t need to be perfect.\nYou need to be predictably safe.'],
            },
          ],
        },
        // Screen 12
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'BEFORE THE QUIZ' },
            { type: 'heading', text: 'What Comes Next', size: 'xl' },
            { type: 'paragraph', text: 'Now that we understand what to reduce…' },
            {
              type: 'heading',
              text: 'The next lesson focuses on what to increase — the chemical that builds long-term emotional safety and connection.',
              size: 'lg',
            },
            { type: 'paragraph', text: 'But first, let\'s lock this in.' },
          ],
        },
        // Quiz intro
        {
          kind: 'content',
          cta: 'Start Quiz →',
          blocks: [
            { type: 'heroEmoji', emoji: '🎯' },
            { type: 'heading', text: 'Quest Time', size: 'xl' },
            { type: 'paragraph', text: 'Let\'s test your understanding of cortisol.' },
            { type: 'paragraph', text: '6 quick questions ahead' },
          ],
        },
        // Quiz Q1
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 6,
              question: 'Which statement is correct?',
              options: [
                { label: 'Cortisol is always bad so ideally my partner and/or child shouldn\'t have any', isCorrect: false },
                { label: 'Cortisol is harmful when it\'s released due to fear that something emotionally upsetting might happen', isCorrect: true },
              ],
              feedback: 'Cortisol becomes damaging when the nervous system stays in a constant state of alert.',
            },
          ],
        },
        // Quiz Q2 (multi-select in source)
        {
          kind: 'content',
          blocks: [
            {
              type: 'multiSelectQuiz',
              questionNumber: 2,
              totalQuestions: 6,
              question: 'Which are common things parents do that release cortisol in their children?',
              options: [
                { label: 'Let child have too much screen time', isCorrect: false },
                { label: 'Sarcasm', isCorrect: true },
                { label: 'Criticism', isCorrect: true },
                { label: 'Not giving child enough vegetables', isCorrect: false },
                { label: 'Fighting with other family members', isCorrect: true },
              ],
              feedback: 'Cortisol is triggered by emotional threat and unpredictability — not nutrition choices.',
            },
          ],
        },
        // Quiz Q3
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 3,
              totalQuestions: 6,
              question: 'Cortisol is only released during a negative experience (e.g. sarcasm).',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: 'Cortisol is released whenever a child fears a negative experience might happen again.',
            },
          ],
        },
        // Quiz Q4
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 4,
              totalQuestions: 6,
              question: 'Cortisol is a minor problem in families where parents are calm and try to be good parents.',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: 'Almost all families have moments that elevate cortisol — awareness is what matters.',
            },
          ],
        },
        // Quiz Q5
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 5,
              totalQuestions: 6,
              question: 'Children with consistently high cortisol levels are more likely to…',
              options: [
                { label: 'Abuse drugs/alcohol', isCorrect: false },
                { label: 'Make poor life choices', isCorrect: false },
                { label: 'Have less happy lives', isCorrect: false },
                { label: 'Commit crimes', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Research shows high cortisol is linked to all of these outcomes.',
            },
          ],
        },
        // Quiz Q6
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 6,
              totalQuestions: 6,
              question: 'True or False: Parents can drastically reduce cortisol in their children.',
              options: [
                { label: 'True', isCorrect: true },
                { label: 'False', isCorrect: false },
              ],
              feedback: 'Cortisol responds strongly to emotional safety and predictability.',
            },
          ],
        },
        // Complete
        {
          kind: 'content',
          cta: 'Start Next Lesson →',
          blocks: [
            { type: 'heroEmoji', emoji: '🌿' },
            { type: 'heading', text: 'Lesson Complete', size: 'xl' },
            {
              type: 'paragraph',
              text: 'You\'ve learned about cortisol and how to create emotional safety',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'What You\'ve Learned:',
              lines: [
                'What cortisol is',
                'Why anticipation is more damaging than events',
                'How common and reversible this problem is',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'YOUR PROGRESS',
              lines: ['3/8', 'lessons completed'],
            },
            {
              type: 'callout',
              variant: 'preview',
              label: 'NEXT:',
              lines: ['Oxytocin — the chemical that builds emotional safety, bonding, and resilience.'],
            },
          ],
        },
      ],
    },
  ],
};
