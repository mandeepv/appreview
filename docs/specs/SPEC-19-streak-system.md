# SPEC-19 — Daily streak system (Duolingo-style retention)

Target version: v1.6.0 · Order: fifth (last) spec in the train · Size: ~2 days
Depends on: SPEC-13 progress sync (shipped in v1.2.0). Pairs naturally with SPEC-18's path UI but has
no hard code dependency on it. Stacks on `develop` after the v1.5.0 boundary.

---

## 0. Goal

A daily streak: a day counts when the user completes ≥1 lesson section that day. Account-scoped and
DB-backed (builds on the existing lesson-progress sync posture), with a freeze/grace day so a single
missed day doesn't nuke a long streak. (All owner-decided; bake in.)

## 1. Ground rules (self-contained)

- Node 20. PR gate: `npx tsc --noEmit` · `npx eslint .` zero new warnings (baseline ~200) ·
  `npm test` green · CI green · adversarial review clean.
- `main` FROZEN (v1.2.0 RC). Branch `spec-19-streak-system` from `develop`; PR into `develop`.
- DB access only through `src/services/`; screens never import the Supabase client; types via
  `npm run gen:supabase-types` after schema changes. Dev Supabase only; prod migration lands at
  release via `scripts/db-push-prod.sh` (external task, §5).
- Analytics only via `safeCapture`; failures → `reportError` (Sentry), never PostHog. Payloads:
  dates + counts only — no PII.
- AsyncStorage keys only via `src/constants/storageKeys.ts` (new keys use the `@kinderwell_`
  namespace).
