// SPEC-09 — Serve and Return lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 22 hand-built Serve & Return screen
// files in src/screens/serveReturn/ (Sec1..6). Text, punctuation, quotes
// (straight ASCII, as in the source), emoji, and block order reproduce the
// existing screens exactly. No redesign, no typo fixes — observed issues are
// logged in docs/spec-09/CONTENT_ERRATA.md instead.
//
// Structural mapping (progress byte-compatibility): the six SECTIONS are
// modelled with ids '1'..'6' — the same values the source stores via
// markSectionComplete('1'..'6') into '@serve_return_completed_sections'
// (verified: each section's LAST screen calls markSectionComplete with its id).
// The controller writes the section id on the last screen of each section,
// reproducing the identical ['1'..'6'] array. Section titles use the sublesson
// topic wording from the lesson hub (ServeAndReturnLessonScreen.tsx).
//
// Fidelity notes: Section 3 Screen 5 has an OPTIONAL multiline reflection
// TextInput (placeholder "Your reflections (optional)"); it is modelled with a
// `textInput` block, required:false (Next/Finish is NOT gated on it — the
// source's Finish button has no disabled logic). Several coloured titled cards
// (green #E8F5E9, amber #FFF9E6, primaryBg boxes) are transcribed as `callout`
// blocks; the source's colour/left-alignment is approximated by the renderer
// defaults. See CONTENT_ERRATA.md.

import type { Lesson } from '../schema';

