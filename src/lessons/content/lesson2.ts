// SPEC-09 — Flow Lesson 2 content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 17 hand-built Lesson 2 flow screens
// (Lesson2Screen1..12 + Lesson2Quiz + Lesson2QuizQ1..3 + Lesson2Complete) in
// src/screens/lessons/. Text, punctuation, quotes (straight ASCII, as in the
// source), emoji, and block order reproduce the existing screens exactly. No
// redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Flow lesson: SINGLE-SECTION, linear. SPEC-18 R1 adds `storageKey` so its
// completion is recorded + synced (sequential locking needs the signal); the
// existing factory picks the key up with no new sync code. Modelled as ONE
// section (id '1'). Title uses the lesson-hub wording from LearnScreen.tsx (id '2').

import type { Lesson } from '../schema';
import { STORAGE_KEYS } from '../../constants/storageKeys';

export const lesson2: Lesson = {
  slug: 'lesson2',
  title: 'Happiness Chemicals',
  storageKey: STORAGE_KEYS.LESSON2_COMPLETED_SECTIONS,
  sections: [
    {
      id: '1',
      title: 'Happiness Chemicals',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Happiness Chemicals', size: 'xl' },
            { type: 'heading', text: 'Why does trying to make ourselves happy often backfire?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Most people assume happiness comes from getting more of what feels good — but research shows that misunderstanding how happiness works can reduce long-term well-being.',
            },
            {
              type: 'paragraph',
              text: 'In this lesson, you\'ll learn how three key body chemicals shape short-term and long-term happiness.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Happiness Backfires', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When people try to increase happiness, they usually focus on the wrong chemical.',
            },
            {
              type: 'paragraph',
              text: 'They chase short-term pleasure, novelty, or rewards — believing these will create lasting happiness.',
            },
            { type: 'paragraph', text: 'But this strategy often leaves people feeling:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Unsatisfied' },
                { icon: '•', iconKind: 'emoji', title: 'Restless' },
                { icon: '•', iconKind: 'emoji', title: 'Emotionally drained' },
              ],
            },
            {
              type: 'paragraph',
              text: 'To understand why, we need to look inside the brain.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Three Happiness Chemicals', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Your sense of happiness is influenced mainly by three chemicals:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Dopamine → short-term reward & motivation' },
                { icon: '•', iconKind: 'emoji', title: 'Oxytocin → connection & bonding' },
                { icon: '•', iconKind: 'emoji', title: 'Cortisol → stress & survival' },
              ],
            },
            {
              type: 'paragraph',
              text: 'Most people focus almost entirely on one of these — often without realizing it.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Chemical Most People Chase', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Most people are subconsciously trying to increase dopamine.',
            },
            { type: 'paragraph', text: 'Dopamine is released when we:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'See something new or exciting' },
                { icon: '•', iconKind: 'emoji', title: 'Accomplish a task' },
                { icon: '•', iconKind: 'emoji', title: 'Eat something pleasurable' },
                { icon: '•', iconKind: 'emoji', title: 'Scroll social media' },
              ],
            },
            {
              type: 'heading',
              text: 'It feels like happiness — but it isn\'t designed to last.',
              size: 'lg',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What Dopamine Really Does', size: 'xl' },
            { type: 'paragraph', text: 'Dopamine is a short-term reward system.' },
            {
              type: 'paragraph',
              text: 'It gives you a brief boost of pleasure or motivation after you do something — like:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Finishing a task' },
                { icon: '•', iconKind: 'emoji', title: 'Feeding the kids' },
                { icon: '•', iconKind: 'emoji', title: 'Taking a shower' },
                { icon: '•', iconKind: 'emoji', title: 'Buying something new' },
              ],
            },
            {
              type: 'heading',
              text: 'Its job is to encourage action — not to create lasting happiness.',
              size: 'lg',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Dopamine Always Fades', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Dopamine is designed to go away quickly, no matter what caused it.',
            },
            { type: 'heading', text: 'That\'s not a flaw — it\'s a feature.', size: 'lg' },
            {
              type: 'paragraph',
              text: 'If dopamine stayed high, the brain would stop motivating you to act.',
            },
            {
              type: 'paragraph',
              text: 'So the brain always pulls you back to baseline.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why New Things Don\'t Make Us Happy for Long', size: 'xl' },
            { type: 'paragraph', text: 'Research shows:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'A favorite food → dopamine spike for ~10 minutes' },
                { icon: '•', iconKind: 'emoji', title: 'A new car → a few minutes of extra happiness per day, for a month or two' },
                { icon: '•', iconKind: 'emoji', title: 'A new house → slightly increased happiness for a few months' },
              ],
            },
            {
              type: 'heading',
              text: 'For 99% of purchases, any happiness boost lasts less than a few hours.',
              size: 'lg',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Happiness Illusion', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Even though dopamine fades quickly, we keep believing:',
            },
            {
              type: 'callout',
              variant: 'quote',
              lines: ['"If I had what they have, I\'d be happier."'],
            },
            { type: 'paragraph', text: 'So people:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Envy others' },
                { icon: '•', iconKind: 'emoji', title: 'Chase upgrades' },
                { icon: '•', iconKind: 'emoji', title: 'Look for the next hit' },
              ],
            },
            {
              type: 'heading',
              text: 'But the brain always returns to baseline.',
              size: 'lg',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Chasing Dopamine Backfires', size: 'xl' },
            { type: 'paragraph', text: 'Trying to maximize dopamine leads to:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Constant craving' },
                { icon: '•', iconKind: 'emoji', title: 'Short-lived satisfaction' },
                { icon: '•', iconKind: 'emoji', title: 'Lower long-term happiness' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              lines: ['It\'s like trying to keep a leaky bucket full of water.'],
            },
            {
              type: 'paragraph',
              text: 'No matter how much you pour in, it keeps draining out.',
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Dopamine Isn\'t "Bad"', size: 'xl' },
            { type: 'paragraph', text: 'Dopamine isn\'t the enemy.' },
            { type: 'paragraph', text: 'You need dopamine to:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Get things done' },
                { icon: '•', iconKind: 'emoji', title: 'Stay motivated' },
                { icon: '•', iconKind: 'emoji', title: 'Enjoy small wins' },
              ],
            },
            {
              type: 'heading',
              text: 'The problem is expecting dopamine to provide long-term happiness.',
              size: 'lg',
            },
            { type: 'paragraph', text: 'It was never designed for that job.' },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'So What Should We Focus On?', size: 'xl' },
            { type: 'paragraph', text: 'If dopamine isn\'t the key to lasting happiness…' },
            { type: 'heading', text: 'What does matter?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'There are other chemicals that play a much bigger role in:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Emotional stability' },
                { icon: '•', iconKind: 'emoji', title: 'Connection' },
                { icon: '•', iconKind: 'emoji', title: 'Long-term well-being' },
              ],
            },
            { type: 'paragraph', text: 'We\'ll explore those next.' },
          ],
        },
        // Screen 12
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'BEFORE THE QUIZ' },
            { type: 'heading', text: 'What You\'ve Learned So Far', size: 'xl' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Dopamine is a short-term reward chemical' },
                { icon: '•', iconKind: 'emoji', title: 'It always fades, no matter the source' },
                { icon: '•', iconKind: 'emoji', title: 'Chasing dopamine lowers long-term happiness' },
                { icon: '•', iconKind: 'emoji', title: 'Lasting well-being requires different systems' },
              ],
            },
            { type: 'heading', text: 'Now let\'s lock this in.', size: 'lg' },
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
              text: 'Let\'s test your understanding of happiness chemicals.',
            },
            { type: 'paragraph', text: '3 quick questions ahead' },
          ],
        },
        // Quiz Q1
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 3,
              question: 'Which body chemical do most people subconsciously try to increase?',
              options: [
                { label: 'Oxytocin', isCorrect: false },
                { label: 'Cortisol', isCorrect: false },
                { label: 'Dopamine', isCorrect: true },
                { label: 'Serotonin', isCorrect: false },
              ],
              feedback: 'Correct! Most people chase dopamine without realizing it—through achievements, purchases, social validation, and other quick rewards.',
            },
          ],
        },
        // Quiz Q2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 3,
              question: 'Why doesn\'t maximizing dopamine increase long-term happiness?',
              options: [
                { label: 'Dopamine is toxic in large amounts', isCorrect: false },
                { label: 'Dopamine always fades back to baseline', isCorrect: true },
                { label: 'Dopamine only works for children', isCorrect: false },
                { label: 'Dopamine requires medical supervision', isCorrect: false },
              ],
              feedback: 'Correct! Dopamine is designed to fade quickly, no matter the source. Your brain always returns to baseline, which is why chasing it leads to constant craving rather than lasting satisfaction.',
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
              totalQuestions: 3,
              question: 'Which of the following best describes dopamine?',
              options: [
                { label: 'The enemy of happiness', isCorrect: false },
                { label: 'A short-term reward chemical', isCorrect: true },
                { label: 'The key to lasting well-being', isCorrect: false },
                { label: 'A chemical only released by exercise', isCorrect: false },
              ],
              feedback: 'Correct! Dopamine is a short-term reward chemical that helps with motivation and small wins. It\'s not bad—it\'s just not designed to provide long-term happiness.',
            },
          ],
        },
        // Complete
        {
          kind: 'content',
          cta: 'Start Next Lesson →',
          blocks: [
            { type: 'heroEmoji', icon: 'checkmark' },
            { type: 'heading', text: 'Quest Complete!', size: 'xl' },
            {
              type: 'paragraph',
              text: 'You\'ve mastered happiness chemicals',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'YOUR PROGRESS',
              lines: ['2/8', 'lessons completed'],
            },
          ],
        },
      ],
    },
  ],
};
