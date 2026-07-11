# SPEC-FIX-11 — Release-train repair + review fixes (v1.3.0–v1.6.0 code review, 2026-07-12)

Scope: every finding from the 2026-07-12 adversarial review of the `develop` train (SPEC-15…19) —
the release-train mechanics that were skipped, one real analytics regression, two behavior fixes, all
minor findings, and the missing branching/merge documentation. Gates the v1.3.0 release. · Size: ~1 day
Depends on: SPEC-19 merged (current `develop` HEAD).

---

## 0. Context

The train's code is in good shape: `tsc` clean, eslint 0 errors / no new warnings, 221 tests green,
all invariants hold (gate untouched, `replace('Root')` only in LoadingScreen, keys via registry, no
PII, additive migrations). This spec closes the review findings so the train is genuinely
code-complete and each version is buildable from a tag.

## 1. Ground rules (self-contained)

- Node 20 (`nvm use 20`). PR gate: `npx tsc --noEmit` clean · `npx eslint .` zero NEW warnings ·
  `npm test` green · CI green · adversarial re-review of the diff before merge.
- `main` stays FROZEN (v1.2.0 RC). Branch `spec-fix-11-train-review-fixes` from `develop`; PR into
  `develop`. Exception: R1 creates a `release/1.3.0` branch and tags — those are deliberate train
  mechanics, spelled out below.
- Keep fix commits atomic and per-finding — R4 (and only R4) must cherry-pick cleanly onto
  `release/1.3.0` (see R1.4).
- All house rules apply: analytics via `safeCapture`/typed helpers only; errors → `reportError`;
  storage keys via `storageKeys.ts`; update every comment a change makes stale (several findings ARE
  stale comments); never touch `eas.json`, `legal/`, dashboards, prod DB.
- After all changes: `grep -rn "replace('Root')" src/` must still hit only LoadingScreen.

## 2. Work items

### R1 — Repair the release-train mechanics (MUST-FIX #1 and #2)

The v1.3.0 boundary was skipped (no bump commit, no tag — SPEC-15 merged at `8017512` and SPEC-16
started directly, so build 12 went to 1.4.0), and no `rc/*` tags exist on the remote at all despite
the 1.4.0/1.5.0/1.6.0 bump commits. Right now the A/B framework — the priority deliverable — has no
shippable checkpoint, and nothing is buildable from a tag.

1. **Create the 1.3.0 checkpoint retroactively, without rewriting shared history:** cut
   `release/1.3.0` from the SPEC-15 merge commit `8017512` (it already contains the CI commit and the
   v1.3.0 runbook; it is exactly "1.2.0 + the A/B framework"). On that branch, one commit:
   `./scripts/bump-version.sh 1.3.0 15` (build 15 — see the build-number policy in step 3). Tag that
   commit `rc/1.3.0`. Push branch + tag.
2. **Create the missing tags on the existing bump commits and push them:** `rc/1.4.0` → `df6f0cc`
   (bump to 1.4.0), `rc/1.5.0` → `a1b1d6b` (bump to 1.5.0), `rc/1.6.0` → `92aa13a` (bump to 1.6.0).
   If the canonical repo already has any of these, reconcile instead of duplicating — verify with
   `git ls-remote --tags` there first.
