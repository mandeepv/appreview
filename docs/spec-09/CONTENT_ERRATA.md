# Content errata — Sprinklers transcription

Issues found during the faithful transcription of the hand-built Sprinklers
screens into `src/lessons/content/sprinklers.ts`. Text was copied VERBATIM
(errors preserved); each observed problem is logged here rather than silently
fixed.

- sprinklers §5 screen1–6: `totalSteps={7}` is declared in every Section 5 screen, but the section only has 6 screens (SprinklersSec5Screen1..6, with `currentStep` running 1→6) — the progress denominator overshoots the real screen count by one.
- recordingDeepBondMoments §1 screen1–6: all quotation marks and apostrophes are straight ASCII (`"..."`, `weren't`, `don't`, `it's`, `you'll`, `can't`) rather than the curly typographic quotes (`"…"`, `'`) used across the other converted lessons — inconsistent typography. Transcribed verbatim as-is.

# Content errata — Emotional Sandbags transcription

Issues found during the faithful transcription of the hand-built Emotional
Sandbags screens into `src/lessons/content/emotionalSandbags.ts`. Text was
copied VERBATIM (errors preserved); each observed problem is logged here rather
than silently fixed.

- emotionalSandbags §3–§6 (all screens): quotation marks and apostrophes are straight ASCII (`"..."`, `isn't`, `it's`, `you're`, `wasn't`, `can't`, `Let's`, `you've`, `didn't`) rather than the curly typographic quotes (`"…"`, `'`) used in §1–§2 of the same lesson and in the other converted lessons — inconsistent typography within the lesson. Transcribed verbatim as-is.
- emotionalSandbags §5 screen6: the emotion-category labels embed literal emoji glyphs in the header text (`❌ DON'T USE (Too Broad)`, `🔵 UPSET EMOTIONS`, `🔴 ANGRY EMOTIONS`, `🟢 STRESSED / LOW-ENERGY`, `🟣 CONFUSION / SOCIAL PAIN`, `🟡 HAPPY EMOTIONS (for contrast later)`) — kept verbatim in the callout labels.
- emotionalSandbags §2 screen3: the original screen defines unused label-position styles (`label1/label2/label3`) and ends with a stray comment `// Re-adjusting labels in the code snippet for clarity`; the three floating labels (`STRESS`, `ANGER`, `OVERWHELM`) are absolutely-positioned decorations layered over the 🎒 emoji circle and carry no body text — the hero emoji is transcribed but the decorative overlay labels are not reproducible as data blocks.
- emotionalSandbags §1 screen3 / §2 screen4 / §5 screen8 & others: several screens open with a decorative Ionicon inside a coloured circle (e.g. `bulb-outline`, `people-outline`) rather than an emoji. The schema's `heroEmoji` block carries an emoji, not an Ionicon, so these purely-decorative Ionicon hero circles are omitted (no text is lost).
- emotionalSandbags §4 screen2–5: these are interactive accordions (one of four steps expanded, the rest collapsed as tappable previews). Transcribed as a static step-list `cardList` plus the expanded step's content blocks; the collapse/expand interaction is not reproducible in the data model.

# Content errata — Helping Someone Process Emotions transcription

Issues found during the faithful transcription of the hand-built Helping Someone
Process Emotions screens into `src/lessons/content/helpingProcessEmotions.ts`.
Text was copied VERBATIM (errors preserved); each observed problem is logged here
rather than silently fixed.

- helpingProcessEmotions §1–§2 (all screens): quotation marks and apostrophes are straight ASCII (`aren't`, `They're`, `you'll`, `Let's`, `That's`, `She's`, `don't`, `it's`, `Everyone's`, `I'm`, `you're`, `there's`, `didn't`, `wasn't`, `you can't`, `"fix it"`, `"perfect"`) rather than the curly typographic quotes (`"…"`, `'`) used across the other converted lessons — inconsistent typography. Transcribed verbatim as-is.
- dissociation §1–§4 (all screens): quotation marks and apostrophes are straight ASCII (`"..."`, `don't`, `can't`, `I've`, `isn't`, `there's`, `Let's`, `you're`, `child's`, `doesn't`, `you'll`, `I'm`, `I'll`, `That's`, `it's`, `dissociation's`) rather than the curly typographic quotes (`"…"`, `'`) used across the other converted lessons — inconsistent typography. Transcribed verbatim as-is.
- dissociation §1 screen4: the original screen is a multi-part comparison layout — a scenario card ("Imagine this:" + setup + a quote box), a divider, two coloured option cards (Option A — No dissociation, green `#E8F5E9`; Option B — Dissociation, orange `#FFF4E6`), then a Key-insight box. There is no comparison/two-column or nested quote-in-card block in the schema, so each region is transcribed as a separate `callout` (scenario summary, the quote as its own summary callout with the quote repeated as label+line, the two option cards as coloured summary callouts with the option name as `label`, and the key insight). The nested visual hierarchy and column styling are not reproduced; all text is preserved verbatim.
- dissociation §4 screen1: the three "Today we learned" bullets embed a hard line break (`\n`) inside the first bullet's text; kept verbatim inside the single `cardList` item title (the schema has no per-item multi-line/subtitle rendering for bullets).
- helpingProcessEmotions §2 screen1: the original screen is a Dad/Daughter dialogue card (`dialogueCard` with bold `speaker:` labels above italic `dialogue` lines) — there is no dialogue block in the schema, and the `cardList` block renders only an item title (subtitle is dropped). To preserve ALL dialogue text verbatim, each exchange is transcribed as a `paragraph` with the speaker name as an inline `emphasis` span followed by the plain dialogue text; the closing `helperBox` ("Notice what Dad isn't doing.") is transcribed as the italic `footer`. The two-column card styling is not reproduced.
