// SPEC-09 — Communication Mistakes lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 59 hand-built Communication Mistakes
// screen files. Source screens are SPLIT across two directories (same lesson):
// src/screens/communication-mistakes/ holds Sec1..Sec3, and
// src/screens/communicationMistakes/ holds Sec4..Sec13. Text, punctuation,
// quotes (straight ASCII, as in the source), emoji, and block order reproduce
// the existing screens exactly. No redesign, no typo fixes — observed issues
// are logged in docs/spec-09/CONTENT_ERRATA.md instead.
//
// Structural mapping (progress byte-compatibility): the THIRTEEN SECTIONS are
// modelled with ids '1'..'13' — the same values the source stores via
// markSectionComplete('1'..'13') into '@communication_mistakes_completed_sections'
// (verified: each section's LAST screen calls markSectionComplete with its id).
// The controller writes the section id on the last screen of each section,
// reproducing the identical ['1'..'13'] array. Section titles use the sublesson
// topic wording from the lesson hub (CommunicationMistakesLessonScreen.tsx).
//
// All screens are `kind: 'content'` (matching dissociation.ts / serveReturn.ts);
// none of the section-final screens is the sparse canonical `sectionComplete`
// card, so every screen is transcribed as `content`.

import type { Lesson } from '../schema';

export const communicationMistakes: Lesson = {
  slug: 'communicationMistakes',
  title: 'Communication Mistakes',
  storageKey: '@communication_mistakes_completed_sections',
  sections: [
    // =====================================================================
    // Section 1 — Situation: The Sleepover
    // =====================================================================
    {
      id: '1',
      title: 'Situation: The Sleepover',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The Sleepover', size: 'xl' },
            {
              type: 'paragraph',
              text: 'In this lesson, you\'ll see a real-life moment where a well-meaning parent accidentally hurts the bond with their child.',
            },
            {
              type: 'paragraph',
              text: 'Although this is a parent–child example, the same communication mistakes happen in romantic relationships, friendships, and even at work.',
            },
            {
              type: 'paragraph',
              text: 'Pay close attention to what goes wrong — not what Dad intends, but how it lands.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The situation', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E3F2FF',
              label: '(Sighs)',
              lines: [
                '"Paige didn\'t invite me to the sleepover.',
                'All the girls were invited…',
                'And she didn\'t even sit by me at lunch."',
              ],
            },
            {
              type: 'footer',
              text: 'Imagine this is your child coming to you after school.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '⏸️' },
            { type: 'heading', text: 'Pause for a moment', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Before seeing how Dad responds, take a second to notice what you feel as you read this.',
            },
            {
              type: 'paragraph',
              text: 'Most communication mistakes happen when we move too fast.',
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
              totalQuestions: 3,
              question: 'What do you think Dad is most likely to do wrong?',
              options: [
                { label: 'Dismiss her feelings', isCorrect: false },
                { label: 'Jump into problem-solving', isCorrect: false },
                { label: 'Minimize the situation', isCorrect: false },
                { label: 'Focus on fixing instead of listening', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'You\'re noticing the pattern. In moments like this, the biggest damage usually comes from how we respond — not what we say. We often rush past emotions instead of helping unload them.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '💡' },
            { type: 'heading', text: 'Why this matters', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When emotions aren\'t acknowledged, they don\'t disappear — they pile up.',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'In the next screen, you\'ll see exactly how Dad responds… and why it unintentionally makes things worse.',
              ],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heroEmoji', emoji: '✅' },
            {
              type: 'heading',
              text: 'You\'ve completed the scenario introduction',
              size: 'lg',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'You now understand the setup for this lesson.',
                'In the next lessons, we\'ll break down exactly what Dad does wrong and learn better ways to respond.',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 2 — Siding with the Enemy
    // =====================================================================
    {
      id: '2',
      title: 'Siding with the Enemy',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '⚠️' },
            { type: 'heading', text: 'Mistake #2: Siding With the Enemy', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Sometimes, when someone we love is upset, we try to be fair.',
            },
            {
              type: 'paragraph',
              text: 'We try to show them the "other side."',
            },
            {
              type: 'paragraph',
              text: 'But when emotions are high, this can feel deeply invalidating—and damage the bond.',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Let\'s look at an example.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'See the conversation',
          blocks: [
            { type: 'heading', text: 'The Situation', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'A daughter comes home upset.',
                'She wasn\'t invited to a sleepover.\nHer friend didn\'t sit with her at lunch.',
                'She tells her dad what happened—hoping to feel understood.',
                [{ text: 'What happens next is a very common mistake.', emphasis: 'emphasis' }],
              ],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Reflect',
          blocks: [
            { type: 'heading', text: 'What Dad Says', size: 'lg' },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: 'She didn\'t sit by you at lunch today?', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter\n', emphasis: 'emphasis' },
                { text: 'No.', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: 'And she didn\'t invite you to sleep over?', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter\n', emphasis: 'emphasis' },
                { text: 'Yeah.', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: 'I didn\'t want to bring this up…\nbut when I saw you together last week,\nyou seemed kind of rude.\nYou were on your phone the whole time.\nMaybe that\'s why she doesn\'t want to hang out.', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter\n', emphasis: 'emphasis' },
                { text: 'I was on my phone looking up homework definitions.\nThat\'s why she came over.\nWe weren\'t supposed to just talk.', emphasis: 'plain' },
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '🤔' },
            { type: 'heading', text: 'Pause & Reflect', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'If you were the daughter in this moment,\nhow would this response feel?',
              ],
            },
            {
              type: 'footer',
              text: 'There\'s no "right" answer—just notice your reaction.',
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
              question: 'What did Dad do wrong here?',
              options: [
                { label: 'He tried to be honest', isCorrect: false },
                { label: 'He helped her see the other side', isCorrect: false },
                { label: 'He sided against her while she was upset', isCorrect: true },
                { label: 'He encouraged accountability', isCorrect: false },
              ],
              feedback: 'When someone is emotionally overwhelmed, trying to explain the other person\'s perspective feels like betrayal—even if it\'s accurate.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Test your understanding',
          blocks: [
            { type: 'heroEmoji', emoji: '⚡' },
            { type: 'heading', text: 'This Is Called: Siding With the Enemy', size: 'lg' },
            {
              type: 'paragraph',
              text: '"Siding with the enemy" happens when we:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Point out how our loved one may be wrong' },
                { icon: '•', iconKind: 'emoji', title: 'Defend the other person\'s behavior' },
                { icon: '•', iconKind: 'emoji', title: 'Try to teach a lesson before emotions are processed' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Even when facts are true, the bond weakens.'],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 2,
              question: 'Why does siding with the enemy hurt relationships?',
              options: [
                { label: 'It discourages honesty', isCorrect: false },
                { label: 'It makes people dependent', isCorrect: false },
                { label: 'It prevents emotional safety', isCorrect: true },
                { label: 'It avoids accountability', isCorrect: false },
              ],
              feedback: 'Before someone can hear feedback or perspective, they need to feel emotionally supported.\n\nSafety first. Perspective later.',
            },
          ],
        },
        // Screen 8
        {
          kind: 'content',
          cta: 'Continue',
          blocks: [
            { type: 'heroEmoji', emoji: '💬' },
            {
              type: 'callout',
              variant: 'quote',
              lines: [
                '"The proper office of a friend is to side with you when you are wrong.\n\nNearly anybody will side with you when you are right."',
                '— Mark Twain',
              ],
            },
          ],
        },
        // Screen 9
        {
          kind: 'content',
          cta: 'Next lesson',
          blocks: [
            { type: 'heroEmoji', emoji: '✨' },
            { type: 'heading', text: 'Key Takeaway', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              label: 'When emotions are high, don\'t correct',
              lines: [
                'Don\'t explain the other person\'s side',
                'Don\'t teach lessons too soon',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Your job first is to:\nNotice → Empathize → Validate',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 3 — Siding with the Enemy: Trying to See Both Sides
    // =====================================================================
    {
      id: '3',
      title: 'Siding with the Enemy: Trying to See Both Sides',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 3 of 13',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💬' },
            { type: 'heading', text: 'Trying to see "both sides"', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Dad wants to help his daughter understand why Paige didn\'t invite her to the sleepover.',
                'His intention is good — but his timing is not.',
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Here\'s what Dad says:', size: 'lg' },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: '"Maybe you need to see why she didn\'t invite you."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: '"What\'s going on with her? Maybe there\'s something on her side."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter\n', emphasis: 'emphasis' },
                { text: '"So you want me to go ask her why she didn\'t invite me?"', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad\n', emphasis: 'emphasis' },
                { text: '"Well… that might not be a bad idea."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter\n', emphasis: 'emphasis' },
                { text: '"That\'s a terrible idea."', emphasis: 'plain' },
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
              totalQuestions: 2,
              question: 'How do you think this made the daughter feel?',
              options: [
                { label: 'Like her feelings don\'t matter', isCorrect: false },
                { label: 'Like her dad is defending the other girl', isCorrect: false },
                { label: 'Like she is being blamed', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'All of these feelings are valid. When someone is upset, trying to understand \'the other side\' too early can trigger all of these emotional responses at once.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '💡' },
            { type: 'heading', text: 'Why this backfires', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: [
                'When someone is upset, trying to understand "the other side" too early feels like betrayal.',
                'Even if your intentions are good, it sounds like:',
                '"You\'re wrong"',
                '"Your feelings aren\'t valid"',
                '"I\'m not on your side"',
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
              questionNumber: 2,
              totalQuestions: 2,
              question: 'When someone is upset, what usually happens when we try to see "both sides" too soon?',
              options: [
                { label: 'They feel understood', isCorrect: false },
                { label: 'They calm down', isCorrect: false },
                { label: 'They become defensive', isCorrect: true },
                { label: 'They appreciate the logic', isCorrect: false },
              ],
              feedback: 'When emotions are high, attempts at fairness or logic trigger defensiveness. People need to feel emotionally safe before they can hear other perspectives.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heroEmoji', emoji: '🎯' },
            { type: 'heading', text: 'The rule to remember', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'When emotions are high, your job is not fairness — it\'s safety.',
                'Perspective can wait.\nConnection cannot.',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF4E6',
              lines: ['You\'ll learn when perspective helps later in the course.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 4 — How to Make It Worse
    // =====================================================================
    {
      id: '4',
      title: 'How to Make It Worse',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A Common Mistake When Someone Is Upset', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Someone is upset about missing a sleepover.\nInstead of acknowledging how it feels, the response sounds like this:',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"You\'ve been to a lot of sleepovers.\nYou and Paige have lived close your whole life.\nMissing just one isn\'t a big deal."',
              ],
            },
            {
              type: 'paragraph',
              text: 'The intention is to help —\nbut this response usually makes things worse.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What the Upset Person Actually Hears', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Instead of feeling understood, the person hears:',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: [
                '"Your feelings are too much"',
                '"You shouldn\'t feel this upset"',
                '"This doesn\'t matter as much as you think it does"',
              ],
            },
            {
              type: 'paragraph',
              text: 'Even if the facts are true,\nthe emotion still feels dismissed.',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'When feelings are minimized, people don\'t calm down —\nthey shut down or push back.',
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
              totalQuestions: 2,
              question: 'When the upset person is told their feelings are "too intense" for the situation, this mistake is called:',
              options: [
                { label: 'Honesty', isCorrect: false },
                { label: 'Minimizing', isCorrect: true },
                { label: 'Candor', isCorrect: false },
                { label: 'Putting things in perspective', isCorrect: false },
              ],
              feedback: 'Correct. Minimizing dismisses the emotional experience, even when the intent is to help.',
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
              totalQuestions: 2,
              question: 'How do you feel when someone says you are "overreacting"?',
              options: [
                { label: 'I feel thankful for the feedback', isCorrect: false },
                { label: 'I feel really smart', isCorrect: false },
                { label: 'It just makes it worse', isCorrect: true },
              ],
              feedback: 'Minimizing doesn\'t reduce emotions — it usually intensifies them. People calm down after they feel understood, not after they are corrected.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 5 — How We Respond to Minimizing
    // =====================================================================
    {
      id: '5',
      title: 'How We Respond to Minimizing',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When facts clash with feelings', size: 'lg' },
            {
              type: 'paragraph',
              text: 'A parent tries to help by explaining why the situation "isn\'t a big deal."',
            },
            {
              type: 'paragraph',
              text: 'From their perspective, it makes sense.\nFrom the child\'s perspective, it feels dismissive.',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: [
                'The parent focuses on how small the problem is.',
                'The child is focused on how big it feels.',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['👉 Both can be true — but only one needs attention right now.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 3,
              question: 'When someone tells you,\n\n"It\'s not that big of a deal"\n\nHow does it usually feel?',
              options: [
                { label: 'I feel understood', isCorrect: false },
                { label: 'I feel calmer immediately', isCorrect: false },
                { label: 'I feel like I need to explain myself more', isCorrect: false },
                { label: 'I feel dismissed or unheard', isCorrect: true },
              ],
              feedback: 'Exactly. When someone minimizes our feelings, it rarely brings comfort — it usually creates distance.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why this makes things worse', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When someone is upset, their goal usually isn\'t to debate facts.',
            },
            { type: 'paragraph', text: 'They want to know:' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"Do you see how this feels to me?"',
                '"Does this matter to you because it matters to me?"',
              ],
            },
            {
              type: 'paragraph',
              text: 'When we argue whether their reaction is reasonable, we unintentionally send this message:',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: ['"Your feelings don\'t make sense."'],
            },
            { type: 'paragraph', text: 'That almost always leads to:' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Defensiveness' },
                { icon: '•', iconKind: 'emoji', title: 'Stronger emotions' },
                { icon: '•', iconKind: 'emoji', title: 'More arguing, not less' },
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
              totalQuestions: 3,
              question: 'This communication mistake is called:',
              options: [
                { label: 'Being honest', isCorrect: false },
                { label: 'Reality checking', isCorrect: false },
                { label: 'Invalidating feelings', isCorrect: true },
                { label: 'Teaching perspective', isCorrect: false },
              ],
              feedback: 'Correct. Invalidating feelings means dismissing someone\'s emotional experience by arguing whether it\'s justified.',
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Feelings don\'t need to be proven', size: 'lg' },
            { type: 'paragraph', text: 'The child isn\'t saying:' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: ['"This is objectively the worst thing ever."'],
            },
            { type: 'paragraph', text: 'They\'re saying:' },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['"This really matters to me."'],
            },
            {
              type: 'paragraph',
              text: 'You don\'t have to agree with the intensity\nto acknowledge the emotion.',
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              label: 'Acknowledging ≠ Agreeing',
              lines: ['It simply means:\n\n"I see you."'],
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Try this instead', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              label: 'Instead of:',
              lines: ['"It\'s not that big of a deal."'],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#E8F5E9',
              label: 'Try:',
              lines: [
                '"I can see why that hurts."',
                '"That really mattered to you."',
                '"Tell me more about what you\'re feeling."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                'Once someone feels understood,\nproblem-solving becomes possible.',
                'Before that — it usually isn\'t.',
              ],
            },
          ],
        },
        // Screen 7
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heading', text: 'Today you learned:', size: 'lg' },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', title: 'Arguing facts doesn\'t calm emotions' },
                { icon: '•', iconKind: 'emoji', title: 'Feelings don\'t need justification to be valid' },
                { icon: '•', iconKind: 'emoji', title: 'Acknowledgment comes before solutions' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'Reflection question:',
              lines: [
                'Can you notice the next time you\'re tempted to explain why someone shouldn\'t feel the way they do?',
              ],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 6 — A Trigger Phrase
    // =====================================================================
    {
      id: '6',
      title: 'A Trigger Phrase',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A common reaction that makes things worse', size: 'lg' },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"I think you\'re overreacting."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"I\'m not overreacting."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"It seems like you\'re having a ten reaction to a two situation."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"Listen…"', emphasis: 'plain' },
              ],
            },
            {
              type: 'footer',
              text: 'This kind of response often happens when someone is upset and the other person is trying to calm things down.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What went wrong here?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Calling someone\'s reaction "too much" doesn\'t calm them down.\nIt tells them:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Their feelings are incorrect' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Their experience isn\'t valid' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'They shouldn\'t feel what they\'re feeling' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['When emotions are dismissed, they usually get stronger, not smaller.'],
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
              question: 'When someone is told they\'re "overreacting," what usually happens?',
              options: [
                { label: 'They calm down quickly', isCorrect: false },
                { label: 'They feel understood', isCorrect: false },
                { label: 'They feel invalidated and become more defensive', isCorrect: true },
                { label: 'They appreciate the honesty', isCorrect: false },
              ],
              feedback: 'Correct. Being told you\'re overreacting rarely calms anyone down — it usually intensifies defensiveness and makes the situation worse.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 7 — Another Hidden Example of Minimizing
    // =====================================================================
    {
      id: '7',
      title: 'Another Hidden Example of Minimizing',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Good intentions, bad outcome', size: 'lg' },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"I think missing the sleepover isn\'t that big of a deal."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"Okay… that doesn\'t help anything."', emphasis: 'plain' },
              ],
            },
            {
              type: 'footer',
              text: 'Even when the words are calm, the message can still hurt.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'When someone shares an upsetting experience with you, and you say "that\'s not such a big deal," how does that usually make the person feel?',
              options: [
                { label: 'They feel calmer and ready to move on', isCorrect: false },
                { label: 'They feel dismissed and hurt', isCorrect: true },
                { label: 'They feel relieved to hear the truth', isCorrect: false },
                { label: 'They feel appreciative of the reality check', isCorrect: false },
              ],
              feedback: 'Right. Minimizing rarely soothes — it makes people feel unheard.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 8 — Others Have It Worse
    // =====================================================================
    {
      id: '8',
      title: 'Others Have It Worse',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Comparisons don\'t comfort', size: 'lg' },
            {
              type: 'paragraph',
              text: 'A teenager tells their mom about being cut from the soccer team.',
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Mom: ', emphasis: 'emphasis' },
                { text: '"Yeah, but at least you have friends on the team. Some kids don\'t have any friends at all."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Teenager: ', emphasis: 'emphasis' },
                { text: '*goes quiet*', emphasis: 'plain' },
              ],
            },
            {
              type: 'footer',
              text: 'The comparison didn\'t help. It made them feel worse.',
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why "others have it worse" hurts', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When someone is hurting and we say "other people have it worse," they often hear:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: '"Your problem isn\'t big enough to complain about"' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: '"You should feel guilty for being upset"' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: '"Stop talking about this"' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Pain doesn\'t shrink because someone else\'s is larger.'],
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
              question: 'When someone is upset and we remind them that "other people have bigger problems," does that typically make them feel better?',
              options: [
                { label: 'Yes, it helps them feel more grateful', isCorrect: false },
                { label: 'No, it makes them feel guilty or dismissed', isCorrect: true },
                { label: 'Yes, it gives them perspective', isCorrect: false },
                { label: 'It depends on the person', isCorrect: false },
              ],
              feedback: 'Correct. Pain isn\'t reduced by comparison — it just makes people feel like they shouldn\'t have felt anything in the first place.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 9 — Common Minimizing Phrases
    // =====================================================================
    {
      id: '9',
      title: 'Common Minimizing Phrases',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When help misses the point', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Sometimes we try to help by moving forward too quickly.\n\nWe offer fixes, alternatives, or "better ideas" —\nwithout first acknowledging how the other person feels.',
            },
            {
              type: 'paragraph',
              text: 'When this happens, the person may feel:',
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF9E6',
              lines: [
                'Unheard',
                'Dismissed',
                'Like their feelings don\'t matter',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Before solutions, people usually want connection.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 10 — Another Common (but Surprising) Way to Hurt Relationships
    // =====================================================================
    {
      id: '10',
      title: 'Another Common (but Surprising) Way to Hurt Relationships',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A well-intentioned fix', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"I know Paige\'s dad.\nWhat if I text him and explain what happened?\nThen she can invite you, and it\'ll be fixed."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF4E6',
              label: 'Response:',
              lines: [
                '"No! That\'s so embarrassing.\nWhat are they going to think?\nI tell you everything."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: ['What just went wrong here?'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 2,
              question: 'Why does this response make things worse?',
              options: [
                { label: 'It solves the problem too quickly', isCorrect: false },
                { label: 'It ignores how embarrassing this feels', isCorrect: false },
                { label: 'It takes control away from the upset person', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Correct. The fix might work, but it skips the emotional need, which is to be heard and validated first.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 2,
              question: 'When someone is upset, offering a "fix" usually makes them feel:',
              options: [
                { label: 'Relieved', isCorrect: false },
                { label: 'Grateful', isCorrect: false },
                { label: 'More understood', isCorrect: false },
                { label: 'Less in control and less understood', isCorrect: true },
              ],
              feedback: 'Right. Fixing skips connection — and connection is what people need first.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 11 — More About "Solving" Too Early
    // =====================================================================
    {
      id: '11',
      title: 'More About "Solving" Too Early',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'The replacement mistake', size: 'lg' },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"What if you invite some friends here instead?\nWe can have a better sleepover at our house."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFF4E6',
              label: 'Response:',
              lines: [
                '"That doesn\'t fix the fact\nthat I wasn\'t invited."',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: ['Why doesn\'t this help?'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 3,
              question: 'Why doesn\'t this solution work?',
              options: [
                { label: 'It ignores the original hurt', isCorrect: false },
                { label: 'It changes the topic instead of addressing it', isCorrect: false },
                { label: 'It replaces the pain instead of acknowledging it', isCorrect: false },
                { label: 'All of the above', isCorrect: true },
              ],
              feedback: 'Correct. The pain isn\'t about missing a sleepover — it\'s about being left out.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 2,
              totalQuestions: 3,
              question: 'What is the actual problem the daughter is expressing?',
              options: [
                { label: 'She wants a sleepover', isCorrect: false },
                { label: 'She wants different friends', isCorrect: false },
                { label: 'She wants a better plan', isCorrect: false },
                { label: 'She feels left out and rejected', isCorrect: true },
              ],
              feedback: 'Exactly. The emotional wound is rejection — not the event itself.',
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 3,
              totalQuestions: 3,
              question: 'What would help most in this moment?',
              options: [
                { label: 'Offering another idea', isCorrect: false },
                { label: 'Explaining why it\'s not a big deal', isCorrect: false },
                { label: 'Reassuring her it\'ll be okay', isCorrect: false },
                { label: 'Acknowledging how painful it feels to be left out', isCorrect: true },
              ],
              feedback: 'Right. Validation first. Solutions later — if needed at all.',
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 12 — Dad's Final Mistakes
    // =====================================================================
    {
      id: '12',
      title: 'Dad\'s Final Mistakes',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 12 of 13',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Dad tries one more way to help', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Dad suggests a fun distraction to make things better.',
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"Okay, daddy-daughter day. We\'ll go out for ice cream."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"Ice cream doesn\'t fix it. I still have to go to school and face the fact that I wasn\'t invited."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"I\'m just trying to help."', emphasis: 'plain' },
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'When helping turns into another mistake', size: 'lg' },
            {
              type: 'paragraph',
              text: 'When Dad couldn\'t fix the problem, he tried to improve her feelings instead.',
            },
            {
              type: 'paragraph',
              text: 'This is a very common instinct—especially with people we love.',
            },
            {
              type: 'paragraph',
              text: 'But trying to make someone feel better before they\'ve processed their emotions often backfires.',
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
              totalQuestions: 3,
              question: 'When you try to make an upset person happy, this is called:',
              options: [
                { label: 'Fixing it', isCorrect: false },
                { label: 'Trying to cheer them up', isCorrect: true },
                { label: 'Finding the bright side', isCorrect: false },
              ],
              feedback: 'Correct. Cheering someone up is a natural instinct, but timing matters.',
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
              totalQuestions: 3,
              question: 'When someone is still upset and another person tries to cheer them up, it often makes the upset person feel:',
              options: [
                { label: 'Thankful', isCorrect: false },
                { label: 'Distracted', isCorrect: false },
                { label: 'Like the listener is uncomfortable with their negative feelings', isCorrect: true },
                { label: 'Cheered up', isCorrect: false },
              ],
              feedback: 'Exactly. It can feel like their pain is too much for the other person to handle.',
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
              totalQuestions: 3,
              question: 'When is it okay to try and cheer someone up?',
              options: [
                { label: 'Never', isCorrect: false },
                { label: 'After you have helped them process their feelings', isCorrect: true },
                { label: 'As soon as possible', isCorrect: false },
              ],
              feedback: 'Right. Timing is everything. Connection first, then solutions or positivity.',
            },
          ],
        },
        // Screen 6
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why "cheering up" doesn\'t work (yet)', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Trying to cheer someone up too early can make them feel like:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Their feelings are inconvenient' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'You want the emotion to go away' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'You\'re uncomfortable sitting with them' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: ['Sometimes the most supportive thing you can do is nothing—but stay present.'],
            },
          ],
        },
      ],
    },
    // =====================================================================
    // Section 13 — So What's the Right Way to Do It?
    // =====================================================================
    {
      id: '13',
      title: 'So What\'s the Right Way to Do It?',
      screens: [
        // Screen 1
        {
          kind: 'content',
          label: 'Section 13 of 13',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Looking on the bright side', size: 'lg' },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"Listen, I know this is a real bummer. But if you look on the bright side, you\'ve had horse lessons, volleyball, homework… and now you have an open night."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"It\'s not fair that I\'m alone!"', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Dad: ', emphasis: 'emphasis' },
                { text: '"You can just relax."', emphasis: 'plain' },
              ],
            },
            {
              type: 'paragraph',
              text: [
                { text: 'Daughter: ', emphasis: 'emphasis' },
                { text: '"I don\'t want to relax. It\'s not fun when I\'m alone."', emphasis: 'plain' },
              ],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          blocks: [
            {
              type: 'quiz',
              questionNumber: 1,
              totalQuestions: 1,
              question: 'What communication mistake is Dad making here?',
              options: [
                { label: 'Listening patiently', isCorrect: false },
                { label: 'Solving the problem', isCorrect: false },
                { label: 'Finding the bright side too soon', isCorrect: true },
                { label: 'Validating her feelings', isCorrect: false },
              ],
              feedback: 'Correct. While gratitude and perspective can help, forcing it too early dismisses the pain.',
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why "look on the bright side" hurts', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Even when it\'s meant kindly, looking for positives too early can feel like:',
            },
            {
              type: 'cardList',
              layout: 'stack',
              cardStyle: 'plain',
              items: [
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Dismissing pain' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Avoiding discomfort' },
                { icon: '•', iconKind: 'emoji', iconColor: '#D97706', title: 'Suggesting someone should feel differently' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'The upset person hears:',
              lines: ['"Your feelings aren\'t acceptable yet."'],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'A quick reflection', size: 'lg' },
            {
              type: 'paragraph',
              text: 'Think about a time when someone told you to:',
            },
            {
              type: 'callout',
              variant: 'summary',
              lines: [
                '"Look on the bright side"',
                '"Be grateful"',
                '"At least it\'s not worse"',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#F9FAFB',
              lines: ['Did it help in that moment—or did it make you feel more alone?'],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Complete',
          blocks: [
            { type: 'heading', text: 'So what should Dad have done?', size: 'lg' },
            {
              type: 'paragraph',
              text: 'You\'ve just seen many ways not to respond when someone is upset.',
            },
            {
              type: 'callout',
              variant: 'summary',
              label: 'In the next lesson, you\'ll learn:',
              lines: [
                'What does help',
                'How to respond without fixing, minimizing, or cheering up',
                'A simple framework for emotional validation',
              ],
            },
            {
              type: 'callout',
              variant: 'insight',
              bg: '#E8F5E9',
              lines: [
                '🎉',
                'You\'ve completed the Communication Mistakes lesson!',
              ],
            },
          ],
        },
      ],
    },
  ],
};
