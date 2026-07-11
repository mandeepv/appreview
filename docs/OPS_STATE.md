# OPS_STATE — living register of external state

Code is trackable from git; **non-code state is not** (DB migrations applied, dashboard settings, secrets, App Store Connect config). This is the one place that records what is currently true *outside* the repo.

**Rules:**
- **Update the row whenever you touch the setting.** A stale "Last verified" is a prompt to re-check, NOT a guess.
- **`unverified` is the honest default.** Never invent a value. If you don't know, it stays `unverified` until the owner confirms it in a sitting.
- Dashboard screenshots (`docs/dashboard-snapshots/`) are this doc's attachments.
- AI review sessions verify claims against THIS doc instead of asking the owner.

---

## Supabase

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Supabase | prod/dev project refs | see `DEV_PROD_ENVIRONMENTS.md` | unverified | `DEV_PROD_ENVIRONMENTS.md` |
| Supabase | prod password last rotated | **never** — risk accepted by owner | 2026-07-09 | Supabase dashboard → Settings → Database |
| Supabase | last manual backup run | 2026-07-11 (pre-v1.2.0-migration; `backups/prod_20260711T073402Z_*.sql`, schema+data via pg_dump) | 2026-07-11 | Supabase dashboard → Database → Backups |
| Supabase | last restore drill | **never** | unverified | — |
| Supabase | prod migrations applied through | **`20260710010000`** — `completed_sections` [SPEC-13] + `rls_update_with_check` [SPEC-FIX-04 R4] applied to prod 2026-07-11; `completed_sections` column verified present via prod REST (HTTP 200) | 2026-07-11 | `supabase migration list --linked` |
| Supabase | prod backup mechanism | pg_dump 17 direct (no Docker) via `scripts/backup-prod.sh`; needs `PROD_DB_URL` in gitignored `.env.prod` | 2026-07-11 | `scripts/backup-prod.sh` |
| Supabase | dev migration `add_onboarding_variant_columns` [SPEC-15 §4.4] | **pending** — `20260711000000_add_onboarding_variant_columns.sql` (adds `onboarding_variant text`, `variant_b_answers jsonb` to `user_profiles`, nullable, RLS untouched). Apply to dev (`supabase db push`) + regenerate `src/types/supabase.ts`, then tick with a date | unverified | `supabase migration list --linked` (dev) |
| Supabase | prod migration `add_onboarding_variant_columns` [SPEC-15 §4.5] | **pending** — MUST be applied via `scripts/db-push-prod.sh` BEFORE the v1.3.0 binary goes live, or every variant-B onboarding save writes to missing columns and fails. Never `supabase link` to prod manually | unverified | `supabase migration list --linked` (prod) |
| Supabase | delete-account deployed version | **SPEC-FIX-06** (ES256/JWKS + HS256 dual-path) deployed to **BOTH dev + prod 2026-07-11**. Dev verified on-device (200, account deleted); prod verified reachable (401 on no-auth/tampered) | 2026-07-11 | Supabase → Edge Functions |
| Supabase | dev auth signing system | **asymmetric ES256** (new JWT Signing Keys) — JWKS advertises one ES256 key | 2026-07-11 | `/auth/v1/.well-known/jwks.json` |
| Supabase | prod auth signing system | **asymmetric ES256** (same as dev) — so prod delete-account needs NO JWT_SECRET (verifies via JWKS) | 2026-07-11 | prod `/auth/v1/.well-known/jwks.json` |
| Supabase | gateway `verify_jwt` | on (per `config.toml`); live-state unverified | unverified | `supabase/config.toml` + dashboard |
| Supabase | `JWT_SECRET` set | **dev: yes** (set 2026-07-11; now optional there — dev is ES256/JWKS) / prod: no | 2026-07-11 | `supabase secrets list` |
| Supabase | SPEC-16 launch/gate work | **no change required** — no migrations, no edge-function changes, no type regeneration (recorded so external state stays tracked) | 2026-07-11 | — |
| Supabase | SPEC-17 onboarding UX system [SPEC-17 §4.3] | **no change required** — presentation/interaction only; onboarding answer values, saved payload, and `user_profiles` shape are all unchanged. No migrations, no type regeneration, no edge-function changes | 2026-07-11 | — |
| Supabase | SPEC-18 lesson locking [SPEC-18 §4.2] | **no change required** — no schema change; flow lessons 1–4 sync rides the existing `lesson_progress` table + RLS (new AsyncStorage keys only, picked up by the existing factory). No type regeneration, no edge-function changes | 2026-07-12 | — |
| Supabase | dev migration `add_daily_activity` [SPEC-19 §5.1] | **pending** — `20260712000000_add_daily_activity.sql` (facts table `daily_activity (user_id, activity_date PK)`, RLS mirroring `lesson_progress`, insert-only, ON DELETE CASCADE). Apply to dev (`supabase db push`) + regenerate `src/types/supabase.ts` (the PR hand-added the type to keep it compiling — the regen must confirm the identical shape), then tick. MUST land before the service code is exercised | unverified | `supabase migration list --linked` (dev) |
| Supabase | prod migration `add_daily_activity` [SPEC-19 §5.2] | **pending** — MUST be applied via `scripts/db-push-prod.sh` (enforces a same-day backup) BEFORE the v1.6.0 binary goes live, or every `recordActivity` upsert returns `'failed'`, streaks silently stay local-only, and the repeated-failure threshold spams Sentry. Verify RLS afterwards with the standard anon/other-user probe | unverified | `supabase migration list --linked` (prod) |
| Supabase | delete-account covers `daily_activity` [SPEC-19 §5.3] | **pending verify (no redeploy expected)** — the FK is `ON DELETE CASCADE` via `auth.users`, so deleting the auth user removes activity rows automatically. Confirm during the release checklist (don't assume); update the delete-account function docs if it enumerates tables | unverified | dev: delete account → query `daily_activity` |
| Supabase | SPEC-19 streak work | **schema change (above); no edge-function change** — recording rides the existing sync posture; only the new table + regenerated types | 2026-07-12 | — |

## Superwall

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Superwall | `subscription_gate` | Gated, 100%, audience = "unsubscribed users / no active entitlements", no match-limit — **re-verified in dashboard 2026-07-11** (SPEC-FIX-10 F8) | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | `show_paywall` | kept for the v1.0.0 cohort | unverified | Superwall dashboard → Placements |
| Superwall | dashboard-change habit | screenshot on every change (F5 pointer) | — | `docs/dashboard-snapshots/` |
| Superwall | SPEC-16 launch/gate work | **no change required** — gate logic untouched; do NOT modify `subscription_gate` placement/audience | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | SPEC-17 onboarding UX system [SPEC-17 §4.5] | **no change required** — onboarding presentation only; the paywall/gate path is untouched | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | SPEC-18 lesson locking [SPEC-18 §4.4] | **no change required** — locking is inside Root, behind the existing gate; do NOT touch the `subscription_gate` placement or audience | 2026-07-12 | Superwall dashboard → Placements |
| Superwall | SPEC-19 streak system [SPEC-19 §5.6] | **no change required** — streak is inside Root, behind the existing gate | 2026-07-12 | Superwall dashboard → Placements |

## Sentry

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Sentry | new-issue alert rule | prod-scoped, notifies owner email — **VERIFIED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike-regression rule | "Spike / regression (prod)" — escalation + resolved→unresolved → owner email — **CREATED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike protection | **ON** — VERIFIED | 2026-07-10 | Sentry → Settings → Quotas |
| Sentry | client-key rate limit | 100 events per 1 hour — SET | 2026-07-10 | Sentry → Settings → Client Keys |
| Sentry | sourcemaps for live build | 3 uploads present for release 1.1.0 (dist 9) — VERIFIED | 2026-07-10 | Sentry → Releases → artifacts |
| Sentry | SPEC-16 `expo-splash-screen` calls | **pending post-release check** — no config change; after v1.4.0 ships confirm no new error class from `preventAutoHideAsync`/`hideAsync` (they're try/caught — a spike means the guard is being hit) | unverified | Sentry → Issues (env=prod, release 1.4.0) |
| Sentry | SPEC-17 onboarding UX system [SPEC-17 §4.4] | **no change required** — no error-path or config change | 2026-07-11 | — |
| Sentry | SPEC-18 lessons-1–4 sync [SPEC-18 §4.3] | **no config change; post-release watch** — after v1.5.0 ships confirm the lessons-1–4 sync path adds no `lesson progress sync repeatedly failing` reports (it reuses the existing threshold logic) | unverified | Sentry → Issues (env=prod, release 1.5.0) |
| Sentry | SPEC-19 streak sync [SPEC-19 §5.5] | **no config change; post-release watch** — after v1.6.0 ships watch for `streak activity sync repeatedly failing` reports. Any such report is the signal that the prod `daily_activity` migration (OPS §5.2) was missed or RLS is wrong | unverified | Sentry → Issues (env=prod, release 1.6.0) |

## PostHog

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| PostHog | internal-user filter | not done | unverified | PostHog → Settings → Project |
| PostHog | dashboards | none yet (Appendix C, after v1.2.0) | unverified | PostHog → Dashboards |
| PostHog | person-deletion on account delete | not built (7.2 parked) | unverified | — |
| PostHog | `onboarding-flow` feature flag [SPEC-15 §4.1] | **pending** — multivariate `control`/`variant_b`, 100% release condition, **variant_b at 0%** (all control). MUST exist before v1.3.0 ships or every user silently gets control. Mirror in dev for testing | unverified | PostHog → Feature Flags → `onboarding-flow` |
| PostHog | `onboarding-flow` ramp to 50/50 [SPEC-15 §4.2] | **pending** — flip only after placeholder copy is replaced AND v1.3.0 is dominant. variant_b→0% is the kill switch (no build). Annotate at ramp start/stop | unverified | PostHog → Feature Flags |
| PostHog | onboarding A/B experiment dashboard [SPEC-15 §4.3] | **pending** — funnel `welcome_cta_tapped`→`onboarding_step_completed`→`auth_succeeded`→`paywall_presented`→`subscription_purchased` broken down by `onboarding_variant`, env=production; + `onboarding_variant_assigned` by `source` trend | unverified | PostHog → Dashboards |
| PostHog | launch-health events [SPEC-16 §4.1] | **optional/pending** — no flag needed for SPEC-16 to work. At release, optionally add `plan_theater_shown` (per-user; a repeat = returning-launch regression) + `gate_wait_exceeded` to a launch-health dashboard so the "theater exactly once per user" signal is watched | unverified | PostHog → Dashboards |
| PostHog | SPEC-17 flag-state check before merge [SPEC-17 §4.2] | **pending (gates the merge)** — before merging SPEC-17 to `develop`, verify the `onboarding-flow` flag's ramp. If `variant_b > 0%` and a test run is in progress, HOLD the merge or explicitly accept restarting the experiment clock (DECISION 1). Both arms share the migrated components so the lift applies equally, but a mid-run visual discontinuity still poisons the read | unverified | PostHog → Feature Flags → `onboarding-flow` |
| PostHog | SPEC-17 ship annotation [SPEC-17 §4.1] | **pending** — on the day v1.4.0 rolls out, add a prod project annotation: "Onboarding UX system shipped (SPEC-17); both arms affected". Funnel step names/semantics are unchanged, but drop-off *levels* will move — the annotation lets any A/B readout spanning the release segment before/after. Tick with the date when added | unverified | PostHog → Annotations (prod) |
| PostHog | lesson-lock demand insight [SPEC-18 §4.1] | **optional/pending** — not required for locking to work; makes it observable. Add a trend on `lesson_locked_tapped` broken down by `lesson_id`, filtered `environment = production`. A high count on one lesson = a pacing wall worth revisiting. No flag work | unverified | PostHog → Insights |
| PostHog | streak retention dashboard [SPEC-19 §5.4] | **optional/pending** — not required for the feature to work; required for it to be measured. Add a streak card: `streak_day_recorded` trend + `streak_lost` counts, filtered `environment = production`. No flags | unverified | PostHog → Dashboards |

## App Store Connect

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| App Store Connect | live version / build | unverified | unverified | ASC → App → App Store |
| App Store Connect | phased-rollout state | unverified | unverified | ASC → App → Phased Release |
| App Store Connect | Small Business Program | **ENROLLED** (owner) | 2026-07-09 | ASC → Agreements |
| App Store Connect | ToS link in metadata | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | DSA trader status | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | offer codes | not set up (F2 skipped) | unverified | ASC → Subscriptions |
| App Store Connect | SPEC-17 onboarding UX system [SPEC-17 §4.6] | **no change required** — nothing spec-specific; v1.4.0 release actions live in the runbook | 2026-07-11 | — |
| App Store Connect | SPEC-18 lesson locking [SPEC-18 §4.5] | **no change required** — nothing spec-specific; standard v1.5.0 release actions live in the runbook | 2026-07-12 | — |
| App Store Connect | SPEC-19 streak system [SPEC-19 §5.7] | **no change required** — activity data is product-interaction data already declared in the privacy manifest; no App Privacy answer changes | 2026-07-12 | — |

## GitHub

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| GitHub | canonical repo private | yes (owner) | unverified | GitHub → repo settings |
| GitHub | branch protection / required checks | **SKIPPED** — paid feature on private repos (owner decision; compensating controls: PR-triggered CI + never-merge-on-red) | 2026-07-10 | GitHub → Settings → Branches |
| GitHub | public `appreview` copy | pending deletion | unverified | GitHub → appreview repo |
| GitHub | build-number policy | **finalized at release time** (SPEC-FIX-11 R1/R7): `rc/x.y.z` tags mark CODE checkpoints; the final bare-integer build is assigned when cutting `release/x.y.z` via `bump-version.sh`, globally monotonic in upload order (INVARIANT #12). Train so far: 1.2.0=11, 1.3.0=15, develop HEAD re-bumped to 16; 1.4.0/1.5.0/1.6.0 finals TBD at release. See `VERSION_MANAGEMENT.md` → "Branching & release train" | 2026-07-12 | `git ls-remote --tags origin` |
| GitHub | `rc/*` release checkpoints | **pending push** (SPEC-FIX-11 R1): `rc/1.3.0` (on `release/1.3.0`), `rc/1.4.0`, `rc/1.5.0`, `rc/1.6.0` created + pushed to origin (and appreview). Tick with date when pushed | unverified | `git ls-remote --tags origin` |

## Apple

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Apple | SIWA key expiry | per `APPLE_JWT_ROTATION.md` calendar | unverified | `APPLE_JWT_ROTATION.md` |
| Apple | Apple ID recovery hardening | declined by owner (F6) | 2026-07-10 | — |

## Accepted risks (owner decisions — revisit only on the stated trigger)

| Risk accepted | Decided | Compensating control / revisit trigger |
|---|---|---|
| EU analytics tracking without a consent gate | 2026-07-09 | Data already minimal (no PII, pseudonymous IDs, deletion path). Revisit at 5K MAU, first EU data-subject request, or any regulator/App-Review privacy contact |
| Prod DB password never rotated (leaked in old public git history) | 2026-07-09 | Apps use the anon key, not the DB password. Revisit if the repo history is ever shared again |
| No 2FA/recovery hardening on Apple ID & co. | 2026-07-09 | None — accepted as-is |
| No support playbook (tickets handled ad hoc) | 2026-07-09 | Revive if ticket volume appears |
| No mechanical merge-blocking on `main` (GitHub paywalls branch protection on private repos) | 2026-07-10 | The 4 blocking checks (+1 advisory `audit` job) run on every PR to main + "never merge on red" working rule. Revisit on a GitHub Team upgrade |
| CI runs on PRs + manual release gate only (not every push) | 2026-07-09 | Metered Actions minutes; local tsc/lint/test before merges; manual CI run is a release-checklist step |
| Offline first-v1.2.0-launch for a paying v1.1.0 user (SPEC-FIX-08) | 2026-07-11 | A paying v1.1.0 user whose FIRST v1.2.0 launch is offline has the legacy-unowned flag cleared (SPEC-FIX-08 migration) and sits at the retry/escape-hatch screen until connectivity returns. One launch wide, payers-only — inherent cost of the user-binding security fix. Revisit trigger: support tickets about it |
