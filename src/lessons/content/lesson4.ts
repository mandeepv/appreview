// SPEC-09 — Flow Lesson 4 content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 19 hand-built Lesson 4 flow screens
// (Lesson4Screen1..11 + Lesson4Quiz + Lesson4QuizQ1..6 + Lesson4Complete) in
// src/screens/lessons/. Text, punctuation, quotes (straight ASCII, as in the
// source), emoji, and block order reproduce the existing screens exactly. No
// redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Flow lesson: SINGLE-SECTION, linear. SPEC-18 R1 adds `storageKey` so its
// completion is recorded + synced (sequential locking needs the signal); the
// existing factory picks the key up with no new sync code. Modelled as ONE
// section (id '1'). Title uses the lesson-hub wording from LearnScreen.tsx (id '4').
//
// NOTE: QuizQ2, QuizQ3, QuizQ6 use the `QuizQuestionMultiSelect` component
// (multiple correct answers). The schema `quiz` block maps 1:1 to the
// single-answer `QuizQuestion`; those are transcribed as `quiz` blocks
// preserving every option + isCorrect flag, but the multi-select interaction is
// not reproduced. See CONTENT_ERRATA.md.

import type { Lesson } from '../schema';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export const lesson4: Lesson = {
  slug: 'lesson4',
  title: 'The Long-Term Happiness Chemical',
  storageKey: STORAGE_KEYS.LESSON4_COMPLETED_SECTIONS,
  sections: [
    {
      id: '1',
      title: 'The Long-Term Happiness Chemical',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'DAY 6 · FOUNDATIONS' },
            { type: 'heading', text: 'The Long-Term Happiness Chemical', size: 'xl' },
            { type: 'paragraph', text: 'So far, we\'ve learned:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Why maximizing dopamine doesn\'t lead to long-term happiness' },
                { icon: '•', iconKind: 'emoji', title: 'Why high cortisol silently harms well-being' },
              ],
            },
            { type: 'paragraph', text: 'So what should we focus on increasing?' },
            { type: 'heading', text: 'The answer is oxytocin.', size: 'lg' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Chemical With the Biggest Long-Term Impact', size: 'xl' },
            {
              type: 'heading',
              text: 'Oxytocin has the strongest link to long-term well-being — but only when it\'s increased in safe relationships.',
              size: 'lg',
            },
            { type: 'paragraph', text: 'Think of oxytocin like:' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Eating healthy', 'Exercising'],
            },
            {
              type: 'paragraph',
              text: 'You don\'t feel the effects immediately.\nBut over time, it changes everything.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What Is Oxytocin?', size: 'xl' },
            { type: 'paragraph', text: 'Oxytocin is a bonding chemical.' },
            { type: 'paragraph', text: 'It\'s released when we feel:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Emotionally safe' },
                { icon: '•', iconKind: 'emoji', title: 'Accepted' },
                { icon: '•', iconKind: 'emoji', title: 'Connected' },
              ],
            },
            {
              type: 'heading',
              text: 'It doesn\'t create excitement or pleasure.\nIt creates security and belonging.',
              size: 'lg',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Oxytocin Is Often Overlooked', size: 'xl' },
            { type: 'paragraph', text: 'Oxytocin doesn\'t feel exciting.' },
            { type: 'paragraph', text: 'There\'s no rush.\nNo thrill.\nNo immediate payoff.' },
            {
              type: 'heading',
              text: 'That\'s why people often chase dopamine instead — even though oxytocin matters far more for happiness over time.',
              size: 'lg',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Humans Are Wired This Way', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              lines: [
                'Early humans lived in tribes.',
                'Those who deeply cared about:',
              ],
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Belonging' },
                { icon: '•', iconKind: 'emoji', title: 'Being valued' },
                { icon: '•', iconKind: 'emoji', title: 'Staying connected' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              lines: ['were more likely to survive and pass on their genes.'],
            },
            {
              type: 'heading',
              text: 'We are descendants of people who needed connection to survive.',
              size: 'lg',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Cost of Weak Connection', size: 'xl' },
            { type: 'paragraph', text: 'When oxytocin stays low:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Stress feels heavier' },
                { icon: '•', iconKind: 'emoji', title: 'Happiness feels fragile' },
                { icon: '•', iconKind: 'emoji', title: 'People feel lonely even around others' },
              ],
            },
            {
              type: 'heading',
              text: 'Humans are biologically uncomfortable without deep bonds.',
              size: 'lg',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Oxytocin Is Not About Rewards', size: 'xl' },
            { type: 'paragraph', text: 'Oxytocin does not come from:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Treats' },
                { icon: '•', iconKind: 'emoji', title: 'Entertainment' },
                { icon: '•', iconKind: 'emoji', title: 'Buying things' },
              ],
            },
            { type: 'paragraph', text: 'Those mostly increase dopamine.' },
            {
              type: 'heading',
              text: 'Oxytocin grows through emotional safety and closeness.',
              size: 'lg',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'How Oxytocin Is Built', size: 'xl' },
            { type: 'paragraph', text: 'Oxytocin increases through:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Predictable emotional responses' },
                { icon: '•', iconKind: 'emoji', title: 'Physical closeness that feels safe' },
                { icon: '•', iconKind: 'emoji', title: 'Feeling understood without judgment' },
              ],
            },
            {
              type: 'heading',
              text: 'It\'s not one big moment.\nIt\'s many small signals, repeated daily.',
              size: 'lg',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Oxytocin Is Mutual', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['When you increase your child\'s oxytocin, yours increases too.'],
            },
            { type: 'paragraph', text: 'That\'s why deep connection:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Calms both people' },
                { icon: '•', iconKind: 'emoji', title: 'Reduces stress for parents' },
                { icon: '•', iconKind: 'emoji', title: 'Improves long-term well-being for the whole family' },
              ],
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'It\'s Never Too Late', size: 'xl' },
            { type: 'paragraph', text: 'Just like it\'s never too late to:' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Eat healthier', 'Exercise'],
            },
            { type: 'paragraph', text: 'It\'s never too late to:' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              lines: [
                'Build deeper bonds',
                'Increase oxytocin',
                'Improve long-term happiness',
              ],
            },
            { type: 'heading', text: 'Small changes compound.', size: 'lg' },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'How Kinderwell Helps', size: 'xl' },
            { type: 'paragraph', text: 'Kinderwell doesn\'t just explain oxytocin.' },
            { type: 'paragraph', text: 'It helps you:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Build deeper bonds with your specific child' },
                { icon: '•', iconKind: 'emoji', title: 'Use age-appropriate connection strategies' },
                { icon: '•', iconKind: 'emoji', title: 'Practice small daily behaviors that raise oxytocin' },
              ],
            },
            { type: 'heading', text: 'This is where long-term change begins.', size: 'lg' },
          ],
        },
        // Quiz intro
        {
          kind: 'content',
          cta: 'Start Quiz →',
          blocks: [
            { type: 'heroEmoji', emoji: '🎯' },
            { type: 'heading', text: 'Quest Time', size: 'xl' },
            {
              type: 'paragraph',
              text: 'These questions help reinforce what you\'ve learned across the last three lessons.',
            },
            { type: 'paragraph', text: 'No pressure — just learning.' },
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
              question: 'To increase my child\'s long-term well-being, I should optimize body chemicals like this:',
              options: [
                { label: 'Increase cortisol, decrease oxytocin, and increase dopamine', isCorrect: false },
                { label: 'Decrease cortisol, decrease oxytocin, and increase dopamine', isCorrect: false },
                { label: 'Decrease cortisol, and increase oxytocin in safe relationships', isCorrect: true },
              ],
              feedback: 'Long-term well-being depends more on safety and connection than pleasure.',
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
              question: 'Select the dopamine activities below:',
              options: [
                { label: 'Buying a new shirt', isCorrect: true },
                { label: 'Viewing social media', isCorrect: true },
                { label: 'Eating favorite food', isCorrect: true },
                { label: 'Giving a hug', isCorrect: false },
              ],
              feedback: 'Dopamine is about reward and novelty, not bonding.',
            },
          ],
        },
        // Quiz Q3 (multi-select in source)
        {
          kind: 'content',
          blocks: [
            {
              type: 'multiSelectQuiz',
              questionNumber: 3,
              totalQuestions: 6,
              question: 'Which activities trigger harmful cortisol?',
              options: [
                { label: 'Sarcasm / criticism', isCorrect: true },
                { label: 'Teasing', isCorrect: true },
                { label: 'Frequent angry outbursts at family members', isCorrect: true },
                { label: 'Calmly asking a child to do homework', isCorrect: false },
              ],
              feedback: 'Cortisol comes from emotional threat and unpredictability.',
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
              question: 'What is the BEST way for a parent to increase their child\'s oxytocin levels?',
              options: [
                { label: 'Frequently sitting next to the child', isCorrect: false },
                { label: 'Hugging the child', isCorrect: false },
                { label: 'Smiling at the child', isCorrect: false },
                { label: 'Building a deep bond with the child', isCorrect: true },
              ],
              feedback: 'Physical touch helps, but deep emotional safety matters most.',
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
              question: 'True or False: Increasing my child\'s oxytocin levels also increases mine and benefits my long-term well-being.',
              options: [
                { label: 'True', isCorrect: true },
                { label: 'False', isCorrect: false },
              ],
              feedback: 'Connection is biologically beneficial for both people.',
            },
          ],
        },
        // Quiz Q6 (multi-select in source)
        {
          kind: 'content',
          blocks: [
            {
              type: 'multiSelectQuiz',
              questionNumber: 6,
              totalQuestions: 6,
              question: 'Select all the oxytocin-increasing activities below:',
              options: [
                { label: 'Giving a hug', isCorrect: true },
                { label: 'Sitting close with arms or legs touching', isCorrect: true },
                { label: 'Patting your child on the shoulder in passing', isCorrect: true },
                { label: 'Ice cream', isCorrect: false },
                { label: 'Video games', isCorrect: false },
              ],
              feedback: 'Physical connection and closeness increase oxytocin, while treats increase dopamine.',
            },
          ],
        },
        // Complete
        {
          kind: 'content',
          cta: 'Continue →',
          blocks: [
            { type: 'heroEmoji', emoji: '🌱' },
            { type: 'heading', text: 'Foundation Complete', size: 'xl' },
            {
              type: 'paragraph',
              text: 'You now understand the chemistry of well-being',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'What You\'ve Learned:',
              lines: [
                'What not to chase (dopamine)',
                'What to reduce (cortisol)',
                'What to build (oxytocin)',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'YOUR PROGRESS',
              lines: ['4/8', 'lessons completed'],
            },
            {
              type: 'callout',
              variant: 'preview',
              label: 'NEXT:',
              lines: ['Creating emotional safety in everyday moments.'],
            },
          ],
        },
      ],
    },
  ],
};
