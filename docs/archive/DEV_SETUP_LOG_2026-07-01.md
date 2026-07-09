# Dev Environment Setup Log — 2026-07-01

**Purpose:** point-in-time record of every change made setting up the `kinderwell-dev` Supabase environment. Use this to retrace and debug if something in dev doesn't work as expected.

**After Saturday's smoke test passes:** move this file to `docs/archive/` (or delete). It's a receipt, not an ongoing reference. The permanent guide is `DEV_PROD_ENVIRONMENTS.md`.

**Related session:** Claude Code chat, 2026-07-01, `~4pm–7pm IST`.

---

## What we set up

### 1. Supabase dev project created
- **Name:** `kinderwell-dev`
- **Project ref:** `xbkkjqvbsnroenqlqkmi`
- **URL:** `https://xbkkjqvbsnroenqlqkmi.supabase.co`
- **Anon (publishable) key:** `sb_publishable_vsR2RDq_4WE4KKK9f22k0Q_6BKJbwJU`
- **Region:** us-west-1 (prod is us-west-2 — different, both fine)
- **DB pooler host:** `aws-1-us-west-1.pooler.supabase.com`
- **DB password:** ⚠️ SAME AS PROD (should be rotated — see task #7 and Best Practices item 8)

### 2. Schema cloned from prod
- Dumped prod schema with `pg_dump 17.10` (installed via `brew install postgresql@17`) since prod is on Postgres 17 and existing `pg_dump 14` couldn't handle it
- File saved to `supabase/prod_schema.sql` (185 lines, in repo but not committed)
- Applied to dev via `psql`
- **Tables created on dev:** `user_profiles`, `lesson_progress`
- **RLS policies created:** 7 (all `USING (auth.uid() = user_id / id)` pattern)
- **FKs:** both tables reference `auth.users(id) ON DELETE CASCADE`
- **Extension needed:** `uuid-ossp` (Supabase enables by default — no action taken)

### 3. Edge Function deployed to dev
- **Function:** `delete-account`
- **Command used:** `supabase functions deploy delete-account --project-ref xbkkjqvbsnroenqlqkmi`
- **Source:** `supabase/functions/delete-account/index.ts` (unchanged from prod)
- **Uses env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (auto-provided by Supabase runtime)

### 4. Apple Sign In wired to dev

**On Apple Developer portal (Services ID `com.kinderwell.app.auth`):**
- Added Domain: `xbkkjqvbsnroenqlqkmi.supabase.co`
- Added Return URL: `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- **Existing prod entries preserved:** `zqwzdyjfxytvedghujsd.supabase.co` and its callback URL

**On dev Supabase (Auth → Providers → Apple):**
- Enabled: ✅
- **Client IDs:** `com.kinderwell.app,com.kinderwell.app.auth`
- **Secret Key (JWT):** freshly generated via `node scripts/generate_apple_jwt.js` — valid 180 days (expires ~2026-12-28)
- **Callback URL (auto-shown):** `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- Allow users without email: OFF

**Apple credentials used (shared with prod, non-sensitive):**
- Team ID: `DX4F38J8H4`
- Services ID: `com.kinderwell.app.auth`
- Key ID: `8SVB695TG5`
- Private key: `~/Downloads/AuthKey_8SVB695TG5.p8`

### 5. Google Sign In wired to dev

**On Google Cloud Console (OAuth 2.0 client):**
- Added Authorized redirect URI: `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- **Existing prod URI preserved:** `https://zqwzdyjfxytvedghujsd.supabase.co/auth/v1/callback`

**On dev Supabase (Auth → Providers → Google):**
- Enabled: ✅
- **Client IDs:** `737394030212-cdrh1o3lomp3oi29rsovfcoion32oh9j.apps.googleusercontent.com`
- **Client Secret:** reused prod's (revealed from prod Supabase Auth panel)
- **Callback URL (auto-shown):** `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- Skip nonce checks: OFF
- Allow users without email: OFF

### 6. Auth redirect URLs on dev Supabase (URL Configuration)
- **Site URL:** `kinderwell://`
- **Redirect URLs allowlist:**
  - `kinderwell://`
  - `kinderwell://auth/callback`
  - `kinderwell://*`

### 7. Local `.env` repointed to dev
- **Backup saved:** `.env.prod` (gitignored) — the original file pointing at prod
- **`.env` now contains:**
  ```
  SUPABASE_URL=https://xbkkjqvbsnroenqlqkmi.supabase.co
  SUPABASE_ANON_KEY=sb_publishable_vsR2RDq_4WE4KKK9f22k0Q_6BKJbwJU
  SUPERWALL_API_KEY=pk_FkXYLnmCtS4lGjBnjkBHR   (unchanged — Superwall shared)
  SKIP_PAYWALL=false
  SHOW_DEMO_BUTTON=true
  ```
- **`.gitignore`:** added `.env.prod` line

### 8. `eas.json` updated
- **`development` profile:** added `env` block pointing at dev Supabase
- **`preview` profile:** added `env` block pointing at dev Supabase
- **`production` profile:** ⚠️ UNTOUCHED — still points at prod

### 9. Startup env indicator added to app
- **File modified:** `src/lib/supabase.ts`
- **What it does:** On startup in `__DEV__` builds only, logs one of:
  - `[Supabase] Env: DEV ✅ | Project: xbkkjqvbsnroenqlqkmi`
  - `[Supabase] Env: PROD ⚠️ | Project: zqwzdyjfxytvedghujsd`
  - `[Supabase] Env: UNKNOWN | Project: <ref>`
- Silent in production/release builds (`__DEV__` false)

### 10. Supabase CLI relinked to dev
- **Before session:** linked to prod (`zqwzdyjfxytvedghujsd`)
- **After session:** linked to dev (`xbkkjqvbsnroenqlqkmi`)
- **File updated:** `supabase/.temp/project-ref`
- **Why dev is safer as default link:** any accidental `supabase db ...` or `supabase functions deploy` will hit dev, not prod

---

## What we did NOT change (prod is unchanged)

- Prod Supabase project — no schema edits, no auth changes, no function deploys
- Prod DB — no data touched, only `pg_dump` (read-only)
- Prod app builds — `production` profile in `eas.json` still points at prod
- Prod app users — none affected
- Superwall — same API key, same campaigns (shared by design)
- Apple IAP products — unchanged (sandbox handles dev isolation automatically)
- App Store Connect — no submissions or changes

---

## Files changed in the repo

| File | Change | Committed? |
|---|---|---|
| `.env` | Repointed to dev Supabase | Gitignored — will never commit |
| `.env.prod` | New — backup of old prod-pointing .env | Gitignored |
| `.gitignore` | Added `.env.prod` | Not committed yet |
| `eas.json` | Added dev env blocks to `development` and `preview` profiles | Not committed yet |
| `src/lib/supabase.ts` | Added startup env indicator | Not committed yet |
| `supabase/prod_schema.sql` | New — dumped from prod | Not committed yet (contains schema only, no data) |
| `supabase/.temp/project-ref` | Changed prod ref → dev ref | Gitignored |
| `docs/DEV_PROD_ENVIRONMENTS.md` | New — permanent env guide | Not committed yet |
| `docs/BEST_PRACTICES.md` | New — prioritized gap list | Not committed yet |
| `docs/README.md` | New — docs index | Not committed yet |
| `README.md` | Added Documentation section | Not committed yet |
| `docs/*` (10 files moved from root) | Reorganized | Move tracked via `git mv` |

---

## Saturday verification checklist

Before doing anything on Saturday, plug the iPhone in and prep:

- [ ] Confirm iPhone shows in `xcrun xctrace list devices` (or Xcode → Window → Devices and Simulators)
- [ ] Confirm you're signed into the developer Apple ID in Xcode
- [ ] Confirm sandbox Apple ID created in App Store Connect (see `STOREKIT_SETUP_GUIDE.md`) and signed in on iPhone (Settings → App Store → Sandbox Account)
- [ ] Confirm local `.env` still points at dev: `cat .env | grep SUPABASE_URL` → should show `xbkkjqvbsnroenqlqkmi`

### Step 1: Build and install dev client on iPhone

```bash
npx expo run:ios --device
```

- [ ] Build succeeds
- [ ] App installs on iPhone
- [ ] Metro logs show `[Supabase] Env: DEV ✅ | Project: xbkkjqvbsnroenqlqkmi`
  - ❌ If it shows `PROD ⚠️`, stop. Something's wrong. Check `.env` file.
  - ❌ If it shows `UNKNOWN`, stop. The URL doesn't match either known project. Check `.env`.

### Step 2: Fresh sign-up with Apple

- [ ] Tap "Sign in with Apple" on onboarding
- [ ] Sign-in sheet appears (Apple's native modal)
- [ ] Complete sign-in with your Apple ID
- [ ] App proceeds past auth screen (no error, no hang)
- [ ] Onboarding flow starts
- [ ] Verify user appears in **dev** Supabase: dashboard → Authentication → Users → new row with your Apple email
- [ ] Verify user does NOT appear in **prod** Supabase Users list

**If sign-in fails or hangs:**
- Most likely cause: Apple Services ID Return URL missing dev callback → recheck Apple portal
- Second most likely: dev Supabase Apple provider client ID mismatch → recheck `com.kinderwell.app,com.kinderwell.app.auth`
- Third: `Site URL` / redirect URLs missing on dev Supabase → recheck URL Configuration

### Step 3: Complete onboarding and check DB writes

- [ ] Fill out onboarding to completion
- [ ] Verify a row exists in **dev** Supabase → `user_profiles` matching your auth user ID
- [ ] Verify RLS: try `SELECT * FROM user_profiles;` in dev SQL editor as anon → should return only your row (or fail if you're not authed)

### Step 4: Sign out and back in

- [ ] Sign out from app Settings
- [ ] Sign in again with Apple
- [ ] App recognizes returning user, shows onboarding completed state

### Step 5: Google Sign-In

- [ ] Delete the account via app Settings ("Delete Account" button — this hits the Edge Function)
- [ ] Verify user is gone from **dev** Supabase Users list
- [ ] Verify the corresponding `user_profiles` row is gone (FK cascade)
- [ ] Sign up fresh with Google
- [ ] Google OAuth browser flow completes, redirects back to `kinderwell://`
- [ ] App proceeds past auth, onboarding starts

**If Google sign-in fails at the redirect step:**
- Most likely: Google Cloud Console missing dev callback URI → recheck
- Second: dev Supabase Google client secret wrong → recheck by revealing it in dashboard

### Step 6: Paywall + sandbox purchase

- [ ] Complete onboarding, reach paywall
- [ ] Paywall renders (Superwall config loaded)
- [ ] Tap a subscription option
- [ ] Sandbox purchase sheet appears (shows "[Environment: Sandbox]" or similar)
- [ ] Complete purchase with sandbox Apple ID
- [ ] App receives success, unlocks content

**If real money would be charged:** you're NOT in a sandbox build. Stop, verify you built via `expo run:ios --device` (debug) not a store-signed build.

### Step 7: Delete account (Edge Function)

- [ ] Settings → Delete Account
- [ ] Confirm deletion
- [ ] Check dev Supabase Edge Functions → `delete-account` → Logs → see the invocation
- [ ] Verify user is gone from Users list
- [ ] Verify `user_profiles` row is gone

### Step 8: Verify prod is untouched

- [ ] Open prod Supabase → Authentication → Users. Confirm NONE of your Saturday test users appear there.
- [ ] Open prod Supabase → Table Editor → `user_profiles` → same check.

---

## If anything fails during verification

1. **First:** re-read the corresponding section above ("What we set up") and cross-check the exact values against what's in the dashboard now
2. **Second:** check Metro logs (Xcode → Devices → Console) for the actual error text
3. **Third:** ask Claude with the exact error and the section number from above

Most common failure modes and their fix:
- **Apple sign-in hangs after user consents** → Apple Services ID missing dev Return URL, or dev Supabase Apple provider has wrong client ID
- **Google sign-in returns to browser with an error** → Google Cloud Console missing dev redirect URI, or client secret mismatch
- **App shows `[Supabase] Env: PROD ⚠️`** → `.env` file was reverted somehow, run `cat .env | grep SUPABASE_URL` and swap back if needed
- **Test user shows up in PROD, not dev** → same as above — the app is pointing at prod

---

## After Saturday passes

1. Move this file: `mv docs/DEV_SETUP_LOG_2026-07-01.md docs/archive/`
2. Commit any post-Saturday fixes to the branch, then merge `setup/dev-environment` to `main`

---

## Continued work — 2026-07-01 evening

After the initial dev setup was committed to `setup/dev-environment`, we started on the roadmap items that don't require the iPhone. Tracking here so nothing gets lost.

### Migration tracking set up ✅ (2026-07-01)

Best Practices item #1 knocked out.

- Created `supabase/migrations/` folder
- Baseline saved as `supabase/migrations/20260101000000_initial_schema.sql` (copy of `supabase/prod_schema.sql`)
- Docs updated: `DEV_PROD_ENVIRONMENTS.md` → "Migration tracking" section now says "Set up on 2026-07-01" and references the baseline file
- `BEST_PRACTICES.md` item #1: to be marked done in a later commit

**From now on:** every schema change goes as `supabase/migrations/YYYYMMDDHHMMSS_description.sql` — apply to dev first, then prod, commit the file.

### PostHog analytics ✅ installed (2026-07-01) — awaiting verification

**Why:** funnel visibility before A/B tests / conversion decisions. See `PRODUCT_ROADMAP.md`.

**How it was installed:** `npx @posthog/wizard@latest` did most of it — SDK install, config file, provider wrap, screen tracking, 11 lifecycle events instrumented. Then we added:
- Env vars in `eas.json` for all three build profiles (using same dev key everywhere; prod placeholder for later)
- `POSTHOG_PROJECT_TOKEN` line in `.env.prod`
- `posthog.identify()` in `authStore.ts` `initialize()` — so returning users with a persisted session get identified on app launch (wizard flagged this gap)
- Created `.env.example` documenting all env vars

**Files changed:**
- `package.json` — added `posthog-react-native` + 4 transitive expo deps (`expo-application`, `expo-device`, `expo-file-system`, `expo-localization`)
- `.env` — added `POSTHOG_PROJECT_TOKEN=phc_nrGkHz...` and `POSTHOG_HOST=https://us.i.posthog.com`
- `.env.prod` — added `POSTHOG_PROJECT_TOKEN` (same key as dev — free tier limits us to 1 project; separation via env property)
- `eas.json` — added PostHog vars to all three profiles (prod uses placeholder until real prod project created)
- `app.config.js` — exposed `posthogProjectToken` and `posthogHost` via `extra`
- `src/config/posthog.ts` — new — PostHog init with graceful degradation if token missing
- `App.tsx` — wrapped with `PostHogProvider`, added `NavigationContainer.onStateChange` for screen tracking
- `src/store/authStore.ts` — added `posthog.identify()` for returning users on session restore
- Six screens instrumented by wizard (see `posthog-setup-report.md` for details)

**Screen tracking:** every navigation change fires a `$screen` event with the route name. That gives you the full onboarding funnel automatically (Splash → Welcome → UserType → NameAge → ... → Auth → Loading → PremiumUnlocked) — no per-step manual instrumentation needed.

**Custom events instrumented (11):**
See `posthog-setup-report.md` for the full list. Notable ones: `onboarding_completed`, `user_signed_in`, `subscription_purchased`, `paywall_dismissed`, `lesson_started`, `user_logged_out`, `account_deleted`.

**PostHog dashboards created by wizard:** links in `posthog-setup-report.md`.

**Dev/prod share one PostHog project (2026-07-03 decision):** PostHog free tier only allows one project. Instead of paying, we tag every event with an `environment` super-property (`dev` or `prod`) derived from the Supabase URL. Filter dashboards by `environment = prod` to see only real users. See `src/config/posthog.ts`.

**How to verify:**
- Run `npx expo start --ios` — Metro logs should show PostHog debug output
- Complete onboarding in the simulator
- Sign up
- Check PostHog dashboard within 2 minutes for events like `$screen`, `onboarding_completed`, `user_signed_in`

### Onboarding tracking additions (2026-07-01 evening)

Added 4 higher-signal tracking items on top of what the wizard did:

**New shared helper:** `src/lib/analytics.ts` — thin wrappers around `posthog.capture` for the events below. Keeps event schema in one place, easier to rename/refactor later.

Also exposes `safeCapture(event, props)` — a try/catch wrapper used from any code path that touches money, auth, or the paywall (LoadingScreen paywall handlers). Analytics failure must never break a real user flow.

**New events:**
- `onboarding_step_completed` — fires on continue from each answering screen with `{ step, answer }`. Screens instrumented:
  - `UserType` (answer: father/mother/other)
  - `NameAge` (answer: `{ age, has_name }` — name NOT sent, PII)
  - `ChildrenCount` (answer: `{ count, age_ranges }`)
  - `ImprovementGoals` (answer: array of goals)
  - `PartnerInvolvement` (answer: level)
  - `GoalSelection` (answer: learning goal)
  - `ExperienceLevel` (answer: level)
  - `ParentingStyles` (answer: array)
  - `EmotionalChallenges` (answer: `{ challenges, skipped }`)
- `auth_attempted` — fires on Google/Apple button tap in AuthScreen + SignInScreen, before OAuth
- `auth_abandoned` — fires if session isn't returned (user quit browser) or error
- `paywall_option_selected` — fires via Superwall's `transaction_start` event when user taps a plan (BEFORE App Store sheet)
- `paywall_purchase_abandoned` — fires if user closes App Store sheet without paying
- `paywall_purchase_failed` — fires on payment error

**Enriched identify:** `identifyUserWithOnboarding()` sets these user properties on identify (they attach to ALL future events for that user, enabling segmentation):
- `email`, `user_type`, `age`, `children_count`, `experience_level`, `improvement_goals`, `learning_goal`, `partner_involvement`, `notifications_enabled`, `familiar_parenting_styles`, `emotional_challenges`
- `$set_once`: `first_sign_in_date`

**Files changed for this addition:**
- `src/lib/analytics.ts` (new)
- `src/screens/onboarding/UserTypeScreen.tsx`, `NameAgeScreen.tsx`, `ChildrenCountScreen.tsx`, `ImprovementGoalsScreen.tsx`, `PartnerInvolvementScreen.tsx`, `GoalSelectionScreen.tsx`, `ExperienceLevelScreen.tsx`, `ParentingStylesScreen.tsx`, `EmotionalChallengesScreen.tsx`
- `src/screens/onboarding/AuthScreen.tsx` — richer identify + auth_attempted/abandoned
- `src/screens/onboarding/SignInScreen.tsx` — auth_attempted/abandoned for returning users
- `src/screens/onboarding/LoadingScreen.tsx` — onSuperwallEvent handler for paywall interaction depth

### Lifecycle events added (2026-07-01 evening, second batch)

Also added:

**Splash entry events (`onboarding_started`):** fires once from SplashScreen when routing decision is made. Property `source`:
- `first_open` — brand new user, going to Welcome
- `resumed` — mid-flow user with saved lastScreen, going back to that screen
- Also includes `last_screen` property for the resumed case

**Welcome CTAs (`welcome_cta_tapped`):** `cta: get_started | sign_in`

**Onboarding restart (`onboarding_restarted`):** fires when user taps "Get Started" on Welcome and had a prior lastScreen (means they backed out of mid-flow and started fresh). Includes `previous_last_screen` property.

**Install-to-signup timing (no new code needed):**
- `$app_installed` fires automatically via `captureAppLifecycleEvents: true` on first launch (anonymous distinct ID)
- When user signs up, `identify()` links the anon events to the new user
- PostHog can now compute "time from install to signup" natively as a funnel/insight
- `first_sign_in_date` user property (set on identify) gives absolute timestamp for cohort analysis

**Files changed for this addition:**
- `src/lib/analytics.ts` — added `trackOnboardingStarted`, `trackOnboardingRestarted`, `trackWelcomeCtaTapped`
- `src/screens/onboarding/SplashScreen.tsx` — fires `onboarding_started` on route decision
- `src/screens/onboarding/WelcomeScreen.tsx` — fires `welcome_cta_tapped` + `onboarding_restarted` when applicable

**Known coverage gap — intentionally deferred:**
- Lesson-level tracking (per-lesson-screen events with lesson_id / step_number) is NOT instrumented. Every lesson screen fires a raw `$screen` event, but there's no `lesson_step_viewed` semantic event yet.
- Why deferred: post-paywall screens will be rebuilt soon. Instrumenting the current screens is wasted work if they're being replaced. Add clean tracking during the rebuild via the shared `LessonContainer` component.
- Also deferred: notification permission response, partner invite outcome, time on screen (session replays cover this qualitatively).

### Branch protection ✅ (2026-07-03, partial)

Branch protection enabled on `main`:
- ✅ Require pull request before merging
- ✅ Require 1 approval (self-approval allowed for solo work)
- ⏳ Require status checks — **temporarily disabled.** Reason: GitHub only lists status checks that have run at least once, and the CI yaml hasn't been committed + pushed yet.

**Follow-up to enable status check requirement:**
1. Commit + push `.github/workflows/ci.yml` to main once (or via a first PR that triggers it)
2. Wait ~1 min for the CI job to run and register with GitHub
3. Go back to Settings → Branches → edit the `main` rule
4. Check "Require status checks to pass before merging"
5. In the search box that appears, type `typecheck` — it'll now show up
6. Select it → Save

### Version bump + kill switch ✅ (2026-07-03)

Bumped app version to 1.1.0, build 9. All three files synced (`app.json`, `Info.plist`, `project.pbxproj`).

Kill switch implemented:
- Migration file: `supabase/migrations/20260703200000_add_app_config_table.sql`
- Applied to **dev** (not yet prod — applies with v1.1.0 release)
- Table: `public.app_config` with `min_supported_ios_build` + `min_supported_android_build`, both defaulting to `0`
- RLS: anon can SELECT, only service_role can UPDATE (dashboard-only writes)
- New files: `src/lib/appConfig.ts` (fetch + version check), `src/components/ForceUpdateModal.tsx` (blocking upgrade prompt)
- Wired into `App.tsx` — non-blocking fetch on launch, modal shows if current build < minimum
- Fail-safe: any error in fetch → defaults → no lockout on Supabase outage
- `ForceUpdateModal.tsx` App Store URL uses placeholder ID — need real numeric App Store ID to fix

Full usage documented in `docs/DEV_PROD_ENVIRONMENTS.md` → "Kill switch" section.

### Bundle ID split ✅ (2026-07-03)

Dev and prod now use different iOS bundles and Android packages so both apps can be installed on the same device at once.

**Config changes (repo):**
- `app.config.js` — reads `IOS_BUNDLE_ID`, `ANDROID_PACKAGE`, `APP_DISPLAY_NAME` from env vars, defaults to prod values
- `eas.json` — dev + preview profiles set `com.kinderwell.app.dev` / `Kinderwell Dev`; production profile keeps `com.kinderwell.app` / `Kinderwell`
- `.env` — dev values
- `.env.prod` — prod values

**External dashboards updated:**
- Apple Developer → registered `com.kinderwell.app.dev` App ID with Sign in with Apple + Associated Domains + Push Notifications capabilities
- Google Cloud Console → created new iOS OAuth client `Kinderwell iOS Dev` with bundle `com.kinderwell.app.dev`, team ID `DX4F38J8H4`
- Dev Supabase Google provider → added new dev iOS OAuth client ID to the comma-separated `Client IDs` list
- Dev Supabase Apple provider → added `com.kinderwell.app.dev` to comma-separated `Client IDs` list

**Not touched:**
- Prod Supabase — knows nothing about the dev bundle (correct — total isolation)
- Apple Services ID `com.kinderwell.app.auth` — Primary App ID stays prod (Native Sign in with Apple in dev works via the dev App ID's own capability, not the Services ID)

**Still queued (do when ready to test on a device):**
```bash
npx expo prebuild --clean
eas build --profile development --platform ios   # or android
```

The prebuild rewrites `ios/Kinderwell/Info.plist` + `project.pbxproj` (and Android equivalents) with the env-driven bundle ID. Without prebuild, EAS build will still use the OLD bundle ID because those native files are frozen to `com.kinderwell.app`.

**How to verify after build + install:**
- Both prod (App Store install) and dev (EAS build install) coexist on the device
- Dev app shows "Kinderwell Dev" name on home screen
- Dev app's `[Supabase] Env: DEV ✅` log fires
- Google Sign In works in dev
- Apple Sign In works in dev

### Onboarding A/B experiment scaffold ✅ built (2026-07-01) — ❌ removed (2026-07-04)

**2026-07-04 update:** the entire scaffold described below was removed before v1.1.0 shipped. `src/screens/onboardingB/`, `OnboardingVariantSwitch.tsx`, `experimentStore.ts`, `experiments.ts`, and the DevMenu variant buttons were all deleted. Reason: shipping placeholder screens (even behind a flag defaulted off) added test surface and risk to v1.1.0 with zero user benefit. When we're ready to run onboarding experiments again, we'll rebuild cleanly. See `PRODUCT_ROADMAP.md` → "Onboarding polish + A/B test (future)". The section below is preserved as a historical record.

---

Set up a 50/50 A/B test between the current onboarding (`control`) and a new placeholder onboarding (`variant_b`).

**How assignment works:**
- PostHog feature flag `onboarding_variant` with two values: `control` and `variant_b`, 50/50 rollout
- SplashScreen calls `resolveOnboardingVariant()` on mount in the BACKGROUND (does NOT block routing):
  1. Check AsyncStorage cache — sticky per install so users never flip mid-flow
  2. Fetch PostHog flag with 3s timeout — fallback to `control` on error
  3. Cache result to AsyncStorage
  4. Register as PostHog user property so every event tags with the variant
- Splash routes after its normal 2s animation — never waits for variant. This keeps first-launch UX bounded regardless of network conditions.
- If variant is unresolved when Welcome renders, the switch component renders control by default. When variant later resolves as `variant_b`, the switch swaps — brief flash of control-to-B in the worst case (first launch on dead network).
- Subsequent launches: cache hits instantly, no flash, no delay.

**How routing works:**
- One `Stack.Navigator`, one `OnboardingStackParamList` — no duplicated route tree
- Each screen name (e.g. `Welcome`) is registered against a `WelcomeSwitch` component
- `WelcomeSwitch` reads `useExperimentStore` and renders either the control or variant B version
- Switch layer lives in `src/navigation/OnboardingVariantSwitch.tsx`

**Variant B content (all 20 screens):**
- `WelcomeScreenB` — visibly different teal gradient + "VARIANT B" tag + different copy/CTA
- `UserTypeScreenB` — visibly different teal card design + "STEP 1" indicator
- All other 15 pre-auth screens: `VariantBPlaceholder` — teal background, screen name, Continue/Back
- `AuthScreenB`, `LoadingScreenB`, `PremiumUnlockedScreenB`: re-export the control components (business-critical auth + paywall paths must not break)

**Dev QA:**
- `DevMenuScreen` (dev-only route) got three new buttons:
  - Force Control
  - Force Variant B
  - Clear override (falls back to PostHog flag on next launch)
- These use `overrideOnboardingVariant()` — writes to AsyncStorage + updates the store

**PostHog dashboard setup needed:**
1. In PostHog → Feature Flags → new flag `onboarding_variant`
2. Type: multivariate. Values: `control` (50%), `variant_b` (50%)
3. Save
4. To read: PostHog auto-attaches the variant as a user property, so every insight can be filtered/grouped by `onboarding_variant`

**Files added:**
- `src/lib/experiments.ts` — flag resolution, timeout, override, cache
- `src/store/experimentStore.ts` — Zustand store for in-memory variant
- `src/navigation/OnboardingVariantSwitch.tsx` — 17 switch components
- `src/screens/onboardingB/` — 17 variant B screens + `VariantBPlaceholder`

**Files modified:**
- `src/navigation/OnboardingNavigator.tsx` — uses switches instead of direct imports
- `src/screens/onboarding/SplashScreen.tsx` — waits for variant before routing
- `src/screens/DevMenuScreen.tsx` — variant override buttons

**How to verify:**
1. First launch → check Metro logs for `[Experiment] onboarding_variant: control` or `variant_b`
2. Open DevMenu → force to variant B → tap Splash → Welcome should be teal
3. Complete onboarding — real Auth/Loading screens fire (business logic intact)
4. In PostHog, insights should show `onboarding_variant` as a filterable property on every event

### Still pending

- iPhone verification Saturday (see checklist above)
- `subscription_status` schema migration + Superwall webhook — wait until Saturday's iPhone tests pass
- Rotate DB password (task #7)
- App Store page optimization — orthogonal, do anytime
- **Verify Sentry test error flow** — DevMenu → "Send test error to Sentry" → confirm it lands in Sentry dashboard within 30–60 sec, with `environment` tag set correctly
