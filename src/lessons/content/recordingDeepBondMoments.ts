// SPEC-09 — Recording Deep Bond Moments lesson content (data-driven).
//
// FAITHFUL, VERBATIM transcription of the 6 hand-built screen files in
// src/screens/recordingDeepBondMoments/. Text, punctuation, straight quotes,
// emoji, and block order reproduce the existing screens exactly. No redesign,
// no typo fixes — observed issues are logged in docs/spec-09/CONTENT_ERRATA.md.
//
// This is ONE section (id '1'). The final screen (Screen6) is a rich content
// screen, not the sparse sectionComplete shape, so it is transcribed as a
// `content` screen; the generic progress store writes the section key on
// completion of the last screen regardless of kind.
//
// One-off hex colours are carried verbatim so the render is byte-identical:
//   #FFFFFF = Colors.surface, #E8F2F1 = Colors.primaryBg,
//   #4F8F8B = Colors.primary, #6B6B6B = Colors.textTertiary.
// The teal-accented insight boxes (primaryBg fill + primary left accent) are
// mapped as `highlight` callouts carrying bg + accentColor + leftAccent.

import type { Lesson } from '../schema';

export const recordingDeepBondMoments: Lesson = {
  slug: 'recordingDeepBondMoments',
  title: 'Recording Deep Bond Moments',
  storageKey: '@recording_deep_bond_moments_completed_sections',
  sections: [
    {
      id: '1',
      title: 'Recording Deep Bond Moments',
      screens: [
        // Screen 1
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What do old family photos get wrong?', size: 'xl' },
            { type: 'heroEmoji', emoji: '📷', bg: '#FFF9E6' },
            { type: 'paragraph', text: 'This is an early 20th-century family photo.' },
            {
              type: 'paragraph',
              text: [
                { text: 'Most people notice one thing immediately:\n', emphasis: 'plain' },
                { text: 'No one is smiling.', emphasis: 'emphasis' },
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFFFFF',
              accentColor: '#6B6B6B',
              leftAccent: true,
              center: true,
              lines: ['When we see photos like this, we often assume:\n"Maybe they weren\'t happy."'],
            },
            { type: 'paragraph', text: 'But that assumption can be misleading.' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: ['Photos don\'t just capture moments —\nthey shape how we remember our childhood.'],
            },
          ],
        },
        // Screen 2
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why memories need reminders', size: 'xl' },
            { type: 'heroEmoji', emoji: '🧠', bg: '#E3F2FF' },
            {
              type: 'paragraph',
              text: 'Most people forget large parts of their childhood.\nWhat fills in the gaps are photos, videos, and stories.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#FFF9E6',
              label: 'If those reminders mostly show:',
              lines: [
                '• Sad expressions',
                '• Distant group shots',
                '• Activities without emotional connection',
              ],
            },
            {
              type: 'paragraph',
              text: 'Our brain may assume those moments were typical —\neven when they weren\'t.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: ['That\'s why what we record matters as much as that we record.'],
            },
          ],
        },
        // Screen 3
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What are "deep bond moments"?', size: 'xl' },
            { type: 'heroEmoji', emoji: '🤗', bg: '#FFE4ED' },
            {
              type: 'paragraph',
              text: 'Deep bond moments are one-on-one moments of closeness, such as:',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              lines: [
                '• A parent giving a warm hug',
                '• Siblings laughing together',
                '• Quiet affection without posing',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              label: 'These moments are powerful because:',
              lines: [
                '✓ Both people know they were part of the joy',
                '✓ The connection is unmistakable',
                '✓ The emotion feels real — not staged',
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFFFFF',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: [
                [
                  { text: 'Group photos show what we did.\n', emphasis: 'plain' },
                  { text: 'Deep bond moments show who we were to each other.', emphasis: 'emphasis' },
                ],
              ],
            },
          ],
        },
        // Screen 4
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'Why this matters later in life', size: 'xl' },
            {
              type: 'paragraph',
              text: 'When children grow up — especially during difficult years —\nthese reminders become emotional anchors.',
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              label: 'They help:',
              lines: [
                '• Reduce stress during setbacks',
                '• Reinforce identity and belonging',
                '• Heal faster from hurt or rejection',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: [
                'Seeing proof of past closeness reminds them:',
                [{ text: '"I was loved. I mattered. I was safe."', emphasis: 'emphasis' }],
              ],
            },
          ],
        },
        // Screen 5
        {
          kind: 'content',
          cta: 'Next',
          blocks: [
            { type: 'heading', text: 'What if you didn\'t record these moments?', size: 'xl' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              label: 'You can still:',
              lines: [
                '• Tell stories about those moments',
                '• Share memories of closeness',
                '• Reminisce together out loud',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: ['Stories activate the same emotional systems as photos.'],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E3F2FF',
              center: true,
              lines: ['What matters is not perfection —\nit\'s reminding them of the bond.'],
            },
          ],
        },
        // Screen 6 — final screen (writes progress at runtime)
        {
          kind: 'content',
          cta: 'Finish lesson',
          blocks: [
            { type: 'heading', text: 'Your takeaway', size: 'xl' },
            { type: 'paragraph', text: 'Look for moments of real connection:' },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F5E9',
              lines: [
                '✓ Capture them if you can',
                '✓ Tell stories about them if you can\'t',
              ],
            },
            {
              type: 'callout',
              variant: 'highlight',
              bg: '#E8F2F1',
              accentColor: '#4F8F8B',
              leftAccent: true,
              center: true,
              lines: [
                'Photos, videos, and stories all serve the same goal:',
                [{ text: 'reminding your child of the deep bonds they grew up with.', emphasis: 'emphasis' }],
              ],
            },
            {
              type: 'callout',
              variant: 'summary',
              bg: '#FFFFFF',
              center: true,
              lines: ['You\'ll carry this idea into future lessons.'],
            },
          ],
        },
      ],
    },
  ],
};
