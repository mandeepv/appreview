# Best Practices & Gap Analysis — Kinderwell

**Purpose:** honest inventory of what Kinderwell is doing well, what it's not, and — since real users pay real money — what to fix in what order.

**Last reviewed:** July 1, 2026
**Live version at time of review:** v1.0.0 (build 8)

## How to use this doc

- Priorities: 🔴 High (this month), 🟡 Medium (next quarter), 🟢 Nice to have
- Each item has: **Why it matters**, **Effort**, **What to do**
- Effort ratings: **XS** (< 1h), **S** (1–4h), **M** (half day to full day), **L** (multi-day)
- When you finish an item, move it to the "Done" section at the bottom with the date

## Where we are today — snapshot

**Good:**
- Dev/prod Supabase separation (as of 2026-07-01)
- RLS enabled on all tables
- Auth providers (Apple, Google) working
- Release tagging process documented (`RELEASE_PROCESS.md`)
- Environment guide documented (`DEV_PROD_ENVIRONMENTS.md`)
- Sandbox StoreKit via debug builds — no risk of real charges in dev
- Delete-account Edge Function deployed to both envs

**Not good:**
- No schema migration tracking — changes are ad-hoc dashboard SQL
- No error tracking / crash reporting on prod
- No automated tests, no CI checks
- Version numbers spread across 3 files, currently out of sync (`app.json` build 7 vs `Info.plist` build 8)
- No branch protection on `main`
- Backup / restore strategy unverified
- Same DB password on dev and prod
- No emergency kill switch for bad releases
- No PR-based workflow

---

## 🔴 High priority — do this month

### ~~1. Migration tracking with `supabase/migrations/`~~ ✅ DONE 2026-07-01

Baseline saved at `supabase/migrations/20260101000000_initial_schema.sql`. All future schema changes go through the migrations folder. See `DEV_PROD_ENVIRONMENTS.md` → "Migration tracking" for the workflow.

---

### 2. Verify backups exist and test a restore

**⚠️ CURRENT STATUS (2026-07-04): PROD HAS ZERO BACKUPS. Deferred by user, accepting risk.**

**The reality on Supabase Free tier:** no automatic backups at all. Zero retention. If prod DB corrupts, gets accidentally `DROP TABLE`d, or Supabase has an incident with data loss on our project → every paying user's data is unrecoverable. Sign-ups, subscription state, lesson progress — all gone.

Verified against Supabase docs (2026-07-04): "We automatically back up all Pro, Team, and Enterprise Plan projects on a daily basis" — Free tier is not covered.

**Why it's currently deferred:** User made the explicit call to accept this risk for now rather than pay $25/mo for Pro tier or set up manual dump automation. Documented so the risk is conscious, not accidental.

**Three ways to fix later** — pick one when this bites (or preemptively):

**Option A — DIY dump automation (Free tier, ~1h + ongoing discipline):**
1. Write `scripts/backup-prod.sh` that runs `supabase db dump` and pipes to a local or cloud file
2. Cron / GitHub Action to run it weekly
3. Store dumps somewhere durable (private git repo, Google Drive, S3)
4. Test a restore against dev at least once so you know the flow

**Option B — Upgrade to Pro ($25/mo, ~15 min setup):**
1. Prod dashboard → Subscription → upgrade
2. Automatic daily backups + 7-day retention appear
3. Self-service restore in the dashboard
4. Do a test restore against dev to confirm the procedure

**Option C — Third-party backup service:**
1. Services like DatabaseSpy, SimpleBackups, or a custom Python cron. Similar effort to A, lets you offload to a managed service.

**Definition of done:** you have EITHER (a) automated backup dumps running + tested restore procedure, OR (b) Pro tier subscription with a verified restore drill. Right now: neither.

**Cost of NOT fixing:** if you lose prod data, no recovery. Every paying user's data is gone. Real money lost + reputational damage + would-be a paying user retention crisis.

---

### ~~3. Add error / crash tracking to the app~~ ✅ DONE 2026-07-04