3. **Amend the build-number policy (and document it in R7):** the retro-created 1.3.0 takes build 15
   (next unused; 11 = the v1.2.0 rebuild, 12–14 are burned in develop's history). Because the kill
   switch compares bare build integers globally (INVARIANT #12), builds must stay globally monotonic
   across releases in the order they are actually uploaded — so 1.4.0 can NOT ship as build 12 after
   1.3.0 ships as 15. Policy going forward: an `rc/*` tag marks a CODE checkpoint; the final build
   integer is (re)assigned at release time — cut `release/x.y.z` from the rc tag, run
   `bump-version.sh x.y.z <next global integer>` as that branch's first commit, build from there.
   (This also handles resubmission re-bumps cleanly.) Add one commit on `develop` re-bumping
   `app.json` to 1.6.0 / build 16 so develop's HEAD is never behind the highest assigned integer.
4. **Cherry-pick R4 (the AuthScreen fix) onto `release/1.3.0`** — it's the one finding that changes
   SPEC-15 behavior, and 1.3.0 must not ship without it. Re-tag `rc/1.3.0` on the post-cherry-pick
   commit (delete + re-push the tag; it is not yet public/built). Run the full gate (`tsc`/lint/jest)
   on the release branch too.

### R2 — `lesson_started` regression for lessons 1–4 (MUST-FIX #3)

`src/lessons/LessonController.tsx:83` detects flow lessons via `const isFlowLesson =
!lesson.storageKey;`. SPEC-18 R1 gave lessons 1–4 storage keys, so this is now false for them — and
they have no hub screen to fire `lesson_started` instead. The tapped→started funnel is silently
broken for four lessons. (`content.test.ts` already introduced `FLOW_LESSON_SLUGS` and the note that
"the discriminator is now 'has a storageKey AND is not a flow lesson'" — the same fix was never
applied to the controller.)

1. Make the discriminator explicit and single-sourced: add `FLOW_LESSON_SLUGS` (or an
   `isFlowLesson(slug)` helper) to `src/lessons/registry.ts` and consume it from
   `LessonController.tsx:83`, `content.test.ts` (replace its local copy), and anywhere else that needs
   the flow/hub split. Do NOT key it off `storageKey` anywhere.
2. Update the now-false comments: `LessonController.tsx:74–80` ("Flow lessons (no storageKey)…") and
   `:127–129`, and `progressStore.ts:179` ("flow lessons don't sync" — they do now).
3. Test: `lesson_started` fires for a flow lesson at section 0/screen 0 and does NOT fire for a hub
   lesson in the controller (mock `safeCapture`; the discriminator itself gets a unit test asserting
   exactly `lesson1–4`).

### R3 — Streak: replays must count as activity (SHOULD-FIX #4)

`progressStore.ts` calls `recordStreakActivity()` only inside the `!completed.includes(sectionId)`
guard — so re-completing an already-done section records nothing, and a user who has finished all 13
lessons can never extend a streak again. A day counts when the user completes ≥1 section, including
replays.

1. Move `void recordStreakActivity()` outside the dedup guard in `markSectionComplete` (fire on every
   completion event; `recordActivityToday` is already idempotent per day, so the write cost is one
   AsyncStorage read on repeats).
2. Update the surrounding comment (it currently ties streak recording to "new section" semantics).
3. Test: completing an already-completed section on a new day records that day (extend
   `progressStore.test.ts` / `streakStore.test.ts`).

### R4 — Experiment assignment hygiene (SHOULD-FIX #5) — cherry-picks to `release/1.3.0`

`AuthScreen` calls `resolveOnboardingVariant()` unconditionally on auth success — so a returning user
signing in on a fresh device gets a fresh assignment persisted, an `onboarding_variant_assigned`
event, and the super-property stamped on all subsequent events (including `subscription_purchased`),
contaminating any non-funnel breakdown by variant. Secondary: Welcome-mount warming also persists an
assignment for users who bounce or tap "already have an account."

1. Add a read-only `peekOnboardingVariant(): Promise<OnboardingVariant | null>` to
   `src/lib/experiments.ts` (persisted value or null; never consults the flag, never persists, never
   fires the event).
2. `AuthScreen`: resolve only in signup mode — `const onboardingVariant = mode === 'signup' ? await
   resolveOnboardingVariant() : undefined;` (signup users already have a persisted value from
   Welcome, so this stays instant).
3. `WelcomeScreen` mount: warm the flag cache WITHOUT persisting — e.g. fire
   `posthog.getFeatureFlag` via a `warmOnboardingFlag()` no-op-on-result helper (or simply drop the
   mount call; `preloadFeatureFlags: true` already warms on launch). Assignment (persist + event +
   super-property) happens only in `handleGetStarted`. Document the rule in the module header: an
   assignment exists only for devices that actually entered onboarding.
4. Tests: signin mode never persists/fires; Get Started is the only persist point; peek never writes.

### R5 — Minor findings (all of them)

1. **Shared shake shakes every locked card** (`LearnScreen.tsx:297–306`, `:449`): all locked cards
   subscribe to one `Animated.Value`, so tapping one wiggles the whole locked column. Track which
   card is shaking (e.g. `shakingSlug` state; only that card gets the animated wrapper) or give each
   card its own value. Test not required (animation); note the fix in the PR
   recording/screenshot.
2. **Retry-state copy regressions** (`LoadingScreen.tsx`): (a) gate mode's waiting/retry text is a
   static "Checking your subscription…" — when `gateStatus === 'retry'`, show the old, more honest
   line: "Checking your subscription — please make sure you're online…"; (b) onboarding mode stuck in
   retry shows "Almost ready!" indefinitely — when `gateStatus === 'retry'` in theater mode, swap the
   status line to the same retry copy. Keep everything else identical.
3. **Dead expression + lying comment** (`streakStore.ts` `mergeRemoteActivityIntoLocal`):
   `Math.max(blob.longestEver, 0)` is a no-op under a comment claiming it recomputes longest over the
   union. Either recompute honestly — the call site (`authStore` SIGNED_IN) passes `new Date()` down
   so the merge can run `computeStreak(union, localToday(now)).longest` — or keep the monotonic-cache
   behavior and fix the comment to say longest self-heals on the next `getStreak`. Prefer the honest
   recompute (a restored device then shows the right `longest` immediately, not after a second read).
4. **Locked-card a11y** (`LearnScreen.tsx:404`): `accessibilityState={{ disabled: false }}` is
   hardcoded — make it `{{ disabled: locked }}` (the card still responds to taps for the feedback,
   but assistive tech should know it's locked; the label already says so).
5. **UserType privacy microcopy dropped**: the old screen showed "The next few questions help us
   personalize lessons for your family. All responses are stored securely and used only to customize
   your experience." The migration folded the first sentence into the subtitle and dropped the trust
   line. Restore the storage/trust sentence on the first question screen (UserType subtitle or a small
   caption slot in `QuestionScreen`) — SPEC-17 promised presentation-only changes.
6. **Splash handoff geometry — pin it** (`app.json`): the `expo-splash-screen` plugin config sets no
   `imageWidth`, while the JS splash renders the glyph at 220dp with the wordmark in the layout
   column; the handoff match is currently unverifiable from code. Set `"imageWidth": 220` in the
   plugin config (and keep the legacy top-level `splash` block in sync or remove it — one config, one
   comment saying which governs), and size/position the JS first frame to match. The 240fps slo-mo
   check in `docs/releases/v1.4.0.md` remains the on-device gate.
7. **`streak_lost` fires before its guard persists** (`streakStore.ts` `getStreak`): the event fires,
   then the `lastKnownStreak` write follows — a failed write can re-fire the event on the next read.
   Persist first (or make the capture conditional on the write succeeding). One-line reorder +
   comment.
8. **Document the accepted `atRisk` bridge edge** (`computeStreak.ts`): when a run needs two bridges
   within 7 days across the today boundary, the at-risk display can exceed what completing today
   actually yields (the shown streak can drop after doing a lesson). Rare by construction. Do not
   change behavior — add a comment documenting it as accepted, plus a test pinning the current
   behavior so a future change is deliberate.

### R6 — Stale-comment sweep

Beyond R2's comments: re-read every comment in the files this spec touches and fix any the train made
stale (house rule). Known instances are listed in R2.2; the sweep confirms there are no others (e.g.
any remaining "flow lessons don't persist" phrasing in `LessonController` / `LessonScreen` /
`hubMeta`).

### R7 — Commit the branching & safe-merge-to-main doc (the missing process doc)

Today no repo doc explains the `develop` train or how/when `main` is updated — `RELEASE_CHECKLIST.md`
assumes a single branch and `VERSION_MANAGEMENT.md` doesn't mention branches. The model lives only in
a disposable planning folder. Add a "Branching & release train" section to
`docs/VERSION_MANAGEMENT.md` (it's the version/release-mechanics doc; add a pointer to it from
RELEASE_CHECKLIST's "Tag the release" step), covering:

1. **Roles:** `main` = the shipped/shipping branch — always equal to what is live or in release
   testing; FROZEN while a release is in test. `develop` = the accumulation trunk for post-release
   work; feature branches PR into `develop`, never `main`.
2. **Checkpoints:** each version boundary on `develop` gets a version-bump commit + an `rc/x.y.z`
   tag. An rc tag is a CODE checkpoint; the final build integer is assigned at release time (see 4).
3. **Releasing:** cut `release/x.y.z` from `rc/x.y.z`; first commit = `bump-version.sh x.y.z <next
   GLOBAL build integer>`; re-run CI on that commit; build/submit from it; tag the built commit
   `vX.Y.Z-build-N` and move `appstore-live-*` per the existing checklist. Strict version order — one
   version live/healthy before the next builds (each version's code contains the previous one's).
4. **Build numbers:** bare integers, globally monotonic in upload order across all versions, forever
   (kill-switch INVARIANT #12). Never reuse or go backwards; resubmissions re-bump.
5. **Reconciling `main` (the "safe merge" procedure):**
   - After vX.Y.Z is live and healthy: fast-forward `main` to the released commit (`git checkout main
     && git merge --ff-only <released-commit>`). If `--ff-only` fails, `main` has commits `develop`
     doesn't — STOP and reconcile the other direction first (see 6); never force, never merge with a
     generated conflict resolution on `main`.
   - Verify before pushing: `git merge-base --is-ancestor main <released-commit>` (must be true), CI
     green on that commit, and the release tags exist on it.
   - `main` therefore only ever advances to already-shipped, already-tested commits — nothing lands
     on `main` that hasn't been through a release.
6. **Hotfixes while `main` is frozen:** fix on a branch off `main`, ship per the emergency checklist,
   then immediately merge `main` into `develop` so the trunk is a superset again (the train's later
   releases must contain every shipped fix). A hotfix's build number takes the next global integer.
7. **Worked example:** the v1.2.0→v1.6.0 train itself (main frozen at the 1.2.0 RC; develop carrying
   1.3.0–1.6.0; the 1.3.0 retro-checkpoint from R1) — a short concrete narrative so the next train
   doesn't re-derive this.

Also: update `docs/releases/README.md` (or the runbooks) if they reference tagging steps that the new
release-branch flow changes.

## 3. Tests (summary of the new/updated ones)

- Flow-lesson discriminator: exactly `lesson1–4`; `lesson_started` fires for flow lessons in the
  controller, not for hub lessons (R2).
- Streak: replay-on-a-new-day records the day (R3); `streak_lost` fire-once survives a failed persist
  (R5.7); the atRisk bridge edge pinned (R5.8).
- Experiments: signin never assigns; peek never writes; Get Started is the only persist point (R4).
- All existing suites stay green; eslint adds zero new warnings.

## 4. Out-of-repo actions

None — every finding is code, git, or docs. (The already-tracked OPS_STATE items — PostHog
flag/ramp/dashboards, prod migrations, cutoff date — are unchanged by this spec.) The only
quasi-external step is pushing the R1 tags/branches to the canonical remote, which is a git operation
from the repo. Add one OPS_STATE line noting the build-number policy amendment (builds finalized at
release time from `release/x.y.z` branches).

## 5. Acceptance criteria

- [ ] `rc/1.3.0` (on `release/1.3.0`, containing the R4 cherry-pick + the 1.3.0/build-15 bump),
  `rc/1.4.0`, `rc/1.5.0`, `rc/1.6.0` all exist on the remote; `develop` HEAD re-bumped to 1.6.0/build
  16; full gate green on both `develop` and `release/1.3.0`.
- [ ] `lesson_started` fires for lessons 1–4 again; discriminator single-sourced in the registry; no
  `!lesson.storageKey` flow-detection anywhere; stale comments fixed (R2, R6).
- [ ] Replays count toward the streak; merge recomputes (or honestly documents) `longestEver`;
  `streak_lost` persist-before-fire; atRisk edge documented + pinned.
- [ ] Sign-in never creates an experiment assignment; assignment happens only on Get Started;
  `peekOnboardingVariant` exists and is what identify/warm paths use.
- [ ] Locked-card shake is per-card; locked a11y state honest; retry copy restored in both
  LoadingScreen modes; UserType trust microcopy restored; splash `imageWidth` pinned with one
  governing config.
- [ ] `docs/VERSION_MANAGEMENT.md` has the "Branching & release train" section (roles, checkpoints,
  release-branch flow, global build-number rule, the ff-only main reconciliation procedure, hotfix
  flow, worked example); RELEASE_CHECKLIST points to it.
- [ ] `grep -rn "replace('Root')" src/` still hits only LoadingScreen; `tsc`/lint(no new)/jest/CI
  green; adversarial re-review clean; spec copied to `docs/specs/SPEC-FIX-11-train-review-fixes.md`.

## 6. DECISION points

1. **1.3.0 as its own release vs. collapsed into 1.4.0** — this spec bakes the separate
   `release/1.3.0` checkpoint (R1), preserving "the A/B test ships first, alone." The fallback (skip
   1.3.0; first release = 1.4.0 carrying A/B + splash + onboarding polish together) saves one release
   cycle but bundles visual changes with the experiment binary. Confirm before executing R1.
2. **Build-number plan** — R1 bakes: 1.3.0 = 15, develop re-bumped to 16, finals assigned at release
   time. Confirm, or renumber differently before any build is uploaded (nothing is built yet, so any
   consistent monotonic scheme works).
3. **`longestEver` merge behavior (R5.3)** — recompute at merge (recommended) vs. comment-only fix.
   Cheap either way.