- Sync posture must match lesson progress (SPEC-13, owner-decided): local-first, background
  fire-and-forget, never blocks UI, never user-facing errors; `reportError` only on repeated failure
  (mirror `progressStore.ts`'s streak-of-3 pattern).
- `grep -rn "replace('Root')" src/` must still hit only LoadingScreen. Never touch `eas.json`,
  `legal/`, dashboards. Preserve narrative why-comments. Conventional commits (`feat(streak): ...`).

## 2. Design (bake in)

### Data model — record activity days, derive the streak

Store *facts* (which days had activity), compute the streak with a pure function. No stored counter
to corrupt or migrate.

Migration `add_daily_activity` (dev now, prod at release):

```sql
CREATE TABLE IF NOT EXISTS public.daily_activity (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL,        -- device-local calendar date
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_date)
);
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
-- RLS: owner-only select/insert, both USING and WITH CHECK on user_id = auth.uid(),
-- mirroring lesson_progress's policies (see 20260710010000_rls_update_with_check.sql).
-- No UPDATE policy needed (rows are insert-only facts); DELETE cascades with the user.
```

Idempotent writes: `upsert` / `ON CONFLICT DO NOTHING` on the PK — completing five sections in a day
is one row.

Dates are device-local calendar dates (format `YYYY-MM-DD` from local time, not UTC). A streak is a
human-perceived daily ritual; UTC dates break it for most timezones. Timezone travel can occasionally
gift/cost a day — accepted, documented in a why-comment (this is what the big streak apps accept
too).

### Streak semantics — pure function

`computeStreak(activityDates: string[], today: string): { current: number; longest: number;
freezeUsedOn: string | null; atRisk: boolean }`

- Walk back from `today`: the current streak is the run of consecutive active days ending at `today`
  or yesterday (today not yet active ⇒ streak intact but `atRisk: true` — "do a lesson today to keep
  it").
- Freeze/grace rule: while walking back, a single missed day inside the run is bridged automatically
  — at most **one bridge per rolling 7 days** of the run (so a long streak survives one slip a week,
  but alternating-day usage doesn't count as a streak). The bridged date is reported as
  `freezeUsedOn`. No user-managed freeze inventory in v1 — automatic and free.
- `longest` = best run ever under the same rule.
- Pure, deterministic, exhaustively unit-tested; `today` is always a parameter (never `new Date()`
  inside) so tests and midnight-crossing UI stay honest.

### Local-first plumbing

- New key in `storageKeys.ts`: `ACTIVITY_DAYS: '@kinderwell_activity_days'` — JSON array of
  `YYYY-MM-DD` strings (bounded: keep the most recent ~400; `computeStreak` only needs recent history
  + `longest` can be computed before trimming and cached alongside, e.g. `{ days: [...], longestEver:
  n }`).
- Write hook: the single choke point is `createProgressStore().markSectionComplete`
  (`src/lessons/progressStore.ts`) — every section completion in the app already flows through it.
  After the local progress write succeeds, append today to `ACTIVITY_DAYS` (idempotent) and fire a
  background, non-awaited `recordActivity()` (lazy-required service, exactly like
  `syncSectionsToRemote` — keeps the Supabase client out of the local path and the existing tests).
- Service `src/services/streakService.ts`: `recordActivity(date)` (upsert own row; `'ok'` |
  `'skipped'` | `'failed'` outcomes matching `lessonProgressService.upsertSections` — signed-out/demo
  = `'skipped'`, never counted as failure) and `getActivityDays()` (recent dates for the user; `null`
  on fetch error — `null` means unknown, never merge/overwrite on `null`, same contract as
  `getAllRemoteProgress`).
- Sign-in reconciliation: union remote dates into local (and push local-only dates up), alongside the
  existing `mergeRemoteIntoLocal()` call site so a re-installed device restores its streak. Set-union
  of dates is order-free and idempotent — same non-destructive posture as lesson progress.

### UI (keep v1 minimal)

- Streak chip in `LearnScreen`'s header: flame + current count; dimmed/outline flame when `atRisk`
  (no activity yet today), filled when today is done. Tap → small explainer sheet: current, longest,
  the one-line freeze rule, and today's state. Theme tokens only.
- Increment moment: when a section completion makes today active for the first time, show a
  lightweight celebration (toast/inline moment in the lesson completion flow, not a blocking modal):
  "🔥 Day N". Respect Reduce Motion.
- No push notifications in this spec (notifications are a separately-parked decision — SPEC-11); the
  streak must stand alone without reminders.

## 3. Analytics (safeCapture)

- `streak_day_recorded { streak_length }` — first section of a local day.
- `streak_freeze_used { streak_length }` — computed walk bridged a gap ending today.
- `streak_lost { previous_length }` — fired once when the app observes a broken run (previous
  current-streak > 1 collapsing to 0/1). Fire-once guard per break (persist last-known streak
  alongside `ACTIVITY_DAYS` to detect the transition).
- No dates-of-activity lists in event props (counts only).

## 4. Tests

- `computeStreak`: consecutive runs; gap of 1 bridged (freeze) and reported; two gaps in 7 days →
  break; gaps 8+ days apart both bridged; today-inactive ⇒ `atRisk` + streak preserved through
  yesterday; empty history; longest vs current divergence; month/year boundaries; input
  unsorted/duplicated tolerated.
- `markSectionComplete` hook: appends today once per day (idempotent), never throws into the caller,
  signed-out ⇒ local-only (`'skipped'` not a failure) — extend `progressStore.test.ts` mocks.
- Service: null-on-error contract; merge never runs on null.
- Trim logic: `longestEver` survives trimming.

## 5. Out-of-repo actions

Steps that cannot be done from this codebase — external systems only. Each gets a pending entry in
`docs/OPS_STATE.md` in this PR, ticked with a date when performed.

1. **Supabase dev — apply the migration + regenerate types** *(before the service code merges, or
   type-checks fail)*: with the CLI linked to the dev project only, `supabase db push` for
   `add_daily_activity`, then `npm run gen:supabase-types` and commit the updated
   `src/types/supabase.ts`.
2. **Supabase prod — apply the migration at release time** *(must be applied BEFORE the v1.6.0 binary
   goes live; without it every `recordActivity` upsert returns `'failed'`, streaks silently stay
   local-only, and the repeated-failure threshold spams Sentry)*: via `scripts/db-push-prod.sh` only
   (it enforces a same-day backup). Verify RLS afterwards with the standard anon/other-user probe.
3. **Supabase (both envs) — delete-account coverage**: confirm the `delete-account` edge function's
   cleanup covers `daily_activity` — the FK is `ON DELETE CASCADE` via `auth.users`, so deleting the
   auth user suffices; verify (don't assume) during the release checklist, and update the function's
   docs if it enumerates tables. No redeploy expected.
4. **PostHog — retention dashboard**: add a streak card (`streak_day_recorded` trend +
   `streak_lost` counts, filtered to `environment = production`). Not required for the feature to
   work; required for it to be measured. No flags.
5. **Sentry**: nothing to configure. After release, watch for `recordActivity` repeated-failure
   reports (the signal that out-of-repo action 2 was missed or RLS is wrong).
6. **Superwall**: nothing.
7. **App Store Connect**: nothing — activity data is product-interaction data, already declared in
   the privacy manifest; no App Privacy answer changes.

## 6. Device-test checklist — create `docs/releases/v1.6.0.md`

Frozen runbook instance (SPEC-14 convention: this block + copied standard checklist; ticked with
evidence at release time):

- [ ] Complete a section → "Day 1" moment; chip shows 🔥1; second section same day does not increment.
- [ ] Change device date +1 day, complete a section → 🔥2; +2 days without activity → streak shows
  broken per the freeze rule (one skipped day bridged, two not).
- [ ] Airplane mode: section completion still records the day locally; on reconnect the row appears in
  dev Supabase.
- [ ] Wipe + reinstall + sign in → streak restored from DB.
- [ ] Demo user / signed-out flows: no errors, no Sentry noise (skipped-not-failed).
- [ ] `atRisk` state: next local day, before any activity, chip shows the dimmed flame.
- [ ] Delete account → `daily_activity` rows gone (dev).
- [ ] Standard paywall/lesson regression (sandbox Apple ID).

## 7. Version boundary — v1.6.0 closes the train

After merge to `develop`: `./scripts/bump-version.sh 1.6.0 <next monotonic build int>` → commit → tag
`rc/1.6.0` → push. Build later from the tag, only after v1.5.0 is live and healthy (strict order).
Copy this spec to `docs/specs/SPEC-19-streak-system.md`.

## 8. Acceptance criteria

- [ ] `daily_activity` migration (RLS mirroring `lesson_progress`, insert-idempotent) applied to dev;
  types regenerated; every §5 item entered as pending in `docs/OPS_STATE.md`; prod push listed in the
  runbook, not executed.
- [ ] Streak derived by a pure, exhaustively-tested `computeStreak` with the one-bridge-per-rolling-
  7-days freeze rule; `today` always injected.
- [ ] Recording rides `markSectionComplete` — local-first, fire-and-forget, `'ok'`/`'skipped'`/
  `'failed'` semantics, null-fetch-means-no-merge; UI never blocked, no user-facing sync errors.
- [ ] Sign-in reconciliation restores streaks on a fresh install (set-union, non-destructive).
- [ ] Streak chip + at-risk state + first-activity-of-day celebration shipped from theme tokens;
  Reduce Motion respected; no notifications.
- [ ] Events per §3 via `safeCapture`, counts only; screens still never import Supabase.
- [ ] `docs/releases/v1.6.0.md` committed; spec copied to `docs/specs/`; version bumped + `rc/1.6.0`
  tagged on `develop`; `tsc`/lint (no new)/jest/CI green; adversarial review clean.

## 9. DECISION points

1. **Freeze generosity** — baked: one automatic bridge per rolling 7 days, no inventory/UI.
   Alternatives (earnable freezes, streak-repair purchase — a monetization surface) are future
   product calls.
2. **What counts as activity** — baked: lesson section completion only. Whether app-opens or future
   non-lesson actions should count can widen later (one more call site into the same
   `recordActivity`).
3. **Streak surfacing beyond LearnScreen** — home-tab placement, widgets, or notification pairing
   (ties to the parked SPEC-11 decision) are out of scope; decide when notifications unpark.
4. **Timezone posture** — baked: device-local dates, travel edge accepted. Revisit only if support
   tickets appear.