Sentry integrated. Single project, `environment` tag ('dev' | 'prod') derived from Supabase URL (same pattern as PostHog). SDK initialized in `App.tsx` before any other code so import-time crashes are caught. `Sentry.wrap(App)` at the export sets up ErrorBoundary + session tracking. Native iOS/Android crashes auto-captured. `reportError()` helper in `src/config/sentry.ts` used alongside existing `posthog.captureException` calls in auth + paywall paths — same error surfaces in both dashboards.

DSN configured in `.env`, `.env.prod`, and all three eas.json profiles.

---

### ~~4. Fix version number sync + write a bump script~~ ✅ DONE 2026-07-03

Sync bug fixed (1.0.0 → 1.1.0 done). `scripts/bump-version.sh` written and executable — refuses to run if files are drifted, safely updates all 3 files, verifies after. Documented in `VERSION_MANAGEMENT.md`.

---

### 5. Branch protection + PR-based workflow
**Why it matters:** You commit straight to `main` today. Even solo, requiring a PR forces a "look at the diff" moment before change becomes permanent. When you inevitably work with a contractor or another dev, this becomes a non-negotiable.

**Effort:** XS (15 min for the settings; new habit takes longer)

**What to do:**
1. GitHub → Settings → Branches → Add rule for `main`
2. Require pull request before merge — 1 approval (self-approval is fine for solo)
3. Require status checks (once CI is set up — see item 7)
4. Disallow force push, disallow deletion
5. Start using branches for all future work: `git checkout -b feature/my-feature`

**Definition of done:** you cannot `git push main` from your Mac anymore. Must go through a PR.

---

## 🟡 Medium priority — next quarter

### ~~6. Emergency kill switch (`min_supported_version`)~~ ✅ IMPLEMENTED 2026-07-03

Kill switch built. `app_config` table with `min_supported_ios_build` and `min_supported_android_build` keys, both defaulting to 0 (no minimum enforced). App fetches on launch, shows `ForceUpdateModal` if current build < minimum.

**To use in an emergency:** update the row on prod:

```sql
UPDATE public.app_config
SET value = '10'::jsonb, updated_at = now()
WHERE key = 'min_supported_ios_build';
```

Any user on iOS build 9 or below will get force-upgrade modal on next launch.

**Migration applied to dev:** yes (2026-07-03). **Applied to prod:** no — applies with the next prod release.

See `docs/DEV_PROD_ENVIRONMENTS.md` → "Kill switch" for full details.

---

### 7. CI with type check on every PR
**Why it matters:** Cheapest possible safety net. Catches TypeScript regressions before they ship. Once branch protection (item 5) is on, a required CI check means you can't merge broken code.

**Effort:** S (2 hours)

**What to do:**
1. Add `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [pull_request]
   jobs:
     typecheck:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with: { node-version: '20' }
         - run: npm ci
         - run: npx tsc --noEmit
   ```
2. Push, open a test PR, verify the check runs
3. In branch protection settings, mark `typecheck` as required

**Definition of done:** you cannot merge a PR that has TypeScript errors.

---

### ~~8. Rotate DB passwords~~ — DEFERRED by user, 2026-07-03

User acknowledged the risk but explicitly deferred. Not tracked as a pending item. Revisit only if a rotation is externally forced (e.g., known leak, org policy change).

---

### 9. Aggregated monitoring dashboard
**Why it matters:** You have signal scattered across Supabase logs, App Store Connect, Superwall dashboard, and (soon) Sentry. Checking 4 places daily is a task nobody does. Aggregate what matters.

**Effort:** M (half day)

**What to do:**
1. Pick a hub — Sentry works, or PostHog if you want product analytics too
2. Wire the top 5 signals: crash rate, sign-up conversion, paywall conversion, DAU, revenue
3. Set daily/weekly summary email
4. Set alerts for step-changes (e.g., paywall conversion drops 20%)

**Definition of done:** one dashboard, one daily email, one on-call phone number for critical alerts.

---

### ~~10. Document sandbox Apple ID setup~~ ✅ DONE 2026-07-03

`STOREKIT_SETUP_GUIDE.md` updated with sandbox tester (`sandeepv98@gmail.com`), iOS 18 sign-in path notes, and troubleshooting.

