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

### 1. Migration tracking with `supabase/migrations/`
**Why it matters:** Kinderwell is live. Every schema change is a change to a production system taking money. No audit trail = no accountability, no reproducibility, no way to reconcile dev/prod drift when it happens (it will). This is the single biggest risk in the current setup.

**Effort:** S (one-time setup, ~2 hours)

**What to do:**
1. `mkdir -p supabase/migrations`
2. Save current prod schema as baseline: `cp supabase/prod_schema.sql supabase/migrations/00000000000000_initial_schema.sql`
3. Commit to git
4. From now on: every schema change is a new file `YYYYMMDDHHMMSS_description.sql` — apply to dev first, then prod, commit the file
5. See `DEV_PROD_ENVIRONMENTS.md` → "Migration tracking" for the full flow

**Definition of done:** next schema change goes through the migration file workflow instead of raw dashboard SQL.

---

### 2. Verify backups exist and test a restore
**Why it matters:** If prod DB corrupts (or you `DROP TABLE` in a moment of tiredness), how do you recover? On Free tier Supabase, backups are limited. On Pro tier ($25/mo) you get point-in-time recovery. Either way, you need to know what you have and prove restore works before you need it.

**Effort:** S (2–3 hours including test restore)

**What to do:**
1. Check prod dashboard → Database → **Backups**. What retention do you have?
2. If Free tier and you're taking real money, upgrade to Pro. $25/mo is nothing compared to losing user data.
3. Restore the most recent backup to `kinderwell-dev` to prove it works.
4. Document the restore procedure in `DEV_PROD_ENVIRONMENTS.md` → "Rollback plans"

**Definition of done:** you have written notes on exactly how to restore prod from a backup, and you've done it once as a drill.

---

### 3. Add error / crash tracking to the app
**Why it matters:** Right now if a paid user crashes, you find out from a 1-star review. Sentry / Bugsnag catches JS errors, native crashes, and API failures in real time. For a paid app, this is table stakes.

**Effort:** M (3–5 hours to install, configure, filter noise)

**What to do:**
1. Pick one — **Sentry** is the standard, generous free tier for React Native
2. Install: `npx @sentry/wizard@latest -i reactNative`
3. Wire DSN into both env profiles in `eas.json` (separate DSNs for dev and prod)
4. Test: throw a fake error in dev, confirm it appears in Sentry dashboard
5. Add Sentry to Superwall + Supabase failure paths (they already have hooks)
6. Set up email alerts for `>N` errors in `Y` minutes

**Definition of done:** you get an email/Slack ping if a paid user hits a crash within 5 minutes.

---

### 4. Fix version number sync + write a bump script
**Why it matters:** Right now `app.json` says `buildNumber: 7`, `Info.plist` says `CFBundleVersion: 8`. They must match at submit time or the build is rejected. Currently kept in sync by hand — that's a bug waiting to ship.

**Effort:** S (2–3 hours)

**What to do:**
1. Read `VERSION_MANAGEMENT.md` — it may already have a process
2. If not, write a bump script (`scripts/bump-version.sh`):
   - Takes new version + build number as args
   - Updates all three files (`app.json`, `package.json`, `ios/Kinderwell/Info.plist`)
   - Fails loudly if any of them was out of sync going in
3. Add a "verify versions match" line to your release checklist
4. Optional: convert `Info.plist` to reference `app.json` via a plugin so Expo manages it

**Definition of done:** one command bumps versions everywhere, or a checklist step catches drift before submission.

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

### 6. Emergency kill switch (`min_supported_version`)
**Why it matters:** If you ship a build that breaks paid features for existing users, you're stuck for the 24–72h Apple review cycle. A `min_supported_version` config row checked at app launch lets you force-upgrade users out of a bad build.

**Effort:** M (4–6 hours)

**What to do:**
1. Add `app_config` table (single row) to dev + prod: `min_supported_ios_build INT`, `updated_at`
2. App reads it on launch. If `Info.plist CFBundleVersion < min_supported_ios_build`, show a hard "Please update" modal — no way past it
3. Default = 0 (never blocks)
4. Test: bump `min_supported_ios_build` in dev, confirm the old-build app forces upgrade
5. Document the procedure: "If X broke, run this SQL on prod to force upgrade"

**Definition of done:** you can force any specific build to upgrade with a single SQL query on prod.

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

### 8. Rotate DB passwords to be different for dev vs prod
**Why it matters:** Right now they're the same. A leak of one compromises both. Trivial fix, meaningful risk reduction.

**Effort:** XS (30 min)

**What to do:**
1. Rotate prod password: prod dashboard → Connect → Reset database password → save to password manager
2. Rotate dev password to something different: same steps on dev
3. Test each by running a `psql` command with the new password
4. Delete `PROD_DB_URL` and `DEV_DB_URL` env vars from your shell history: `history -c` or edit `~/.zsh_history`

**Definition of done:** dev and prod use different DB passwords, and both are in a password manager.

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

### 10. Document sandbox Apple ID setup
**Why it matters:** You'll need this again. Six months from now when you're setting up on a new device, you'll have forgotten. Write it down while it's fresh.

**Effort:** XS (30 min)

**What to do:**
1. Update `STOREKIT_SETUP_GUIDE.md` with: how to create a sandbox tester in App Store Connect, how to sign in on device (Settings → App Store → Sandbox Account), which email you're using
2. Save the sandbox tester credentials to a password manager

**Definition of done:** the guide is complete enough that a new dev could pick up sandbox testing without asking you.

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

### 13. Feature flags (GrowthBook, PostHog, LaunchDarkly)
**Why it matters:** Ship a risky feature to 5% of users, watch metrics, expand or roll back without a new release. Standard for apps at scale.

**Effort:** M (1 day)

**Why it's not urgent:** Ship simple stuff first. Come back when you have a specific risky feature to gate.

---

### 14. Support tooling
**Why it matters:** When a paid user emails "my account is broken," you shouldn't be hand-writing SQL to look them up and fix their state. Even a simple internal admin page saves hours per incident.

**Effort:** M (1 day)

**Why it's not urgent:** Only builds up as support load grows. Cheap fix until then: keep a `runbook.md` of common SQL queries.

---

## Done — track wins here

*(Move items here with date when completed.)*

- **2026-07-01** — Dev/prod Supabase separation set up
- **2026-07-01** — Startup env indicator in app (`[Supabase] Env: DEV ✅ / PROD ⚠️`)
- **2026-07-01** — Documented environment switching (`DEV_PROD_ENVIRONMENTS.md`)
- **2026-07-01** — Best practices audit written (this doc)

---

## The honest bottom line

Kinderwell is a solo-dev app taking real money with production practices that are mostly ad-hoc. That's not a crisis — most solo apps are like this — but if you want it to grow without eating you alive, the 🔴 items above are the ones that matter. In order:

1. **Migration tracking** (item 1) — you can't safely evolve the schema without it
2. **Backups & restore drill** (item 2) — you can't sleep well without knowing this works
3. **Error tracking** (item 3) — you can't fix what you don't see
4. **Version sync + bump script** (item 4) — current bug, fix once
5. **Branch protection** (item 5) — cheapest win of the five

Two weekends of focused work gets all five done. That's probably the best ROI on your time between now and your next feature.
