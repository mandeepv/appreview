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
| Supabase | dev migration `add_onboarding_variant_columns` [SPEC-15 §4.4] | **DONE 2026-07-19** — `20260711000000_add_onboarding_variant_columns.sql` applied to dev (`onboarding_variant text`, `variant_b_answers jsonb` on `user_profiles`, nullable, RLS untouched); `src/types/supabase.ts` regenerated + committed (both columns typed), tsc clean. Prod still pending (row below) | 2026-07-19 | `supabase migration list --linked` (dev) |
| Supabase | prod migration `add_onboarding_variant_columns` [SPEC-15 §4.5] | **pending** — MUST be applied via `scripts/db-push-prod.sh` BEFORE the v1.3.0 binary goes live, or every variant-B onboarding save writes to missing columns and fails. Never `supabase link` to prod manually | unverified | `supabase migration list --linked` (prod) |
| Supabase | delete-account deployed version | **SPEC-FIX-06** (ES256/JWKS + HS256 dual-path) deployed to **BOTH dev + prod 2026-07-11**. Dev verified on-device (200, account deleted); prod verified reachable (401 on no-auth/tampered) | 2026-07-11 | Supabase → Edge Functions |
| Supabase | dev auth signing system | **asymmetric ES256** (new JWT Signing Keys) — JWKS advertises one ES256 key | 2026-07-11 | `/auth/v1/.well-known/jwks.json` |
| Supabase | prod auth signing system | **asymmetric ES256** (same as dev) — so prod delete-account needs NO JWT_SECRET (verifies via JWKS) | 2026-07-11 | prod `/auth/v1/.well-known/jwks.json` |
| Supabase | gateway `verify_jwt` | on (per `config.toml`); live-state unverified | unverified | `supabase/config.toml` + dashboard |
| Supabase | `JWT_SECRET` set | **dev: yes** (set 2026-07-11; now optional there — dev is ES256/JWKS) / prod: no | 2026-07-11 | `supabase secrets list` |
| Supabase | SPEC-16 launch/gate work (now in v1.3.0) | **no change required** — no migrations, no edge-function changes, no type regeneration. NOTE 2026-07-19: SPEC-16 (splash/loading) folded into **v1.3.0**, not a separate 1.4.0 | 2026-07-11 | — |
| Supabase | SPEC-17 onboarding UX system [SPEC-17 §4.3] (now in v1.3.0) | **no change required** — presentation/interaction only; onboarding answer values, saved payload, and `user_profiles` shape are all unchanged. No migrations, no type regeneration, no edge-function changes. NOTE 2026-07-19: folded into **v1.3.0** | 2026-07-11 | — |

## Superwall

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Superwall | `subscription_gate` | Gated, 100%, audience = "unsubscribed users / no active entitlements", no match-limit — **re-verified in dashboard 2026-07-11** (SPEC-FIX-10 F8) | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | `show_paywall` | kept for the v1.0.0 cohort | unverified | Superwall dashboard → Placements |
| Superwall | dashboard-change habit | screenshot on every change (F5 pointer) | — | `docs/dashboard-snapshots/` |
| Superwall | SPEC-16 launch/gate work (now in v1.3.0) | **no change required** — gate logic untouched; do NOT modify `subscription_gate` placement/audience | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | SPEC-17 onboarding UX system [SPEC-17 §4.5] (now in v1.3.0) | **no change required** — onboarding presentation only; the paywall/gate path is untouched | 2026-07-11 | Superwall dashboard → Placements |