---

## 🟢 Nice to have — someday

### 11. E2E smoke tests (Maestro or Detox)
**Why it matters:** Catches regressions in the golden path (sign up → onboarding → paywall → lesson) before they ship. High setup cost but pays off long term.

**Effort:** L (2–3 days initial, ongoing maintenance)

**Why it's not urgent:** Manual testing on dev before every release covers this if you're disciplined. Automate once manual testing is the bottleneck.

---

### 12. CI-driven schema migrations
**Why it matters:** Human running `psql` against prod is error-prone. A pipeline that requires PR approval + auto-applies migrations reduces risk.

**Effort:** M (1 day)

**Why it's not urgent:** You're solo. Overhead > benefit until you have another dev or migrations are happening frequently.

---

### ~~13. Feature flags (PostHog)~~ ✅ DONE 2026-07-01

PostHog feature flags in use via `onboarding_variant` flag — see `src/lib/experiments.ts` + `useExperimentStore`. Free with PostHog account (1M requests/mo covered).

---

### 14. Support tooling
**Why it matters:** When a paid user emails "my account is broken," you shouldn't be hand-writing SQL to look them up and fix their state. Even a simple internal admin page saves hours per incident.

**Effort:** M (1 day)

**Why it's not urgent:** Only builds up as support load grows. Cheap fix until then: keep a `runbook.md` of common SQL queries.

---

### 15. Gate LearnScreen behind subscription check
**Why it matters:** The paywall in `LoadingScreen.tsx` has fallback paths (`onSkip`, `onError`, `onDismiss` without purchase) that all call `navigation.replace('Root')` — meaning a paying user hitting a network glitch or Superwall outage could reach the main app without subscribing. The current paywall UX is hard, so this is largely theoretical, but the escape hatches exist in code.

**Effort:** S (30 min for the perfectionist version — waits for Superwall to report a definite status before making the routing decision, so paying users never see a spurious spinner)

**What to do:**
1. Add `subscriptionStatusResolved` to auth store — starts false, flips true when Superwall fires `onSubscriptionStatusChange` at least once
2. In `LearnScreen`, wait for `subscriptionStatusResolved` before checking `isDemoUser || isSubscribed`
3. If resolved AND neither demo nor subscribed → bounce to `Loading` screen (re-triggers paywall)
4. Show a soft loading state while resolving (usually <1 sec)

**Why not now:** Only trips when the hard paywall fails or is misconfigured. Real-user impact currently near-zero. Fix during next paywall-related work.

**Definition of done:** users can NEVER reach LearnScreen without being demo, subscribed, or having Superwall confirm their status.

---

## Done — track wins here

*(Move items here with date when completed.)*

