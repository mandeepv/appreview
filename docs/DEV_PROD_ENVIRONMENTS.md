# Dev / Prod Environment Guide

How to switch between the `kinderwell-dev` and `kinderwell` (prod) Supabase environments when developing, testing, and releasing the Kinderwell app.

## Overview

We run two Supabase projects with identical schemas:

| Environment | Supabase project | Project ref | Region |
|---|---|---|---|
| **Prod** | `kinderwell` | `zqwzdyjfxytvedghujsd` | us-west-2 |
| **Dev** | `kinderwell-dev` | `xbkkjqvbsnroenqlqkmi` | us-west-1 |

Both projects have:
- Same tables (`user_profiles`, `lesson_progress`) with same RLS policies
- Same Edge Functions (`delete-account`)
- Same Auth providers (Apple + Google, dev has its own iOS OAuth client and allowed Apple bundle)
- Same allowed redirect URLs (`kinderwell://*`)

Superwall and Apple IAP are **shared** across both environments — sandbox mode (debug builds, TestFlight) handles isolation automatically. No real money is charged in non-store builds.

## Bundle IDs (single bundle across all profiles, as of 2026-07-05)

All three EAS build profiles (development / preview / production) use the same iOS bundle ID and Android package: **`com.kinderwell.app`**.

| Environment | iOS bundle | Android package | App name (home screen) |
|---|---|---|---|
| **Prod** | `com.kinderwell.app` | `com.kinderwell.app` | Kinderwell |
| **Dev / Preview** | `com.kinderwell.app` | `com.kinderwell.app` | Kinderwell Dev |

Only the **display name** differs — the app name shown on the home screen — so you can tell a dev install from a prod install by icon label without needing a separate bundle. The underlying bundle is identical.

### Why we don't split bundles

We used to (2026-07-03 to 2026-07-05) — dev/preview builds used `com.kinderwell.app.dev` for real side-by-side install with the store version. The split was reverted because:

1. **StoreKit product resolution broke in dev builds.** App Store Connect only has one app record (`com.kinderwell.app`), which is where the subscription products (`com.kinderwell.app.monthly`, `com.kinderwell.app.annual`) live. A dev build running as `com.kinderwell.app.dev` asked StoreKit for products against a bundle ASC had never heard of → StoreKit returned nothing → paywall rendered `/mo` and `/yr` with no prices. Impossible to test IAP in dev without shipping a second ASC app.
2. **The alternative fix** — registering `com.kinderwell.app.dev` as a second app in ASC with its own duplicated subscription products, App Privacy questionnaire, review flow, tax forms — was more overhead than the split was worth for a solo dev.
3. **Environment isolation was never dependent on the bundle split.** Dev vs. prod separation is driven by `SUPABASE_URL` (per-profile env var in `eas.json`), which sets the project ref that PostHog / Sentry / all runtime guards key off of.

**Trade-off we accepted with collapsing:** dev/preview builds cannot be installed on the same phone as the prod App Store build simultaneously — the new install overwrites the previous one. In practice this is not a real cost:

- The Phase 8.3 mandatory upgrade test (RELEASE_CHECKLIST) explicitly *requires* installing the live App Store version, then upgrading to a TestFlight build. With single bundles, TestFlight overwrites the App Store install cleanly, which is the exact flow Phase 8.3 wants to test.
- Ordinary dev iteration doesn't need the store build coexisting.
- If you ever need to compare v1.0.0 and v1.1.0 side-by-side visually, use two devices, or the simulator + a device.

See git history around 2026-07-05 for the discussion and commit that reverted the split.

### Registered where (updated for single-bundle world)

- **App Store Connect:** one app record, `com.kinderwell.app`. Subscription products (`com.kinderwell.app.monthly`, `com.kinderwell.app.annual`) live here. Sandbox testers work against this bundle.
- **Apple Developer portal (Identifiers → App IDs):** only `com.kinderwell.app` needs to be registered / kept. If `com.kinderwell.app.dev` still exists from the split era, it can be deleted (harmless if left).
- **Apple Services ID (`com.kinderwell.app.auth`):** unchanged — primary App ID is `com.kinderwell.app` for both web and native Sign in with Apple.
- **Google Cloud Console:** one iOS OAuth client (`Kinderwell iOS`) with bundle `com.kinderwell.app` is sufficient. The dev iOS OAuth client from the split era can be deleted or ignored.
- **Supabase Apple/Google providers:** the `Client IDs` fields no longer need `.dev` entries — one bundle covers everything. If they still list `.dev`, remove them for cleanliness.
- **Superwall:** bundle-scoped by app record. One app registered, matching `com.kinderwell.app`, unchanged.

