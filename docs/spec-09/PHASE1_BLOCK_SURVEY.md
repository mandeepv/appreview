> **SNAPSHOT — frozen as of 2026-07-10. Do not follow as current process; see docs/README.md for the live docs.**

# SPEC-09 Phase 1 — Block-vocabulary survey

**Deliverable for CHECKPOINT A.** The block vocabulary below was derived
EMPIRICALLY by surveying two structurally-different lessons — **Sprinklers**
(52 screens) and **Emotional Sandbags** (47 screens), 99 screen files total —
not invented. Method: read a representative spread of screens + a programmatic
scan of every file for component usage and recurring style-key vocabulary.

Nothing has been converted or deleted. This survey + the zod schema
(`src/lessons/schema.ts`) are what CHECKPOINT A reviews before mass conversion.

---

## What the survey found (raw signal, both lessons)

| Signal | Files (of 99) | Meaning |
|---|---|---|
| `LessonContainer` | 99 | Universal shell (progress bar, back arrow, optional label). Every screen. |
| gradient `Button` | 90 | The Next / Continue / CTA button. The 9 without it are quiz-only screens (the quiz component owns its own advance). |
| `QuizQuestion` component | 9 | The quiz block — already a reusable component with its own API. |
| `Ionicons` | 50 | Icons inside cards / list rows. |
| `<Image>` / `require(png\|jpg)` | 0 | **No image blocks** in these two lessons. |
| `TextInput` | 0 | **No free-text input** blocks. |
| `AsyncStorage` | 5 | Only the section-final screens write progress (the "section complete" screens). |
| `.map()` (list rendering) | 31 | Card-list / icon-list blocks. |

Recurring style-key vocabulary (occurrence counts across both lessons):
`option` 197 · `body` 104 · `headline` 100 · `quote` 48 · `highlight` 32 ·
`footerText` 12 · `card` 12 · `bodyContainer` 12 · `subheadline` 8 · `quiz` 8 ·
`optionCard` 4 · `previewCard`/`phaseCard`/`completionCard`/`timeContainer` 2 each.

---

## Proposed block vocabulary (pattern → count → block type)

A **screen** is an ordered list of **blocks**. The block types below cover
every visual pattern observed in the two survey lessons.

| # | Visual pattern (from real screens) | Seen in | Proposed block type | Notes |
|---|---|---|---|---|
| 1 | Centered headline text (the big title on a screen) | ~all | `heading` | fontSize varies 22–28 by emphasis; captured as an optional `size` field. |
| 2 | Centered body paragraph(s), medium grey, with optional **inline emphasis** (a coloured/bold span inside the sentence) | ~all | `paragraph` | Inline emphasis (`highlight`, `bold`) is NOT a separate block — it's inline rich-text inside a paragraph. Modelled as an array of text spans (plain vs emphasized). |
| 3 | Small uppercase eyebrow label ("SECTION 2 OF 5", "THIS APPLIES WHEN:") | several | `eyebrow` | Short uppercase accent line. (Screen-level "SECTION x OF y" also maps to `LessonContainer`'s `label` prop — see Open Q1.) |
| 4 | A coloured callout box with a left accent border and 1–2 lines (summary / "quote" / preview) | quote 48, previewCard/summaryBox several | `callout` | One family covers the quote box, the summary box, and the NEXT-preview card — all are "coloured box + optional label + text", differing only by colour/label. `variant` field: `quote` \| `summary` \| `preview`. |
| 5 | A vertical list of cards, each: icon (or number) + title (+ optional colour) | .map() 31, phaseCard/listItem | `cardList` | Each item: `{ icon?, number?, title, subtitle?, color? }`. Covers the "3 phases" cards and the icon-row lists. |
| 6 | A "time to complete" pill ("⏱️ ~3–4 minutes") | timeContainer 2 | Folded into `heading`/intro as an optional `timePill` field on the screen, OR a tiny `pill` block | Rare (2). Proposing a small `pill` block to avoid special-casing. |
| 7 | Multiple-choice question with feedback + retry | 9 | `quiz` | Maps 1:1 to the EXISTING `QuizQuestion` component (question, options[{label,isCorrect}], feedback, questionNumber, totalQuestions). No new UI. |
| 8 | Section-complete screen: big checkmark card + "complete" title/text + NEXT-preview card | 5 (the AsyncStorage writers) | `sectionComplete` | This is a screen-level *kind*, not just a block — it's the screen that writes progress and returns to the hub. Modelled as `screen.kind: 'sectionComplete'` carrying a completion title/text + preview. See schema. |

### Screen "kinds"
Two screen kinds cover everything:
- **`content`** — an ordered list of the blocks above (heading/paragraph/eyebrow/callout/cardList/pill/quiz), advanced by the Next button (or by the quiz on correct answer).
- **`sectionComplete`** — the final screen of a section: renders the completion card + preview, and its "Continue" writes the section's progress key and returns to the hub.

---

## Open questions for CHECKPOINT A (owner)

1. **`eyebrow` vs `LessonContainer.label`.** Screen-level "SECTION 2 OF 5"
   currently uses `LessonContainer`'s `label` prop; some screens also have an
   in-body uppercase eyebrow ("THIS APPLIES WHEN:"). Proposal: keep the
   screen-level section label on `LessonContainer` (a screen field), and use
   the `eyebrow` block only for in-body labels. OK?
2. **`callout` unification.** I'm collapsing quote-box / summary-box /
   NEXT-preview-card into one `callout` block with a `variant`, since they're
   visually the same family (coloured box + left accent + text). If you'd
   rather keep them as distinct block types for clarity, say so.
3. **`pill` (time-to-complete).** Only 2 occurrences. Fine as its own tiny
   block, or fold into the intro screen as an optional field? (Proposing a
   `pill` block.)
4. **Colours.** A few blocks use one-off hex colours (`#FFE4ED` quote bg,
   `#C2185B` quote text, `#F5F9FF` summary bg). To reproduce the look exactly,
   the schema allows an optional per-block `color`/`bg` override; the default
   comes from `theme.ts`. Confirm you're OK carrying these one-off colours as
   data (needed for byte-identical look) rather than normalizing them.

**No content is ported and nothing is deleted until you sign off on this table
+ the schema.**

---

## CHECKPOINT A — resolutions (owner delegated the calls, 2026-07-09)

The owner reviewed and delegated the 4 open questions ("use your discretion").
Resolutions, each chosen to serve the byte-identical-look / progress-survives
constraints:

1. **eyebrow vs label** → **Keep both.** Screen-level "SECTION x OF y" stays on
   `LessonContainer.label` (chrome); in-body uppercase labels use the `eyebrow`
   block. They render differently in the real screens.
2. **callout unification** → **Unified with a `variant`** (quote/summary/preview)
   + optional colour overrides. Same visual family; less duplication.
3. **pill** → **Kept as its own block.** Trivial; avoids special-casing the intro.
4. **one-off colours** → **Carried as optional per-block data.** Required for the
   byte-identical-look acceptance criterion; normalizing to theme tokens would
   visibly change screens.

The schema (`src/lessons/schema.ts`) already implements all four — no change
needed. **Checkpoint A closed; proceeding to Phase 2 (Sprinklers pilot).**
