# SPEC-18 — Lesson screen redesign + Duolingo-style sequential locking

Target version: v1.5.0 · Order: fourth spec in the train · Size: ~2–3 days
Depends on: SPEC-13 progress sync (already merged, shipped in v1.2.0). Stacks on `develop` after the
v1.4.0 boundary; no code dependency on SPEC-15/16/17.

---

## 0. Goal

1. Redesign the lesson list (`src/screens/LearnScreen.tsx`) to feel professional.
2. Sequential locking, Duolingo-style: lessons unlock in order; future lessons stay *visible* but
   greyed with a lock icon until the previous lesson is finished.
3. The path must **not** look like the app ends at lesson 13 — include a "more lessons coming"
   affordance so the journey feels ongoing. (All owner-decided; bake in.)

## 1. Grounded starting point

- `LearnScreen.tsx` renders a hardcoded `learningModules` array (ids `'1'`–`'13'`, all
  `Colors.primaryTint`), maps id → route via `LESSON_NAV` (`src/navigation/lessonRoutes.ts`), fires
  `lesson_tapped` then `gateToLesson` (a deliberate no-op seam — hard paywall gates at entry; keep
  the seam). Every card is currently tappable (SPEC-13 removed the old dead "Coming Soon" logic —
  this spec reintroduces locking, but *real* this time).
- Completion data: per-lesson AsyncStorage arrays via `createProgressStore(storageKey)`
  (`src/lessons/progressStore.ts`), synced account-scoped to `lesson_progress` (slug-keyed,
  `completed` derived when all sections done). `LESSON_REGISTRY` (`src/lessons/registry.ts`) maps
  slug → `Lesson` (with `sections`, optional `storageKey`).
- **Gap you must close:** flow lessons `lesson1`–`lesson4` have **no** `storageKey` — nothing records
  their completion, locally or remotely. Sequential locking is impossible past lesson 1 without a
  completion signal for lessons 1–4.

## 2. Ground rules (self-contained)

- Node 20. PR gate: `npx tsc --noEmit` · `npx eslint .` zero new warnings (baseline ~200) ·
  `npm test` green · CI green · adversarial review clean.
- `main` FROZEN (v1.2.0 RC). Branch `spec-18-lesson-redesign-locking` from `develop`; PR into
  `develop`.
- Analytics via `safeCapture` only; keep the two-event honesty rule: `lesson_tapped` on tap (top of
  funnel), `lesson_started` stays where the engine fires it. Errors → `reportError`. No PII.
- AsyncStorage keys ONLY via `src/constants/storageKeys.ts`; never rename a shipped key (the plain
  `@<lesson>_completed_sections` keys are shipped user progress — leave them). New keys use the
  `@kinderwell_` namespace.
- DB access only through `src/services/`; screens never import the Supabase client; `npm run
  gen:supabase-types` after any schema change; dev Supabase only, prod pushes only via
  `scripts/db-push-prod.sh` at release.
- Lesson content lives in `src/lessons/content/*.ts` validated by zod — content edits are data edits;
  do not create new per-lesson screen files.
- `grep -rn "replace('Root')" src/` must still hit only LoadingScreen. Never touch `eas.json`,
  `legal/`, dashboards. Preserve narrative why-comments. Conventional commits.

## 3. Work items (in-code)

### R1 — Completion signal for flow lessons 1–4

- Add `storageKey` to `lesson1`–`lesson4` content modules: new namespaced keys in `storageKeys.ts`
  (`LESSON1_COMPLETED_SECTIONS: '@kinderwell_lesson1_completed_sections'`, …4). New keys, never
  shipped → no migration needed; note that pre-v1.5.0 completions of lessons 1–4 were simply never
  recorded (the legacy signup-date rule in R2 handles the fairness — those users are never subject to
  locking).
- With `storageKey` set, the existing factory + background sync + sign-in merge cover them with
  **zero** new sync code (`LESSONS_BY_STORAGE_KEY` picks them up automatically). Verify
  `LessonController`/`LessonScreen` actually calls `markSectionComplete` for flow lessons once a key
  exists — wire it if the call is currently skipped for keyless lessons.

### R2 — Locking model (pure, unit-tested): signup-date cutoff + sequential

New pure module `src/lessons/unlockPolicy.ts` (same compute→act philosophy as `routingPolicy.ts`):

- **Canonical order** = one explicit ordered slug array (matching today's `learningModules` 1→13
  order) exported as `LESSON_PATH`. Single source; LearnScreen renders from it (joined with registry
  + `HUB_META`/module metadata).
