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
| Supabase | delete-account deployed version | **SPEC-FIX-06** (ES256/JWKS + HS256 dual-path) deployed to **BOTH dev + prod 2026-07-11**. Dev verified on-device (200, account deleted); prod verified reachable (401 on no-auth/tampered) | 2026-07-11 | Supabase → Edge Functions |
| Supabase | dev auth signing system | **asymmetric ES256** (new JWT Signing Keys) — JWKS advertises one ES256 key | 2026-07-11 | `/auth/v1/.well-known/jwks.json` |
| Supabase | prod auth signing system | **asymmetric ES256** (same as dev) — so prod delete-account needs NO JWT_SECRET (verifies via JWKS) | 2026-07-11 | prod `/auth/v1/.well-known/jwks.json` |
| Supabase | gateway `verify_jwt` | on (per `config.toml`); live-state unverified | unverified | `supabase/config.toml` + dashboard |
| Supabase | `JWT_SECRET` set | **dev: yes** (set 2026-07-11; now optional there — dev is ES256/JWKS) / prod: no | 2026-07-11 | `supabase secrets list` |

## Superwall

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Superwall | `subscription_gate` | gated, 100%, audience = unsubscribed | pre-v1.1.0-release | Superwall dashboard → Placements |
| Superwall | `show_paywall` | kept for the v1.0.0 cohort | unverified | Superwall dashboard → Placements |
| Superwall | dashboard-change habit | screenshot on every change (F5 pointer) | — | `docs/dashboard-snapshots/` |

## Sentry

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Sentry | new-issue alert rule | prod-scoped, notifies owner email — **VERIFIED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike-regression rule | "Spike / regression (prod)" — escalation + resolved→unresolved → owner email — **CREATED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike protection | **ON** — VERIFIED | 2026-07-10 | Sentry → Settings → Quotas |
| Sentry | client-key rate limit | 100 events per 1 hour — SET | 2026-07-10 | Sentry → Settings → Client Keys |
| Sentry | sourcemaps for live build | 3 uploads present for release 1.1.0 (dist 9) — VERIFIED | 2026-07-10 | Sentry → Releases → artifacts |

## PostHog

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| PostHog | internal-user filter | not done | unverified | PostHog → Settings → Project |
| PostHog | dashboards | none yet (Appendix C, after v1.2.0) | unverified | PostHog → Dashboards |
| PostHog | person-deletion on account delete | not built (7.2 parked) | unverified | — |

## App Store Connect

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| App Store Connect | live version / build | unverified | unverified | ASC → App → App Store |
| App Store Connect | phased-rollout state | unverified | unverified | ASC → App → Phased Release |
| App Store Connect | Small Business Program | **ENROLLED** (owner) | 2026-07-09 | ASC → Agreements |
| App Store Connect | ToS link in metadata | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | DSA trader status | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | offer codes | not set up (F2 skipped) | unverified | ASC → Subscriptions |

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
