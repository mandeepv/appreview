// SPEC-09 — Labeling Emotions lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 23 hand-built Labeling Emotions
// section screens in src/screens/lessons/Lesson5Sec{1..4}Screen*.tsx
// (Sec1: 7 screens, Sec2: 4, Sec3: 8, Sec4: 4). Text, punctuation, quotes
// (straight ASCII, as in the source), emoji, and block order reproduce the
// existing screens exactly. No redesign, no typo fixes — observed issues are
// logged in docs/spec-09/CONTENT_ERRATA.md instead.
//
// Structural mapping (progress byte-compatibility): the four SECTIONS are
// modelled with ids '1'..'4' — the same values the source stores via
// markSectionComplete('1'..'4') into '@lesson5_completed_sections' (verified:
// each section's LAST screen calls markSectionComplete with its id — '1'←Sec1
// Screen7, '2'←Sec2Screen4, '3'←Sec3Screen8, '4'←Sec4Screen4). The controller
// writes the section id on the last screen of each section, reproducing the
// identical ['1'..'4'] array. Section titles use the sublesson topic wording
// from the lesson hub (LabelingEmotionsLessonScreen.tsx).
//
// OUT OF SCOPE: Lesson5Complete.tsx is a hub-level "whole lesson done" screen
// (not part of any section's linear flow, writes no progress); it is NOT
// transcribed.

import type { Lesson } from '../schema';

