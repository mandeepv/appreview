// SPEC-09 — Flow Lesson 1 content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 16 hand-built Lesson 1 flow screens
// (Lesson1Screen1..11 + Lesson1Quiz + Lesson1QuizQ1..3 + Lesson1Complete) in
// src/screens/lessons/. Text, punctuation, quotes (straight ASCII, as in the
// source), emoji, and block order reproduce the existing screens exactly. No
// redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Flow lessons are SINGLE-SECTION and linear — they do NOT persist section
// progress (they just return to MainTabs on completion). So `storageKey` is
// OMITTED (the controller then skips the progress write), and the whole lesson
// is modelled as ONE section (id '1'). Title uses the lesson-hub wording from
// LearnScreen.tsx (learningModules id '1').

import type { Lesson } from '../schema';

export const lesson1: Lesson = {
  slug: 'lesson1',
  title: 'What changed parenting Science?',
  sections: [
    {
      id: '1',
      title: 'What changed parenting Science?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'DAY 1 · FOUNDATIONS' },
            { type: 'heading', text: 'What Changed in How We Understand Parenting', size: 'xl' },
            {
              type: 'paragraph',
              text: 'For generations, parents were told that discipline, obedience, and control were the foundations of raising good children.',
            },
            {
              type: 'paragraph',
              text: 'And for a long time, this was considered "common sense."',
            },
            {
              type: 'paragraph',
              text: 'But over the last few decades, research in neuroscience, psychology, and child development has quietly overturned many of these assumptions.',
            },
            {
              type: 'paragraph',
              text: 'This lesson explains what changed — and why it matters for you today.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Traditional Parenting Model', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Most traditional parenting advice was built on three ideas:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Children need external control to behave well' },
                { icon: '•', iconKind: 'emoji', title: 'Fear, punishment, or authority teach right from wrong' },
                { icon: '•', iconKind: 'emoji', title: 'Emotions should be suppressed so children "learn discipline"' },
              ],
            },
            {
              type: 'paragraph',
              text: 'This model aimed to produce obedience — and sometimes it did.',
            },
            {
              type: 'paragraph',
              text: 'But obedience is not the same as learning, emotional regulation, or long-term character.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why This Model Survived for So Long', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Traditional methods often appear effective in the short term.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'A child stops crying.' },
                { icon: '•', iconKind: 'emoji', title: 'A behavior stops — for now.' },
                { icon: '•', iconKind: 'emoji', title: 'The house gets quieter.' },
              ],
            },
            {
              type: 'paragraph',
              text: 'But research later showed that this quiet often came from fear or emotional shutdown, not understanding.',
            },
            {
              type: 'paragraph',
              text: 'What looks like success in the moment can create problems later.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Then Science Started Asking Different Questions', size: 'xl' },
            { type: 'paragraph', text: 'Instead of asking:' },
            {
              type: 'callout',
              variant: 'quote',
              lines: ['"How do we control children?"'],
            },
            { type: 'paragraph', text: 'Researchers began asking:' },
            {
              type: 'callout',
              variant: 'quote',
              lines: ['"How do children\'s brains actually develop?"'],
            },
            { type: 'paragraph', text: 'Advances in:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Brain imaging' },
                { icon: '•', iconKind: 'emoji', title: 'Stress physiology' },
                { icon: '•', iconKind: 'emoji', title: 'Attachment research' },
              ],
            },
            { type: 'paragraph', text: 'revealed something crucial.' },
            {
              type: 'paragraph',
              text: 'Children\'s brains are still under construction — especially the parts responsible for impulse control, emotional regulation, and reasoning.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'A Key Discovery About the Brain', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When a child is overwhelmed, scared, or emotionally flooded:',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'The thinking part of the brain goes offline',
                'The survival part takes over',
              ],
            },
            {
              type: 'paragraph',
              text: 'In this state, children cannot learn lessons, even if they appear to comply.',
            },
            {
              type: 'heading',
              text: 'This means punishment during emotional distress teaches very little — except fear.',
              size: 'lg',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Modern Parenting Science Reframed the Goal', size: 'xl' },
            { type: 'heading', text: 'The goal is no longer control.', size: 'lg' },
            { type: 'heading', text: 'The goal is skill-building.', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Modern parenting focuses on helping children develop:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Emotional regulation' },
                { icon: '•', iconKind: 'emoji', title: 'Internal discipline' },
                { icon: '•', iconKind: 'emoji', title: 'Empathy' },
                { icon: '•', iconKind: 'emoji', title: 'Problem-solving' },
              ],
            },
            {
              type: 'paragraph',
              text: 'These skills grow through co-regulation, not force.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'A FOUNDATIONAL IDEA' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Behavior is a signal, not a moral failure.'],
            },
            {
              type: 'paragraph',
              text: 'When children act out, they are usually communicating:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Stress' },
                { icon: '•', iconKind: 'emoji', title: 'Frustration' },
                { icon: '•', iconKind: 'emoji', title: 'Unmet needs' },
                { icon: '•', iconKind: 'emoji', title: 'Immature regulation skills' },
              ],
            },
            {
              type: 'heading',
              text: 'Understanding the signal changes how we respond.',
              size: 'lg',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'This Is Not "Permissive Parenting"', size: 'xl' },
            { type: 'paragraph', text: 'Modern parenting does not mean:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'No rules' },
                { icon: '•', iconKind: 'emoji', title: 'No boundaries' },
                { icon: '•', iconKind: 'emoji', title: 'Letting children do whatever they want' },
              ],
            },
            { type: 'heading', text: 'Boundaries are essential.', size: 'lg' },
            { type: 'paragraph', text: 'The difference is how they are enforced:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Calm instead of threatening' },
                { icon: '•', iconKind: 'emoji', title: 'Consistent instead of reactive' },
                { icon: '•', iconKind: 'emoji', title: 'Firm and emotionally safe' },
              ],
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What This Looks Like in Real Life', size: 'xl' },
            { type: 'paragraph', text: 'When a child has a meltdown:' },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Old approach:',
              lines: ['"Stop crying or you\'ll be punished."'],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Modern approach:',
              lines: ['"I see you\'re overwhelmed. I\'m here. We\'ll handle this together."'],
            },
            {
              type: 'heading',
              text: 'This doesn\'t remove limits — it changes the path to learning.',
              size: 'lg',
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'If This Feels New or Uncomfortable', size: 'xl' },
            { type: 'heading', text: 'That doesn\'t mean you\'ve been doing it wrong.', size: 'lg' },
            { type: 'paragraph', text: 'It means:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'You were using tools based on outdated understanding' },
                { icon: '•', iconKind: 'emoji', title: 'You\'re now learning more effective ones' },
              ],
            },
            {
              type: 'heading',
              text: 'Growth begins with better information — not self-blame.',
              size: 'lg',
            },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'eyebrow', text: 'BEFORE THE QUIZ' },
            { type: 'heading', text: 'What You Learned in This Lesson', size: 'xl' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Why traditional parenting focused on control' },
                { icon: '•', iconKind: 'emoji', title: 'How brain science changed our understanding of behavior' },
                { icon: '•', iconKind: 'emoji', title: 'Why emotional safety is essential for learning' },
                { icon: '•', iconKind: 'emoji', title: 'What modern parenting is actually trying to build' },
              ],
            },
            {
              type: 'heading',
              text: 'This foundation will shape everything that comes next.',
              size: 'lg',
            },
          ],
        },
        // Quiz intro
        {
          kind: 'content',
          cta: 'Start →',
          blocks: [
            { type: 'heroEmoji', emoji: '🎯' },
            { type: 'heading', text: 'Quest Time!', size: 'xl' },
            { type: 'paragraph', text: 'Let\'s lock in what you just learned' },
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
              question: 'When a child is emotionally overwhelmed, which part of the brain is least available?',
              options: [
                { label: 'The emotional center', isCorrect: false },
                { label: 'The thinking / reasoning center', isCorrect: true },
                { label: 'The memory center', isCorrect: false },
                { label: 'The language center', isCorrect: false },
              ],
              feedback: 'When stress is high, reasoning shuts down — connection comes first.',
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
              question: 'According to modern parenting science, the primary goal of discipline is:',
              options: [
                { label: 'Immediate obedience', isCorrect: false },
                { label: 'Preventing future mistakes', isCorrect: false },
                { label: 'Skill-building over time', isCorrect: true },
                { label: 'Maintaining authority', isCorrect: false },
              ],
              feedback: 'Discipline is about teaching skills children don\'t yet have.',
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
              question: 'A child throws a tantrum because playtime ended. Which response best fits modern parenting principles?',
              options: [
                { label: 'Punish the behavior immediately', isCorrect: false },
                { label: 'Ignore the child completely', isCorrect: false },
                { label: 'Acknowledge feelings while holding the boundary', isCorrect: true },
                { label: 'Give in to stop the tantrum', isCorrect: false },
              ],
              feedback: 'Acknowledging feelings while maintaining boundaries helps children learn emotional regulation.',
            },
          ],
        },
        // Complete
        {
          kind: 'content',
          cta: 'Continue to Learn →',
          blocks: [
            { type: 'heroEmoji', emoji: '✓' },
            { type: 'heading', text: 'Day 1 complete 🌱', size: 'xl' },
            {
              type: 'paragraph',
              text: 'You\'ve learned how parenting science changed — and why many old methods failed.',
            },
            { type: 'eyebrow', text: 'Up next:' },
            {
              type: 'paragraph',
              text: 'Day 2 · Why children struggle with self-control — and what actually helps',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Lesson completed'],
            },
          ],
        },
      ],
    },
  ],
};
