// SPEC-09 — Emotional Sandbags lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 47 hand-built Emotional Sandbags
// screen files in src/screens/emotional-sandbags/. Text, punctuation, curly/
// straight quotes, emoji, and block order reproduce the existing screens
// exactly. No redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Section-complete mapping note: none of the section-final screens match the
// canonical sparse `sectionComplete` visual (checkmark card + short title/text
// + NEXT preview). They are all richer content screens (bulleted recaps,
// checklists, teaser cards, dual buttons); they are transcribed as `content`
// screens to preserve their content faithfully. The generic progress store
// writes the section key on section completion regardless of kind.
//
// Icon-hero note: emoji hero circles map to `heroEmoji`. A few screens open
// with an Ionicon in a circle (decorative only, no text) — the schema's
// heroEmoji carries an emoji, not an Ionicon, so those purely-decorative
// Ionicon circles are omitted (no text is lost).

import type { Lesson } from '../schema';

export const emotionalSandbags: Lesson = {
  slug: 'emotionalSandbags',
  title: 'Emotional Sandbags',
  storageKey: '@emotional_sandbags_completed_sections',
  sections: [
    // =====================================================================
    // Section 1 — Introduction
    // =====================================================================
    {
      id: '1',
      title: 'Introduction',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            {
              type: 'heading',
              text: 'There’s something your loved ones want from you more than anything else',
              size: 'xl',
            },
            {
              type: 'paragraph',
              text: 'Studies show there’s a relationship responsibility that most of us have never been taught — yet it’s the number one thing people crave from their partners, parents, and closest relationships.',
            },
            { type: 'paragraph', text: 'Most people don’t even realize it exists.' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'So what is it?',
          blocks: [
            {
              type: 'heading',
              text: 'And it affects almost every relationship in your life',
              size: 'lg',
            },
            { type: 'eyebrow', text: 'This applies when:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: 'happy-outline', iconKind: 'ionicon', title: 'Your child is overwhelmed' },
                { icon: 'heart-outline', iconKind: 'ionicon', title: 'Your partner has had a rough day' },
                { icon: 'alert-circle-outline', iconKind: 'ionicon', title: 'You’re stressed, anxious, or emotionally full' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F9FF',
              lines: [
                [
                  { text: 'When this responsibility is met, relationships feel ', emphasis: 'plain' },
                  { text: 'lighter and safer', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
                [
                  { text: 'When it’s missed, ', emphasis: 'plain' },
                  { text: 'frustration quietly builds', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Show me',
          blocks: [
            { type: 'heading', text: 'Let’s name what’s really happening', size: 'lg' },
            {
              type: 'paragraph',
              text: 'To understand this responsibility, we need a simple metaphor — one that explains why emotions feel so heavy, and why we can’t always deal with them alone.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2 — What are emotional sandbags?
    // =====================================================================
    {
      id: '2',
      title: 'What are emotional sandbags?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Keep going',
          blocks: [
            { type: 'heading', text: 'Imagine this moment', size: 'xl' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Your partner comes home and closes the door harder than usual. A few minutes later, they walk into the room looking stressed and frustrated.',
              ],
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'car-outline', iconKind: 'ionicon', title: 'They had a flat tire.' },
                { icon: 'time-outline', iconKind: 'ionicon', title: 'AAA took twice as long as promised.' },
                { icon: 'briefcase-outline', iconKind: 'ionicon', title: 'They missed an important meeting.' },
              ],
            },
            { type: 'paragraph', text: 'They’re clearly upset.' },
            { type: 'paragraph', text: 'What do you do?' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Here’s what’s really going on',
          blocks: [
            { type: 'heading', text: 'Most of us instinctively try one of these', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'chip',
              items: [
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#FF5252', title: 'Leave them alone' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#FF5252', title: 'Say “Tomorrow will be better”' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#FF5252', title: 'Try to cheer them up' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#FF5252', title: 'Fix the problem' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#FF5252', title: 'Put things in perspective' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              center: true,
              lines: [
                [
                  { text: 'These reactions feel helpful — but they often miss what the person ', emphasis: 'plain' },
                  { text: 'actually needs', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Why this matters',
          blocks: [
            { type: 'heading', text: 'We’re all carrying emotional sandbags', size: 'lg' },
            { type: 'heroEmoji', emoji: '🎒', bg: '#F0F0F0' },
            {
              type: 'paragraph',
              text: 'Each of us carries heavy sandbags filled with emotions. They fill up throughout the day:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: 'trending-down', iconKind: 'ionicon', title: 'Frustration when plans fall apart' },
                { icon: 'briefcase', iconKind: 'ionicon', title: 'Stress from work' },
                { icon: 'thunderstorm', iconKind: 'ionicon', title: 'Anger from small conflicts' },
                { icon: 'layers', iconKind: 'ionicon', title: 'Overwhelm from responsibilities' },
              ],
            },
            { type: 'footer', text: 'By the end of the day, those bags can be very heavy.' },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'What happens when they’re emptied?',
          blocks: [
            { type: 'heading', text: 'We can’t empty them on our own', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'As hard as we try, it’s incredibly difficult to empty these sandbags by ourselves.',
              ],
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'lock-closed-outline', iconKind: 'ionicon', title: 'They’re hard to reach.' },
                { icon: 'barbell-outline', iconKind: 'ionicon', title: 'They’re emotionally heavy.' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              center: true,
              lines: [
                [
                  { text: 'The most effective way they get emptied is when ', emphasis: 'plain' },
                  { text: 'someone else helps us process', emphasis: 'emphasis' },
                  { text: ' what we’re feeling.', emphasis: 'plain' },
                ],
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: [
                [
                  { text: 'This doesn’t mean fixing the problem. It means helping the emotions ', emphasis: 'plain' },
                  { text: 'move through', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'There’s science behind this',
          blocks: [
            { type: 'heading', text: 'What happens after the sand is released', size: 'lg' },
            { type: 'paragraph', text: 'When someone helps us process our emotions:' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'surface',
              items: [
                { icon: 'leaf-outline', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'We feel relief' },
                { icon: 'chatbubble-outline', iconKind: 'ionicon', iconColor: '#2196F3', title: 'We feel understood' },
                { icon: 'cloud-outline', iconKind: 'ionicon', iconColor: '#00BCD4', title: 'We feel lighter' },
              ],
            },
            {
              type: 'callout',
              variant: 'quote',
              bg: '#FFF0F5',
              dividers: true,
              lines: [
                [
                  { text: 'And almost automatically, we feel ', emphasis: 'plain' },
                  { text: 'love and connection', emphasis: 'emphasis' },
                  { text: ' toward the person who helped us.', emphasis: 'plain' },
                ],
                [
                  { text: 'This is not accidental. It’s ', emphasis: 'plain' },
                  { text: 'how bonding works', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Check your understanding',
          blocks: [
            { type: 'heading', text: 'This is how deep bonds are built', size: 'lg' },
            { type: 'eyebrow', text: 'RESEARCH BACKED' },
            {
              type: 'paragraph',
              text: 'Research shows that helping someone process emotions empathically is one of the most powerful ways to build deep, lasting bonds.',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'In healthy relationships, this goes both ways:',
              lines: [
                [
                  { text: 'When ', emphasis: 'plain' },
                  { text: 'they’re', emphasis: 'emphasis' },
                  { text: ' struggling, you support them', emphasis: 'plain' },
                ],
                [
                  { text: 'When ', emphasis: 'plain' },
                  { text: 'you’re', emphasis: 'emphasis' },
                  { text: ' struggling, they support you', emphasis: 'plain' },
                ],
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              center: true,
              lines: [
                [
                  { text: 'Both people feel ', emphasis: 'plain' },
                  { text: 'purpose, closeness, and trust', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next Question',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'When someone we love is upset, what is the #1 way to help them?',
              options: [
                { text: 'Help them process their emotions', isCorrect: true },
                { text: 'Give them some alone time', isCorrect: false },
                { text: 'Help them put things in perspective', isCorrect: false },
                { text: 'All of the above', isCorrect: false },
              ],
              correctFeedback:
                'Helping someone process emotions is the fastest way to create relief and connection.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'Why is it important to help our loved ones empty their emotional sandbags?',
              options: [
                { text: 'It’s hard for them to do on their own', isCorrect: false },
                { text: 'It gives us a sense of purpose and accomplishment', isCorrect: false },
                { text: 'It creates feelings that bond us together', isCorrect: false },
                { text: 'All of the above', isCorrect: true },
              ],
              correctFeedback:
                'All of these are true — emotional support benefits both people and is the foundation of a strong relationship.',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Finish Lesson',
          blocks: [
            { type: 'heading', text: 'Try this today', size: 'xl' },
            {
              type: 'paragraph',
              text: 'The next time someone in your life seems frustrated or overwhelmed:',
            },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'plain',
              items: [
                { icon: 'construct-outline', iconKind: 'ionicon', iconColor: '#F44336', title: 'Don’t fix' },
                { icon: 'trending-down-outline', iconKind: 'ionicon', iconColor: '#F44336', title: 'Don’t minimize' },
                { icon: 'happy-outline', iconKind: 'ionicon', iconColor: '#F44336', title: 'Don’t cheer up' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: [
                [
                  { text: 'Just help them ', emphasis: 'plain' },
                  { text: 'talk it out', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
                'Even a few minutes can empty a lot of sand.',
              ],
            },
          ],
        },
        // Screen 10 — recap + teaser (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Today you learned', size: 'xl' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'caret-forward', iconKind: 'ionicon', title: 'Everyone carries emotional sandbags' },
                { icon: 'caret-forward', iconKind: 'ionicon', title: 'We can’t empty them alone' },
                { icon: 'caret-forward', iconKind: 'ionicon', title: 'Helping someone process emotions builds deep bonds' },
                { icon: 'caret-forward', iconKind: 'ionicon', title: 'This responsibility goes both ways' },
              ],
            },
            {
              type: 'callout',
              variant: 'preview',
              label: 'COMING UP NEXT',
              lines: [
                [
                  { text: 'Next, you’ll learn ', emphasis: 'plain' },
                  { text: 'how to help someone empty their sandbags correctly', emphasis: 'emphasis' },
                  { text: ' — without fixing or making things worse.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3 — How to help unload emotional sandbags
    // =====================================================================
    {
      id: '3',
      title: 'How to help unload emotional sandbags',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🏠' },
            {
              type: 'heading',
              text: 'When a loved one has a bad day, what should we do?',
              size: 'xl',
            },
            {
              type: 'paragraph',
              text: "When someone we love is overwhelmed, stressed, or frustrated, our role isn't to fix the problem.",
            },
            {
              type: 'paragraph',
              text: 'Our responsibility is to help them unload their emotional sandbags.',
            },
            {
              type: 'paragraph',
              text: 'This starts with something surprisingly simple: Noticing.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '📡' },
            { type: 'heading', text: 'Step 1: Have a radar for unhappiness', size: 'lg' },
            {
              type: 'paragraph',
              text: "When our partner is grumpy or withdrawn — especially when it isn't about us — it's often a sign they're carrying emotional weight.",
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'They might be:' },
                { icon: '•', iconKind: 'emoji', title: 'Overwhelmed' },
                { icon: '•', iconKind: 'emoji', title: 'Stressed' },
                { icon: '•', iconKind: 'emoji', title: 'Frustrated' },
                { icon: '•', iconKind: 'emoji', title: 'Disappointed' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Simply noticing early sends a powerful message:',
                [{ text: '"I see you. I care. I have your back."', emphasis: 'emphasis' }],
              ],
            },
          ],
        },
        // Screen 3 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 4,
              question: 'True or False: Research shows that most of us are naturally good at noticing when our partner is unhappy.',
              options: [
                { label: 'True', isCorrect: false },
                { label: 'False', isCorrect: true },
              ],
              feedback: "Research shows that most of us miss these signals, even when we think we're paying attention. That's why this skill needs to be practiced.",
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💙' },
            { type: 'heading', text: 'Step 2: Show concern', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Once you notice something is off, the next step is simple — but powerful.',
            },
            { type: 'paragraph', text: 'Let them know:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '✓', iconKind: 'emoji', title: 'You noticed' },
                { icon: '✓', iconKind: 'emoji', title: 'You care' },
                { icon: '✓', iconKind: 'emoji', title: 'They matter to you' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'This can sound like:',
              lines: [
                [{ text: '"You seem stressed today."', emphasis: 'emphasis' }],
                [{ text: '"Rough day?"', emphasis: 'emphasis' }],
                [{ text: '"Want to talk about what happened?"', emphasis: 'emphasis' }],
              ],
            },
            { type: 'footer', text: 'This kind of concern feels empathetic, not intrusive.' },
          ],
        },
        // Screen 5 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 4,
              question: 'Why is showing concern so important?',
              options: [
                { label: 'It tells them they are important to us', isCorrect: false },
                { label: 'It helps them feel emotionally safe', isCorrect: false },
                { label: 'It shows we are paying attention', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Showing concern helps our loved ones feel seen, valued, and emotionally supported.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '👟' },
            { type: 'heading', text: 'Step 3: Put yourself in their shoes', size: 'lg' },
            {
              type: 'paragraph',
              text: 'To really help someone unload their emotional sandbags, we need to feel what they might be feeling.',
            },
            {
              type: 'paragraph',
              text: [{ text: 'Imagine their situation.', emphasis: 'emphasis' }],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF4E6',
              label: 'For example:',
              labelColor: '#D97706',
              lines: [
                'Your partner shares an idea at work — something they were excited about — and a colleague quickly dismisses it.',
              ],
            },
            { type: 'paragraph', text: 'Pause and ask yourself:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: 'How would you feel?' },
                { iconKind: 'ionicon', title: 'Embarrassed?' },
                { iconKind: 'ionicon', title: 'Disappointed?' },
                { iconKind: 'ionicon', title: 'Frustrated?' },
              ],
            },
            { type: 'footer', text: "It's okay if this takes a few minutes." },
          ],
        },
        // Screen 7 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 3,
              totalQuestions: 4,
              question: "Why is it important to put yourself in your partner's shoes before responding?",
              options: [
                { label: 'To better understand their emotions', isCorrect: false },
                { label: 'To avoid minimizing their feelings', isCorrect: false },
                { label: 'To respond with empathy instead of advice', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Empathy comes from understanding, not fixing.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🏷️' },
            { type: 'heading', text: 'Step 4: Help them name their emotions', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Finally, gently help your loved one label their emotions.',
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Try to name at least three emotions, and why they might be feeling them.', emphasis: 'emphasis' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'For example:',
              lines: [
                [
                  { text: '"It sounds like you\'re ', emphasis: 'plain' },
                  { text: 'frustrated', emphasis: 'emphasis' },
                  { text: ' because your idea wasn\'t heard."', emphasis: 'plain' },
                ],
                [
                  { text: '"Maybe you\'re ', emphasis: 'plain' },
                  { text: 'disappointed', emphasis: 'emphasis' },
                  { text: ' after putting so much effort into it."', emphasis: 'plain' },
                ],
                [
                  { text: '"And maybe a bit ', emphasis: 'plain' },
                  { text: 'embarrassed', emphasis: 'emphasis' },
                  { text: ', too."', emphasis: 'plain' },
                ],
              ],
            },
            {
              type: 'footer',
              text: 'This helps their emotions move out of the sandbags — and out of their system.',
            },
          ],
        },
        // Screen 9 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 4,
              totalQuestions: 4,
              question: 'When helping someone unload emotional sandbags, what is your main responsibility?',
              options: [
                { label: 'Fix the situation', isCorrect: false },
                { label: 'Make them feel better quickly', isCorrect: false },
                { label: 'Give advice', isCorrect: false },
                { label: 'Help them process and release emotions', isCorrect: true },
              ],
              feedback: "Your role is not to fix — it's to help them process.",
            },
          ],
        },
        // Screen 10 — checklist recap (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heroEmoji', emoji: '✅' },
            { type: 'heading', text: 'How to help unload emotional sandbags', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { icon: '✅', iconKind: 'emoji', title: 'Have a radar for unhappiness' },
                { icon: '✅', iconKind: 'emoji', title: 'Gently show concern' },
                { icon: '✅', iconKind: 'emoji', title: 'Put yourself in their shoes' },
                { icon: '✅', iconKind: 'emoji', title: 'Help them name at least three emotions' },
              ],
            },
            {
              type: 'paragraph',
              text: 'With practice, this skill can transform your relationships.',
            },
            {
              type: 'paragraph',
              text: 'Many people are stunned by how powerful this feels — for their loved ones and for themselves.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: ['Science shows this is one of the fastest ways to build deep, lasting bonds.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4 — Let's review
    // =====================================================================
    {
      id: '4',
      title: "Let's review",
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Start Review',
          blocks: [
            { type: 'heroEmoji', emoji: '👥' },
            {
              type: 'heading',
              text: "Let's review how to help others process emotions",
              size: 'xl',
            },
            {
              type: 'paragraph',
              text: 'These simple steps help your loved ones unload emotional sandbags — and build deep bonds over time.',
            },
          ],
        },
        // Screen 2 — accordion (Step 1 expanded)
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: 'Step 1: Radar' },
                { iconKind: 'ionicon', title: 'Step 2: Ask' },
                { iconKind: 'ionicon', title: 'Step 3: Imagine & Feel' },
                { iconKind: 'ionicon', title: 'Step 4: Label' },
              ],
            },
            { type: 'heroEmoji', emoji: '😟 👀' },
            {
              type: 'paragraph',
              text: 'Notice when your partner seems grumpy or off.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                "Being aware — especially when it's not about you — sends a powerful signal:",
                [{ text: '"I see you. I care. I\'ve got your back."', emphasis: 'emphasis' }],
              ],
            },
          ],
        },
        // Screen 3 — accordion (Step 2 expanded)
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: 'Step 1: Radar' },
                { iconKind: 'ionicon', title: 'Step 2: Ask' },
                { iconKind: 'ionicon', title: 'Step 3: Imagine & Feel' },
                { iconKind: 'ionicon', title: 'Step 4: Label' },
              ],
            },
            {
              type: 'paragraph',
              text: "Ask what's going on while showing concern.",
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              textColor: '#1976D2',
              lines: [
                [{ text: '"You seem down.\nAre you okay?\nWant to talk about it?"', emphasis: 'emphasis' }],
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Simply asking — without fixing or minimizing — tells them they matter.',
              ],
            },
          ],
        },
        // Screen 4 — accordion (Step 3 expanded)
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: 'Step 1: Radar' },
                { iconKind: 'ionicon', title: 'Step 2: Ask' },
                { iconKind: 'ionicon', title: 'Step 3: Imagine & Feel' },
                { iconKind: 'ionicon', title: 'Step 4: Label' },
              ],
            },
            { type: 'heroEmoji', emoji: '💭🤔' },
            {
              type: 'paragraph',
              text: 'Imagine you are in their shoes and feel their emotions.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F3E5F5',
              textColor: '#6A1B9A',
              lines: [
                'Take a moment to picture what they experienced.',
                'Let yourself feel the embarrassment, frustration, or disappointment.',
              ],
            },
            { type: 'footer', text: "It's okay if this takes a few minutes." },
          ],
        },
        // Screen 5 — accordion (Step 4 expanded)
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: 'Step 1: Radar' },
                { iconKind: 'ionicon', title: 'Step 2: Ask' },
                { iconKind: 'ionicon', title: 'Step 3: Imagine & Feel' },
                { iconKind: 'ionicon', title: 'Step 4: Label' },
              ],
            },
            { type: 'heroEmoji', emoji: '🫂' },
            {
              type: 'paragraph',
              text: 'Help label their emotions — and avoid common traps.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                [{ text: '"Are you feeling frustrated that your coworker was so rude?"', emphasis: 'emphasis' }],
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              lines: [
                'Try to name at least three emotions and why they might be feeling them.',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF3E0',
              textColor: '#E65100',
              lines: ['Avoid minimizing, fixing, or problem-solving here.'],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'The 4-step process at a glance', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', number: 1, title: 'Radar', subtitle: 'Notice unhappiness early' },
                { iconKind: 'ionicon', number: 2, title: 'Ask', subtitle: 'Show concern and invite sharing' },
                { iconKind: 'ionicon', number: 3, title: 'Imagine & Feel', subtitle: 'Put yourself in their shoes' },
                { iconKind: 'ionicon', number: 4, title: 'Label', subtitle: 'Name emotions with compassion' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: ["Your responsibility isn't to fix — it's to help unload emotional sandbags."],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Finish Review',
          blocks: [
            { type: 'heroEmoji', emoji: '✨' },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: ['Once you become practiced at this, you may be stunned by the results.'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: ['This is the #1 way science has shown we can improve relationships.'],
            },
          ],
        },
        // Screen 8 — send-off (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heroEmoji', emoji: '🌱' },
            {
              type: 'heading',
              text: "You're building a powerful relationship skill",
              size: 'xl',
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: [
                "This may feel awkward at first — that's normal.",
                'With practice, it becomes second nature.',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              label: 'Next lesson:',
              labelColor: '#2E7D32',
              center: true,
              lines: ['Continue building emotional connection'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 5 — Let's practice
    // =====================================================================
    {
      id: '5',
      title: "Let's practice",
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Read the scenario', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              center: true,
              lines: [
                "You've had a long day at work.",
                'You get home and your partner is already there. You ask how their day went.',
                'They look down and say, "Good," then move on to something else.',
              ],
            },
          ],
        },
        // Screen 2 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 5,
              question: 'What should you do first?',
              options: [
                { label: 'Walk away — after all, they said "good"', isCorrect: false },
                { label: 'Ask "what\'s wrong with you?" knowing your day was worse', isCorrect: false },
                { label: 'Notice: your radar for unhappiness goes off and you notice your partner is upset', isCorrect: true },
              ],
              feedback: 'Noticing is powerful. It tells your partner: "I see you. You matter."',
            },
          ],
        },
        // Screen 3 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 5,
              question: 'Next, what should you say to your partner?',
              options: [
                { label: '"What\'s wrong with you?"', isCorrect: false },
                { label: '"What\'s your problem?!?!"', isCorrect: false },
                { label: '"You look like something\'s up. What\'s going on?"', isCorrect: true },
              ],
              feedback: 'Warm, neutral phrasing shows concern without judgment.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'paragraph',
              text: 'Your partner tells you that while you were at work:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Your daughter got in trouble at school' },
                { icon: '•', iconKind: 'emoji', title: 'Your son got punched by a friend' },
                { icon: '•', iconKind: 'emoji', title: 'The house is a disaster' },
              ],
            },
            { type: 'footer', text: 'They also mention they have a headache.' },
          ],
        },
        // Screen 5 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 3,
              totalQuestions: 5,
              question: 'What should you do next?',
              options: [
                { label: 'Start thinking of ways to solve the problems', isCorrect: false },
                { label: "Try to put yourself in your partner's shoes and feel what they are feeling", isCorrect: true },
                { label: 'Prepare to tell your partner about your bad day', isCorrect: false },
              ],
              feedback: 'Empathy comes before solutions.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Review this list of common emotions', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFE5E5',
              label: '❌ DON\'T USE (Too Broad)',
              labelColor: '#D32F2F',
              lines: ['Happy · Mad · Sad · Bad'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FD',
              label: '🔵 UPSET EMOTIONS',
              labelColor: '#1976D2',
              lines: [
                'Pressured · Scared · Defensive · Worried · Worthless · Stupid · Disrespected · Excluded · Threatened · Nervous · Misunderstood · Depressed · Lonely · Abandoned · Unimportant · Hopeless · Guilty · Ashamed · Disappointed · Embarrassed · Ugly · Small',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFEBEE',
              label: '🔴 ANGRY EMOTIONS',
              labelColor: '#C62828',
              lines: [
                'Angry · Let down · Humiliated · Betrayed · Jealous · Frustrated · Annoyed · Disgust · Contempt',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              label: '🟢 STRESSED / LOW-ENERGY',
              labelColor: '#388E3C',
              lines: ['Bored · Stressed · Tired · Overwhelmed'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F3E5F5',
              label: '🟣 CONFUSION / SOCIAL PAIN',
              labelColor: '#7B1FA2',
              lines: ['Surprised · Confused · Bullied · Down · Unloved'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF9C4',
              label: '🟡 HAPPY EMOTIONS (for contrast later)',
              labelColor: '#F57F17',
              lines: [
                'Curious · Confident · Loving · Inspired · Relieved · Appreciated · Content · Peaceful · Proud · Thankful',
              ],
            },
          ],
        },
        // Screen 7 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 4,
              totalQuestions: 5,
              question: 'What are three feelings your partner might be feeling?',
              options: [
                { label: 'Overwhelmed, Stressed, Worried', isCorrect: true },
                { label: 'Guilty, Embarrassed, Small', isCorrect: false },
                { label: 'Jealous, Betrayed, Confused', isCorrect: false },
              ],
              feedback: 'These emotions match the situation without exaggerating or mislabeling.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💙' },
            {
              type: 'paragraph',
              text: 'You take a moment to feel what your partner might be feeling.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'You show empathy and say:',
              center: true,
              lines: [[{ text: '"That sounds like a really rough day."', emphasis: 'emphasis' }]],
            },
          ],
        },
        // Screen 9 — QuizQuestion
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 5,
              totalQuestions: 5,
              question: 'What do you do next?',
              options: [
                { label: 'Start trying to fix problems', isCorrect: false },
                { label: 'Tell your partner about your day', isCorrect: false },
                { label: "Tell your partner it's time to move on", isCorrect: false },
                { label: 'Help your partner label their feelings: "Are you feeling…?"', isCorrect: true },
              ],
              feedback: 'Helping your partner label their emotions — while avoiding common traps — builds deep bonds.',
            },
          ],
        },
        // Screen 10 — send-off (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heroEmoji', emoji: '✨' },
            {
              type: 'callout',
              variant: 'summary',
              center: true,
              lines: [
                "You didn't fix anything.",
                'And yet — you did the most important thing.',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: ['You helped your partner unload their emotional sandbags.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 6 — Summary
    // =====================================================================
    {
      id: '6',
      title: 'Summary',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: "Let's recap", size: 'xl' },
            {
              type: 'paragraph',
              text: 'In this lesson, you learned what emotional sandbags are — the heavy emotions our loved ones carry throughout the day.',
            },
            {
              type: 'paragraph',
              text: "You also learned that most of us can't unload them alone.",
            },
            { type: 'paragraph', text: 'We need someone we trust to help us.' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '📡' },
            { type: 'heading', text: 'The most important habit', size: 'lg' },
            {
              type: 'paragraph',
              text: "See if you can develop a radar for when a loved one's sandbags are full.",
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Small signals matter:',
              lines: [
                '• Short answers',
                '• Changes in tone',
                '• Withdrawal or irritation',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              center: true,
              lines: [
                [
                  { text: 'Simply noticing sends a powerful message:\n', emphasis: 'plain' },
                  { text: '"I see you. I care."', emphasis: 'emphasis' },
                ],
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '⚠️' },
            { type: 'heading', text: 'A temptation to resist', size: 'lg' },
            {
              type: 'paragraph',
              text: "When someone you love is struggling, it's natural to want to fix the problem.",
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF3E0',
              textColor: '#E65100',
              label: 'But solving the problem too early often:',
              labelColor: '#E65100',
              lines: [
                '• Shuts emotions down',
                '• Makes people feel unheard',
                '• Misses the chance to build a deeper bond',
              ],
            },
            {
              type: 'footer',
              text: "Fixing feels helpful — but it's rarely what's needed first.",
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💪' },
            { type: 'heading', text: 'What really makes the difference', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When you help unload emotional sandbags instead of fixing the problem:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '✓', iconKind: 'emoji', title: 'Your loved one feels relieved' },
                { icon: '✓', iconKind: 'emoji', title: 'They feel understood' },
                { icon: '✓', iconKind: 'emoji', title: 'They feel closer to you' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              center: true,
              lines: ['Over time, this creates stronger, safer, more resilient relationships.'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🤔' },
            { type: 'heading', text: 'Take a moment to notice', size: 'lg' },
            {
              type: 'paragraph',
              text: [{ text: 'In your own life:', emphasis: 'emphasis' }],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F3E5F5',
              textColor: '#6A1B9A',
              center: true,
              lines: [
                'How long does it take you to unload emotional sandbags?',
                'How long does it take your loved ones?',
              ],
            },
            { type: 'footer', text: "There's no right answer — just awareness." },
          ],
        },
        // Screen 6 — send-off (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Next Lesson',
          blocks: [
            { type: 'heroEmoji', emoji: '🌟' },
            { type: 'heading', text: "You're building a new skill", size: 'lg' },
            {
              type: 'paragraph',
              text: 'Learning to unload emotional sandbags takes practice.',
            },
            {
              type: 'callout',
              variant: 'insight',
              center: true,
              lines: [
                "The fact that you're here means you're already doing something different — and meaningful.",
              ],
            },
            {
              type: 'footer',
              text: "In the next lesson, we'll learn how to apply this skill even more effectively in relationships.",
            },
          ],
        },
      ],
    },
  ],
};
