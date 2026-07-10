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
| Supabase | last manual backup run | unverified | unverified | Supabase dashboard → Database → Backups |
| Supabase | last restore drill | **never** | unverified | — |
| Supabase | prod migrations applied through | unverified (**pending** `completed_sections`) | unverified | `supabase migration list --linked` |
| Supabase | delete-account deployed version | pre-hardening (**SPEC-03 version NOT deployed**) | unverified | Supabase → Edge Functions |
| Supabase | gateway `verify_jwt` | on (per `config.toml`); live-state unverified | unverified | `supabase/config.toml` + dashboard |
| Supabase | `JWT_SECRET` set | dev: no / prod: no | unverified | `supabase secrets list` |

## Superwall

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Superwall | `subscription_gate` | gated, 100%, audience = unsubscribed | pre-v1.1.0-release | Superwall dashboard → Placements |
| Superwall | `show_paywall` | kept for the v1.0.0 cohort | unverified | Superwall dashboard → Placements |
| Superwall | dashboard-change habit | screenshot on every change (F5 pointer) | — | `docs/dashboard-snapshots/` |

## Sentry

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Sentry | alert rules prod-scoped | unverified | unverified | Sentry → Alerts |
| Sentry | spike alert | unverified | unverified | Sentry → Alerts |
| Sentry | quota/spike protection + per-key rate limit | unverified | unverified | Sentry → Settings |
| Sentry | sourcemaps for live build | unverified | unverified | Sentry → release artifacts |

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
| GitHub | branch protection / required checks | not enabled | unverified | GitHub → Settings → Branches |
| GitHub | public `appreview` copy | pending deletion | unverified | GitHub → appreview repo |

## Apple

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Apple | SIWA key expiry | per `APPLE_JWT_ROTATION.md` calendar | unverified | `APPLE_JWT_ROTATION.md` |
| Apple | Apple ID recovery hardening | declined by owner (F6) | 2026-07-10 | — |
