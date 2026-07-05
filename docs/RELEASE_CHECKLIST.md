# Release Checklist

**Purpose:** the single ordered list of things to do when shipping a new version of Kinderwell. Use this every release, top to bottom, don't skip steps.

**Related docs:**
- [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) — the git tagging convention (referenced in Phase 4)
- [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) — dev/prod switching, kill switch, migrations
- [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md) — where the 3 version files live
- [`BEST_PRACTICES.md`](./BEST_PRACTICES.md) — ongoing gap tracking

---

## 🚨 Submission blockers — do not skip

Every release, these five manual steps happen *outside* the code and *outside* CI. If you skip any of them you either get rejected by Apple, ship an app that doesn't work for existing users, or corrupt prod data. They are covered by their own phases below — this list exists so nobody skims past them:

1. **Phase 4** — Apply schema migrations to prod (`supabase db push`) if any are pending. Skipping = new app talks to old schema, writes fail silently.
2. **Phase 5** — Redeploy any Edge Functions that changed on this branch. **For v1.1.0 specifically this includes `delete-account` (CORS was tightened)**. Skipping = the app calls the old function code, so account-deletion behavior on prod diverges from what was tested. Also: the Fable re-review 2026-07-05 flagged that the `ACAO: null` value in the shipped code is not a lockdown — remove the `Access-Control-Allow-Origin` header entirely in the same deploy.
3. **Phase 7.5** — Verify each Superwall paywall in the Superwall dashboard has a dismiss control (X, "Not now", or swipe-to-dismiss). Skipping = Apple 3.1.2 rejection.
4. **Phase 8.3** — Run the mandatory UPGRADE test on TestFlight (old app → new app on same device, subscription + progress preserved). Skipping = existing users break the moment they update; hotfix takes 24–72h through Apple.
5. **Phase 9a** — Update the App Store Connect App Privacy questionnaire so it matches `PrivacyInfo.xcprivacy` and `legal/PRIVACY_POLICY.md`. Skipping = Apple review rejection for privacy-manifest mismatch.

Everything else in this checklist is code, config, or timing — these five are the ones that a human has to click / do in an external system, and they're easy to forget.

---

## Phase 0: Decide

- [ ] What are you actually shipping? Write a one-line release note now, not later.
  - Bug fix only? → next patch (`1.1.0` → `1.1.1`)
  - New feature? → next minor (`1.1.0` → `1.2.0`)
  - Breaking user-facing change or major redesign? → next major (`1.1.0` → `2.0.0`)
- [ ] Is this a good time to ship? (Avoid Fridays if possible — Apple review + weekend response times = bad combo.)

---

## Phase 1: Build on dev

- [ ] Confirm `.env` points at dev — `cat .env | grep SUPABASE_URL` shows `xbkkjqvbsnroenqlqkmi`
- [ ] All schema changes for this release exist as migration files in `supabase/migrations/` (create with `supabase migration new <name>`)
- [ ] Migration files applied to dev via `supabase db push --linked` (currently linked to dev — verify with `supabase migration list --linked`)
- [ ] **If schema changed:** regenerate `src/types/supabase.ts` with `npm run gen:supabase-types`. Commit the regenerated file. This is what makes wrong-column bugs a compile error instead of a runtime one — skip this and the app compiles clean but writes into a nonexistent column.
- [ ] Do NOT touch prod DB during development
- [ ] If accidental test signups happened on prod, delete them from prod Supabase → Auth → Users

---

## Phase 2: Pre-release verification (on dev)

- [ ] **Backward-compat check:** if schema changed, install the currently-live app version (from TestFlight or previous build), point it at dev, verify it still works
- [ ] **Full flow smoke test on dev — Apple + Google both:**
  - Fresh sign-up → onboarding → paywall → sandbox purchase → complete a lesson → log out → log back in
