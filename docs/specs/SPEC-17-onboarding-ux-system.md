# SPEC-17 — Onboarding UX system: one consistent, best-practice question flow

Target version: v1.4.0 (second half; SPEC-16 is the first half — the two together are the 1.4.0
checkpoint) · Order: third spec in the train · Size: ~2–3 days
Depends on: SPEC-16 merged to `develop`. Experiment interaction: if the SPEC-15 A/B experiment is
actively ramped (`variant_b > 0%`), this spec's merge must be scheduled *between* test runs — never
change onboarding visuals mid-experiment. Because both arms share the components changed here, the
lift applies to both arms equally, but the mid-run discontinuity still poisons the read. Check the
flag state before merging (DECISION 1).

---

## 0. Goal

The onboarding question screens are inconsistent — differing option layouts, Continue-button
behaviors, spacing, and transitions, built screen-by-screen. Define **one** best-practice UX system
(interaction rules, layout grammar, motion, aesthetics) and apply it across **all** onboarding
question screens — variant A's ~11 question screens and variant B's scaffold screens alike.

Owner-decided interaction rules — bake in, do not re-litigate:

- **Single-select questions auto-advance on tap** (no Continue button).
- **Multi-select questions reveal a Continue button once the selection is valid (≥1 item)**, rather
  than showing a permanently disabled button.

---

## 1. Current inconsistencies (grounded)

- `UserTypeScreen`: bespoke square-card grid + horizontal card, checkmark badge, disabled
  `"Continue →"` button (arrow in label — unique to this screen).
- `ImprovementGoalsScreen`: `SelectableCard` list, its own scroll-hint animation, selection-count
  pill, disabled `"Continue"`.
- `OnboardingContainer`: `totalSteps` defaults to **20** while screens pass `currentStep` 1…~13 —
  the progress bar never approaches completion; several screens hand-roll their own headers/spacing
  on top of it.
- Mixed hardcoded hex values (`#111827`, `#4B5563`, `#FFFFFF` in `OnboardingContainer`) vs
  `theme.ts` tokens; inconsistent title alignment (`centerTitle` sometimes); inconsistent
  bottom-section padding; some screens ScrollView-in-ScrollView.
- Transitions are uniform (`slide_from_right` stack default) — keep that; the inconsistency is
  within screens, not between them.

## 2. Ground rules (self-contained)

- Node 20 (`nvm use 20`). PR gate: `npx tsc --noEmit` clean · `npx eslint .` zero new warnings
  (baseline ~200) · `npm test` green · CI green · adversarial review clean.
- `main` FROZEN (v1.2.0 RC). Branch `spec-17-onboarding-ux-system` from `develop`; PR into
  `develop`.
- Analytics only via `safeCapture` / typed helpers; keep every existing
  `trackOnboardingStepCompleted(step, answer)` call firing with the **same step names and answer
  shapes** — the A/B funnel (SPEC-15) depends on them. No PII.
- Storage keys only via `storageKeys.ts`; the `OnboardingContainer` `screenName` persistence
  (auto-save on blur → `ONBOARDING_LAST_SCREEN`) must keep working on every screen —
  resume-mid-onboarding is shipped behavior.
- Do not touch: `LoadingScreen.tsx` gate logic, `AuthScreen` auth flows, `routingPolicy.ts`,
  `eas.json`, `legal/`, dashboards, prod DB. `grep -rn "replace('Root')" src/` must still hit only
  LoadingScreen.
- Narrative why-comments: house style — preserve/update. Commits conventional
  (`feat(onboarding-ux): ...`), ideally one commit per migrated screen after the system commits.

## 3. Work items (in-code)

### R1 — The system, as code: `src/components/onboarding/`

Build the grammar once; screens become thin declarations.