- **Legacy cohort by signup date.** Export `LOCKING_CUTOFF_ISO` (a UTC ISO constant; placeholder
  value until set at the version boundary — see DECISION 1). The Supabase `User.created_at` (already
  on the `authStore` user, persisted with the session — no network read) decides the cohort:
  - `created_at < LOCKING_CUTOFF_ISO` → legacy user: all 13 lessons unlocked, exactly today's
    behavior. Completed badges still render where progress is recorded.
  - `created_at >= LOCKING_CUTOFF_ISO` → sequential locking applies (below).
  - **Fail open:** `created_at` missing or unparsable → treat as legacy (never lock an existing user
    out of previously-accessible content because of a parse bug; genuinely new users always have a
    valid `created_at`). Why-comment this.
- **Demo users** (`isDemoUser`, the App-Review bypass) → all unlocked, regardless of dates — the
  reviewer must be able to browse every lesson.
- This rule fully replaces per-lesson progress-grandfathering: anyone with pre-v1.5.0 progress by
  definition signed up before the cutoff, including the lessons-1–4 cohort whose completions were
  never recorded.
- `resolveUnlockState(input: { signupDateIso: string | null; isDemoUser: boolean; completedBySlug:
  Record<string, boolean>; hasProgressBySlug: Record<string, boolean> }): Record<string, 'completed'
  | 'unlocked' | 'locked'>` — for the sequential (post-cutoff) path:
  - Lesson 1 is always unlocked.
  - Lesson N is unlocked iff lesson N−1 is **completed** (all its sections done — the existing derived
    definition).
  - Belt-and-braces: a lesson with any recorded progress (≥1 section) is never `locked`, regardless of
    chain position. This covers the residual upgrade window: a post-cutoff signup can spend weeks on a
    pre-v1.5.0 binary (no locking) making mid-path progress before updating — locking a lesson the
    user is visibly partway through would read as data loss. Why-comment this.
  - Completed lessons stay tappable forever (replay allowed).
- LearnScreen computes `completedBySlug` by reading each registry lesson's progress store on focus
  (`useFocusEffect`; AsyncStorage reads, local-first — no network on this path) and applies the
  policy.

### R3 — LearnScreen redesign

- Professional path/journey presentation built from theme tokens (`theme.ts`): clear visual states —
  **completed** (check badge, full color), **current/unlocked** (emphasized, "Continue" affordance,
  subtle progress like `3/5 sections`), **locked** (greyed/desaturated card, lock icon via
  `@expo/vector-icons`, reduced elevation, no illustration tint). All 13 remain visible — locked ≠
  hidden.
