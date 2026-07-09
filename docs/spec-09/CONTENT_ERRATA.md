# Content errata — Sprinklers transcription

Issues found during the faithful transcription of the hand-built Sprinklers
screens into `src/lessons/content/sprinklers.ts`. Text was copied VERBATIM
(errors preserved); each observed problem is logged here rather than silently
fixed.

- sprinklers §5 screen1–6: `totalSteps={7}` is declared in every Section 5 screen, but the section only has 6 screens (SprinklersSec5Screen1..6, with `currentStep` running 1→6) — the progress denominator overshoots the real screen count by one.
