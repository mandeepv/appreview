# SPEC-15 — Onboarding A/B test framework + variant-B scaffold

> **NOTE 2026-07-19 (superseded, not rewritten):** the 3-screen variant-B
> *scaffold* described below (`VariantBQ1–Q3`, placeholder copy) was replaced
> during v1.3.0 work with a full 22-screen long-form onboarding. The A/B
> *framework* in this spec (flag resolution, sticky assignment, super-property,
> per-step analytics contract, resume) is unchanged and still current — only the
> variant-B screen set grew. Current variant-B design lives in
> `docs/specs/variant-b-onboarding-copy.md`; current screen/route names in
> `flows.ts` + `OnboardingNavigator`. Snapshot kept as-is per CLAUDE.md.

Target version: v1.3.0 · Order: first spec in the v1.3.0→v1.6.0 train · Size: ~2 days
Depends on: nothing on `develop` (v1.2.0 ships independently from `main`). Explicitly does NOT
depend on SPEC-17 (onboarding redesign): a split test measures the *relative delta* between two
flows, so both arms run on the current components and shared visual roughness cancels out.
Do not hold this spec for the redesign, and do not change onboarding visuals inside this spec.

---

## 0. Goal

50/50 split-test the current onboarding flow (**variant A / control**) against an alternative flow
(**variant B**), assigned via PostHog feature flags (server-controlled split, kill switch, and
rollout — no app build needed to change the split). Variant B ships as a **working scaffold with
clearly-marked placeholder questions** (real question copy comes later as a data/content edit),
visually consistent with variant A (reuse A's components — `OnboardingContainer`, `SelectableCard`,
`Button`).

- Primary metric: paid-subscription conversion (`subscription_purchased`).
- Guardrails: onboarding completion, signup (`auth_succeeded`), per-step drop-off
  (`onboarding_step_completed` by `step`).

## 1. Ground rules (this spec is self-contained — read nothing else first)

- Node 20 (`nvm use 20`; lint crashes on Node 16). Gate for every PR: `npx tsc --noEmit`
  clean · `npx eslint .` adds **zero** new warnings (baseline ~200) · `npm test` green · CI green
  · adversarial review clean before merge.
- `main` is FROZEN as the v1.2.0 release candidate. Never commit to it. All work in this spec
  goes to `develop` (see §2).
- Analytics only via `safeCapture` / the typed helpers in `src/lib/analytics.ts` — never raw
  `posthog.capture` in screens. Failures go to Sentry via `reportError`, never to PostHog. No
  email, child names, or free-text PII in any PostHog event or `$set` property — identify by
  Supabase user ID only.
- AsyncStorage keys only via `src/constants/storageKeys.ts`. Never rename a shipped key.
- Invariant: **every path into `Root` goes through the Loading gate.** After your changes, `grep -rn
  "replace('Root')" src/` must still hit only `LoadingScreen.tsx`. Variant B must end at the same
  `Auth → Loading` funnel tail as variant A — no new route into Root.
