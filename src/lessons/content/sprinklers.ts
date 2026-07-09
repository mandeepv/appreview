// SPEC-09 — Sprinklers lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 52 hand-built Sprinklers screen files
// in src/screens/sprinklers/. Text, punctuation, curly quotes, emoji, and block
// order reproduce the existing screens exactly. No redesign, no typo fixes —
// observed issues are logged in docs/spec-09/CONTENT_ERRATA.md instead.
//
// Section-complete mapping note: only §1 Screen10 matches the canonical
// sectionComplete visual (checkmark card + "complete" + NEXT preview), so it is
// the only `sectionComplete` screen. The final screens of §2–§5 are richer
// content screens (checklists, journey cards, summary cards, a rocket send-off);
// they are transcribed as `content` screens to preserve their content faithfully.
// The generic progress store writes the section key on section completion.

import type { Lesson } from '../schema';

export const sprinklers: Lesson = {
  slug: 'sprinklers',
  title: 'Sprinklers: Building Deep Bonds',
  storageKey: '@sprinklers_completed_sections',
  sections: [
    // =====================================================================
    // Section 1
    // =====================================================================
    {
      id: '1',
      title: 'How do we really bond with our loved ones?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Start',
          blocks: [
            { type: 'heading', text: 'How Do We Really Bond With Our Kids?', size: 'xl' },
            { type: 'paragraph', text: 'Most parents think bonding happens during fun moments.' },
            { type: 'paragraph', text: 'Science says something very different.' },
            { type: 'pill', text: '⏱️ ~3–4 minutes' },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'heading',
              text: 'When you think of bonding with your child, what comes to mind?',
              size: 'lg',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { icon: 'ellipse', iconKind: 'ionicon', title: 'Going to the park' },
                { icon: 'ellipse', iconKind: 'ionicon', title: 'Playing sports or games' },
                { icon: 'ellipse', iconKind: 'ionicon', title: 'One-on-one time' },
                { icon: 'ellipse', iconKind: 'ionicon', title: 'Family dinners' },
              ],
            },
            {
              type: 'footer',
              text: 'These do matter — but they’re not what builds the deepest bonds.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'That matters →',
          blocks: [
            { type: 'heading', text: 'Is building deep bonds really that important?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Study after study shows that children who have deep emotional bonds:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: '✨', iconKind: 'emoji', title: 'Get better grades' },
                { icon: '✨', iconKind: 'emoji', title: 'Live longer' },
                { icon: '✨', iconKind: 'emoji', title: 'Whine less' },
                { icon: '✨', iconKind: 'emoji', title: 'Have longer attention spans' },
                { icon: '✨', iconKind: 'emoji', title: 'Have fewer discipline problems' },
                { icon: '✨', iconKind: 'emoji', title: 'Solve more of their own problems' },
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'This surprised me →',
          blocks: [
            { type: 'heading', text: 'So what actually builds deep bonds?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Most people assume relationships are built during happy moments — like vacations or playtime.',
            },
            {
              type: 'paragraph',
              text: [
                { text: 'But research shows that relationships are mostly built or torn down during moments when our loved ones are ', emphasis: 'plain' },
                { text: 'emotionally upset', emphasis: 'emphasis' },
                { text: '.', emphasis: 'plain' },
              ],
            },
            {
              type: 'callout',
              variant: 'quote',
              lines: ['"It’s how we respond during these moments that defines the relationship."'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Okay, but how? →',
          blocks: [
            { type: 'heading', text: 'This surprises almost every parent', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Many parents think of emotional moments as something to survive:',
            },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { icon: 'alert-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Tantrums' },
                { icon: 'alert-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Tears' },
                { icon: 'alert-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Frustration' },
                { icon: 'alert-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Meltdowns' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              label: 'BUT SCIENCE IS CLEAR:',
              labelColor: '#2E7D32',
              textColor: '#1B5E20',
              lines: ['These moments are actually opportunities to build deep bonds.'],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'The best time to build deep bonds with kids is during:',
              options: [
                { text: 'Sports or games', isCorrect: false },
                { text: 'Hobbies', isCorrect: false },
                { text: 'Studying for school', isCorrect: false },
                { text: 'Emotional or upset moments', isCorrect: true },
              ],
              correctFeedback:
                'Deep bonds are built when we help children during emotional moments — not just fun ones.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Show me',
          blocks: [
            { type: 'heading', text: 'This applies to adults too', size: 'lg' },
            { type: 'heroEmoji', emoji: '👫', bg: '#FFF3E0' },
            { type: 'paragraph', text: 'The same science applies to romantic partners.' },
            {
              type: 'callout',
              variant: 'highlight',
              dividers: true,
              lines: [
                'Deep bonds are not built by gifts, compliments, or vacations alone —',
                [
                  { text: 'they are built when we help our partner during emotional or upset moments.', emphasis: 'emphasis' },
                ],
              ],
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'The best way to bond with our romantic partner is…',
              options: [
                { text: 'Buying them something expensive', isCorrect: false },
                { text: 'Having shared experiences like vacations', isCorrect: false },
                { text: 'Learning how to help them during emotional or upset moments', isCorrect: true },
                { text: 'Doing tasks for them so they can relax', isCorrect: false },
                { text: 'Telling them they are attractive', isCorrect: false },
              ],
              correctFeedback:
                'The strongest bonds form when someone feels emotionally supported during difficult moments.',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Learn the tools →',
          blocks: [
            { type: 'heading', text: 'The good news', size: 'lg' },
            { type: 'paragraph', text: 'Emotional moments don’t have to feel overwhelming.' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              lines: ['There are simple, learnable tools that make these moments:'],
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'chip',
              items: [
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'Easier' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'Calmer' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'More connecting' },
              ],
            },
            {
              type: 'footer',
              text: 'And learning these tools can dramatically change your relationship with your child.',
            },
          ],
        },
        // Screen 10 — section complete
        {
          kind: 'sectionComplete',
          title: 'Sublesson complete',
          text: 'You’ve learned when deep bonds are actually built.',
          cta: 'Continue',
          nextPreview:
            'How to show up during emotional moments without making things worse.',
        },
      ],
    },
    // =====================================================================
    // Section 2
    // =====================================================================
    {
      id: '2',
      title: 'What NOT to do when loved ones are upset',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'SECTION 2 OF 5',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What NOT to do when loved ones are upset', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Now that we know deep bonds are built during emotional moments, let’s look at a simple analogy that shows why good intentions often backfire.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heroEmoji', emoji: '⛲🚿🚿🚿👩‍👦', bg: '#E3F2FF' },
            {
              type: 'paragraph',
              text: 'Imagine your child is walking through the park on a chilly day. Suddenly, the sprinklers turn on and soak them.',
            },
            {
              type: 'paragraph',
              text: 'They’re surprised. Uncomfortable. All they want is to get out of the situation.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'This is what emotional upset feels like', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When our kids are emotionally upset, their experience is very similar.',
            },
            {
              type: 'callout',
              variant: 'quote',
              bg: '#FFE4ED',
              lines: ['Their system is flooded.', 'They want relief — not explanations.'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What’s happening in their brain?', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', title: 'Logical (OFF)', color: '#E0E0E0' },
                { iconKind: 'ionicon', title: 'Emotional', color: '#FFE4ED' },
                { iconKind: 'ionicon', title: 'Primitive (IN CONTROL)', color: '#FFEBEE' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'When a child is upset, the ', emphasis: 'plain' },
                { text: 'primitive brain', emphasis: 'emphasis' },
                { text: ' takes control.', emphasis: 'plain' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'This part of the brain is great at:',
              lines: ['Fighting    Running', 'But it’s not good at thinking things through.'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'When a child is really upset, what part of the brain is in control?',
              options: [
                { text: 'Primitive', isCorrect: true },
                { text: 'Emotional', isCorrect: false },
                { text: 'Logical', isCorrect: false },
              ],
              correctFeedback:
                'Correct. When the primitive brain is in control, reasoning doesn’t work.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Mistake #1: Problem solving too soon', size: 'lg' },
            { type: 'paragraph', text: 'Let’s go back to the park.' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              lines: [
                'You’re walking with a friend. The sprinklers suddenly turn on.',
                'Your friend grabs your arm and says:',
                '“We should’ve noticed the sprinklers earlier.”',
              ],
            },
            { type: 'paragraph', text: 'It might be good advice — but now is not the time.' },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'How this shows up with kids', size: 'lg' },
            { type: 'paragraph', text: 'When kids are upset, we often jump to advice:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: '“Put your toys away next time.”' },
                { iconKind: 'ionicon', title: '“You should’ve studied more.”' },
              ],
            },
            {
              type: 'paragraph',
              text: 'Even good advice can feel hurtful when their primitive brain is in control.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              textColor: '#4A90D9',
              lines: [
                [
                  { text: 'Your goal is not to solve — it’s to ', emphasis: 'plain' },
                  { text: 'emotionally connect', emphasis: 'emphasis' },
                  { text: '.', emphasis: 'plain' },
                ],
              ],
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Mistake #2: Minimizing', size: 'lg' },
            { type: 'paragraph', text: 'Back in the park.' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              lines: [
                'The sprinklers turn on and your friend says:',
                '“It’s not a big deal.”',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFFFFF',
              lines: [
                'Maybe it isn’t to them.',
                [{ text: 'But it is to you.', emphasis: 'emphasis' }],
              ],
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'What kids hear when we minimize', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: '“You’re overreacting.”', color: '#FFEBEE' },
                { iconKind: 'ionicon', title: '“It’s just a toy.”', color: '#FFEBEE' },
              ],
            },
            { type: 'paragraph', text: 'Kids don’t learn to calm down. They learn:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'bordered',
              items: [
                { iconKind: 'ionicon', title: '“My feelings are wrong.”' },
                { iconKind: 'ionicon', title: '“I’m bad at emotions.”' },
              ],
            },
            { type: 'footer', text: 'Over time, this makes them less likely to come to us.' },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Mistake #3: Not being on their team', size: 'lg' },
            { type: 'paragraph', text: 'Imagine the sprinklers turn on and your friend says:' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              lines: ['“Well, the sprinklers had to run or the grass would die.”'],
            },
            { type: 'footer', text: 'That probably wouldn’t feel very supportive.' },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next →',
          blocks: [
            { type: 'heading', text: 'Why this hurts connection', size: 'lg' },
            { type: 'paragraph', text: 'When a child is upset and we say:' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFEBEE',
              textColor: '#D32F2F',
              lines: ['“Maybe you did something to deserve it.”'],
            },
            { type: 'paragraph', text: 'They don’t feel understood. They feel alone.' },
            {
              type: 'callout',
              variant: 'insight',
              lines: [
                'When someone’s primitive brain is activated, they need to know:',
                'You’re on their team.',
              ],
            },
          ],
        },
        // Screen 12
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              lines: [
                'Sarah is upset that her teacher kept her in from recess. Her mom says:',
                '“Obviously the teacher had a good reason.”',
              ],
            },
            {
              type: 'interactiveQuiz',
              question: 'What mistake is Sarah’s mom making?',
              options: [
                { text: 'Minimizing', isCorrect: false },
                { text: 'Siding with the enemy', isCorrect: true },
                { text: 'Problem solving', isCorrect: false },
                { text: 'Trying to cheer up', isCorrect: false },
              ],
              correctFeedback:
                'When kids are upset, they need us on their team first — not explanations.',
            },
          ],
        },
        // Screen 13 — checklist summary (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Next section →',
          blocks: [
            { type: 'heading', text: 'When kids are in the sprinkler of emotions…', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Don’t problem solve' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Don’t minimize' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Don’t take the other side' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'Do connect emotionally' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'Do show you’re on their team' },
              ],
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
      title: 'What TO DO when loved ones are upset',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'paragraph', text: 'When someone is upset, it’s not random chaos.' },
            {
              type: 'paragraph',
              text: 'There are three predictable phases their brain moves through.',
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E3F2FF',
              textColor: '#4A90D9',
              lines: ['Knowing the phase tells you what to do — and what not to do.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The emotional sprinkler has three phases:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { iconKind: 'ionicon', number: 1, title: 'Primitive Brain Phase', color: '#FFEBEE' },
                { iconKind: 'ionicon', number: 2, title: 'Cooling Down Period', color: '#E3F2FF' },
                { iconKind: 'ionicon', number: 3, title: 'Logical Brain Phase', color: '#E8F5E9' },
              ],
            },
            { type: 'footer', text: 'Each phase needs a different response.' },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '⚡', bg: '#FFEBEE' },
            { type: 'heading', text: 'Phase 1: The Primitive Brain Phase', size: 'lg' },
            { type: 'paragraph', text: 'When someone is in this phase:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Fight-or-flight is active' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Rational thinking is offline' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#E53935', title: 'Teaching will not work' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF9C4',
              textColor: '#F9A825',
              lines: [
                'This is where most well-meaning parents accidentally make things worse.',
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'In Phase 1, do NOT:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#D32F2F', title: 'Give advice or problem solve', color: '#FFEBEE' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#D32F2F', title: 'Teach lessons or consequences', color: '#FFEBEE' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#D32F2F', title: 'Try to cheer them up', color: '#FFEBEE' },
                { icon: 'close-circle', iconKind: 'ionicon', iconColor: '#D32F2F', title: 'Minimize what they’re feeling', color: '#FFEBEE' },
              ],
            },
            { type: 'footer', text: 'The logical brain isn’t available yet.' },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'So what should you do?', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F5F5F5',
              label: 'First, recognize the moment:',
              lines: ['“They are in the emotional sprinkler.”'],
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'heart', iconKind: 'ionicon', title: 'Show sympathy' },
                { icon: 'people', iconKind: 'ionicon', title: 'Be nearby' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', title: 'Let them know they’re not alone' },
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: ['This is not fixing.', 'This is building safety.'],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'What should we do in phase 1, the primitive brain phase?',
              options: [
                { text: 'Give advice and solve the problem', isCorrect: false },
                { text: 'Show sympathy and be nearby', isCorrect: true },
                { text: 'Explain the consequences of their behavior', isCorrect: false },
                { text: 'Try to cheer them up with a joke', isCorrect: false },
              ],
              correctFeedback:
                'Phase 1 isn’t about fixing or teaching. It’s about helping the brain feel safe enough to calm down.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🌡️', bg: '#E3F2FF' },
            { type: 'heading', text: 'Phase 2: The Cooling Down Period', size: 'lg' },
            { type: 'paragraph', text: 'This phase can last:' },
            {
              type: 'cardList',
              layout: 'chips',
              cardStyle: 'chip',
              items: [
                { iconKind: 'ionicon', title: '2 minutes' },
                { iconKind: 'ionicon', title: '2 hours' },
                { iconKind: 'ionicon', title: 'Or even 2 days' },
              ],
            },
            { type: 'paragraph', text: 'The primitive brain needs time to deactivate on its own.' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              textColor: '#4A90D9',
              lines: ['You can’t rush this phase.'],
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'What should we do in phase 2, the cooling down period?',
              options: [
                { text: 'Give firm consequences for the behavior', isCorrect: false },
                { text: 'Listen, help label emotions, give advice sparingly', isCorrect: true },
                { text: 'Tell them they need to stop being upset immediately', isCorrect: false },
                { text: 'Force them to apologize', isCorrect: false },
              ],
              correctFeedback:
                'Correct. Once the brain begins to calm, gentle listening and naming emotions becomes possible.',
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'callout',
              variant: 'quote',
              bg: '#FFFFFF',
              lines: [
                '“If the emotional (or primitive) mind starts taking over again, just go back to listening and sympathizing.”',
                '— Dr. Stephen Covey',
              ],
            },
            {
              type: 'paragraph',
              text: 'The brain’s recovery isn’t always a straight line. If they get upset again, simply step back into Phase 1 support.',
            },
          ],
        },
        // Screen 10
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💡', bg: '#E8F5E9' },
            { type: 'heading', text: 'Phase 3: The Logical Brain Phase', size: 'lg' },
            { type: 'paragraph', text: 'This phase happens when:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'Emotions have cooled' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', iconColor: '#4CAF50', title: 'The brain can think again' },
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              textColor: '#2E7D32',
              lines: ['This is where learning can finally happen.'],
            },
          ],
        },
        // Screen 11
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'In Phase 3:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'checkmark-done', iconKind: 'ionicon', title: 'Listen without getting defensive' },
                { icon: 'checkmark-done', iconKind: 'ionicon', title: 'Ask for their side of the story' },
                { icon: 'checkmark-done', iconKind: 'ionicon', title: 'Validate how it felt for them' },
                { icon: 'checkmark-done', iconKind: 'ionicon', title: 'Help them label and organize emotions' },
              ],
            },
            { type: 'footer', text: 'What felt like a jumbled mess can finally start making sense.' },
          ],
        },
        // Screen 12
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Advice & limits', size: 'lg' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFFDE7',
              label: 'As long as the logical brain stays active:',
              labelColor: '#FBC02D',
              lines: [
                'You can give a little advice',
                'You can remind about expectations',
                'You can set limits or consequences if needed',
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Advice works ', emphasis: 'plain' },
                { text: 'only now', emphasis: 'emphasis' },
                { text: ', not earlier.', emphasis: 'plain' },
              ],
            },
          ],
        },
        // Screen 13
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'What should we do in phase 3, the logical brain phase?',
              options: [
                { text: 'Immediately start with advice', isCorrect: false },
                { text: 'Organize feelings, give advice sparingly, and listen without getting defensive', isCorrect: true },
                { text: 'Stay silent and avoid the topic', isCorrect: false },
                { text: 'Focus only on consequences', isCorrect: false },
              ],
              correctFeedback:
                'During phase 3 we can help organize feelings, give advice (sparingly), and listen without getting defensive.',
            },
          ],
        },
        // Screen 14 — journey summary (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Next sublesson',
          blocks: [
            {
              type: 'heading',
              text: 'When the sprinklers come on, your job is not to fix.',
              size: 'lg',
            },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'Your job is to help them move safely:',
              lines: ['Primitive  →  Cooling  →  Logical'],
            },
            {
              type: 'footer',
              text: 'Deep bonds are built by how we walk with them through that journey.',
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
      title: 'Three things to remember',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 4 of 5',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Three Things to Remember', size: 'xl' },
            { type: 'paragraph', text: 'This might sound hard or overwhelming at first.' },
            {
              type: 'paragraph',
              text: 'Before we move on, there are three important things we want you to remember.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '👥', bg: '#F5F5F5' },
            { type: 'heading', text: 'You don’t need to do this perfectly', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Dr. John Gottman states that parents who are really great at building deep bonds are only doing it right about 30% of the time.',
            },
            {
              type: 'paragraph',
              text: 'You don’t have to be perfect at this to make a big difference.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              textColor: '#4A90D9',
              lines: ['30% is enough'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question:
                'True or False:\nTo build deep bonds you need to do this correctly 80% of the time',
              options: [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: true },
              ],
              correctFeedback:
                'You don’t need to do this perfectly. Even small, imperfect efforts build trust over time.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '😊', bg: '#FFF3E0' },
            { type: 'heading', text: 'This may feel awkward at first', size: 'lg' },
            { type: 'paragraph', text: 'You may feel like this is cheesy or uncomfortable.' },
            { type: 'paragraph', text: 'Could you really talk to your kids about their feelings?' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#F5F5F5',
              lines: ['Just know: everything related to deep bonds feels awkward at first.'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'That makes sense',
          blocks: [
            { type: 'heading', text: 'At first, new things feel uncomfortable.', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { iconKind: 'ionicon', title: '30 Years Ago', subtitle: 'Dads saying “I love you” felt awkward.' },
                { iconKind: 'ionicon', title: '20 Years Ago', subtitle: 'Wearing seatbelts felt awkward.' },
                { iconKind: 'ionicon', title: 'Today', subtitle: 'Over time, they become normal—and second nature.' },
              ],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question: 'True or False:\nBuilding deep bonds may feel awkward at first',
              options: [
                { text: 'True', isCorrect: true },
                { text: 'False', isCorrect: false },
              ],
              correctFeedback:
                'Correct. Awkward is often a sign that you’re learning something new—not doing something wrong.',
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '✨', bg: '#FFFDE7' },
            { type: 'heading', text: 'Small moments matter', size: 'lg' },
            {
              type: 'paragraph',
              text: 'You may be tempted—especially with younger kids—to feel like their problems are too small.',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                [
                  { text: 'Being there in the ', emphasis: 'plain' },
                  { text: 'broken toy', emphasis: 'emphasis' },
                  { text: ' moments earns you a ticket to the ', emphasis: 'plain' },
                  { text: 'broken heart', emphasis: 'emphasis' },
                  { text: ' moments later in life.', emphasis: 'plain' },
                ],
              ],
            },
            {
              type: 'footer',
              text: 'If a child doesn’t feel safe coming to you with the small things now, they won’t come to you later with the big things.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'interactiveQuiz',
              question:
                'True or False:\nYou can safely dismiss a child if they are upset over something small',
              options: [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: true },
              ],
              correctFeedback: 'Small moments are how trust is built for the big ones.',
            },
          ],
        },
        // Screen 9 — summary (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Finish lesson',
          blocks: [
            { type: 'heroEmoji', emoji: '⭐', bg: '#E3F2FF' },
            { type: 'heading', text: 'You’re learning something powerful', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: 'checkmark-circle', iconKind: 'ionicon', title: 'You don’t need to be perfect' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', title: 'Feeling awkward is normal' },
                { icon: 'checkmark-circle', iconKind: 'ionicon', title: 'Small moments build lifelong bonds' },
              ],
            },
            {
              type: 'footer',
              text: 'With a little practice, this is a skill you can learn—and it can change lives across generations.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 5
    // =====================================================================
    {
      id: '5',
      title: 'Summary',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 5 of 5',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Summary', size: 'xl' },
            {
              type: 'paragraph',
              text: 'Let’s quickly bring together what we learned in this lesson.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            {
              type: 'heading',
              text: 'When emotions run high, the primitive brain takes over',
              size: 'lg',
            },
            {
              type: 'callout',
              variant: 'highlight',
              lines: ['Sprinkler (Primitive)  →  Cooling Period  →  Logic Active'],
            },
            {
              type: 'paragraph',
              text: 'We learned that our loved ones can get caught in the sprinkler of emotions, where the primitive brain takes control.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFEBEE',
              textColor: '#D32F2F',
              lines: ['In this phase, it’s not helpful to give advice or problem-solve.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Got it',
          blocks: [
            { type: 'heroEmoji', emoji: '⏱️', bg: '#E3F2FF' },
            { type: 'heading', text: 'Advice works only at the right time', size: 'lg' },
            { type: 'paragraph', text: 'We also learned that giving advice too early doesn’t help.' },
            {
              type: 'paragraph',
              text: 'It’s best to wait until the cooling off period has passed and the logical brain is active again.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              textColor: '#4A90D9',
              lines: ['Timing matters more than advice'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heading', text: 'Now notice this in your own life', size: 'lg' },
            { type: 'paragraph', text: 'Start noticing when your own primitive brain is in control.' },
            {
              type: 'callout',
              variant: 'highlight',
              label: 'Notice when you move from:',
              lines: ['Primitive  →  Cooling Off  →  Logical'],
            },
            {
              type: 'footer',
              text: 'Just notice. No fixing.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Notice it in the people you love', size: 'lg' },
            { type: 'paragraph', text: 'Begin noticing this in others too.' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'surface',
              items: [
                { icon: 'help-circle', iconKind: 'ionicon', title: 'How long does it take them to cool down?' },
                { icon: 'help-circle', iconKind: 'ionicon', title: 'How long does it take you?' },
                { icon: 'help-circle', iconKind: 'ionicon', title: 'Is it minutes? Hours? Longer?' },
              ],
            },
            { type: 'footer', text: 'There’s no “right” answer.' },
          ],
        },
        // Screen 6 — send-off (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Continue to next lesson →',
          blocks: [
            { type: 'heroEmoji', emoji: '🚀', bg: '#E3F2FF' },
            { type: 'heading', text: 'This is just the beginning', size: 'lg' },
            {
              type: 'paragraph',
              text: 'In the next lesson, we’ll learn how to apply this understanding directly in relationships—step by step.',
            },
          ],
        },
      ],
    },
  ],
};
