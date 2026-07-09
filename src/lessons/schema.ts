// SPEC-09 Phase 1 — the lesson-content schema.
//
// Lessons become DATA: a lesson is sections → screens → blocks. This zod
// schema is the single source of truth for that shape. Content files in
// src/lessons/content/<slug>.ts are validated against it (a Phase-4 Jest test
// zod-parses every content file, so malformed content fails CI).
//
// The block vocabulary here is derived from the empirical survey of Sprinklers
// + Emotional Sandbags — see docs/spec-09/PHASE1_BLOCK_SURVEY.md. It is NOT a
// guess; every block type maps to a visual pattern that exists in the current
// hand-built screens. No new visual design — templates reproduce today's look.
//
// TS types are derived via z.infer (never hand-maintained in parallel).

import { z } from 'zod';

// --- Inline rich text -------------------------------------------------------
// Paragraphs can contain inline emphasis (a coloured/bold span inside a
// sentence, e.g. "...are <highlight>emotionally upset</highlight>."). This is
// NOT a separate block — it's inline formatting. A paragraph is an array of
// spans; a plain string is sugar for a single plain span (see paragraphBlock).
export const TextSpanSchema = z.object({
  text: z.string(),
  // 'plain' = default body text; 'emphasis' = the coloured/bold inline span
  // the current screens render with the `highlight`/`bold` style.
  emphasis: z.enum(['plain', 'emphasis']).default('plain'),
});
export type TextSpan = z.infer<typeof TextSpanSchema>;

// A rich string is either a plain string (common case) or an array of spans
// (when inline emphasis is present).
export const RichTextSchema = z.union([z.string(), z.array(TextSpanSchema)]);
export type RichText = z.infer<typeof RichTextSchema>;

// --- Blocks -----------------------------------------------------------------
// Each block is a discriminated union member keyed on `type`. Optional
// color/bg overrides carry the one-off hex colours a few screens use, so the
// data-driven render is byte-identical to the hand-built look (survey Q4).

const HeadingBlock = z.object({
  type: z.literal('heading'),
  text: z.string(),
  // Observed sizes range 22–28 by emphasis; default matches the common title.
  size: z.enum(['lg', 'xl']).default('xl'),
});

const ParagraphBlock = z.object({
  type: z.literal('paragraph'),
  text: RichTextSchema,
});

// Small uppercase eyebrow line inside the body ("THIS APPLIES WHEN:").
// (Screen-level "SECTION x OF y" uses the screen's `label` field instead.)
const EyebrowBlock = z.object({
  type: z.literal('eyebrow'),
  text: z.string(),
});

// Coloured callout box with a left accent border. One family covers the quote
// box, the summary box, and the NEXT-preview card — they differ only by
// colour + optional label. Survey Q2.
const CalloutBlock = z.object({
  type: z.literal('callout'),
  variant: z.enum(['quote', 'summary', 'preview']).default('summary'),
  // Optional small label above the text (e.g. "NEXT:").
  label: z.string().optional(),
  // One or more lines. Each line is rich text (may carry inline emphasis).
  lines: z.array(RichTextSchema).min(1),
  // Optional one-off colour overrides to reproduce the exact look.
  bg: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
});

// A vertical list of cards: icon OR number + title (+ optional subtitle/color).
const CardListBlock = z.object({
  type: z.literal('cardList'),
  items: z
    .array(
      z.object({
        // Ionicons glyph name; validated as a string here (the render maps it
        // to the icon). Either an icon or a number is shown in the leading slot.
        icon: z.string().optional(),
        number: z.number().optional(),
        title: z.string(),
        subtitle: z.string().optional(),
        // One-off card background colour (e.g. the coloured phase cards).
        color: z.string().optional(),
      }),
    )
    .min(1),
});

// The "⏱️ ~3–4 minutes" pill. Rare (2 occurrences) but modelled to avoid
// special-casing the intro screen.
const PillBlock = z.object({
  type: z.literal('pill'),
  text: z.string(),
});

// Maps 1:1 to the existing QuizQuestion component — no new UI.
const QuizBlock = z.object({
  type: z.literal('quiz'),
  questionNumber: z.number(),
  totalQuestions: z.number(),
  question: z.string(),
  options: z
    .array(z.object({ label: z.string(), isCorrect: z.boolean() }))
    .min(2),
  feedback: z.string(),
});

export const BlockSchema = z.discriminatedUnion('type', [
  HeadingBlock,
  ParagraphBlock,
  EyebrowBlock,
  CalloutBlock,
  CardListBlock,
  PillBlock,
  QuizBlock,
]);
export type Block = z.infer<typeof BlockSchema>;

// --- Screens ----------------------------------------------------------------
// Two screen kinds cover every screen in the survey.

// A normal content screen: an ordered list of blocks, advanced by the Next
// button (or by the quiz block on a correct answer).
const ContentScreen = z.object({
  kind: z.literal('content'),
  // Optional screen-level uppercase label shown in the LessonContainer chrome
  // (e.g. "SECTION 2 OF 5"). Survey Q1.
  label: z.string().optional(),
  // The Next/CTA button title. Screens vary it ("Start", "Continue",
  // "This surprised me →"). Quiz-only screens omit it (the quiz advances).
  cta: z.string().optional(),
  blocks: z.array(BlockSchema).min(1),
});

// The final screen of a section: the completion card + NEXT preview. Its
// "Continue" writes the section's progress key and returns to the hub. This is
// the ONLY screen kind that touches progress storage.
const SectionCompleteScreen = z.object({
  kind: z.literal('sectionComplete'),
  title: z.string(),
  text: z.string(),
  cta: z.string().default('Continue'),
  // Optional "NEXT:" preview of the following section.
  nextPreview: z.string().optional(),
});

export const ScreenSchema = z.discriminatedUnion('kind', [
  ContentScreen,
  SectionCompleteScreen,
]);
export type LessonScreen = z.infer<typeof ScreenSchema>;

// --- Sections & Lesson ------------------------------------------------------

export const SectionSchema = z.object({
  // Section id as a STRING — must match the value the lesson currently stores
  // in its completed-sections AsyncStorage array (e.g. '1'..'5'). Progress is
  // byte-compatible; existing users' progress must survive.
  id: z.string(),
  title: z.string(),
  screens: z.array(ScreenSchema).min(1),
});
export type LessonSection = z.infer<typeof SectionSchema>;

export const LessonSchema = z.object({
  // Stable lesson slug (e.g. 'sprinklers'). Used for the content filename and
  // the generic route's lessonId param (typed via SPEC-08).
  slug: z.string(),
  title: z.string(),
  // The exact AsyncStorage key this lesson uses for its completed-sections
  // array TODAY (from src/constants/storageKeys.ts). Carried as data so the
  // generic progress store writes the identical key/format — no data
  // migration, existing progress survives (SPEC-09 constraint).
  storageKey: z.string(),
  sections: z.array(SectionSchema).min(1),
});
export type Lesson = z.infer<typeof LessonSchema>;

/**
 * Parse + validate a lesson content object against the schema. Throws (with a
 * zod error) on malformed content — the Phase-4 CI test calls this on every
 * file in src/lessons/content/ so broken content fails the build.
 */
export function parseLesson(data: unknown): Lesson {
  return LessonSchema.parse(data);
}