- **2026-07-01** — Dev/prod Supabase separation set up
- **2026-07-01** — Startup env indicator in app (`[Supabase] Env: DEV ✅ / PROD ⚠️`)
- **2026-07-01** — Documented environment switching (`DEV_PROD_ENVIRONMENTS.md`)
- **2026-07-01** — Best practices audit written (this doc)
- **2026-07-01** — Migration tracking (item #1) — baseline saved, workflow documented
- **2026-07-03** — Bundle ID split (dev vs prod), enables parallel install on same device
- **2026-07-03** — Version bump 1.0.0 → 1.1.0 build 9, all three files synced
- **2026-07-03** — Kill switch (item #6) — `app_config` table + `ForceUpdateModal`, applied to dev
- **2026-07-03** — CI yaml added — GitHub Actions runs `tsc --noEmit` on every PR + push to main
- **2026-07-03** — RELEASE_CHECKLIST.md added — single ordered list for every release
- **2026-07-03** — APPLE_JWT_ROTATION.md added — 6-month rotation procedure documented
- **2026-07-03** — PostHog dev/prod separation via `environment` property (single-project workaround for free tier)
- **2026-07-03** — Version bump script (`scripts/bump-version.sh`) — one-command safe version bumps across all 3 files
- **2026-07-03** — `PrivacyInfo.xcprivacy` — declared all collected data types (email, user ID, device ID, product interaction, crash data, purchase history, name, other user content)
- **2026-07-03** — Sandbox Apple ID (item #10) documented in STOREKIT_SETUP_GUIDE.md
- **2026-07-03** — Feature flags (item #13) done via PostHog
- **2026-07-04** — Subscription enforcement Option B (Fable P0#1) — app-level Superwall listener, LearnScreen gate, cold-start fail-open
- **2026-07-04** — Removed dead `SHOW_DEMO_BUTTON` env var (Fable P0#2) — never read, cleaned from .env/eas.json/app.config.js/env.d.ts
- **2026-07-04** — Restore Purchases now works (Fable P0#3) — calls Superwall's getSubscriptionStatus, three-outcome UI (restored/no_purchases/failed), analytics renamed to restore_purchases_tapped + restore_purchases_completed
- **2026-07-04** — Managed workflow migration (Fable P0#4) — deleted ios/ folder, all native config in app.config.js, bundle ID split ACTUALLY works, entitlements/privacy manifest properly declared
- **2026-07-04** — Sentry crash & error reporting (item #3, Fable P1#8) — single project + environment tag, ErrorBoundary via Sentry.wrap, native crash capture, reportError wired into auth + paywall catch blocks
- **2026-07-04** — Supabase CLI-tracked migrations (item #12, Fable P1#10) — baselined dev + prod via `supabase migration repair`, rewrote initial migration as idempotent SQL, retired prod_schema.sql to `supabase/archive/`, updated release checklist to use `supabase db push --linked` instead of raw `psql -f`
- **2026-07-04** — Kill switch reads real binary build (Fable P1#12) — swapped `Constants.expoConfig.ios.buildNumber` for `Application.nativeBuildVersion` so build-number drift can't silently break the kill switch
- **2026-07-04** — Phased release + manual release documented (Fable P1#13 Part A) — RELEASE_CHECKLIST Phase 9/10/11 now cover App Store Connect toggles and phased-rollout monitoring. **Backup restore drill deferred (item #2 status: risk accepted, no automated backups on Free tier)**
- **2026-07-04** — Privacy policy corrected (Fable P1#7) — removed false "children's data never transmitted to servers" claim, added PostHog and Sentry disclosure, replaced "may add analytics in future" with what's actually collected. Updated `legal/PRIVACY_POLICY.md`. GitHub Pages repo (`kinderwell-legal`) still needs the same update pushed. App Store Connect App Privacy questionnaire steps documented in RELEASE_CHECKLIST Phase 9a
- **2026-07-04** — Structural prod guards (Fable P1#11, partial) — `supabase.ts` now HARD THROWS if a `__DEV__` build tries to connect to prod Supabase (unless `ALLOW_DEV_PROD_ACCESS=true` is set explicitly). `app.config.js` defaults flipped from prod-shaped to dev-shaped so a fresh clone / missing `.env` yields dev, not prod. **DB password rotation still deferred by user.**
- **2026-07-04** — Apple Sign In fixes (Fable P1#9) — nonce added (SHA-256 to signInAsync, raw to signInWithIdToken) for replay hardening; fixed silent data loss where the post-signin upsert wrote to non-existent `full_name`/`email` columns (table has `name`). Apple only provides the user's name on FIRST authorization, so every new Apple sign-up before this fix silently lost their name forever. Now upserts to correct column with error reporting to Sentry if the write fails.

---

## The honest bottom line

Kinderwell is a solo-dev app taking real money with production practices that are mostly ad-hoc. That's not a crisis — most solo apps are like this — but if you want it to grow without eating you alive, the 🔴 items above are the ones that matter. In order:

1. **Migration tracking** (item 1) — you can't safely evolve the schema without it
2. **Backups & restore drill** (item 2) — you can't sleep well without knowing this works
3. **Error tracking** (item 3) — you can't fix what you don't see
4. **Version sync + bump script** (item 4) — current bug, fix once
5. **Branch protection** (item 5) — cheapest win of the five

Two weekends of focused work gets all five done. That's probably the best ROI on your time between now and your next feature.