- **Locked tap:** card does **not** navigate; gentle feedback (shake or tooltip/toast: "Finish
  '<previous lesson title>' to unlock") + `safeCapture('lesson_locked_tapped', { lesson_id,
  blocking_lesson_id })` — this event doubles as the demand signal for how hard users push on the
  lock.
- **Unlocked tap:** unchanged pipeline (`lesson_tapped` → `gateToLesson` seam → navigate).
- **"More lessons coming" affordance:** after the last lesson, a terminal path node styled as a
  future step (not an error/empty state): e.g. dashed/ghost card, "New lessons are on the way — we
  add to your path regularly", optionally previewing nothing specific (no fake titles). It must read
  as *the path continues*, not *the app is finished*. `safeCapture('more_lessons_card_viewed')` once
  per screen focus when it scrolls into view is optional-nice; skip if fiddly.
- **Keep:** the 5-minute framing copy, the educational disclaimer, `useLessonGate` call sites, hub
  screens themselves (`LessonHubScreen` internals unchanged this spec).

### R4 — Tests

- `unlockPolicy` exhaustively: signup before cutoff → all unlocked (with completed badges where
  recorded); signup exactly at / after cutoff → sequential; `signupDateIso` null/garbage → all
  unlocked (fail open); demo user → all unlocked regardless of date; post-cutoff: empty progress →
  only lesson 1 unlocked, chain unlock, all complete → all completed; mid-path partial progress (e.g.
  lesson 7 has sections done, 2–6 untouched) → lesson 7 not locked while 2–6 stay locked; unknown
  slug tolerated.
- `LESSON_PATH` integrity: every path slug exists in `LESSON_REGISTRY`; length 13; no duplicates;
  every `LESSON_NAV` target reachable from it.
- Flow lessons 1–4: factory round-trip on the new keys; `getLessonByStorageKey` resolves them; sync
  layer treats them like any hub lesson (mock the service as existing tests do).
- Render: locked card blocks navigation and fires `lesson_locked_tapped`.

## 4. Out-of-repo actions

Steps that cannot be done from this codebase — external systems only. Each gets a pending entry in
`docs/OPS_STATE.md` in this PR (including "no change required" lines, so external state stays
tracked), ticked with a date when performed.

1. **PostHog — lesson-funnel dashboard update** *(not required for the feature to work; required for
   the lock to be observable)*: add a trend/insight on `lesson_locked_tapped` broken down by
   `lesson_id`, filtered to `environment = production` — a high count on one lesson = a pacing wall
   worth revisiting. No flag work.
2. **Supabase (dev + prod):** nothing — no schema change in this spec (lessons 1–4 sync rides the
   existing `lesson_progress` table and its RLS), no type regeneration, no edge-function changes.
3. **Sentry:** nothing required. After release, watch that the lessons-1–4 sync path adds no `lesson
   progress sync repeatedly failing` reports (it reuses the existing threshold logic).
4. **Superwall:** nothing — locking is inside Root, behind the existing gate; do not touch the
   `subscription_gate` placement or audience.
5. **App Store Connect:** nothing spec-specific; standard v1.5.0 release actions live in the runbook.

## 5. Device-test checklist — create `docs/releases/v1.5.0.md`

Frozen runbook instance (SPEC-14 convention: this block + copied standard checklist from
`docs/RELEASE_CHECKLIST.md`; ticked with evidence at release time):

- [ ] Fresh account (created after the cutoff): only lesson 1 tappable; 2–13 greyed with lock icons
  but fully visible.
- [ ] Complete lesson 1 (all sections) → lesson 2 unlocks immediately on returning to the path (focus
  refresh, no app restart).
- [ ] Locked tap: feedback shows the correct blocking lesson name; no navigation; event visible in
  PostHog.
- [ ] **Upgrade path (critical):** an account created BEFORE the cutoff (any pre-v1.5.0 account, with
  or without progress) → all 13 lessons remain unlocked after update; completed badges correct;
  nothing previously accessible becomes locked.
- [ ] Demo user (7-tap App-Review bypass): all lessons unlocked and openable.
- [ ] Flow lessons 1–4: completing sections persists across relaunch AND syncs (sign out → sign in on
  a wiped install restores them).
- [ ] Last lesson completed → "more lessons coming" node reads as an ongoing path; no dead-end feel.
- [ ] Replay of a completed lesson works.
- [ ] Standard paywall regression (sandbox): subscriber cold launch straight to app; fresh signup
  hits the gate.

## 6. Version boundary — v1.5.0

Before or at the boundary: set `LOCKING_CUTOFF_ISO` to its real value (DECISION 1) in a final commit
— the tag must not carry the placeholder.

After merge to `develop`: `./scripts/bump-version.sh 1.5.0 <next monotonic build int>` (check
`app.json` history on `develop` + `main`; one greater than the highest ever used) → commit → tag
`rc/1.5.0` → push. Build later from the tag, **only after v1.4.0 is live and healthy** (strict
order). Copy this spec to `docs/specs/SPEC-18-lesson-redesign-locking.md`.

## 7. Acceptance criteria

- [ ] `LESSON_PATH` + pure `resolveUnlockState` exist with the exact rules in R2 (legacy-by-signup-
  date all-unlocked, fail-open on missing date, demo all-unlocked, first-always, predecessor-complete,
  progress-never-locks, replay-allowed) and exhaustive tests.
- [ ] Lessons 1–4 record + sync completion via new namespaced keys registered in `storageKeys.ts`; no
  shipped key renamed.
- [ ] LearnScreen renders three distinct states from theme tokens; locked cards visible, non-
  navigating, with lock icon + feedback naming the blocker.
- [ ] "More lessons coming" terminal affordance present; path never reads as finished.
- [ ] `lesson_tapped`/`lesson_started` semantics unchanged; `lesson_locked_tapped` added via
  `safeCapture`.
- [ ] No schema changes; screens still never import Supabase; `grep -rn "replace('Root')" src/` clean.
- [ ] §4 entries added to `docs/OPS_STATE.md`; `docs/releases/v1.5.0.md` committed; spec copied to
  `docs/specs/`; version bumped + `rc/1.5.0` tagged on `develop`; `tsc`/lint (no new)/jest/CI green;
  adversarial review clean.

## 8. DECISION points

1. **The cutoff date** — the exact `LOCKING_CUTOFF_ISO` value (UTC ISO timestamp). Recommended: the
   moment the v1.5.0 build is submitted/released, so every account that exists before locking ships is
   legacy. Must be set (replacing the code placeholder) before `rc/1.5.0` is tagged.
2. **Unlock granularity** — spec bakes "previous lesson fully complete" (all sections). Alternative
   (any-section-of-previous) unlocks faster; decide only if device feel demands it.
3. **"More coming" copy/cadence promise** — the card implies ongoing content; confirm the wording
   doesn't promise a cadence that won't be kept (App Review + trust).
4. **Hub-screen visual refresh** — explicitly out of scope here; decide whether it becomes its own
   later spec.
