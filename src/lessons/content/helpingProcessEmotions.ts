// SPEC-09 — Helping Someone Process Emotions lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 11 hand-built screen files in
// src/screens/helpingProcessEmotions/. Text, punctuation, quotes, and block
// order reproduce the existing screens exactly. No redesign, no typo fixes —
// observed issues are logged in docs/spec-09/CONTENT_ERRATA.md instead.
//
// Section id strings ('1','2') verified against markSectionComplete('1') in
// Sec1Screen1 and markSectionComplete('2') in Sec2Screen10.
//
// Transcription notes:
// - §2 screen1 is a Dad/Daughter dialogue card. The cardList block renders only
//   an item title (subtitle is not rendered), so to preserve ALL dialogue text
//   verbatim each line is a paragraph with the speaker name as an inline
//   emphasis span, followed by the italic helper footer.
// - The QuizQuestion screens (§2 screens 2,4,5,7,8,9) map 1:1 to the `quiz`
//   block (questionNumber/totalQuestions/options[label,isCorrect]/feedback).

import type { Lesson } from '../schema';

export const helpingProcessEmotions: Lesson = {
  slug: 'helpingProcessEmotions',
  title: 'Helping Someone Process Emotions',
  storageKey: '@helping_process_emotions_completed_sections',
  sections: [
    // =====================================================================
    // Section 1
    // =====================================================================
    {
      id: '1',
      title: 'Introduction to the lesson',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Helping Someone Process Emotions', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When someone we care about is upset, our instinct is often to fix the problem, cheer them up, or make the feelings go away.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#EAF2FF',
              leftAccent: true,
              lines: [
                "But strong emotions aren't problems to solve.",
                "They're experiences to be understood.",
              ],
            },
            { type: 'heading', text: "In this lesson, you'll learn:", size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'What actually helps someone feel better' },
                { icon: '•', iconKind: 'emoji', title: 'Why problem-solving too early backfires' },
                { icon: '•', iconKind: 'emoji', title: 'How emotional moments build deeper bonds' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              lines: [
                "Let's revisit the sleepover situation — this time, with a different approach.",
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2
    // =====================================================================
    {
      id: '2',
      title: 'Scenario - The sleepover - take two',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 2 OF 2',
          cta: 'Next',
          blocks: [
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: "Hey, babe. What's going on?", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: 'Paige is having a sleepover and she invited everyone… except me.', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: "That's really surprising. It seemed like you two were getting along so well last week.", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: "Yeah. She's just been really distant lately.", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: 'Does that make you worried she might keep pulling away?', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: "Yeah. I don't want to lose her… or my other friends.", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: 'That sounds really frustrating.', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: "It is. And it's embarrassing. Everyone's going to see the pictures.", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: "I hate that feeling of being embarrassed. I'm really sorry you're going through that.", emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: "Let me know if there's anything I can do to help.", emphasis: 'plain' },
              ],
            },
            { type: 'footer', text: "Notice what Dad isn't doing." },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 6,
              question: 'What is Dad focusing on in this conversation?',
              options: [
                { label: 'Solving the sleepover problem', isCorrect: false },
                { label: 'Making her feel better quickly', isCorrect: false },
                { label: 'Understanding how she feels', isCorrect: true },
                { label: 'Teaching her how to respond better', isCorrect: false },
              ],
              feedback: 'Correct. Dad is listening to understand her emotional experience, not to fix the situation.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Processing Emotions Comes First', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Before someone can think clearly or move forward, their emotions need space.',
            },
            { type: 'paragraph', text: 'When emotions are acknowledged:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'The nervous system calms down' },
                { icon: '•', iconKind: 'emoji', title: 'Defensiveness decreases' },
                { icon: '•', iconKind: 'emoji', title: 'Trust increases' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#EAF2FF',
              leftAccent: true,
              lines: [
                'Trying to "fix it" too early often makes the emotions stronger — not weaker.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 6,
              question: "Why didn't Dad immediately suggest solutions?",
              options: [
                { label: "He didn't know what to say", isCorrect: false },
                { label: 'He wanted her to figure it out alone', isCorrect: false },
                { label: "She wasn't emotionally ready yet", isCorrect: true },
                { label: "Solutions aren't helpful", isCorrect: false },
              ],
              feedback: 'Exactly. She needed to process her emotions first before she could hear any solutions.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 3,
              totalQuestions: 6,
              question: 'What feeling does Dad help her identify?',
              options: [
                { label: 'Anger', isCorrect: false },
                { label: 'Embarrassment', isCorrect: true },
                { label: 'Jealousy', isCorrect: false },
                { label: 'Disappointment', isCorrect: false },
              ],
              feedback: 'Right. By naming the embarrassment, Dad helped her identify what she was really feeling.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: "You Can't Skip the Feeling Part", size: 'xl' },
            {
              type: 'paragraph',
              text: "People don't need solutions when they're overwhelmed.\nThey need:",
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', title: 'To feel heard' },
                { iconKind: 'ionicon', title: 'To feel understood' },
                { iconKind: 'ionicon', title: 'To feel safe' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              leftAccent: true,
              accentColor: '#2E7D32',
              lines: ['Once emotions are processed, problem-solving becomes much easier.'],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 4,
              totalQuestions: 6,
              question: 'What would most likely happen if Dad jumped straight to advice?',
              options: [
                { label: 'She would feel relieved', isCorrect: false },
                { label: 'She would feel understood', isCorrect: false },
                { label: 'She would feel dismissed', isCorrect: true },
                { label: 'She would calm down faster', isCorrect: false },
              ],
              feedback: 'Right. Jumping to solutions before processing emotions usually makes people feel unheard.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 5,
              totalQuestions: 6,
              question: 'True or False: Helping someone process emotions means agreeing with them.',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: "Correct. You can validate someone's feelings without agreeing with their perspective.",
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 6,
              totalQuestions: 6,
              question: 'What is Dad actually building in this conversation?',
              options: [
                { label: 'Conflict resolution skills', isCorrect: false },
                { label: 'Emotional resilience', isCorrect: false },
                { label: 'A deeper bond', isCorrect: true },
                { label: 'Independence', isCorrect: false },
              ],
              feedback: 'Exactly. By being emotionally present, Dad is building trust and deepening their connection.',
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heading', text: 'Solving the Problem Is Not the Goal', size: 'xl' },
            { type: 'heading', text: 'The goal is not to:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Make the feeling go away', color: '#FFF9E6' },
                { icon: '•', iconKind: 'emoji', title: 'Fix the situation immediately', color: '#FFF9E6' },
                { icon: '•', iconKind: 'emoji', title: 'Say the "perfect" thing', color: '#FFF9E6' },
              ],
            },
            { type: 'heading', text: 'The real goal is to:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Help them process their emotions', color: '#E8F5E9' },
                { icon: '•', iconKind: 'emoji', title: 'Make them feel understood', color: '#E8F5E9' },
                { icon: '•', iconKind: 'emoji', title: 'Strengthen your emotional bond', color: '#E8F5E9' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#EAF2FF',
              leftAccent: true,
              lines: ['When people feel emotionally safe, solutions follow naturally.'],
            },
            {
              type: 'footer',
              text: 'Coming up next: a simple cheat sheet you can use in real conversations.',
            },
          ],
        },
      ],
    },
  ],
};