## Sentry

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Sentry | new-issue alert rule | prod-scoped, notifies owner email — **VERIFIED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike-regression rule | "Spike / regression (prod)" — escalation + resolved→unresolved → owner email — **CREATED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike protection | **ON** — VERIFIED | 2026-07-10 | Sentry → Settings → Quotas |
| Sentry | client-key rate limit | 100 events per 1 hour — SET | 2026-07-10 | Sentry → Settings → Client Keys |
| Sentry | sourcemaps for live build | 3 uploads present for release 1.1.0 (dist 9) — VERIFIED | 2026-07-10 | Sentry → Releases → artifacts |
| Sentry | SPEC-16 `expo-splash-screen` calls (now in v1.3.0) | **pending post-release check** — no config change; after **v1.3.0** ships confirm no new error class from `preventAutoHideAsync`/`hideAsync` (they're try/caught — a spike means the guard is being hit) | unverified | Sentry → Issues (env=prod, release 1.3.0) |
| Sentry | SPEC-17 onboarding UX system [SPEC-17 §4.4] | **no change required** — no error-path or config change | 2026-07-11 | — |

## PostHog

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| PostHog | internal-user filter | not done | unverified | PostHog → Settings → Project |
| PostHog | dashboards | none yet (Appendix C, after v1.2.0) | unverified | PostHog → Dashboards |
| PostHog | person-deletion on account delete | not built (7.2 parked) | unverified | — |
| PostHog | `onboarding-flow` feature flag [SPEC-15 §4.1] | **CREATED 2026-07-19** — multivariate, key `onboarding-flow`, variants `control`/`variant_b`, 100% release condition, enabled. Currently **50/50 (TEST split)** so both A-with-fixes and B are reachable on the dev build. ⚠️ Single PostHog project (no separate dev/prod) — this same flag serves prod. See the two ordered ship steps below (ship-dark, then ramp) | 2026-07-19 | PostHog → Feature Flags → `onboarding-flow` |
| PostHog | **STEP 1 — flip variant_b → 0% BEFORE v1.3.0 submission** [ship gate] | **pending (SHIP BLOCKER)** — set `variant_b` to **0%** (control 100%) before the review build is submitted, and keep it there **until Apple approves**. TWO reasons: (a) variant B is 22 screens — a reviewer bucketed into it (50/50) must walk the whole flow before reaching EITHER reviewer test path (the 7-tap demo bypass on AuthScreen OR the sandbox purchase at the paywall both sit AFTER onboarding), risking a give-up/2.1 rejection; (b) placeholder proof claims/testimonials/stubbed rating button must not reach the reviewer. Shipping dark means the reviewer always gets the known, short variant A. The binary still CARRIES variant B (dormant) — no rebuild needed to turn it on later | unverified | PostHog → Feature Flags → `onboarding-flow` |
| PostHog | **STEP 2 — ramp variant_b → 50/50 AFTER approval** [SPEC-15 §4.2] | **pending** — only after: (1) Apple approves v1.3.0, (2) all variant-B placeholders are replaced with real content + the Rate button is wired, (3) v1.3.0 is the dominant installed version. Then flip variant_b 0%→50% (dashboard only, no build) and add the ship annotation. variant_b→0% remains the kill switch | unverified | PostHog → Feature Flags |
| PostHog | onboarding A/B experiment dashboard [SPEC-15 §4.3] | **pending** — funnel `welcome_cta_tapped`→`onboarding_step_completed`→`auth_succeeded`→`paywall_presented`→`subscription_purchased` broken down by `onboarding_variant`, env=production; + `onboarding_variant_assigned` by `source` trend | unverified | PostHog → Dashboards |
| PostHog | launch-health events [SPEC-16 §4.1] (now in v1.3.0) | **optional/pending** — no flag needed. At **v1.3.0** release, optionally add `plan_theater_shown` (per-user; a repeat = returning-launch regression) + `gate_wait_exceeded` to a launch-health dashboard so the "theater exactly once per user" signal is watched | unverified | PostHog → Dashboards |
| PostHog | SPEC-17 flag-state check before merge [SPEC-17 §4.2] | **OBSOLETE 2026-07-19** — this row guarded against merging the onboarding-UX redesign mid-experiment. Moot now: SPEC-16+17 are folded into v1.3.0 and ship *together with* the experiment framework, before any ramp. There is no in-flight experiment to poison — A (control) and B both get the new UX from day one. No action | 2026-07-19 | — |
| PostHog | v1.3.0 ship annotation [SPEC-17 §4.1] | **pending** — on the day **v1.3.0** rolls out, add a prod annotation: "Onboarding UX system + A/B framework shipped (v1.3.0); both arms get the new UX". Funnel step names/semantics unchanged, but drop-off *levels* will move — the annotation lets any A/B readout span the release cleanly. Tick with the date when added | unverified | PostHog → Annotations (prod) |
| Variant B copy | proof-number sign-off | **pending (BLOCKS ramp)** — variant B's full onboarding (built 2026-07-19) ships with placeholder-but-hard-hitting proof stats: "83% of parents", "12 lessons", "~2 weeks to first result", "100,000+ parents", + two testimonials (Sarah/James). Every one must be confirmed real/defensible or softened to an unfalsifiable form BEFORE `onboarding-flow` variant_b ramps > 0% — inflated/unverifiable claims (esp. "100,000+" and named testimonials) are an App Review rejection risk. Checklist at bottom of `docs/specs/variant-b-onboarding-copy.md` | unverified | `docs/specs/variant-b-onboarding-copy.md` |
| Variant B rating | native review prompt STUBBED | **follow-up (not blocking)** — `VBRating` screen fires the ASO review-request beat but the native prompt is stubbed: `expo-store-review` is NOT installed, so "Rate Kinderwell" only logs intent + advances. Wire `StoreReview.requestReview()` in a follow-up (adds a native dep → needs a fresh eas build); until then the beat still primes but collects no reviews | 2026-07-19 | `grep expo-store-review package.json` |

## App Store Connect

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| App Store Connect | live version / build | **v1.2.0 (build 11)** — released (owner-confirmed); marker tag `appstore-live-v1.2.0` on `39badd3` | 2026-07-19 | ASC → App → App Store |
| Build deps (v1.3.0) | native module added then REMOVED | **`@react-native-picker/picker` was added 2026-07-19 then removed 2026-07-20** — the age wheel picker it powered was reverted to the +/- CounterSelector (wheel looked dated; NameAge already converts at 98.65%/~4s, no benefit). `AgeWheelPicker.tsx` deleted, dep uninstalled. NET: v1.3.0 adds **no new native module** vs v1.2.0 on this axis. (Other v1.3.0 native surface — Reanimated/SVG/haptics for the loading theater — was already present.) A fresh `eas build` is still needed for the JS/feature changes, just not for this picker | 2026-07-20 | `grep react-native-picker package.json` (absent) |
| App Store Connect | phased-rollout state | **7-day phased release ON** (owner-confirmed 2026-07-19) — Phase 11 monitoring window active; watch crash-free % / Sentry, numeric pause thresholds per RELEASE_CHECKLIST Phase 11 | 2026-07-19 | ASC → App → Phased Release |
| Supabase | prod test-user cleanup (v1.2.0) | **done** — 1 test account deleted from prod Auth after release (RELEASE_CHECKLIST Phase 10) | 2026-07-19 | Supabase → Authentication → Users |
| App Store Connect | Small Business Program | **ENROLLED** (owner) | 2026-07-09 | ASC → Agreements |
| App Store Connect | ToS link in metadata | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | DSA trader status | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | offer codes | not set up (F2 skipped) | unverified | ASC → Subscriptions |
| App Store Connect | SPEC-17 onboarding UX system [SPEC-17 §4.6] (now in v1.3.0) | **no change required** — nothing spec-specific; **v1.3.0** release actions live in the runbook | 2026-07-11 | — |

## GitHub

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| GitHub | canonical repo private | yes (owner) | unverified | GitHub → repo settings |
| GitHub | branch protection / required checks | **SKIPPED** — paid feature on private repos (owner decision; compensating controls: PR-triggered CI + never-merge-on-red) | 2026-07-10 | GitHub → Settings → Branches |
| GitHub | public `appreview` copy | pending deletion | unverified | GitHub → appreview repo |

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