### Managed workflow — native folders are NOT committed

**As of 2026-07-04:** we migrated to Expo's managed workflow. `ios/` and `android/` folders are gitignored — they get regenerated fresh from `app.config.js` on every EAS build (and locally with `npx expo prebuild --clean` when needed).

**All native config lives in `app.config.js`.** That includes:
- Bundle ID (env-driven — but the same value across profiles now, kept env-driven so future re-splits are trivial)
- Entitlements (Sign in with Apple, Associated Domains, push)
- PrivacyInfo.xcprivacy (data collection declarations)
- Info.plist customizations
- Plugin list

**Rebuilding locally when needed:**

```bash
npx expo prebuild --clean --platform ios
```

The `--clean` flag deletes `ios/` first. Regenerates from current env vars. Then you can `pod install` and open Xcode.

**Version numbers:** prebuild regenerates `Info.plist` + `project.pbxproj` from `app.json` on every build. There's nothing to keep in sync inside `ios/`. `bump-version.sh` updates `app.json` (marketing version + `ios.buildNumber`) and `package.json` (marketing version, for git-blame consistency and release metadata). **It does NOT touch `android.versionCode`** — the script is iOS-focused today (verify: its Python edits set only `expo.version` and `expo.ios.buildNumber`). Android `versionCode` bumping arrives with the Android-readiness work (SHIP_READY_PLAN 8.24); until then, bump it by hand if you cut an Android build. See [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md).

**When to prebuild:** only when you need to inspect / build native locally. EAS builds do this automatically inside their build container.

### Single source of truth: `app.config.js`

**`app.json` is intentionally minimal** — name, version, slug, icon, splash, base plugin list. That's it.

**`app.config.js` is the single source of truth** for everything dynamic:
- Env-driven bundle ID and package (dev vs prod)
- Info.plist customizations (URL schemes, ATS, orientation, ITSAppUsesNonExemptEncryption)
- Entitlements (Sign in with Apple, Associated Domains)
- PrivacyInfo.xcprivacy declarations
- Plugin list for native modules (expo-notifications, expo-localization, @sentry/react-native/expo)
- Runtime `extra` config exposed via `Constants.expoConfig.extra`

**Rule:** any change to native config → edit `app.config.js`. Do NOT add fields to `app.json` beyond what's currently there. If you find `app.json` has grown fields that `app.config.js` also produces, that's drift — clean it up.

**Where drift comes from:** Expo's CLI answers to interactive prompts (e.g. "encryption exempt?" during upload) sometimes write resolved config back into `app.json`. When that happens, delete the duplicated fields from `app.json` immediately — `app.config.js` produces them dynamically anyway.

**Verify current state:** `npx expo config --type public | grep <field>` shows the FINAL resolved config that ships. If a field appears here, it doesn't matter which file it came from — but it should only come from ONE.

## How the app knows which env it's in

The app reads Supabase creds from `Constants.expoConfig.extra` via `expo-constants`. Those values come from:

- **Local dev (`npx expo start` / `expo run:ios`):** the `.env` file at repo root
- **EAS builds (`eas build`):** the `env` block in `eas.json` for the chosen build profile

`src/lib/supabase.ts` logs `[Supabase] Env: DEV ✅` or `PROD ⚠️` on launch in dev builds — check Metro/Xcode logs after startup to confirm which project the app is hitting.

## The two files that control everything

### 1. `.env` — used by `npx expo start` and `expo run:ios`

**Default:** points to **dev**. A backup pointing at prod is stored at `.env.prod` (gitignored).

### 2. `eas.json` — used by `eas build`

Three build profiles:

| Profile | Command | Points at |
|---|---|---|
| `development` | `eas build --profile development` | Dev |
| `preview` | `eas build --profile preview` | Dev |
| `production` | `eas build --profile production` | **Prod** |

## Switching local dev to point at prod (extremely rare — you should never need to)

The app REFUSES to run a `__DEV__` build against prod Supabase — it throws a clear error at startup. This catches the "I forgot my `.env` got overwritten" mistake before you write test data to real users.