- An `error` result from the onboarding check is never treated as `no_onboarding` (don't touch
  `routingPolicy.ts`'s tri-state).
- Dev Supabase project only; never `supabase link` to the prod ref. Never touch `eas.json`
  values, `legal/`, or any Superwall/PostHog/Sentry dashboard (dashboard work is in §4, Out-of-repo
  actions — performed in the external systems, not from this codebase).
- Comment style: narrative why-comments are house style. Never delete one unless the code it
  explains is gone; update comments your change makes stale. Commits conventional
  (`feat(experiment): ...`), one concern per commit.

## 2. Branch & sequencing (v1.3.0 opens the `develop` train)

1. If `develop` does not exist yet: create it from current `main` (`git checkout -b develop main`,
   push). The first commit on `develop` — before any feature work — updates
   `.github/workflows/ci.yml`: the `pull_request` trigger currently reads `branches: [main]`
   (line ~15); change to `branches: [main, develop]` so PRs into `develop` run CI. Commit message:
   `ci: run PR checks for develop (release train through 1.6.0)`.
2. Cut the work branch from `develop`: `spec-15-onboarding-ab-test`. PR into `develop`, never `main`.
3. Version boundary after merge: see §7.

## 3. Work items (in-code)

### R1 — Experiment accessor: `src/lib/experiments.ts`

New module; the only place the app reads the flag. PostHog client (`src/config/posthog.ts`)
already sets `preloadFeatureFlags: true` and `sendFeatureFlagEvent: true` — build on that, don't
change the client config.

```
FLAG KEY:         'onboarding-flow'          (multivariate)
VARIANT VALUES:   'control' | 'variant_b'
DEFAULT:          'control'                  (any failure/timeout/unknown value → control)
```

API (exact shape up to implementation, contract fixed):

- `resolveOnboardingVariant(): Promise<OnboardingVariant>` where `OnboardingVariant =
  'control' | 'variant_b'`.
  1. **Persisted assignment wins.** Read `STORAGE_KEYS.ONBOARDING_VARIANT` (new key, see R2). If
     present, return it. This makes assignment sticky for the device for the *whole* onboarding
     attempt — a server-side split change mid-onboarding must never flip a user between flows.
  2. Otherwise read `posthog.getFeatureFlag('onboarding-flow')` guarded by a 2s timeout race. On
     `'variant_b'` → variant_b; on anything else (`'control'`, `undefined`, `false`, unknown
     string, timeout, throw) → control. Onboarding must never block or crash on flag resolution —
     wrap everything, default control.
  3. Persist the resolved value to `STORAGE_KEYS.ONBOARDING_VARIANT`, fire
     `safeCapture('onboarding_variant_assigned', { variant, source: 'flag' | 'fallback' })`
     exactly once (only when persisting a fresh assignment — `source: 'fallback'` when the flag
     didn't resolve), and `posthog.register({ onboarding_variant: variant })` as a super-property
     so every subsequent event (steps, auth, paywall, purchase) carries the variant without
     touching those call sites.
- Hydrate hook: on app start, if a persisted assignment exists, re-register the super-property
  (needed because `resetPostHog()` wipes super-properties — mirror how `environment` is
  re-registered in `src/config/posthog.ts`).
- `clearOnboardingVariant()`: clears the storage key only (called from the
  `onboardingStore.clearState()` path in LoadingScreen, so a future re-onboard — account deletion →
  fresh signup — gets a fresh assignment). Keep the super-property registered: the variant must
  keep flowing on post-onboarding events (paywall/purchase) — that's the primary metric.

Kill/rollout semantics (document in a module header comment): the dashboard controls the split
for new assignments only; already-assigned devices keep their flow mid-onboarding by design.
Setting variant_b to 0% in PostHog = kill switch for all new users, effective immediately, no build.

### R2 — Storage key

Add to `src/constants/storageKeys.ts` (namespaced convention):
`ONBOARDING_VARIANT: '@kinderwell_onboarding_variant'` — with a why-comment: sticky per-device
experiment assignment; cleared with onboarding state; server flag consulted only when absent.

### R3 — Branch point: WelcomeScreen

`WelcomeScreen.handleGetStarted` (currently `navigation.navigate('UserType')`, ~line 42):

- Resolve the variant fire-and-forget on Welcome mount (warms the cache so the tap is instant).
- On Get Started: `const variant = await resolveOnboardingVariant()` (already warm ⇒ instant;
  cold ⇒ capped at the 2s timeout, then control) → `navigate('UserType')` for control,
  `navigate('VariantBQ1')` for variant_b.
- "Already have an account" (`signin`) path is untouched — experiments apply to fresh onboarding
  only.
- Mid-flow resume already works structurally: `SplashScreen` resumes via
  `ONBOARDING_LAST_SCREEN` with a try/catch fallback to Welcome; variant-B route names round-trip
  through it once registered in the navigator. Verify in a test (R6).

### R4 — Variant B scaffold (placeholder screens; do NOT write real parenting questions)

Three new screens in `src/screens/onboarding/variantB/`: `VariantBQ1Screen`, `VariantBQ2Screen`,
`VariantBQ3Screen`, registered in `OnboardingNavigator` + `OnboardingStackParamList`
(`navigation/types.ts`) as `VariantBQ1 | Q2 | Q3`.

- **Placeholders are explicit and unmissable.** Every question title/option is literal placeholder
  copy — e.g. title `"[Placeholder] Variant B question 1 of 3"`, options `"Placeholder option
  A/B/C"` — plus a `// PLACEHOLDER (SPEC-15): real copy replaces this before the flag ramps above
  0%` comment block. Do NOT invent parenting-domain questions; the scaffold proves the pipeline,
  the copy comes later as a content edit.
- **Shape:** Q1 single-select, Q2 multi-select, Q3 single-select — one of each interaction so the
  real questions later slot into a proven pattern. Reuse variant A's existing components and layout
  idioms (`OnboardingContainer` with `screenName`, `currentStep` 1..3 / `totalSteps` 3,
  `SelectableCard`, `Button` Continue, same disabled-until-valid behavior). Consistent look with A
  is a requirement; new visual patterns are SPEC-17's job, not this spec's.
- **Flow:** Welcome → Q1 → Q2 → Q3 → `Auth` (signup mode, same as A's `EmotionalChallenges →
  Auth`). Loading/theater/paywall are untouched and shared.
- **State:** extend `onboardingStore` with `variantBAnswers: Record<string, string | string[]>`
  (+ setter, included in the persisted `ONBOARDING_STATE` JSON — additive, safe for `loadState`'s
  `set(parsedState)`), cleared by `clearState()`. Do NOT fake profile fields (e.g. never set a
  placeholder `userType`) — instead, Loading's `hasOnboardingPayload` check changes from
  `userType !== null` to `userType !== null || Object.keys(variantBAnswers).length > 0` (update the
  two places in `LoadingScreen.tsx` that use it, keeping the why-comments accurate). The theater +
  save then fire for both arms.
- **Persistence:** migration `add_onboarding_variant_columns`: `ALTER TABLE user_profiles ADD COLUMN
  IF NOT EXISTS onboarding_variant text; ADD COLUMN IF NOT EXISTS variant_b_answers jsonb;`
  (nullable, no backfill; RLS untouched — existing row-owner policies cover the new columns). Apply
  to dev and regenerate types (see §4 for the exact steps; prod application is an out-of-repo action
  at release). `onboardingService.saveUserOnboardingData` includes `onboarding_variant` always and
  `variant_b_answers` only when non-empty (INVARIANT: omit fields rather than writing
  placeholder/fallback values). Answers are option keys only — never free text (PII rule).
- **Analytics:** each B screen fires the existing `trackOnboardingStepCompleted(step, answer)` with
  `step: 'VariantBQ1'` etc., so per-step drop-off works for both arms in one insight. The variant
  itself rides on the super-property.
- Also `$set` person property `onboarding_variant` at the existing `identifyUserWithOnboarding`
  signup call (durable, low-sensitivity — allowed by the person-property rule in
  `src/lib/analytics.ts`).

### R5 — Guardrail: control flow byte-identical

Variant A screens are untouched by this spec except the Welcome branch line and the Loading
`hasOnboardingPayload` predicate. Diff review must confirm no other behavior change for control
users — the experiment is invalid if control moves.

### R6 — Tests (jest)

- `experiments.test.ts`: flag returns `variant_b` → variant_b; returns `control` / `undefined`
  / garbage / throws / times-out → control; persisted value wins over a changed flag; assignment
  event fires once; fresh resolve after clear.
- Store: `variantBAnswers` round-trips through save/load/clear.
- Routing: Welcome branch (extract a pure `resolveWelcomeDestination(variant)` if that keeps it
  testable without rendering); resume: a persisted `lastScreen: 'VariantBQ2'` resolves to a
  registered route.
- Existing suites stay green (especially `routingPolicy` and LoadingScreen-adjacent tests).

## 4. Out-of-repo actions

Steps that cannot be done from this codebase — they happen in external systems and gate the
feature working in production, but can't be closed by writing code. Keep them cleanly separate
from §3. Each one: add a pending entry to `docs/OPS_STATE.md` (the living external-state register)
in this PR, and tick it there with a date when actually performed.

1. **PostHog — create the feature flag** (*must exist BEFORE the code has any effect: without it,
   `getFeatureFlag` returns undefined and every user silently gets control — the app never crashes,
   but no experiment runs*). In the prod PostHog project: Feature Flags → New → key exactly
   `onboarding-flow` → enable "multiple variants" → variants `control` and `variant_b` → release
   condition 100% of users, split on the variants. Start with **variant_b at 0%** (everything
   control); mirror the flag in the dev project for testing (any split).
2. **PostHog — ramp to 50/50 (experiment start).** Flip `control`/`variant_b` to 50/50 only when
   (a) the placeholder questions have been replaced with real copy, and (b) v1.3.0 is the dominant
   installed version. Setting variant_b back to 0% is the kill switch — immediate, no build. Add a
   PostHog annotation at ramp start/stop.
3. **PostHog — experiment dashboard.** Funnel `welcome_cta_tapped (get_started)` →
   `onboarding_step_completed (per step)` → `auth_succeeded` → `paywall_presented` →
   `subscription_purchased`, broken down by `onboarding_variant`, filtered to `environment =
   production`. Plus a trend on `onboarding_variant_assigned` by `source` (a spike in `fallback` =
   flag-delivery problem).
4. **Supabase dev — apply the migration + regenerate types** (before the service code merges, or
   type-checks fail): with the CLI linked to the dev project only, `supabase db push`, then
   `npm run gen:supabase-types` and commit the updated `src/types/supabase.ts`.
5. **Supabase prod — apply the migration at release time** (*must be applied BEFORE the v1.3.0
   binary goes live, or every onboarding save writes to missing columns and fails*): via
   `scripts/db-push-prod.sh` only (it enforces a same-day backup). Never `supabase link` to the
   prod ref manually.
6. **Sentry:** no changes required. Verify only that no new error classes appear from
   `experiments.ts` after ship.
7. **Superwall:** no changes. Explicitly: do not touch the `subscription_gate` placement or
   audience.
8. **App Store Connect:** nothing experiment-specific; standard v1.3.0 release actions live in the
   release runbook (§5).

## 5. Device-test checklist — commit `docs/releases/v1.3.0.md`

Create it in this PR as a frozen runbook instance (same convention as `docs/releases/v1.2.0.md`:
copy the standard checklist from `docs/RELEASE_CHECKLIST.md` below a release-specific block; ticked
with dated evidence at release time, not now). Release-specific block:

- [ ] Force `variant_b` for a test device (PostHog flag override / test account) → Welcome routes
  into VariantBQ1→Q3 → Auth → theater → paywall; complete signup; `user_profiles` row has
  `onboarding_variant='variant_b'` + `variant_b_answers`.
- [ ] Force `control` → current flow unchanged end-to-end (byte-identical UX).
- [ ] Airplane mode on first launch → Get Started waits ≤2s, falls back to control,
  `onboarding_variant_assigned{source:'fallback'}` fires.
- [ ] Kill app mid-variant-B (on Q2) → relaunch resumes at Q2 (not Welcome, not variant A).
- [ ] Funnel events in PostHog all carry `onboarding_variant`; per-step drop-off insight splits
  correctly.
- [ ] Flag flip in dashboard (variant_b 0%→100%) changes assignment for a **fresh** install without
  an app update.
- [ ] Standard paywall regression: fresh signup hits undismissable paywall; purchase (sandbox
  Apple ID only) → Root; restore works; cold relaunch of a subscriber → no paywall.

## 6. Version boundary (do this after the PR merges to `develop`)

1. `./scripts/bump-version.sh 1.3.0 <build>` — `<build>` = the next monotonic bare integer across
   all builds ever (check `app.json` on `main` — currently 11 for the v1.2.0 rebuild — and
   `eas build:list`; if 11 is the highest used, this is 12). Commit to `develop`.
2. Tag `rc/1.3.0` on that commit and push the tag. The 1.3.0 release is built from this tag, later,
   only after v1.2.0 is live and healthy — releases go out strictly in version order.
3. Copy this spec file into the app repo at `docs/specs/SPEC-15-onboarding-ab-test.md` in the PR
   (the planning folder is disposable; the repo is the system of record).

## 7. Acceptance criteria

- [ ] `develop` exists; its first commit adds `develop` to the CI `pull_request` trigger; CI ran on
      this PR.
- [ ] `src/lib/experiments.ts` exists with timeout-guarded, default-control, sticky-persisted
      resolution; no screen reads the flag directly.
- [ ] `ONBOARDING_VARIANT` key added via `storageKeys.ts`; cleared when onboarding state clears;
      super-property re-registered on hydrate.
- [ ] Variant B: 3 placeholder screens (1 single-, 1 multi-, 1 single-select), visibly
      `[Placeholder]`-labelled, reaching the same `Auth → Loading → paywall` tail; zero new
      `replace('Root')` hits outside LoadingScreen.
- [ ] Control flow behavior-identical (diff-reviewed) apart from the Welcome branch + Loading
      payload predicate.
- [ ] `onboarding_variant` present on funnel events (super-property), on the person (`$set`), and
      in `user_profiles`; no PII in any of it.
- [ ] Dev migration applied + `src/types/supabase.ts` regenerated; every §4 item entered as pending
      in `docs/OPS_STATE.md`; prod push listed in the runbook, not executed.
- [ ] Tests in §R6 written and green; `tsc` / `eslint` (no new) / `jest` / CI all green; adversarial
      review clean (this spec touches the gate file — money-path review depth).
- [ ] `docs/releases/v1.3.0.md` committed; spec copied to `docs/specs/`; version bumped to 1.3.0 +
      `rc/1.3.0` tagged on `develop`.

## 8. Decision points (resolve outside the code; none block the merge)

1. Variant B's real questions/screens — the placeholder copy, option sets, and possibly the screen
   count are to be filled in later (content edit + possible screen add/remove following the scaffold
   pattern). The flag must not ramp above 0% until then.
2. Ramp plan — when to move variant_b 0% → 50%, and the stop rule (minimum sample / duration before
   judging the primary metric).
3. Interaction with SPEC-17 (onboarding polish) — recommended: run the experiment on current
   visuals; apply SPEC-17 either before the ramp starts or after the experiment concludes, never
   mid-run.
