// SPEC-09 — Dissociation lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 25 hand-built Dissociation screen
// files in src/screens/dissociation/. Text, punctuation, quotes (straight
// ASCII, as in the source), emoji, and block order reproduce the existing
// screens exactly. No redesign, no typo fixes — observed issues are logged in
// docs/spec-09/CONTENT_ERRATA.md instead.
//
// Section-complete mapping note: none of the section-final screens match the
// canonical sparse `sectionComplete` visual (checkmark card + "complete" +
// NEXT preview). §1 Screen7, §3 Screen9 and §4 Screen3 are richer content
// screens (icon/emoji + heading + body cards), and §2 Screen6 is a quiz; all
// are transcribed as `content` screens to preserve their content faithfully.
// The generic progress store writes the section key on section completion.

import type { Lesson } from '../schema';

export const dissociation: Lesson = {
  slug: 'dissociation',
  title: 'Dissociation',
  storageKey: '@dissociation_completed_sections',
  sections: [
    // =====================================================================
    // Section 1
    // =====================================================================
    {
      id: '1',
      title: 'What is dissociation',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🌾', bg: '#F5F3ED' },
            { type: 'heading', text: 'Your brain has a hidden escape button', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Your brain has a fascinating trick to get you out of uncomfortable situations.',
            },
            {
              type: 'paragraph',
              text: 'It usually happens at least once a week — and most of the time,\nyou don\'t even realize it happened.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: ['Sometimes this protects us.\nOther times, it quietly hurts our relationships.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What is dissociation?', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Dissociation (also called avoidance) is what happens when something feels too overwhelming for your brain to process.',
              ],
            },
            {
              type: 'paragraph',
              text: 'Instead of thinking through it,\nyour brain briefly checks out.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '💭', iconKind: 'emoji', title: 'You suddenly go blank' },
                { icon: '🛑', iconKind: 'emoji', title: 'You stop thinking about the issue' },
                { icon: '↪️', iconKind: 'emoji', title: 'You mentally turn to something else' },
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What does dissociation feel like?', size: 'lg' },
            { type: 'paragraph', text: 'Dissociation happens instantly.' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'checkmark', iconKind: 'ionicon', title: '"My mind just went blank"' },
                { icon: 'checkmark', iconKind: 'ionicon', title: '"I don\'t know what to say"' },
                { icon: 'checkmark', iconKind: 'ionicon', title: '"I don\'t see a solution"' },
                { icon: 'checkmark', iconKind: 'ionicon', title: '"I just want to think about something else"' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: ['This usually happens without conscious choice.'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A simple example', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              label: 'Imagine this:',
              lines: ['Your child can only attend one school.\nSomeone says to you:'],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: '"I\'ve heard that school isn\'t as good as it used to be."',
              lines: ['"I\'ve heard that school isn\'t as good as it used to be."'],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'Option A — No dissociation',
              lines: [
                '"Maybe I should talk to the principal."',
                '"Let me see if there\'s a solution."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF4E6',
              label: 'Option B — Dissociation',
              lines: [
                '"There\'s nothing we can do."',
                '"I don\'t want to think about this."',
                '(Mind goes blank)',
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              label: 'Key insight',
              lines: [
                'Dissociation happens when your brain decides there is no solution, so it shuts the problem down.',
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 2,
              question: 'What is dissociation?',
              options: [
                { label: 'When you decide not to associate with a group', isCorrect: false },
                { label: 'What happens when someone says something that overwhelms you', isCorrect: true },
                { label: 'The breaking down of memories inside your brain', isCorrect: false },
              ],
              feedback: 'Exactly. Dissociation is a mental shutdown, not a choice.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 2,
              question: 'True or False: Dissociation happens frequently and we are usually unaware that it occurred.',
              options: [
                { label: 'True', isCorrect: true },
                { label: 'False', isCorrect: false },
              ],
              feedback: 'Correct. Most dissociation happens below awareness, which is why it can quietly affect communication.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '✨' },
            { type: 'heading', text: 'Awareness is the first step', size: 'xl' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'In the next sublesson, you\'ll learn how to notice dissociation in real time — and what to do instead.',
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
      title: 'How do we not dissociate',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'How do we not dissociate?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Dissociating — or avoiding — feels helpful in the moment,\nbut it usually makes things worse.',
            },
            {
              type: 'paragraph',
              text: 'Avoidance makes us feel helpless,\neven though situations are almost never as hopeless as they seem.',
            },
            {
              type: 'paragraph',
              text: 'When something feels overwhelming, the healthier response is not to push it away —\nbut to say:',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"This is a hard problem.\nI can\'t think about it right now,\nbut I can come back to it once I\'ve calmed down."',
              ],
            },
            {
              type: 'paragraph',
              text: 'When our logical brain regains control,\nwe are usually able to face the problem\nand find solutions.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What happens when we don\'t avoid?', size: 'lg' },
            { type: 'paragraph', text: 'Let\'s take an example.' },
            {
              type: 'paragraph',
              text: 'Imagine you\'re worried about your child\'s school.\nIf you don\'t dissociate, you might:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: 'Look up research' },
                { iconKind: 'ionicon', title: 'Talk to teachers' },
                { iconKind: 'ionicon', title: 'Meet the principal' },
                { iconKind: 'ionicon', title: 'Explore specific solutions' },
              ],
            },
            {
              type: 'paragraph',
              text: 'You may learn — as many studies have shown —\nthat teachers matter more than the school itself.',
            },
            { type: 'paragraph', text: 'That opens up options.' },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Avoiding the thought feels easier,\nbut facing it usually gives you more control, not less.',
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What if I just dissociate?', size: 'lg' },
            { type: 'paragraph', text: 'When you dissociate, the problem doesn\'t go away.' },
            { type: 'paragraph', text: 'It keeps nagging you in the background.' },
            { type: 'paragraph', text: 'In that school example, you may start feeling:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '😔', iconKind: 'emoji', title: 'Like you\'re failing as a parent' },
                { icon: '😰', iconKind: 'emoji', title: 'Like you should be doing more' },
                { icon: '😟', iconKind: 'emoji', title: 'Like something is unresolved' },
              ],
            },
            { type: 'paragraph', text: 'That emotional weight builds up — quietly.' },
            { type: 'paragraph', text: 'People dissociate a lot:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: 'When facts challenge their beliefs' },
                { iconKind: 'ionicon', title: 'When truths feel uncomfortable' },
                { iconKind: 'ionicon', title: 'When something feels unsolvable' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Once you start noticing it,\nyou\'ll see it everywhere — in yourself and others.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The solution is simpler than it sounds', size: 'lg' },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              label: 'The good news is this:',
              lines: ['You don\'t need to solve the problem immediately.'],
            },
            {
              type: 'paragraph',
              text: 'Simply noticing dissociation when it happens\nand giving it a name already reduces its power.',
            },
            { type: 'paragraph', text: 'You might say to yourself:' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"I\'m dissociating right now.\nI\'m overwhelmed and feel stuck.\nI\'ll come back to this tomorrow\nwhen I can think clearly."',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F9FAFB',
              lines: ['Naming it creates space.', 'Space creates options.'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'That\'s how we see more solutions\nand make better choices —\nfor ourselves and our loved ones.',
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 2,
              question: 'Why is dissociating or avoidance usually a bad reaction?',
              options: [
                { label: 'It makes us feel helpless', isCorrect: false },
                { label: 'It prevents us from working on solutions', isCorrect: false },
                { label: 'It keeps the problem emotionally unresolved', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Correct. Dissociation creates helplessness, blocks solutions, and leaves emotional weight unresolved — making things worse over time.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 2,
              question: 'What is the most effective first step to reduce dissociation?',
              options: [
                { label: 'Solve the problem immediately', isCorrect: false },
                { label: 'Avoid overwhelming situations', isCorrect: false },
                { label: 'Notice it and name it', isCorrect: true },
                { label: 'Distract yourself', isCorrect: false },
              ],
              feedback: 'Correct. Naming dissociation creates awareness and space, which helps you regain control and see more options.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3
    // =====================================================================
    {
      id: '3',
      title: 'More ways to stop dissociation when it starts',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When dissociation starts, you still have options', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Dissociation doesn\'t mean something is wrong with you.\nIt\'s your brain trying to protect you from feeling overwhelmed.',
            },
            {
              type: 'paragraph',
              text: 'The goal isn\'t to "force it away."\nThe goal is to gently bring yourself back to the present.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: [
                'Here are simple techniques you can use the moment you notice yourself checking out.',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '👣' },
            { type: 'heading', text: '1. Ground your body', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Physical sensations help your brain reconnect to the present moment.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: 'Take off your shoes and feel the ground' },
                { iconKind: 'ionicon', title: 'Press your feet firmly into the floor' },
                { iconKind: 'ionicon', title: 'Notice pressure, temperature, and texture' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F9FAFB',
              lines: [
                'Strong physical sensations pull attention out of your head and back into your body.',
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🔢' },
            { type: 'heading', text: '2. Count things around you', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Actively observing your environment keeps dissociation from deepening.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', number: 1, title: 'Name 5 things you can see' },
                { iconKind: 'ionicon', number: 2, title: 'Then 5 things of a different color' },
                { iconKind: 'ionicon', number: 3, title: 'Keep switching categories if needed' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F9FAFB',
              label: 'Why it works',
              lines: ['Your brain can\'t "check out" while it\'s actively noticing details.'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: '3. Stimulate your senses', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Strong sensory input can interrupt dissociation quickly.',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '🍬', iconKind: 'emoji', title: 'Chew gum' },
                { icon: '🌿', iconKind: 'emoji', title: 'Smell something strong (mint, citrus)' },
                { icon: '🔑', iconKind: 'emoji', title: 'Hold something textured (stone, key, fabric)' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F9FAFB',
              lines: ['You\'re not distracting yourself — you\'re grounding yourself.'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: '4. Run through your senses', size: 'lg' },
            { type: 'paragraph', text: 'Pause and name what\'s happening right now.' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '👁️', iconKind: 'emoji', title: 'What can you see?' },
                { icon: '👂', iconKind: 'emoji', title: 'What can you hear?' },
                { icon: '👃', iconKind: 'emoji', title: 'What can you smell?' },
                { icon: '✋', iconKind: 'emoji', title: 'What can you feel?' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F9FAFB',
              label: 'Why this helps',
              lines: ['This reconnects your brain directly to your surroundings.'],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '❄️' },
            { type: 'heading', text: '5. Use cold sensation\n(when possible)', size: 'lg' },
            { type: 'paragraph', text: 'Cold is a fast and effective grounding tool.' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', title: 'Hold ice cubes' },
                { iconKind: 'ionicon', title: 'Splash cold water on your face' },
                { iconKind: 'ionicon', title: 'Run cold water over your wrists' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF9E6',
              textColor: '#856404',
              lines: ['Use only what feels safe and manageable for you.'],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'You\'re not alone', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Dissociation is extremely common — and rarely talked about.',
            },
            {
              type: 'paragraph',
              text: 'Many people experience it regularly without knowing what it is.\nNoticing it is already a huge step forward.',
            },
            {
              type: 'paragraph',
              text: 'If it happens again, don\'t panic.\nJust gently bring yourself back.',
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
              question: 'What is the most important first step when dissociation starts?',
              options: [
                { label: 'Try to force it to stop', isCorrect: false },
                { label: 'Ignore it', isCorrect: false },
                { label: 'Notice it and name it', isCorrect: true },
                { label: 'Avoid difficult topics forever', isCorrect: false },
              ],
              feedback: 'Correct. Awareness reduces dissociation\'s power.',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heading', text: 'Key takeaway', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Dissociation isn\'t a failure.\nIt\'s a signal.'],
            },
            {
              type: 'paragraph',
              text: 'When you notice it and name it, you create space for better choices — for yourself and for the people you care about.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4
    // =====================================================================
    {
      id: '4',
      title: 'Summary and Homework',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Today we learned', size: 'xl' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                {
                  iconKind: 'ionicon',
                  title: 'Dissociation is what our brain does when something feels overwhelming or unsolvable.\nIt\'s a protective response — not a failure.',
                },
                {
                  iconKind: 'ionicon',
                  title: 'Dissociation often happens automatically and without awareness.',
                },
                {
                  iconKind: 'ionicon',
                  title: 'The most powerful first step is simply noticing and naming it when it happens.',
                },
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Homework: Practice noticing', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Over the next few days, see if you can notice dissociation when it happens.',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'You might notice it when:',
              lines: [
                'Your mind suddenly goes blank',
                'You feel numb or detached',
                'You avoid thinking about something uncomfortable',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              label: 'Reflection questions',
              lines: [
                'Can you name it when it happens to you?',
                'Can you notice it in your loved ones?',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: ['You don\'t need to fix anything.\nJust notice and name it.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heading', text: 'That\'s enough for today', size: 'xl' },
            { type: 'paragraph', text: 'Awareness alone creates change.' },
            {
              type: 'paragraph',
              text: 'Every time you notice dissociation,\nyou give yourself more choice —\nand more compassion.',
            },
          ],
        },
      ],
    },
  ],
};