**There is intentionally no env-var bypass** (a previous `ALLOW_DEV_PROD_ACCESS=true` escape hatch was removed 2026-07-04 per Fable review 🟡 — it invited hacking around the guard rather than fixing a mis-configured `.env`). If you have a genuine need to reproduce a prod-only bug against prod data locally (very rare):

1. Comment out the `if (__DEV__ && isProdRef)` throw block in `src/lib/supabase.ts` **on a scratch branch you will NEVER merge**.
2. Set `.env` to prod values.
3. `npx expo start`.
4. Debug carefully — every write is a live user impact.
5. When done: revert the file, restore `.env`, delete the scratch branch.

The extra friction is intentional. Any PR that touches that throw block should get high scrutiny; if it accidentally merged you'd remove the guard globally.

## Building for a real device

### Development build (dev backend, dev client)

For everyday iterating on your iPhone. Fast, hot-reloadable.

```bash
# Physical device plugged in
npx expo run:ios --device

# Or via EAS (cloud build, install via internal distribution)
eas build --profile development --platform ios
```

Check Metro logs for `[Supabase] Env: DEV ✅` — confirms dev backend.

### Preview build (dev backend, release-mode client)

Release-mode compile, but still pointed at dev. Use before shipping to catch release-mode-only bugs (e.g., minified code issues) without risking prod data.

```bash
eas build --profile preview --platform ios
```

### Production build (prod backend, release-mode client)

**Only for App Store submission.** Never test experimental changes with this profile — you'll be hitting real users' data.

```bash
eas build --profile production --platform ios
eas submit --profile production --platform ios
```

## Testing workflow — the standard loop

1. **Local dev on Mac** — `npx expo start` (dev backend)
2. **On-device dev** — `npx expo run:ios --device` (dev backend, iPhone)
3. **Pre-release smoke test** — `eas build --profile preview` and install via TestFlight or ad-hoc (dev backend, release-mode)
4. **Ship** — `eas build --profile production` → `eas submit`

## Schema migrations — backward compatibility

Once the app is live, users on multiple app versions coexist for weeks (App Store review + slow updaters). The DB has to work for ALL of them at once.

### The rule

**Every schema change must be backward compatible with every app version currently in users' hands.**

### Safe changes (ship freely)

- Add a new nullable column
- Add a new table
- Add a new index
- Add a new Edge Function
- Loosen an RLS policy or CHECK constraint

### Breaking changes (never ship in one step)

- Rename a column or table
- Drop a column the old app reads
- Change a column type incompatibly
- Add `NOT NULL` column with no default
- Tighten a CHECK constraint or FK
- Remove/rename an enum value
- Rename/remove an Edge Function
- Change an Edge Function response shape
- Tighten an RLS policy

### Expand → migrate → contract

For anything that looks like a breaking change:

1. **Expand** — add the new thing alongside the old thing. Both work. New app writes to both.
2. **Migrate** — ship the app update. Wait weeks/months until old-version usage is near zero.
3. **Contract** — only then drop the old column/table/function.

### Client-side hygiene

- Never `SELECT *` from Supabase — always specify columns
- Use Zod with tolerance for unknown fields
- Version Edge Functions if response shape changes (`/foo` stays, add `/foo-v2`)

## Testing schema changes safely

### Recommended flow

1. Create a migration file with `supabase migration new <name>` and write the SQL in it
2. Apply to **dev** via `supabase db push --linked` (CLI stays linked to dev)
3. **Regenerate TypeScript types** with `npm run gen:supabase-types` — writes to `src/types/supabase.ts`. Every `supabase.from('table')` query is typed against this file, so a new/renamed/deleted column becomes a compile error the next time you edit calling code. Regen after every migration or the types drift silently.
4. Verify the currently-running app version still works against dev (backward compat check)
5. Verify the new app changes work against dev
6. Once confident, apply to prod during release — see "Migration tracking" section below for the full commands.

### Re-syncing dev schema from prod

Since dev + prod are both tracked via Supabase migrations now, the concept of "dump prod and blast it over dev" no longer applies. If dev has drifted (extra tables, columns, etc), the correct fix is:

- Are the differences intentional (e.g. `app_config` is dev-only until v1.1.0 releases)? Then leave them.
- Are they unintentional (you experimented and want to reset)? Reset the specific table or column, or use Supabase Dashboard's SQL editor to drop what you don't want. Don't blow away everything — you'd lose tables that prod hasn't caught up to yet.

If you truly need a fresh dev DB from scratch, re-run all migrations against a new empty Supabase project: `supabase db push --linked` will replay everything in `supabase/migrations/` in order.

## Edge Functions

Deploy to dev first, verify, then deploy to prod.

```bash
# Deploy to dev
supabase link --project-ref xbkkjqvbsnroenqlqkmi
supabase functions deploy delete-account --project-ref xbkkjqvbsnroenqlqkmi

# Deploy to prod (after verifying on dev)
supabase link --project-ref zqwzdyjfxytvedghujsd
supabase functions deploy delete-account --project-ref zqwzdyjfxytvedghujsd
```

Always link back to dev after prod work so accidental commands hit dev, not prod.

## Auth provider changes

Apple and Google are configured on both projects, but they reuse the same underlying credentials (same Apple Services ID, same Google OAuth client). Both projects' callback URLs are registered on Apple and Google.

If you rotate the Apple JWT secret or Google client secret, **update both dev AND prod Supabase**, otherwise sign-in will break on whichever one you forgot.

### Regenerate Apple JWT (expires every 6 months)

```bash
npm install --no-save jsonwebtoken
node scripts/generate_apple_jwt.js
```

Copy the printed JWT into:
1. Dev Supabase → Auth → Providers → Apple → Secret Key
2. Prod Supabase → Auth → Providers → Apple → Secret Key

## Superwall

One API key, one campaign for both environments. Debug builds and TestFlight automatically use StoreKit sandbox — no real money is charged.

To test paywall config changes without affecting prod users:
1. In Superwall dashboard, duplicate the live campaign as a test campaign
2. Gate the test campaign to your Apple ID (audience filter)
3. Iterate on the test campaign, promote changes to the live campaign only when ready

## Sandbox Apple ID for IAP testing

Create once, use forever on your test iPhone.

1. App Store Connect → Users and Access → Sandbox → **Testers** → **+**
2. Create a tester with a fresh email
3. On iPhone: Settings → App Store → Sandbox Account → sign in with the tester email
4. Any purchase from a debug/TestFlight build runs through sandbox

## Release workflow — the standard path from idea → App Store