1. **`QuestionScreen` layout shell** (evolves or wraps `OnboardingContainer` — keep its `screenName`
   auto-save and back-button seam):
   - Fixed vertical grammar: header (back + progress) → title → optional subtitle → option area
     (scrolls internally when needed) → footer slot (Continue, only for multi-select). Spacing
     exclusively from `theme.ts` `Spacing` tokens; colors exclusively from `Colors` (replace the
     hardcoded hex values); type from `Typography` scale. Title left-aligned everywhere (pick one;
     centered dies) — one rule, no per-screen `centerTitle` flag.
   - Accurate progress: each flow declares its step list once (an ordered array per variant — A's
     ~11 question screens; B's 3 scaffold screens); `currentStep`/`totalSteps` derive from position
     in that array. Kill the `totalSteps = 20` default. Adding/removing a screen updates the bar
     automatically.

2. **`OptionList` interaction component**, two modes:
   - `mode="single"`: renders option cards; on tap → selected visual state + light haptic
     (`expo-haptics`, already a dependency) → auto-advance after ~250ms (long enough to register the
     selection state, short enough to feel instant). Answer is written to the store before
     navigation. No Continue button rendered at all. Rapid double-taps must not double-navigate
     (guard ref).
   - `mode="multi"`: tap toggles; Continue reveals (fade/slide-up into the footer slot) when the
     selection becomes valid, hides when it becomes invalid — never a visible-but-disabled button.
     Keep the selection-count pill as a system element (it's good), standardized.
   - One option-card visual family (consolidate `SelectableCard` + `UserTypeScreen`'s bespoke
     cards): base card, `illustration` variant (image cards like UserType/ImprovementGoals),
     `compact` variant (text-only rows). Selected state = one rule (border + tint + check badge)
     everywhere.
   - Reduce Motion: reveal/advance animations degrade to opacity/no-delay.

3. **Motion spec**: screen-to-screen stays the stack's `slide_from_right`; within-screen only the
   Continue reveal, selection state (~150ms), and staggered option entrance (subtle, ≤300ms total,
   skippable via Reduce Motion). No parallax, no springs on layout-affecting properties.

4. **Non-question screens** (`NameAge` free-input, `ChildrenCount` counter, `Educational` info page,
   `PartnerInvolvement` if it has an invite action) adopt the same shell/spacing/footer grammar;
   free-input screens keep an explicit Continue (auto-advance is for single-select only).

### R2 — Migrate every onboarding screen to the system

> **NOTE 2026-07-19 (superseded, not rewritten):** `ChildrenGender`, `ChildrenAge`,
> `GoalSelection`, and `ParentingStyles` were **deleted** during the v1.3.0 work — they had
> been off the active flow since before v1.1.0. The list below is the historical R2 scope;
> the current live flow is UserType → NameAge → ChildrenCount → ImprovementGoals →
> Educational → PartnerInvolvement → ExperienceLevel → EmotionalChallenges (see
> `src/components/onboarding/flows.ts` and BACKLOG). Snapshot kept as-is per CLAUDE.md.

`UserType`, `NameAge`, `ChildrenCount`, `ChildrenGender`, `ChildrenAge`, `ImprovementGoals`,
`Educational`, `PartnerInvolvement`, `GoalSelection`, `ExperienceLevel`, `ParentingStyles`,
`EmotionalChallenges` + variant B's `VariantBQ1–Q3` (from SPEC-15). Per screen: same question, same
answer values written to `onboardingStore`, same analytics call, same `screenName` — only the
presentation/interaction migrates. Single-select screens lose their Continue button (auto-advance);
multi-select screens get the reveal. One commit per screen keeps review sane. Delete per-screen style
duplication as it migrates; `WelcomeScreen` / `AuthScreen` get token/spacing alignment only (no
interaction change — auth is not a question screen).

### R3 — Tests

- `OptionList` logic: single-select fires `onAdvance` once (double-tap guarded) with the tapped
  value; multi-select validity → Continue visibility transitions; answers written before advance.
- Step-count derivation: each flow's declared array yields monotonically increasing `currentStep`
  and correct `totalSteps`; every registered question screen appears in exactly one flow array.
- Regression: onboarding store round-trip untouched; existing suites green; every screen still calls
  `trackOnboardingStepCompleted` with its historical step name (assert via a table test if cheap).

## 4. Out-of-repo actions

Steps that cannot be done from this codebase — external systems only. Each gets a pending entry in
`docs/OPS_STATE.md` in this PR, ticked with a date when performed.

1. **PostHog — experiment annotation** *(must happen at ship, or any A/B readout that spans the
   release is silently contaminated)*: add a project annotation in the prod PostHog project on the
   day v1.4.0 rolls out — "Onboarding UX system shipped (SPEC-17); both arms affected" — so
   experiment readouts can segment before/after. Funnel step semantics are unchanged (same
   event/step names), but drop-off *levels* will move.
2. **PostHog — flag state check before merge** *(gates the merge itself)*: verify the
   `onboarding-flow` flag's ramp state; if `variant_b > 0%` and a test run is in progress, hold the
   merge or explicitly accept restarting the experiment clock (DECISION 1).
3. **Supabase (dev + prod)**: nothing — no migrations, no type regeneration, no edge-function
   changes.
4. **Sentry**: nothing.
5. **Superwall**: nothing.
6. **App Store Connect**: nothing spec-specific; v1.4.0 release actions live in the runbook.

## 5. Device-test checklist — append to `docs/releases/v1.4.0.md`

(The file was created by SPEC-16; append this block to its release-specific section.)

- [ ] Walk full variant-A onboarding on device: consistent spacing/type/cards on every screen;
  progress bar starts near 0 and reaches the end at the last question.
- [ ] Single-select screens: tap → selected state + haptic → auto-advance; no Continue button
  anywhere on them; rapid double-tap advances exactly one screen.
- [ ] Multi-select screens: Continue absent until a selection; appears with the reveal animation;
  disappears if selection cleared.
- [ ] Kill app mid-flow → resumes at the correct screen with saved answers.
- [ ] Variant B scaffold screens render in the same system (force the flag).
- [ ] Reduce Motion: no entrance/reveal motion, flow fully usable.
- [ ] Answers land in `user_profiles` unchanged (spot-check one signup end-to-end, dev Supabase).
- [ ] Standard paywall/lesson regression (sandbox Apple ID): signup → theater → paywall → purchase →
  Root; one lesson opens and saves progress.

## 6. Version boundary — v1.4.0 closes here

After this PR merges to `develop` (with SPEC-16 already in):

1. `./scripts/bump-version.sh 1.4.0 <build>` — next monotonic bare integer (check `app.json` on
   `main` AND the 1.3.0 boundary commit on `develop`; if 1.2.0 used 11 and 1.3.0 used 12, this is
   13). Commit to `develop`.
2. Tag `rc/1.4.0`, push. The 1.4.0 release builds from this tag later, only after 1.3.0 is live and
   healthy (strict version order — 1.4.0's code contains 1.3.0's).
3. Copy this spec into `docs/specs/SPEC-17-onboarding-ux-system.md`.

## 7. Acceptance criteria

- [ ] One question-screen system (`QuestionScreen` shell + `OptionList`) exists; option cards are
  one visual family; all spacing/colors/type from theme tokens (zero hardcoded hex in onboarding
  screens/components).
- [ ] All variant-A question screens + variant-B scaffold migrated; single-select auto-advances (no
  Continue), multi-select reveals Continue on validity.
- [ ] Progress bar derives from declared per-flow step arrays; `totalSteps=20` default gone.
- [ ] Zero data-shape changes: store fields, saved payload, analytics step names/answers,
  `screenName` persistence, resume behavior all identical (diff-reviewed).
- [ ] Reduce Motion supported; haptics on selection; double-advance guarded.
- [ ] Tests in §R3 green; `tsc`/lint (no new)/jest/CI green; adversarial review clean.
- [ ] §4 entries added to `docs/OPS_STATE.md`; `docs/releases/v1.4.0.md` appended; spec copied to
  `docs/specs/`; version bumped to 1.4.0 + `rc/1.4.0` tagged on `develop`.

## 8. DECISION points

1. **Merge timing vs the experiment** — confirm the `onboarding-flow` flag's ramp state before
   merging; if a test is mid-run, hold the merge (or accept restarting the experiment clock after
   ship).
2. **Auto-advance delay** — 250ms default; tune on device.
3. **Title alignment** — spec picks left-aligned everywhere; confirm against brand taste before the
   screens are migrated (cheap to flip while it's one token).
4. **Educational/info screens** — kept as full-width Continue pages in the same shell; if any should
   become swipeable cards or merge away entirely, that's a content call to make separately.
