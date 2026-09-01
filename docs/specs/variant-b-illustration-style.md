# Variant B — Illustration Style Guide + Generation Prompts

Status: **active build spec** (2026-07-24). Owner-generated art drops into
`assets/onboarding/`; the redesign wires each slot. Delete/park once every slot
below has a real (non-placeholder) asset committed.

## Why this exists

Two facts:
1. There IS a real illustration library — the **`_illo.jpg` set** (11 distinct
   images: `tantrums_illo`, `fighting_illo`, `quality_time_illo`,
   `relationship_illo`, `behavior_issues_illo`, `character_traits_illo`,
   `parenting_skills_illo`, etc.) that variant A uses. Variant B now reuses these
   where a concept matches (see the wiring in `variantBContent.ts`).
2. But there are ALSO placeholder dupes — the bare-name `.png` twins
   (`tantrums.png`, `mother_illustration.png`, `quality_time.png`, etc.) all share
   md5 `7143bd42…` and are NOT real art. Do not wire those.

The remaining problem this guide solves: the real art spans **two styles** — flat
teal+peach fills (`father`, `guardian`, `relationship_illo`, `character_traits`)
vs. outlined terracotta/grey symbol-icons (`tantrums_illo`, `quality_time_illo`).
The plan is **reuse the `_illo.jpg` art now, regenerate to ONE canon later** so the
whole app shares a style. This guide is the canon + prompts for that unification.

## The canon style (derived from `father_illustration.png` + `guardian_illustration.png`)

These two are the strongest, most premium assets and are exactly on-brand. Everything
else is regenerated to match them.

**Style DNA — put this block at the TOP of every prompt:**

> Flat vector illustration, two-tone minimalist. A single subject rendered as clean
> negative-space silhouettes in exactly two fills: deep sage teal (#4F8F8B) and warm
> peach (#F4C7A1), on a soft warm-cream background (#FAF7F2). No outlines, no strokes,
> no gradients, no texture, no shadows. Smooth confident curves, generous rounded
> shapes, calm and warm mood. Lots of empty background space around the subject.
> Editorial, modern, premium wellness-app aesthetic. Centered composition. No text,
> no letters, no numbers, no UI, no border.

**Locked constraints (every asset):**
- Palette: teal `#4F8F8B` + peach `#F4C7A1` on cream `#FAF7F2`. Nothing else. (A tiny
  accent of `#6BA8A4` lighter teal is OK for depth; no new hues.)
- **Flat, no outlines.** The `emotional_anxious` storm-brain (outlined, busy) is the
  anti-example — do not reproduce that look.
- Square `1024×1024`, subject centered, ample cream margin (so it crops cleanly into
  cards AND large hero placement).
- Export PNG, transparent OR cream background (cream preferred — matches app bg).
- One subject per image. No scenes, no backgrounds-with-props.

## File-naming contract (so wiring is mechanical)

Overwrite the placeholder names in place where they exist; add new ones as listed.
Keep the exact filenames below — the code references these paths.

---

## SLOT LIST + PROMPTS

### A. Challenge options (`CHALLENGE_OPTIONS`) — 8 slots

Each is a small illustrated card. Subject should read at ~120px.

| key | file (overwrite/new) | prompt subject (append to Style DNA) |
|---|---|---|
| tantrums | `ill_tantrums.png` | a small child mid-tantrum, arms up, one big rounded teal figure with a peach face-blush; simple, not scary |
| listening | `ill_listening.png` | a parent kneeling to a child's eye level, two teal-and-peach figures leaning toward each other |
| screens | `ill_screens.png` | a child holding a tablet, soft peach glow from the screen, teal figure |
| sleep | `ill_sleep.png` | a crescent moon and a small sleeping child curled under a peach blanket |
| defiance | `ill_defiance.png` | a small child with arms crossed and chin up, standing firm, teal figure with peach detail |
| anxiety | `ill_anxiety.png` | a child hugging their knees with a soft peach worry-cloud above, calm not distressing |
| siblings | `ill_siblings.png` | two children back-to-back, one teal one peach, a gentle spark between them |
| bond | `ill_bond.png` | a parent and child reaching toward each other, hands almost touching, warm |

### B. Mood options (`MOOD_OPTIONS`) — 5 slots

You ALREADY have strong on-canon-ish objects for these (candle, sunrise). Regenerate
the 3 weak ones to the flat two-tone look; keep `emotional_okay` (sunrise) and
`emotional_burned_out` (candle) if you like them, or regen for perfect consistency.

| key | file | prompt subject |
|---|---|---|
| calm | `mood_calm.png` | a calm sunrise over gentle hills, cream sun, teal hills (matches existing sunrise) |
| manageable | `mood_manageable.png` | a single leaf floating on calm teal water ripples |
| stretched | `mood_stretched.png` | a taut peach rubber band about to stretch, minimal |
| chaotic | `mood_chaotic.png` | three small objects juggled mid-air in a loose arc, teal + peach |
| overwhelmed | `mood_overwhelmed.png` | a small teal figure under a large soft peach wave, calm not alarming (replace the swirl) |

### C. Goal options (`GOAL_OPTIONS`) — 6 slots

| key | file | prompt subject |
|---|---|---|
| calm_mornings | `goal_calm_mornings.png` | a steaming mug beside a small sunrise, cream + teal |
| fewer_meltdowns | `goal_fewer_meltdowns.png` | a single dove / peace bird mid-flight, teal with peach wing |
| closer_bond | `goal_closer_bond.png` | a parent and child in a gentle hug, two-tone silhouette |
| more_patience | `goal_more_patience.png` | a figure seated cross-legged, breathing, calm posture |
| confidence | `goal_confidence.png` | a figure standing tall on a small hill, peach sun behind |
| consistency | `goal_consistency.png` | two adult figures side by side facing the same way, aligned |

### D. Story-beat heroes — large illustrations (already partly real)

| screen | file | keep or prompt |
|---|---|---|
| VBWelcome | `hero_welcome.png` | NEW (mother_illustration is a placeholder dupe!) — a parent holding a child up, like `father_illustration` but different pose |
| VBMirror | `emotional_burned_out.png` | KEEP (candle is on-canon) |
| VBBenefit | `emotional_okay.png` | KEEP (sunrise is on-canon) |
| VBHowItWorks | `hero_science.png` | NEW — a simple teal head-profile with a small peach growth-sprout inside, calm (replace clip-arty brain-science placeholder) |
| VBRole (mother) | `mother_illustration.png` | REGEN — currently the placeholder dupe; a parent+child in the `guardian` two-tone style |
| VBRole (father) | `father_illustration.png` | KEEP |
| VBRole (guardian) | `guardian_illustration.png` | KEEP |

---

## Handoff

Generate at `1024×1024`, drop into `assets/onboarding/` with the exact filenames.
Ping me per batch (or all at once) and I wire them. Until an asset lands, its slot
renders a graceful fallback (tinted card, no broken image) — see the redesign PR.