export const serveReturn: Lesson = {
  slug: 'serveReturn',
  title: 'Serve and Return',
  storageKey: '@serve_return_completed_sections',
  sections: [
    // =====================================================================
    // Section 1 — What Is Serve & Return?
    // =====================================================================
    {
      id: '1',
      title: 'What Is Serve & Return?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Serve & Return', size: 'xl' },
            {
              type: 'paragraph',
              text: 'In this lesson, you\'ll learn about an early relationship concept called serve and return.',
            },
            {
              type: 'paragraph',
              text: 'Although it\'s often discussed in early childhood, serve and return applies to all relationships—with children, partners, and even close friends.',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Goal:',
              lines: [
                'Understand what serve and return means and be able to explain it to someone else.',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A Simple Back-and-Forth', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Serve and return is a back-and-forth interaction between two people.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', number: 1, title: 'One person serves by expressing interest, emotion, or attention' },
                { iconKind: 'ionicon', number: 2, title: 'The other person returns by noticing and responding' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['This back-and-forth builds trust, safety, and connection.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Think of a Tennis Match', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Imagine a tennis match instead of a conversation.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '🎾', iconKind: 'emoji', title: 'A serve is an emotional cue' },
                { icon: '🏓', iconKind: 'emoji', title: 'A return is an attentive response' },
                { icon: '🔄', iconKind: 'emoji', title: 'The rally continues' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['When returns happen consistently, connection grows.'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'What is a "serve"?',
              options: [
                { label: 'Giving advice', isCorrect: false },
                { label: 'Expressing emotion or interest', isCorrect: true },
                { label: 'Fixing the problem', isCorrect: false },
                { label: 'Ending the conversation', isCorrect: false },
              ],
              feedback: 'Correct. A serve is an emotional cue or expression of interest that invites connection.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2 — Why Serve & Return Matters
    // =====================================================================
    {
      id: '2',
      title: 'Why Serve & Return Matters',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'How Serve & Return Shapes Us', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Repeated serve-and-return interactions shape the brain.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'They strengthen:',
              lines: [
                'Emotional regulation',
                'Social skills',
                'Trust and security',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Over time, these interactions form a strong foundation for relationships and learning.',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When the Return Doesn\'t Come', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When serves are ignored or dismissed:',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: [
                'Stress increases',
                'Emotional safety decreases',
                'Connection weakens',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Even well-intentioned responses can break the cycle if they don\'t acknowledge the serve.',
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'It\'s About Consistency, Not Perfection', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Missing a serve occasionally is normal.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              accentColor: '#D97706',
              lines: [
                'Problems arise when lack of response becomes frequent or chronic.',
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              lines: [
                'The goal is consistent responsiveness, not flawless communication.',
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
              questionNumber: 1,
              totalQuestions: 1,
              question: 'Which is most harmful over time?',
              options: [
                { label: 'Occasionally missing a cue', isCorrect: false },
                { label: 'Being distracted once in a while', isCorrect: false },
                { label: 'Chronic lack of responsiveness', isCorrect: true },
                { label: 'Encouraging independence', isCorrect: false },
              ],
              feedback: 'Correct. Chronic lack of responsiveness weakens trust and emotional safety over time.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3 — Serve & Return in Everyday Relationships
    // =====================================================================
    {
      id: '3',
      title: 'Serve & Return in Everyday Relationships',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Not Just for Kids', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Serve and return isn\'t limited to early childhood—it\'s how all meaningful relationships work.',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Adults serve too:',
              lines: [
                '"I\'m feeling stressed about work."',
                '"Did you see this article?"',
                '"I miss spending time together."',
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              lines: ['And adults need returns too.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What Serve & Return Is Not', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              label: 'Serve and return is NOT:',
              lines: [
                'Fixing the problem',
                'Giving advice',
                'Always agreeing',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'It IS:',
              lines: [
                'Acknowledging the bid for connection',
                'Being present',
                'Showing you heard and care',
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The Real Goal', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Connection isn\'t built by being perfect. It\'s built by being responsive.',
            },
            {
              type: 'paragraph',
              text: 'The more often someone\'s emotional cues are noticed and acknowledged, the stronger the relationship becomes.',
            },
            {
              type: 'callout',
              variant: 'quote',
              lines: ['"Responsiveness is the foundation of trust."'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'True or false: A perfect response matters more than a consistent one.',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: 'Correct. Consistency matters far more than perfection in building strong relationships.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Finish',
          blocks: [
            { type: 'heading', text: 'Think About It', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Who in your life serves to you most often? How do you typically return those serves? Where could you be more responsive?',
            },
            {
              type: 'textInput',
              headline: '',
              placeholder: 'Your reflections (optional)',
              required: false,
              minHeight: 120,
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              lines: [
                'Great work. You\'re building awareness of serve and return—one of the most powerful patterns in human connection.',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4 — Recognizing Serve & Return in Real Life
    // =====================================================================
    {
      id: '4',
      title: 'Recognizing Serve & Return in Real Life',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 4 of 6',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What does a "serve" look like?', size: 'lg' },
            { type: 'heroEmoji', emoji: '👋', bg: '#F5F9FF' },
            {
              type: 'paragraph',
              text: 'A serve is any attempt to connect.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'It might look like:',
              lines: [
                'A child calling your name',
                'Showing you something they made',
                'Asking a question',
                'Making eye contact',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What does a "return" look like?', size: 'lg' },
            { type: 'heroEmoji', emoji: '👁️', bg: '#F5F9FF' },
            {
              type: 'paragraph',
              text: 'A return happens when you notice the serve and respond.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'That response could be:',
              lines: [
                'Eye contact',
                'Words',
                'A gesture',
                'Even a brief acknowledgment',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['It doesn\'t need to be perfect.\nIt just needs to be present.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When serve & return breaks', size: 'lg' },
            { type: 'heroEmoji', emoji: '📱', bg: '#FFF9E6' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              accentColor: '#D97706',
              label: 'Serve & return breaks when:',
              lines: [
                'The serve is ignored',
                'The response is delayed without acknowledgment',
                'The interaction feels dismissive',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['This isn\'t about blame.\nIt\'s about awareness.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 5 — Why Serve & Return Matters
    // =====================================================================
    {
      id: '5',
      title: 'Why Serve & Return Matters',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 5 of 6',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Serve & return builds safety', size: 'lg' },
            { type: 'heroEmoji', emoji: '🤗', bg: '#E8F5E9' },
            {
              type: 'callout',
              variant: 'summary',
              label: 'When a child\'s serve is returned, they learn:',
              lines: [
                '"I matter"',
                '"I\'m seen"',
                '"It\'s safe to reach out"',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'This safety becomes the foundation for:',
              lines: [
                'Confidence',
                'Emotional regulation',
                'Trust in relationships',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Serve & return builds the brain', size: 'lg' },
            { type: 'heroEmoji', emoji: '🧠', bg: '#E3F2FF' },
            {
              type: 'paragraph',
              text: 'Each serve-and-return interaction strengthens neural connections.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'Over time, this builds:',
              lines: [
                'Language skills',
                'Emotional intelligence',
                'Social understanding',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['These connections are built through repetition, not perfection.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'You don\'t need to return every serve', size: 'lg' },
            { type: 'heroEmoji', emoji: '👨‍👩‍👧', bg: '#FFF9E6' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                [
                  { text: 'Experts estimate that returning about ', emphasis: 'plain' },
                  { text: '70% of serves', emphasis: 'emphasis' },
                  { text: ' is enough to support healthy development.', emphasis: 'plain' },
                ],
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'What matters most:',
              lines: [
                'Noticing the serve',
                'Acknowledging it',
                'Returning when you can',
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E3F2FF',
              lines: ['Missing some serves is normal — and human.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 6 — Practice & Homework
    // =====================================================================
    {
      id: '6',
      title: 'Practice & Homework',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 6 of 6',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Notice serves today', size: 'lg' },
            { type: 'heroEmoji', emoji: '👀', bg: '#F5F9FF' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'Today, see if you can notice:',
              lines: [
                'Who is serving you?',
                'How they are trying to connect',
                'How you usually respond',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['There\'s nothing to fix.\nJust notice.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When you can\'t return right now', size: 'lg' },
            {
              type: 'paragraph',
              text: 'If you\'re busy, a return can still sound like:',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"I hear you."',
                '"I can\'t help right now, but I see you."',
                '"Let\'s talk in a few minutes."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              lines: ['Even this kind of response maintains the connection.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'This week\'s practice', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '✓', iconKind: 'emoji', title: 'Notice serves' },
                { icon: '✓', iconKind: 'emoji', title: 'Return when possible' },
                { icon: '✓', iconKind: 'emoji', title: 'Acknowledge when you can\'t' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Serve & return is not a technique.\nIt\'s a relationship rhythm.'],
            },
            {
              type: 'callout',
              variant: 'preview',
              lines: ['We\'ll build on this in the next lesson.'],
            },
          ],
        },
      ],
    },
  ],
};