export const labelingEmotions: Lesson = {
  slug: 'labelingEmotions',
  title: 'The Importance of\nLabeling Emotions',
  storageKey: '@lesson5_completed_sections',
  sections: [
    // =====================================================================
    // Section 1 — Why Should We Label Emotions
    // =====================================================================
    {
      id: '1',
      title: 'Why Should We Label Emotions',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 1 OF 4',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why Naming Emotions Matters', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Researchers have shown that labeling emotions is a vital skill towards helping your child avoid cortisol and increase oxytocin.',
            },
            { type: 'heading', text: 'Why?', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Cortisol and oxytocin are caused by your child\'s emotions.' },
                { icon: '•', iconKind: 'emoji', title: 'If you don\'t really understand your child\'s underlying emotions, it is hard to effectively help him/her.' },
              ],
            },
            {
              type: 'paragraph',
              text: 'In this lesson you are going to learn how to determine your own underlying emotions so you can eventually help your child with his/hers.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🚗' },
            { type: 'heading', text: 'A Traffic Story', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              lines: [
                'It\'s a little after 3 p.m. and I\'m stopped cold in traffic.\nI see red brake lights for miles — Highway 1.',
              ],
            },
            {
              type: 'paragraph',
              text: 'I mumbled to myself.\nI was running late and feeling frustrated.',
            },
            {
              type: 'paragraph',
              text: 'I even caught myself thinking negative thoughts about other drivers who had to switch lanes in front of me, which is never a good sign about my emotional state.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: [
                '"It\'s not his fault.\nYou were frustrated because you are stuck in traffic."',
              ],
            },
            { type: 'heading', text: 'Oddly, I felt a lot better.', size: 'lg' },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '😌' },
            { type: 'heading', text: 'Story Continuation', size: 'xl' },
            {
              type: 'paragraph',
              text: 'I relaxed my shoulders, turned on the radio, and continued to sit in traffic — but with less tension.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              lines: [
                'This seemed absurd to me, because if you had asked, I would have told you that I knew exactly what I was feeling and that recognizing it would only make it worse.',
              ],
            },
            { type: 'heading', text: 'But in reality, I felt a lot better.', size: 'lg' },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🧑‍⚕️' },
            { type: 'heading', text: 'What Psychologists Know', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              center: true,
              lines: ['That story was told by Michael Miller on SixSeconds.org.'],
            },
            {
              type: 'paragraph',
              text: 'It wouldn\'t surprise any good psychologists, because naming the emotions of their clients is one of the most common practices in therapy.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: [
                'Why is it important to label our feelings?',
                'How does it actually help?',
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🧠' },
            { type: 'heading', text: 'The Science', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When we give something such as a difficult emotion a name or a label, it allows our logical brain to help regulate and organize the primitive and emotional parts of our brain.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              lines: [
                'When our feelings are swirling around us in an unorganized chaos, the logical brain can\'t help.',
                'It can only help if it understands.',
              ],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🔬' },
            { type: 'heading', text: 'Research Proof', size: 'xl' },
            {
              type: 'paragraph',
              text: 'By giving the emotion a name, the logical brain can step in and calm the other parts down.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E3F2FF',
              label: 'UCLA BRAIN MAPPING CENTER',
              labelColor: '#1976D2',
              lines: [
                'They have special machines that can literally watch how our brain calms down when naming emotions.',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              accentColor: '#FFA726',
              lines: [
                '"In the same way you hit the brake when you see a yellow light, when you put feelings into words you seem to be hitting the brakes on your emotional responses."',
                '— Matthew Lieberman, UCLA',
              ],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'Why is it important to name our emotions?',
              options: [
                { label: 'It lets our logical brain help process them', isCorrect: false },
                { label: 'It helps us hit the brakes and consider how best to respond', isCorrect: false },
                { label: 'It helps us understand what we are feeling', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Naming emotions activates our logical brain, helps us pause before reacting, and deepens our self-understanding.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2 — The Power of Giving Something a Name
    // =====================================================================
    {
      id: '2',
      title: 'The Power of Giving Something a Name',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 2 OF 4',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'The Power of Giving Something a Name', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Let\'s look at a different example about the power of giving something a name.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🚁' },
            { type: 'heading', text: 'Helicopter Parent', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Have you ever heard of a "helicopter parent"?',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: [
                'The term "helicopter parent" was invented in the 1980s to describe parents who are always "hovering" over their children.',
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'After the term \'helicopter parent\' was invented, what do you think happened to instances of helicopter parenting?',
              options: [
                { label: 'It went up', isCorrect: false },
                { label: 'It stayed the same', isCorrect: false },
                { label: 'It went down', isCorrect: true },
              ],
              feedback: 'When we name a behavior, we become more aware of it and can better recognize and avoid it.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Continue →',
          blocks: [
            { type: 'heroEmoji', emoji: '💡' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              accentColor: '#2E7D32',
              center: true,
              lines: [
                '"Giving something a name allows us to make sense of it, and helps us manage it in a healthy way."',
                '— Dr. Sarah Watamura',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3 — How to Label Emotions
    // =====================================================================
    {
      id: '3',
      title: 'How to Label Emotions',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 3 OF 4',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'How to Name Emotions Correctly', size: 'xl' },
            { type: 'paragraph', text: 'How should we name emotions?' },
            { type: 'heading', text: 'Let\'s start by looking at a list of emotions.', size: 'lg' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '⚠️' },
            { type: 'heading', text: 'Broad Emotions', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF3E0',
              accentColor: '#FF9800',
              label: 'TOO BROAD / DON\'T USE',
              labelColor: '#E65100',
              center: true,
              lines: [
                'Happy',
                'Mad',
                'Sad',
                'Bad',
              ],
            },
            {
              type: 'paragraph',
              text: 'These emotions are really just symptoms of the more specific emotions below and don\'t help us really understand what is going on.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '👩‍👧' },
            { type: 'heading', text: 'Parent Example', size: 'xl' },
            { type: 'paragraph', text: 'Here\'s an example.' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              center: true,
              lines: ['A child just told her mother a lie.'],
            },
            {
              type: 'paragraph',
              text: 'On the surface, the mom might feel angry.\nShe might start yelling or giving out a punishment.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: ['But the anger is just a symptom of deeper emotions.'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🔍' },
            { type: 'heading', text: 'Deeper Emotions', size: 'xl' },
            { type: 'paragraph', text: 'The parent might actually be feeling:' },
            {
              type: 'callout',
              variant: 'summary',
              label: 'FRUSTRATION',
              dividers: true,
              lines: [
                'that the child would lie when she has been taught that lying is wrong',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'WORRY',
              lines: [
                'that this may be an indication that she isn\'t a good enough mom',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              accentColor: '#2E7D32',
              lines: [
                'The specific emotions of frustration and worry came out as the surface emotion of anger.',
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '👨‍👦' },
            { type: 'heading', text: 'Teen Example', size: 'xl' },
            { type: 'paragraph', text: 'Let\'s look at another situation.' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              center: true,
              lines: ['A teen failed his driver\'s license test.'],
            },
            { type: 'paragraph', text: 'On the surface, he just seemed sad.' },
            {
              type: 'callout',
              variant: 'summary',
              label: 'But underneath, he might feel:',
              lines: [
                'Overwhelmed by all the errors pointed out',
                'Disappointed because he was excited to drive his friends',
                'Nervous about failing again and admitting it',
              ],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '💡' },
            { type: 'heading', text: 'Key Insight', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              accentColor: '#2E7D32',
              lines: [
                'The specific emotions of being overwhelmed, disappointed, and nervous were expressed as the surface emotion of sadness.',
              ],
            },
            {
              type: 'heading',
              text: 'This works when we name our own emotions — and when we name emotions for others.',
              size: 'lg',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '💝' },
            { type: 'heading', text: 'Bonding Through Emotions', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              lines: [
                'By helping and encouraging others to name their emotions too, we can use our logical brain to help their logical brain calm down the other parts.',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFE4ED',
              center: true,
              lines: [
                'Naming emotions for others is the number one way to build a deep bond with our loved ones.',
              ],
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'True or False: We should try to use words like \'happy,\' \'mad,\' \'sad,\' and \'bad\' when labeling emotions.',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: 'These broad words don\'t help us understand the specific emotions underneath. Use more precise emotion words instead.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4 — Is Learning Enough?
    // =====================================================================
    {
      id: '4',
      title: 'Is Learning Enough?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 4 OF 4',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Practice Makes This a Skill', size: 'xl' },
            { type: 'heroEmoji', emoji: '🎯' },
            { type: 'heading', text: 'But how do I become good at naming emotions?', size: 'lg' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '⚠️' },
            { type: 'heading', text: 'The Reality', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: [
                'People often assume that once they learn about the importance of naming emotions, they\'re done.',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFE4ED',
              center: true,
              lines: ['This couldn\'t be further from the truth.'],
            },
            { type: 'heading', text: 'It needs to be practiced until it becomes a habit.', size: 'lg' },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '🎻' },
            { type: 'heading', text: 'Like Learning an Instrument', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              center: true,
              lines: ['Like learning an instrument, you will only improve if you practice.'],
            },
            {
              type: 'paragraph',
              text: 'Imagine someone who wanted to learn the violin but only watched a few YouTube videos.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: ['Do you think they would be any good?'],
            },
            { type: 'heading', text: 'Of course not.', size: 'lg' },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Continue →',
          blocks: [
            { type: 'heroEmoji', emoji: '✨' },
            { type: 'heading', text: 'The Truth About Skills', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              center: true,
              lines: ['Certain skills need real practice or no progress is made.'],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              accentColor: '#2E7D32',
              textColor: '#2E7D32',
              center: true,
              lines: ['Emotion labeling is one of them.'],
            },
          ],
        },
      ],
    },
  ],
};