**⚠️ Do not follow the workflow from this doc. See
[`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) — it is the single
source of truth for shipping a release.**

This section used to duplicate the release phases as prose. It drifted
from the canonical checklist in ways that would break a release if
followed:

- Missing the "🚨 Submission blockers — do not skip" callout at the
  top of `RELEASE_CHECKLIST.md` (Phase 4 migration → Phase 7.5
  Superwall dashboard → Phase 8.3 mandatory upgrade test → Phase 9a
  App Privacy questionnaire).
- Missing Phase 7.5 (Superwall dashboard verification for dismiss
  control — 3.1.2 rejection risk).
- Missing Phase 8.3 (**mandatory upgrade test** — the single change
  most likely to prevent the next bad release, per Fable review #12).
- Missing Phase 9a (App Privacy questionnaire update — real rejection
  vector if it doesn't match `PrivacyInfo.xcprivacy`).
- Missing phased release + manual "Release This Version" instructions
  (Phase 9).
- Missing Phase 5 delete-account Edge Function redeploy for v1.1.0
  (the function changed on this branch — CORS tightening — so the
  redeploy is mandatory).
- Included a `SHOW_DEMO_BUTTON=true` instruction in the old Phase 8 —
  that env var was deleted from the codebase in the 7-tap demo mode
  rework. Following that line during a release would waste time
  chasing a non-existent config.

Fable re-review 2026-07-05 caught the last two. Stubbing this entire
section rather than fixing each drift point one-by-one, because any
future edit here would immediately re-drift from
`RELEASE_CHECKLIST.md`. The related pieces this doc still owns
(schema-migration mechanics, Edge Function deploy commands, kill
switch operation, rollback plans) live in their own sections above
and below — this stub is only about the release *workflow*.

### If you need release-phase details

Use `RELEASE_CHECKLIST.md`. It is:

- The canonical ordered checklist for every phase of a release.
- Enforced in the release process (the file you actually check
  boxes in).
- Reviewed by the last two rounds of external review.

Section pointers, so you know where things live:

| You need... | Read... |
|---|---|
| The whole release checklist end-to-end | [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) |
| Version bump rules + the sync script | [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md) |
| Git tagging after Apple approval | [`RELEASE_CHECKLIST.md`](./RELEASE_CHECKLIST.md) → "Tag the release" |
| Kill switch operation + rollback | Sections below in this doc |
| Schema migration mechanics + backward-compat rules | Sections above in this doc |
| Apple JWT rotation (every 6 months) | [`APPLE_JWT_ROTATION.md`](./APPLE_JWT_ROTATION.md) |
| 7-tap demo mode invariants (App Review context) | [`DEMO_MODE.md`](./DEMO_MODE.md) |

## Migration tracking

**Set up on 2026-07-01. Migrated to Supabase CLI–driven flow on 2026-07-04** — no more manual `psql -f`. Every schema change goes through `supabase migration new` + `supabase db push --linked`. The DB has a `supabase_migrations` table that records which migrations have already been applied to each project.

**Baseline:** `supabase/migrations/20260101000000_initial_schema.sql` is the state that shipped with v1.0.0. Idempotent — will run cleanly against a fresh DB. Dev and prod are both marked as having this migration applied (via `supabase migration repair` on 2026-07-04).

### Creating a new migration

```bash
supabase migration new add_subscription_status_to_user_profiles
```

That drops a `supabase/migrations/YYYYMMDDHHMMSS_add_subscription_status_to_user_profiles.sql` file. Write the SQL there. **Prefer additive changes** (see the backward-compatibility section).

### Applying a migration

**To dev** (CLI should already be linked to dev by default — see `supabase/.temp/project-ref`):

```bash
supabase db push --linked --dry-run   # sanity-check: shows what will apply
supabase db push --linked             # actually applies
```

**To prod** — only during a release, following `RELEASE_CHECKLIST.md`:

```bash
./scripts/db-push-prod.sh
```

**Do not run the prod link/push commands by hand.** `scripts/db-push-prod.sh`
is the single source of truth for the prod-push procedure. It runs the whole
guarded sequence — typed confirmation, a same-day prod backup
(`scripts/backup-prod.sh`), `migration list` for eyeballing, a mandatory
`--dry-run` before a second typed confirmation, the real push, and a `trap`
that **always re-links the CLI back to dev on exit** (including error and
abort paths, so a Ctrl-C mid-push can't leave you pointed at prod).

The manual four-command list that used to live here was deleted on purpose:
duplicating the steps as prose is exactly how the release-workflow section
above drifted from its canonical source. If you need to know or change what
the prod push does, read the script — not a copy of it.

### Verifying migration state

```bash
supabase migration list --linked
```

Shows a Local vs Remote table. If both columns match, you're in sync. If Local has a migration that Remote doesn't → you have unpushed changes. If Remote has one Local doesn't → someone applied SQL by hand (drift).

### If the tables get out of sync (dev/prod drift)

Two ways:

1. **Something got run by hand.** Fix: write the migration file that matches what was run, then mark it as applied without re-running: `supabase migration repair --status applied YYYYMMDDHHMMSS --linked`
2. **A migration file exists locally but was never applied.** Fix: `supabase db push --linked` to catch up.

### Why it matters

- You have a record of every change ever made to each DB
- If dev/prod drift, `supabase migration list --linked` shows it immediately
- Anyone (including future-you) can rebuild the DB from scratch with a single `supabase db push --linked`
- No forgetting to apply a migration to prod at release time — the tool tracks what's pending

### The old approach (do NOT use)

Raw `psql -f` against `$PROD_DB_URL` — this is what we did before 2026-07-04. Problems:
- No record of what ran where — the `supabase_migrations` table never got a row
- pg_dump output has psql-only directives that break under `db push`
- The dev-resync procedure (drop + recreate `public` schema) would silently delete dev-only tables like `app_config`

**Old raw pg_dump snapshots** (like the one we used to bootstrap dev) live in `supabase/archive/`. Do NOT re-apply them; they exist for historical reference only.

## Rollback plans

### Rollback a bad schema change

If a migration broke prod, you have three options in order of preference:

1. **Roll forward** — write a new migration that fixes the problem, apply immediately. Usually the right answer for additive changes.
2. **Manual reverse** — write SQL that undoes the change and apply it: `ALTER TABLE foo DROP COLUMN new_col;`
3. **Restore from backup** — Supabase automatic backups on Pro plan (Point-in-time recovery). On Free plan, backups are less granular. **Verify you have backups before you need them.** Check: prod dashboard → Database → Backups.

### Rollback a bad app release

The App Store does not support rollbacks. Options:

1. **Ship a fix as a new version, expedited review.** Apple allows requesting expedited review for critical bugs. Have it ready.
2. **Kill switch** (see "Kill switch" section below). Bump `min_supported_ios_build` in prod's `app_config` table to force old-build users to update.
3. **Server-side toggle for the broken feature.** If you can disable the feature via a DB flag, you don't need an app release.

## Kill switch (force-upgrade users out of a bad build)

**Set up 2026-07-03.** Table: `public.app_config`. App fetches on launch (`src/lib/appConfig.ts`), shows `ForceUpdateModal` if the currently-installed build is below the minimum.

### Emergency use — force everyone on iOS build ≤ N to update

Run on prod:
```sql
UPDATE public.app_config
SET value = 'N+1'::jsonb, updated_at = now()
WHERE key = 'min_supported_ios_build';
```

Replace `N+1` with your fix build's build number. E.g. if fix is build 15, use `'15'::jsonb`. Users on build 14 or below get the force-update modal on next launch. Users on build 15 or above are unaffected.

Android equivalent: `min_supported_android_build`.

### Reset (once you're confident everyone's on the good build)

```sql
UPDATE public.app_config
SET value = '0'::jsonb, updated_at = now()
WHERE key = 'min_supported_ios_build';
```

### Fail-safe behavior

- If Supabase is unreachable, `fetchAppConfig` returns defaults (build 0, no minimum). Users are NEVER locked out by a Supabase outage.
- If the config row is missing, same — defaults apply.
- Modal is fully blocking, no swipe-to-dismiss. Only exit is tapping the "Update on App Store" button.
- Modal button opens App Store search (currently placeholder — need real App Store ID in `ForceUpdateModal.tsx` when we know it).

### Testing the kill switch on dev

```sql
UPDATE public.app_config
SET value = '9999'::jsonb, updated_at = now()
WHERE key = 'min_supported_ios_build';
```

Launch dev app → should see force-update modal. Reset back to `'0'::jsonb` when done.

### Applying to prod on next release

The `app_config` table exists on **dev only** as of 2026-07-03. It applies to prod as part of the v1.1.0 release via the standard prod-push flow — run `./scripts/db-push-prod.sh` (see "Applying a migration → To prod" above; the script is the single source of truth for the procedure). The dry-run step should show `20260703200000_add_app_config_table` pending.

**Sequencing rule:** apply DB migration BEFORE submitting the new app build to App Store. Otherwise the new app will call an endpoint that doesn't exist on prod → fetch fails → user sees defaults → still works but skips the kill switch until the migration lands.

## Best practice gaps (prioritized — biggest risk first)

Since Kinderwell has real users paying real money, here are things you're NOT doing that a paid app should be. In priority order:

### 🔴 High priority — should address in the next 1-2 weeks

1. **Set up migration tracking** (see "Migration tracking" above). Without this, any schema change is a black-box risk.
2. **Verify prod backups exist and know how to restore.** Free tier Supabase has limited backups — consider upgrading to Pro for point-in-time recovery. Test a restore to dev at least once so you know the process.
3. **Add error tracking to the app.** Sentry (free tier is generous) or Bugsnag. Right now if a paid user hits a crash, you find out via a 1-star review. Not acceptable for a paid app.
4. **Set up branch protection on `main`.** GitHub → Settings → Branches → require PR before merge. Even solo, this forces a diff review moment.
5. **Version bump automation.** ✅ Done. `scripts/bump-version.sh` updates `app.json` + `package.json` and refuses to run on drift. CI's `version-drift` job enforces it — but note CI is **manual-only** now (see #7), so run CI at release time to catch drift before shipping. See [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md).

### 🟡 Medium priority — next month

6. **Add a `min_supported_version` config for emergency kill switch.** Read on app launch, show a "please update" screen if the user is on a bad version.
7. **CI checks.** ✅ Done (`.github/workflows/ci.yml`): TypeScript type check, ESLint, version-drift, Jest tests, and an advisory dependency audit. **Runs manually only** (`workflow_dispatch`) as a release gate — NOT on push/PR — because this is a private repo with metered Actions minutes and the checks are already run locally during development. Trigger it in Phase 2 of `RELEASE_CHECKLIST.md`. To re-enable automatic gating, add `push: { branches: [main] }` back to the workflow's `on:` block (and set the four gating jobs as required checks under branch protection).
8. **Rotate the shared dev/prod DB password to different values.** Currently the same — a leak of one leaks both.
9. **Set up a status/monitoring dashboard.** Supabase logs + App Store Connect crash reports + Superwall metrics. Ideally aggregated somewhere you check daily.
10. **Set up a Sandbox Apple ID** and document it in `STOREKIT_SETUP_GUIDE.md`. So future you doesn't have to figure it out again.

### 🟢 Nice to have — someday

11. **Add smoke tests.** Detox / Maestro for E2E flows. High setup cost but catches regressions before they ship.
12. **CI-driven schema migrations.** Merge to `main` auto-applies migrations to dev; a manual approval step applies to prod.
13. **Feature flags.** GrowthBook / PostHog for gradual rollout of risky features.
14. **User support tooling.** A way to look up a paid user's account state without hand-crafting SQL.

## Common tasks

### "I want to test a new feature on my iPhone"

```bash
# Make sure .env points to dev (default)
cat .env | grep SUPABASE_URL   # should show xbkkjqvbsnroenqlqkmi

npx expo run:ios --device
```

Watch for `[Supabase] Env: DEV ✅` in Metro logs.

### "I want to verify a fix works against prod data"

Don't. Instead: dump the specific prod row(s) you're testing against, insert into dev, verify the fix there. If you absolutely must:

```bash
cp .env .env.dev.bak
cp .env.prod .env
npx expo run:ios --device
# ... verify ...
cp .env.dev.bak .env
```

Watch for `[Supabase] Env: PROD ⚠️` — do NOT sign up test accounts or write test data while pointed at prod.

### "I want to add a new column to a table"

1. `supabase migration new add_something_to_user_profiles`
2. Fill in the SQL (`ALTER TABLE ... ADD COLUMN ... NULL DEFAULT ...`)
3. Apply to dev: `supabase db push --linked`
4. Test the currently-shipped app version against dev — should still work (backward compat check)
5. Update the app code to use the new column, test against dev
6. Commit the migration file
7. Apply to prod during release: see "Applying to prod on next release" pattern above
8. Ship the app update

### "I want to ship a new app version"

1. Test locally on iPhone: `npx expo run:ios --device` (dev backend)
2. Test pre-release build: `eas build --profile preview` (dev backend, release-mode)
3. Build for store: `eas build --profile production` (prod backend)
4. Submit: `eas submit --profile production`
5. After Apple approval, follow `RELEASE_CHECKLIST.md` ("Tag the release") to tag

## Danger zone — do NOT do these

- **Never** point `eas.json`'s `production` profile at dev
- **Never** run `psql` against prod for exploratory queries — use the Supabase dashboard's SQL editor with a `LIMIT` clause, or use dev
- **Never** commit `.env`, `.env.prod`, or any file containing DB passwords / JWT secrets / OAuth secrets (all are gitignored — verify before committing)
- **Never** delete a column from prod without waiting weeks/months for old app versions to phase out
- **Never** paste DB passwords, service_role keys, or OAuth client secrets into chat/Slack/docs

## Credentials reference

Non-sensitive identifiers only. Secrets live in Supabase dashboards, `.env` files, and `eas.json`.

- **Prod project ref:** `zqwzdyjfxytvedghujsd`
- **Dev project ref:** `xbkkjqvbsnroenqlqkmi`
- **iOS bundle ID:** `com.kinderwell.app`
- **Apple Services ID:** `com.kinderwell.app.auth`
- **Apple Team ID:** `DX4F38J8H4`
- **Apple Key ID:** `8SVB695TG5`
- **Apple private key path:** `~/Downloads/AuthKey_8SVB695TG5.p8`
- **Google OAuth client ID:** `737394030212-cdrh1o3lomp3oi29rsovfcoion32oh9j.apps.googleusercontent.com`
- **Superwall API key env var:** `SUPERWALL_API_KEY` (same for dev and prod)

---

**Last Updated:** July 1, 2026
**Dev project created:** July 1, 2026