- [ ] **Delete account flow works** (tests Edge Function)
- [ ] **Kill switch works on dev:** temporarily set `min_supported_ios_build` to 9999 in dev, launch dev app, verify force-update modal appears; reset to `0` after
- [ ] **Analytics events show up** in PostHog dashboard for the flows you tested

---

## Phase 3: Bump version numbers

Only `app.json` and `package.json` carry the version. Rules in
[`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md).

- [ ] Run the bump script (recommended — keeps versions in sync,
      refuses to run on drift):
  ```bash
  ./scripts/bump-version.sh <new-version> <new-build>
  ```
- [ ] Sanity check — verify both files match:
  ```bash
  node -e "console.log('app.json:', require('./app.json').expo.version)"
  node -e "console.log('package.json:', require('./package.json').version)"
  ```
  Both must show the same marketing version. CI's `version-drift`
  job enforces this.
- [ ] Build number is strictly greater than the last submitted to
      App Store Connect (bump even for rejected builds).

**Managed workflow note:** `ios/Info.plist` and
`ios/*.xcodeproj/project.pbxproj` no longer exist in the repo —
they're generated from `app.json` by `expo prebuild --clean` on every
EAS build. If a doc anywhere else references them for versioning, it's
stale.

---

## Phase 4: Apply schema migrations to prod

**Highest-risk step. Slow down.**

### Which migrations does this specific release need?

- [ ] Run `supabase migration list --linked` — copy the diff between
      Local and Remote. Every "Local only" migration will apply on
      the next `db push`. Only proceed if the list matches your
      expectations for THIS release.
- [ ] For each migration file about to apply, re-read the SQL. In
      particular: `CREATE POLICY` statements must be
      `DROP POLICY IF EXISTS` first, else a half-applied migration
      leaves the file stuck (Fable review #11 idempotence concern).
- [ ] Cross-check against the release notes. If a migration is
      about to apply that's NOT in the release notes → STOP and
      reconcile. Something drifted.

### Verify prod's current state matches your expectations

- [ ] Query prod for the tables/columns you're about to modify.
      Confirm nothing surprising exists.
- [ ] For v1.1.0 specifically: `app_config` table should NOT exist
      on prod yet. Verify with a REST query:
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" \
    "https://zqwzdyjfxytvedghujsd.supabase.co/rest/v1/app_config?select=*&limit=1" \
    -H "apikey: $PROD_ANON_KEY" -H "Authorization: Bearer $PROD_ANON_KEY"
  ```
  Expect `404` (table doesn't exist). If you get `200`, the table
  already exists — investigate before proceeding.

- [ ] **⚠️ Backup reality check.** As of 2026-07-04, prod has NO automated backups (Free tier). If this migration breaks something in a way we can't roll forward, there is no recovery. Review the SQL one more time; make sure `--dry-run` output matches expectations exactly. See `BEST_PRACTICES.md` item #2 for the deferred-fix options.
- [ ] Confirm every SQL file in `supabase/migrations/` that's new since last release is backward-compatible (see [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Schema migrations — backward compatibility"). If it's a breaking change → STOP, refactor to expand-only.

**How to actually verify backward compat (do this, don't just say it's fine):**
- [ ] Install the CURRENTLY-LIVE App Store version of Kinderwell on your iPhone (from App Store, not TestFlight) — this is what most users are running
- [ ] Sign in with a test account
- [ ] Use the app normally — go through onboarding, complete a lesson, hit the paywall, etc.
- [ ] Verify no visible errors, no data corruption, no crashes
- [ ] **This is testing the OLD app against the NEW schema.** If the old app breaks, users on the old version WILL break the moment you push the migration.
- [ ] Only if the old app works cleanly → proceed.
- [ ] Link CLI to prod: `supabase link --project-ref zqwzdyjfxytvedghujsd`
- [ ] Dry-run to see what will apply: `supabase db push --linked --dry-run`
- [ ] Confirm the dry-run lists only the migrations you expect. If it lists something unfamiliar → STOP.
- [ ] Apply to prod during a low-traffic window: `supabase db push --linked`
- [ ] Verify: `supabase migration list --linked` shows both Local and Remote in sync
- [ ] **IMMEDIATELY re-link back to dev** so accidental follow-up commands hit dev, not prod:
  ```bash
  supabase link --project-ref xbkkjqvbsnroenqlqkmi
  ```
- [ ] **Verify prod still works** — open the currently-live App Store app on your phone, test the affected feature. If broken, roll back before submitting.

---

## Phase 5: Deploy Edge Functions to prod (if changed)

- [ ] Identify every Edge Function under `supabase/functions/` that changed on this branch. `git diff <last-release-tag>..HEAD -- supabase/functions/` will show the list.
- [ ] For each changed function, re-read the source in `supabase/functions/<name>/index.ts` before deploying. The prod version is about to become this exact code — no time to catch a typo after `functions deploy` runs.
- [ ] `supabase link --project-ref zqwzdyjfxytvedghujsd`
- [ ] `supabase functions deploy <name> --project-ref zqwzdyjfxytvedghujsd`
- [ ] **IMMEDIATELY re-link back to dev** so accidental commands hit dev, not prod:
  ```bash
  supabase link --project-ref xbkkjqvbsnroenqlqkmi
  ```
- [ ] **Re-test the affected feature from the app** after deploy. For `delete-account` specifically, sign in on the shipped iOS build, tap Settings → Delete Account, verify: single confirmation, subscription warning, success alert, session cleared, no 401. If you get a 401, the refresh + Edge Function chain broke — do NOT ship until fixed.

### v1.1.0 specifics — Edge Function changes this branch

For the v1.1.0 release, the `delete-account` function changed on this branch (CORS tightening — commit `5510406`). Additional carrying instructions from the Fable re-review 2026-07-05:

- [ ] Before the deploy, remove the `Access-Control-Allow-Origin` header entirely from `supabase/functions/delete-account/index.ts`. The `null` value shipped by the previous fix is not a lockdown — the literal string `null` is a real origin browsers will send. Native fetch (what our app uses) ignores CORS entirely, so removing the header has zero app impact and closes the browser-side hygiene gap.
- [ ] Verify locally that `deno check supabase/functions/delete-account/index.ts` (or `supabase functions serve` invocation) still passes before deploying.
- [ ] The Edge Function redeploy is a **submission blocker** for v1.1.0 (see the callout at the top of this doc).

---

## Phase 6: Rotate secrets if any were exposed

- [ ] Any DB password, service_role key, Apple JWT, Google OAuth client secret exposed in chat / commits since last release? If yes, rotate before shipping.
- [ ] Update `.env`, `.env.prod`, and `eas.json` production profile with new values

---

## Phase 7: Build for App Store

### Pre-build sanity checks (Fable re-review 2026-07-05)

Before running `eas build`, run these three checks. Each is <30 seconds
and each has a way to fail silently and give you a broken build without
the CLI telling you anything is wrong.

- [ ] **`SENTRY_AUTH_TOKEN` EAS secret exists.**
  ```bash
  eas env:list --environment production | grep SENTRY_AUTH_TOKEN
  ```
  Expect a line ending in `(sensitive, hidden)`. If missing, the
  `@sentry/react-native/expo` prebuild plugin can't upload source
  maps and every prod crash resolves to unreadable stack traces.
  Recreate with:
  ```bash
  eas env:create --environment production --name SENTRY_AUTH_TOKEN --value <token>
  ```
  (Token comes from Sentry → Settings → Auth Tokens with `project:releases` scope.)

- [ ] **Supabase prod project ref is identical in all three files.**
  ```bash
  echo "=== src/lib/env.ts ===" && grep PROD_PROJECT_REF src/lib/env.ts
  echo "=== eas.json production ===" && python3 -c "import json; print(json.load(open('eas.json'))['build']['production']['env']['SUPABASE_URL'])"
  echo "=== app.config.js ===" && grep 'includes.*supabase\|zqwzdyjfxytvedghujsd' app.config.js | head -2
  ```
  The three should all reference the same project ref. If any one
  drifts, the build succeeds but every launch throws the "REFUSING
  to connect / bundle pointed at wrong project" guard error and the
  binary is DOA. Caught by the runtime guard, but pre-checking here
  saves a wasted TestFlight upload.

- [ ] **`eas.json` still has `"appVersionSource": "local"`** in the `cli`
  block. Without it, EAS ignores the carefully-synced `buildNumber`
  in `app.json` and either prompts interactively or auto-increments
  server-side, breaking `bump-version.sh` doctrine + kill-switch
  comparisons.
  ```bash
  python3 -c "import json; print('appVersionSource =', json.load(open('eas.json'))['cli'].get('appVersionSource'))"
  ```
  Expect `appVersionSource = local`.

### Build

- [ ] Any new native module or bundle ID change since last build? If yes, run `npx expo prebuild --clean` first
- [ ] Build:
  ```bash
  eas build --profile production --platform ios
  ```
- [ ] Wait for build to complete. Do NOT submit yet.

---

## Phase 7.5: Superwall dashboard verification (submission blocker)

Superwall paywalls live outside the repo and can drift silently between
releases. Verify these BEFORE submitting to Apple — a misconfigured
paywall is a real 3.1.2 rejection vector (see Fable review #10).

For EVERY paywall the app can present (currently: `show_paywall` from
LoadingScreen, `learn_access` from useLessonGate) verify in the
Superwall dashboard:

- [ ] **Dismiss control present** — X button, "Not now" link, or
      Modal/Sheet presentation style that allows swipe-down.
      Apple guideline 3.1.2 requires this. Prod v1.0.0's paywall
      shipped without a dismiss control — real rejection risk that
      slipped past prior submissions and must not slip past again.
- [ ] **Visible price** with billing period ("$12.99/month",
      "$69.99/year")
- [ ] **Terms of Use (EULA) link** working, opens the right URL
- [ ] **Privacy Policy link** working, opens the right URL
- [ ] **Restore Purchases** button/link present (required by 3.1.1)

For the Gated paywall specifically (`learn_access`):
- [ ] Placement config: audience = All Users, entitlements =
      unsubscribed, Feature Gating = **Gated** (not Non-Gated)
- [ ] Paywall assigned: "Calorie Tracker - Gated" template (100%)

---

## Phase 8: Test the production build

### 8.1 TestFlight install available

- [ ] Confirm build shows up in App Store Connect → Kinderwell → TestFlight → Internal Testing → **Homies** group (has 3 testers: `mandeepv98@gmail.com`, `kinderwelltry1@gmail.com`, `jacobf1607@gmail.com`)
- [ ] Sandbox Apple ID signed in on the test iPhone (`sandeepv98@gmail.com`) so real IAP is exercised, not real money

### 8.2 Fresh-install smoke test (do this second)

- [ ] Delete Kinderwell if installed. Reinstall from TestFlight.
- [ ] Full flow smoke test on real device — same list as Phase 2, but against prod backend.

### 8.3 UPGRADE test — MANDATORY (Fable review #12)

**Why this matters:** App Store releases cannot be rolled back. If
v1.x.y breaks existing users but works for fresh installs, we won't
know until they update — and the only recovery is a hotfix that takes
24–72h through Apple review, during which every existing user who
opens the app is broken. This test simulates the exact user journey
of "already had the current live build, updates to this new build" —
the scenario a fresh-install smoke test WILL NOT catch.

**Setup the pre-upgrade state:**

- [ ] Uninstall the TestFlight build first (we're testing the OLD →
      NEW transition).
- [ ] Install the **currently-live App Store version** of Kinderwell
      (NOT TestFlight — go to the actual App Store app on the phone
      and search / update).
- [ ] Sign in on the current App Store build with a test account.
- [ ] Complete onboarding.
- [ ] Sandbox-subscribe via the paywall (monthly is fine — 5-minute
      renewal cycle in sandbox lets us verify renewal too).
- [ ] Complete at least 2 lesson sections so AsyncStorage progress
      exists (`getCompletedSections` under `sprinklersProgress` etc.)
- [ ] Force-quit the app.

**Now do the upgrade:**

- [ ] Open TestFlight app on iPhone.
- [ ] Install the new build. iOS will overwrite the App Store install
      with the TestFlight one.
- [ ] Open Kinderwell.

**Verify — none of these may fail:**

- [ ] User is still signed in (Splash goes straight to Root, no
      Welcome screen)
- [ ] Landing screen is LearnScreen (not onboarding, not paywall)
- [ ] Lesson progress is intact — the specific sections you completed
      pre-upgrade still show as completed post-upgrade
- [ ] Tap a lesson section that was previously reachable — content
      opens with no paywall flash. `useLessonGate` sees the sandbox
      subscription and passes through.
- [ ] **Cold start in airplane mode** — turn on airplane mode,
      force-quit, reopen. Tap a lesson. Content opens (this exercises
      the fail-open fallback in `useLessonGate` for confirmed
      subscribers, Fable review #9).
- [ ] Turn airplane mode off. Settings → Restore Purchases → alert
      says "Restored" (not "No Purchases Found" or "Failed").
- [ ] Settings → Delete Account → single confirmation (not the old
      two-step). Alert warns about subscription. Tap Delete. Verify
      it succeeds (no 401). Auth session is cleared, land on Welcome.
- [ ] Any test users created during this? Note them so you can delete
      post-approval.

**If ANY of the above fails: STOP.** Do not submit. Fix, rebuild, retest
the upgrade path. Fresh install passing is not enough — that's what
the pre-Fable v1.0.0 release did.

---

## Phase 8.4: External TestFlight beta (before App Store submission)

**Why this phase exists:** the Fable re-review 2026-07-05 flagged that we
had no external-beta path in any doc. External TestFlight goes through
Apple's Beta App Review — several of the "submission blockers" from
the top of this checklist actually apply here, not just at final
submission. This phase closes that gap.

**Do NOT skip straight from internal beta to App Store submission.**
Every strangers-first release needs this window to catch regressions
that 3-tester internal beta can't reproduce.

### 8.4a — Promotion criteria (must all be true before adding external testers)

- [ ] All 3 internal testers (Homies) have installed the current TestFlight build.
- [ ] All 3 have completed the mandatory upgrade path (from live App Store v1.0.0 build 8) end-to-end without a report of broken behavior.
- [ ] All 3 have completed at least one full "sign in → onboarding → paywall → complete a lesson" fresh path.
- [ ] Sentry `environment=prod` on this release version shows **zero P0 crashes** across 48h of active testing. Filter: `release = kinderwell@1.1.0` (or current), `environment = prod`.
- [ ] PostHog conversion funnel on this release shows no unexpected drop-offs vs. the v1.0.0 baseline (Splash → Welcome → Auth → onboarding → paywall).
- [ ] Zero unresolved tester feedback items rated blocker or above (see 8.4b for the feedback mechanism).
- [ ] The 3 tester devices have `demo_mode_activated` count of 0–5 total (any single tester with >5 activations means they're stress-testing, not that end users have found the gesture — safe).

### 8.4b — Tester feedback mechanism

Testers report issues via one of:

- [ ] **In-app feedback:** long-press the 7-tap title area 3 times to open a `mailto:kinderwellteam@gmail.com?subject=Kinderwell%20Beta%20Feedback` composer. (**Not built yet** — for v1.1.0 testers, rely on the two channels below.)
- [ ] **TestFlight feedback:** TestFlight's built-in "Send Beta Feedback" button. Check daily during beta.
- [ ] **Direct email** to kinderwellteam@gmail.com. Homies have this already.

Homies briefing (send this to the 3 testers **before** they install):

> **Kinderwell v1.1.0 internal beta — please read before opening**
>
> Thanks for testing! A few things you need to know:
>
> 1. **The paywall has no close button in this build.** If you see the paywall and don't want to subscribe (with a sandbox Apple ID or otherwise), **force-quit the app and reopen** — you'll land on the LearnScreen, not stuck in a loop. This is a known issue being fixed before external beta.
> 2. **You will be running against production Supabase.** Please DO NOT run through onboarding with real test data multiple times — every fresh sign-in creates a real prod user record. If you complete a flow and want to re-test, use Settings → Delete Account first.
> 3. **Sandbox payments:** if you want to test subscription flows, sign into iPhone Settings → App Store → Sandbox Account with the sandbox Apple ID (`sandeepv98@gmail.com`) before opening Kinderwell. Sandbox subs auto-renew every 5 minutes so we can verify renewal behavior quickly.
> 4. **7-tap demo mode:** on the "Save your progress" auth screen, tap the title 7 times quickly to unlock all premium content without a purchase. This is the reviewer-testing path — please only use it if you want to skip the paywall entirely for testing.
> 5. **Please report:** any crash, any confusing screen, any behavior that "feels wrong." Even small things. TestFlight has a "Send Beta Feedback" button, or email kinderwellteam@gmail.com.

### 8.4c — External TestFlight setup

- [ ] Add a "Public link" beta group in App Store Connect → TestFlight → External Testing, OR curate a specific list of testers by email.
- [ ] Fill out **TestFlight Test Information** (required by Apple Beta App Review, will reject otherwise):
  - Beta App Description
  - Feedback Email: kinderwellteam@gmail.com
  - Marketing URL (optional but recommended)
  - Privacy Policy URL: `https://mandeepv.github.io/kinderwell-legal/privacy.html` — verify returns 200
  - What to Test (list the specific flows you want feedback on)
  - Demo Account credentials / instructions — copy-paste from `docs/DEMO_MODE.md` "What Apple Review Instructions should say" section
- [ ] Copy the same App Privacy questionnaire answers you'll use for final submission (Phase 9a) — Beta App Review checks these too.

### 8.4d — External beta hardening (recommended, not blocking)

Do these *before* strangers' data arrives. From the Fable re-review 2026-07-05:

- [ ] **Rotate prod DB password** (see `BACKLOG.md` 9i, ~15 min in Supabase dashboard). Coordinate leaked in git history; never rotated since prod was provisioned.
- [ ] **Manual `supabase db dump` of prod** as insurance:
  ```bash
  supabase db dump --project-ref <redacted-prod-ref> --data-only > backups/prod-$(date +%Y%m%d).sql
  ```
  Prod has no automated backups (Free tier); this is the cheapest possible safety net if a bad migration or Edge Function change corrupts data. Store outside the repo (do NOT commit).
- [ ] **PostHog person-deletion** (see `BACKLOG.md` 9j, ~2-3h). Privacy policy was amended (kinderwell-legal `6d85d95`) to describe the current gap honestly ("we plan to add automatic PostHog deletion in a subsequent release"). Amendment is defensible for internal beta; for external beta, either ship the code fix OR keep the amended policy as the permanent answer.

### 8.4e — External beta exit criteria (must all be true to proceed to Phase 9 App Store submission)

- [ ] External beta has been running ≥ 5 days with active testers.
- [ ] Zero P0 crashes / regressions surfaced by external testers.
- [ ] All beta feedback rated blocker or above resolved (or explicitly deferred to a v1.1.1 hotfix if not release-blocking).
- [ ] Sentry `environment=prod` on this release shows no new error signatures from external testers that don't have a diagnosis.
- [ ] Tester count is high enough to be meaningful (target: ≥ 10 external testers who actually opened the app).

**If any exit criterion fails:** stay in external beta, or ship a beta-only hotfix build (do NOT release to App Store).

---

## Phase 9: Submit to App Store

- [ ] `eas submit --profile production --platform ios`
- [ ] Fill out App Store Connect submission:
  - What to test (TestFlight notes)
  - What's new (user-facing release notes)
  - Demo access instructions — see [`DEMO_MODE.md`](./DEMO_MODE.md) → "What Apple Review Instructions should say" for the exact text. Use BOTH the sandbox-purchase primary path AND the 7-tap fallback. Sandbox purchase is Apple's documented testing path for auto-renewing subscriptions; 7-tap is our Kinderwell-specific fallback. Fable review #13 corrected the prior "Apple-mandated" framing in DEMO_MODE.md and recommends leading with sandbox purchase.
  - Screenshots up to date? If UI changed, update them
- [ ] **Version Release** section → select **"Manually release this version"** (NOT "Automatically release"). Prevents the app from going live the second Apple approves it — you'll click a button when YOU'RE ready (early morning, low-traffic window, after final smoke test on prod build).
- [ ] **Phased Release for Automatic Updates** section → toggle **ON** (**"Release update over a 7-day period using phased release"**). Apple auto-rolls out over 7 days — ~1% day 1, ~2% day 2, etc. If crashes / bad reviews spike in the first days, you pause the rollout and only ~10% of users saw the bad build.

### 9a: App Privacy questionnaire (App Store Connect → App → App Privacy)

This section MUST match `PrivacyInfo.xcprivacy` and `legal/PRIVACY_POLICY.md`. If they diverge, App Store review rejects. For **v1.1.0**, the current answers are outdated — the previous submission omitted PostHog and Sentry, and mis-stated children's data. **Update these before submitting v1.1.0.**

The exact data types to declare (matching what our app actually does — see `legal/PRIVACY_POLICY.md` for full context):

**Contact Info:**
- **Email Address** — Linked to user, NOT used for tracking. Purposes: App Functionality, Analytics. (Supabase auth, PostHog identify.)
- **Name** — Linked to user. Purposes: App Functionality. (From Google/Apple Sign-In.)

**User Content:**
- **Other User Content** — Linked to user. Purposes: App Functionality, Product Personalization. (Onboarding answers: user type, age, children's age ranges + gender, parenting styles, goals, challenges.)

**Identifiers:**
- **User ID** — Linked to user. Purposes: App Functionality, Analytics. (Supabase user id + PostHog identify.)
- **Device ID** — NOT linked to user. Purposes: Analytics. (PostHog anonymous events.)

**Purchases:**
- **Purchase History** — Linked to user. Purposes: App Functionality. (Superwall + Apple IAP subscription state.)

**Usage Data:**
- **Product Interaction** — Linked to user. Purposes: App Functionality, Analytics, Product Personalization. (PostHog screen views, event captures.)

**Diagnostics:**
- **Crash Data** — NOT linked to user. Purposes: App Functionality. (Sentry native crashes.)
- **Performance Data** — NOT linked to user. Purposes: App Functionality. (Sentry non-crash errors.)
- **Other Diagnostic Data** — NOT linked to user. Purposes: App Functionality. (Sentry breadcrumbs / context.)

**Data NOT collected (leave unchecked):**
- Precise Location, Coarse Location
- Financial Info, Payment Info (Apple handles all payments, we never see them)
- Contacts, Health & Fitness data
- Photos, Video, Audio, Voice
- Sensitive Info (race, orientation, religion, etc.)
- Browsing / Search History
- Any "Third-Party Advertising" data category

**Tracking:** Answer "No" — we do NOT use ATT-classified tracking. We don't build ad-targeting profiles or share data with data brokers.

- [ ] All 10 declared data types above are set correctly in App Store Connect → App Privacy
- [ ] Confirmed `PrivacyInfo.xcprivacy` (in `app.config.js`) declares the SAME types with matching Linked/Tracking/Purposes flags
- [ ] Confirmed the published privacy policy at `https://mandeepv.github.io/kinderwell-legal/privacy.html` describes the same collection and purposes as above
- [ ] Submit for review

---

## Phase 10: After Apple approval

- [ ] **Do NOT click "Release" immediately.** Apple has approved; the build is now in "Pending Developer Release" state. Take a beat.
- [ ] Install the approved build via TestFlight one more time and run the full smoke test on real device. Any last-minute issue? DO NOT release; go back and fix.
- [ ] If clean → click **"Release This Version"** in App Store Connect at a low-traffic window (early morning your timezone is fine).
- [ ] Follow [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) — create build-specific tag `v1.1.0-build-9`
- [ ] Move production marker tag `appstore-live-v1.1.0`
- [ ] Push tags to GitHub
- [ ] Delete test users from prod Supabase → Authentication → Users
- [ ] Update `docs/BEST_PRACTICES.md` "Done" section with this release date

---

## Phase 11: Post-release monitoring (phased rollout window — 24-72h then 7 days)

**During phased release, users get the new build gradually. This is your window to catch issues affecting <10% of users before the rollout hits everyone.**

Days 1-3 (heaviest monitoring):
- [ ] Watch App Store Connect → Analytics → Crashes for spikes on the new version
- [ ] Watch Sentry → Issues → filter to `environment=prod` and this release version
- [ ] Watch PostHog dashboard for:
  - Funnel drop-off changes
  - Auth failure spikes (`user_signed_in` vs `auth_attempted` ratio)
  - Paywall conversion changes
- [ ] Watch Supabase → Reports for query latency or error spikes
- [ ] Check ratings & reviews on App Store for early user reports

**If something bad shows up during phased release:**
- [ ] App Store Connect → your version → **"Pause Phased Release"** — freezes the rollout at current % until you unpause
- [ ] Diagnose the issue
- [ ] Fix + submit hotfix build (see Emergency section below)
- [ ] Once fixed, either release the hotfix build (recommended) or resume phased release with confidence

Days 4-7:
- [ ] Continue monitoring but less intensively
- [ ] By day 7, Apple has rolled out to 100%. This is now the new "live" version.

---

## Emergency: bad release rollback

Something's on fire post-release. In order of preference:

1. **Kill switch** — bump `min_supported_ios_build` in prod:
   ```sql
   UPDATE public.app_config
   SET value = 'NEXT_BUILD'::jsonb, updated_at = now()
   WHERE key = 'min_supported_ios_build';
   ```
   Ship the fix ASAP.
2. **Server-side toggle** — if the issue is a specific feature and you have a flag for it, disable via PostHog feature flag or DB update.
3. **Expedited Apple review** — https://developer.apple.com/contact/app-store/?topic=expedite — genuine emergency only.
4. **Schema rollback** — write a reverse migration and apply to prod. See [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Rollback plans".

---

## Between releases — recurring hygiene

- [ ] Weekly: check App Store Connect crashes + PostHog funnels
- [ ] Weekly: PostHog dashboard → filter events to `demo_mode_activated`, `environment = prod`, `$app_version = <latest>` and count activations over the last 7 days. **Threshold: ~20/week.** Expected baseline is 1-5/week (Apple reviewers only). If the count spikes above ~20/week, the 7-tap gesture has been discovered by end users — remove it in the next release before Apple notices in review. See `docs/DEMO_MODE.md` "Guideline 2.3.1 concern" section for the full rip-out decision framework. Also rip out if Apple raises 2.3.1 in a submission review, regardless of the count.
- [ ] Monthly: check `BEST_PRACTICES.md` gap list — anything worth doing?
- [ ] Every 6 months: rotate Apple JWT — see [`APPLE_JWT_ROTATION.md`](./APPLE_JWT_ROTATION.md)
- [ ] Every 6 months: rotate DB passwords for good hygiene
- [ ] Quarterly: verify backups exist and can restore — see [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Rollback plans"
