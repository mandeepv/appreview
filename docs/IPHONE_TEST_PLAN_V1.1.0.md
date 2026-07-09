# iPhone Smoke Test Plan — v1.1.0 Dev Build

**Purpose:** end-to-end verification of every meaningful change we've made this weekend before merging `setup/dev-environment` to `main`. If ANY test fails, we fix and re-verify before the merge.

**Device:** iPhone XR (a dedicated tester Apple ID)
**Build:** dev IPA from `eas build --profile preview --platform ios` (bundle: `com.kinderwell.app`, name: "Kinderwell Dev"). Section 0.0 explains why `preview` (not `development`) is the profile that installs on a real device. The dev/preview build shows the "Kinderwell Dev" display name via `APP_DISPLAY_NAME`, but the bundle ID is the single `com.kinderwell.app` — the earlier `com.kinderwell.app.dev` split was reverted (app.config.js: single bundle across all profiles).
**Backend:** dev Supabase (`xbkkjqvbsnroenqlqkmi`)
**Prerequisites:**
- ✅ TestFlight installed and signed in with the tester Apple ID
- ✅ Sandbox Apple ID (managed in App Store Connect) created in App Store Connect
- ✅ Mac connected to same wifi as iPhone (for Metro logs)
- ✅ `npx expo start` running on Mac

**How to reset between tests:** Kinderwell Dev app → Settings → Delete Account (clears everything). Then close/reopen app.

---

## Section 0 — Install & connect

### 0.0 Pick the right EAS profile before building — READ THIS

`eas.json` defines three profiles: `development`, `preview`, `production`. **Which one you build determines whether the artifact even installs on a real iPhone.** This trapped us once (2026-07-05, mid-Section-12 smoke test) — the `.tar.gz` from the `development` profile only opens in the iOS Simulator, and Safari on the phone shows "Download" with no Install button.

- **`development`** — `ios.simulator = true`, `developmentClient = true`. Output is a `.tar.gz` for the iOS Simulator on your Mac. **Cannot install on a physical iPhone.** Use this only if you want to iterate in the simulator with hot reload against a Metro server.
- **`preview`** ← **use this for iPhone XR testing.** `ios.simulator = false`, `buildConfiguration = Release`. Output is a real `.ipa` you install via Safari from the EAS build page. Same dev-Supabase env vars as the `development` profile; release-mode compile catches minification / prod-bundling bugs that dev builds hide.
- **`production`** — Same as preview but with prod Supabase + prod bundle ID (`com.kinderwell.app`). Uploaded to TestFlight for the Homies. Do NOT run this profile until Section 12 has passed against `preview` — every `production` build costs a build minute and touches prod bundle-ID space.

**Command to build the profile you actually want on iPhone XR:**
```bash
eas build --profile preview --platform ios
```

Watch for the `🍏 Open this link on your iOS devices` block at the end of the build log — that URL (starts with `install.expo.dev` when opened in Safari, or the `expo.dev/accounts/...` build page which will redirect properly on iOS) shows an **Install** button on iPhone Safari. If you only see Download, you built the wrong profile.

### 0.1 Install the dev build
- [ ] Build finishes in EAS Cloud → note the `install.expo.dev` or `expo.dev/accounts/...` URL from the build log
- [ ] Open the URL **in Safari** on iPhone XR (not Chrome / any other browser)
- [ ] Tap **Install** on the Expo build page
- [ ] iOS may prompt "Untrusted Enterprise Developer" on first launch → Settings → General → VPN & Device Management → trust the profile
- [ ] App icon shows as **"Kinderwell Dev"** (not "Kinderwell") on home screen — this is `APP_DISPLAY_NAME` from the dev/preview profile env vars
- [ ] Single-bundle check: because dev/preview and prod now share the **same** bundle ID (`com.kinderwell.app`), installing the dev build **replaces** the store app rather than appearing as a second icon. Confirm there is exactly ONE Kinderwell icon after install (the `.dev` bundle-split that used to produce two icons was reverted — see app.config.js "Bundle ID collapse").
- [ ] Launch the dev app — no crash, no "REFUSING to connect" alert (the structural guards would fire if bundle-ID / project-ref drift ever regresses)

**If fail:** bundle ID split broken → managed workflow migration issue

### 0.2 Connect to Metro (only if you built with the `development` profile for simulator)

Skip this section entirely if you're on a `preview` build — preview is a release-mode standalone IPA, not connected to a Metro server. Metro is only relevant for the simulator + `development` iteration workflow.

- [ ] On Mac: `npx expo start` running, showing QR + local URL
- [ ] On iPhone: shake to open Expo dev menu
- [ ] Enter Metro URL or scan QR
- [ ] Bundle loads → app opens to Splash screen

### 0.3 Verify startup logs in Metro terminal
The Metro terminal on your Mac should show these lines in the first ~5 seconds:

- [ ] `[Supabase] Env: DEV ✅ | Project: xbkkjqvbsnroenqlqkmi`
- [ ] `[Sentry] initialized (env=dev, release=kinderwell@1.1.0)`
- [ ] `[PostHog] capture { ... "event": "Application Opened" ... }`
- [ ] No red errors

**If Supabase log shows PROD → STOP.** The structural guard should have thrown a hard error. This means the guard isn't triggering, which is itself a bug.

### 0.4 Verify EAS build output — sourcemap upload succeeded
Go back and look at the build log on expo.dev (the URL EAS printed when the build finished):
- [ ] Search log for "Uploading source maps" or "sentry-cli"
- [ ] No red error about "organization slug required" or "auth token"
- [ ] Sourcemap upload step completed successfully

**If sourcemap upload failed:** stack traces from this build in Sentry will be minified. Verify the SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT EAS env vars are set.

---

## Section 1 — Basic navigation & PostHog wiring

### 1.1 Splash → Welcome
- [ ] Splash animation runs ~2 sec
- [ ] Auto-navigates to Welcome screen (pink gradient, "Kinderwell" title)
- [ ] Metro shows `[PostHog] capture ... "$screen" ... "Welcome"` OR `"onboarding_started"` event

### 1.2 Welcome → UserType
- [ ] Tap "Get Started" → navigates to UserType screen
- [ ] Metro shows `welcome_cta_tapped` with `cta: get_started` in PostHog capture

---

## Section 2 — Google Sign-In flow (main happy path)

### 2.1 Complete onboarding + sign in with Google
- [ ] Walk through onboarding all the way to AuthScreen ("Save your progress")
- [ ] Tap "Continue with Google"
- [ ] Google OAuth browser opens
- [ ] Sign in with any Google account you're OK using for testing
- [ ] Redirect back to app succeeds
- [ ] Metro shows `auth_attempted` + `user_signed_in` events
- [ ] App navigates to LoadingScreen (paywall trigger)

### 2.2 Verify in dev Supabase
- [ ] Open **dev** Supabase → Authentication → Users
- [ ] Your Google email appears as a new user
- [ ] Open Table Editor → `user_profiles` → row with your onboarding answers
- [ ] Confirm the row has `user_type`, `age`, `children`, etc. populated (not null)

### 2.3 Verify in **prod** Supabase (safety check)
- [ ] Open **prod** Supabase → Authentication → Users
- [ ] Your Google email does NOT appear
- [ ] `user_profiles` in prod does NOT have a new row

**If fail:** app is talking to prod instead of dev → catastrophic

---

## Section 3 — Paywall & subscription enforcement (P0 #1)

**Architecture note (updated 2026-07-05 — hard-paywall model)**: v1.1.0
uses a SINGLE mandatory paywall placement, `subscription_gate`, fired
from `LoadingScreen`. It's Gated, has no dismiss control, and shows on
every launch until the user subscribes. See `docs/PAYWALL_MODEL.md` for
the full model and reasoning.

Key properties:
- Paywall shows after onboarding.
- Paywall shows on every cold launch for signed-in unsubscribed users.
- Paywall CANNOT be dismissed — no X button, no swipe-down. If Superwall
  reports a dismiss (older cached template, edge case), our code
  defensively re-presents the paywall (`onDismiss` → `runGate()`).
- Confirmed subscribers (isSubscribed = true from a prior session) skip
  the paywall entirely — go straight to LearnScreen. Persists across
  cold launches via AsyncStorage.
- Demo users (7-tap App Store reviewer mode) also skip the paywall.
- `useLessonGate` hook is now a no-op — no per-lesson gating needed
  because unsubscribed users can't reach LearnScreen at all.

The v1.0.0 placements (`show_paywall`, `learn_access`) still exist in
the Superwall dashboard for backward compatibility with shipped v1.0.0
clients, but v1.1.0 code no longer references them.

### 3.1 Paywall renders after onboarding
- [ ] After Google or Apple sign-up + onboarding, LoadingScreen fires
      `subscription_gate` placement
- [ ] Superwall paywall UI appears with prices ($12.99/mo, $69.99/yr)
- [ ] Metro shows: `📱 Registering placement: subscription_gate`
- [ ] Metro shows: `✅ Paywall presented: subscription_gate`

**If no prices show:** sandbox tester not signed in, or bundle
mismatch. See `docs/STOREKIT_SETUP_GUIDE.md`.

### 3.2 Paywall has NO dismiss control
- [ ] Look for an X button — should NOT be visible
- [ ] Try swiping down from top of paywall — should NOT dismiss
- [ ] Try tapping outside the paywall content area — should NOT dismiss
- [ ] Only user-facing exits: subscribe (paid path) OR Restore
      Purchases (existing subscriber path)

**If the paywall IS dismissable:** the Superwall dashboard template has
a close button that needs to be removed. Verify Feature Gating = Gated
and paywall template has no close-button element.

### 3.3 Force-quit + reopen shows the paywall again (the anti-bypass fix)
- [ ] With paywall showing: force-quit app (swipe up in app switcher,
      swipe Kinderwell away)
- [ ] Reopen app cold
- [ ] Splash appears first (as always)
- [ ] Then Loading screen briefly
- [ ] Then the paywall re-appears — same `subscription_gate` UI

**If LearnScreen appears instead of paywall:** the SplashScreen
routing regressed. Check `SplashScreen.tsx` — signed-in users should
route to `Loading` (the gate), NOT directly to `Root`.

### 3.4 Emergency dismiss recovery (defense in depth)
This tests the belt-and-suspenders re-present logic in case the
Superwall template ever ships with a dismiss control.

- [ ] With paywall showing: shake the device to open the Superwall
      debug menu (dev build only, if enabled) OR try any programmatic
      dismiss trick
- [ ] If the paywall dismisses somehow, verify: Loading screen appears
      briefly, then paywall re-presents itself automatically
- [ ] Metro shows: `🔒 Paywall dismissed without purchase — re-presenting (hard gate)`

Skip this if you can't induce a dismiss — it's a defensive backstop,
not something the user should be able to trigger.

### 3.5 Confirmed subscriber skips the paywall
Tests that a paying user doesn't see the paywall on cold launch.

- [ ] Complete a sandbox purchase (see Section 5 setup or use demo
      mode — 7-tap the "Save your progress" title during onboarding)
- [ ] Force-quit the app after landing on LearnScreen
- [ ] Reopen cold
- [ ] Verify: Splash → Loading → **LearnScreen** (no paywall)
- [ ] Metro shows: `⏩ Skipping paywall — user is a confirmed subscriber`
      OR `⏩ Skipping paywall — demo user`

**If paywall shows for a subscribed user:** the isSubscribed cache
hydration in authStore is broken, or Superwall's ACTIVE event never
fires. Check Metro logs for `[authStore] hydrated isSubscribed=true`
and `[Subscription] ACTIVE`.

### 3.6 Offline behavior — subscribed user
- [ ] While signed in as a confirmed subscriber, enable Airplane Mode
- [ ] Force-quit the app
- [ ] Reopen cold
- [ ] Verify: Splash → Loading → **LearnScreen** (no paywall)
- [ ] Confirmed subscribers get through even offline — the isSubscribed
      cache is authoritative until Superwall says otherwise

### 3.7 Offline behavior — unsubscribed user
- [ ] Signed in but never subscribed
- [ ] Enable Airplane Mode
- [ ] Force-quit the app
- [ ] Reopen cold
- [ ] Verify: Splash → Loading → gate tries to reach Superwall → fails
- [ ] Loading message changes to "Checking your subscription — please
      make sure you're online..."
- [ ] Turn Airplane Mode off
- [ ] Within 3 seconds: gate auto-retries and paywall appears

### 3.8 Sandbox purchase path
Sandbox mode requires either Xcode developer mode setup (~30 min) or
TestFlight. Defer purchase tests to the TestFlight build.

- [ ] From the paywall, tap Yearly or Monthly plan
- [ ] iOS sandbox purchase sheet appears with `[Environment: Sandbox]`
- [ ] Complete purchase
- [ ] Paywall dismisses → LearnScreen
- [ ] Metro shows: `💰 Purchase completed! Updating subscription status...`
- [ ] Metro shows: `[Subscription] ACTIVE`

Once running on TestFlight:
- [ ] From paywall, tap a subscription plan
- [ ] Apple's IAP sheet appears — should say **"[Environment: Sandbox]"**
- [ ] Complete the purchase
- [ ] Metro shows `paywall_option_selected` then `subscription_purchased`
- [ ] Paywall dismisses, back on LearnScreen
- [ ] Tap a lesson → `[useLessonGate] entitlement confirmed`, lesson opens

**If sheet does NOT say "Sandbox":** CANCEL — real money.

### 3.6 Verify no lock-out post-purchase
- [ ] Kill the app completely
- [ ] Reopen app → LearnScreen
- [ ] Tap a lesson → lesson opens immediately, no paywall flash
- [ ] `[useLessonGate]` log shows entitlement confirmed instantly

### 3.7 🔴 Offline entitlement check (REGRESSION RISK from prod bug hunt Section 8.3)

**Why this exists:** v1.1.0's `useLessonGate` calls
`registerPlacement('learn_access')` which needs network. On prod,
subscribed users can access lessons offline (dumb, but works). On
v1.1.0 they might get locked out because the placement can't reach
Superwall's servers.

- [ ] Verify entitlement online first (tap a lesson successfully)
- [ ] Turn on airplane mode
- [ ] Return to LearnScreen (Home tab, then Learn tab)
- [ ] Tap a lesson
- [ ] Report what happens:
  - Best case: lesson opens (Superwall SDK cached entitlement)
  - Bad case: paywall shows, or spinner hangs, or error alert
- [ ] If lesson does NOT open: 🔴 we need a local `isSubscribed` fallback
      in `gateToLesson` for offline paying users

If this fails, mitigation: cache last-known Superwall status in
Zustand/AsyncStorage. On offline `registerPlacement` failure, check
the cached value. If cached ACTIVE, run `feature()` anyway. Fail-open
for paying users only, still gates unsubscribed.

---

## Section 4 — Apple Sign-In (P1 #9)

**Reset first:** delete-account via Settings, close app.

### 4.1 Apple Sign-In with nonce
- [ ] Fresh onboarding to AuthScreen
- [ ] Tap the Apple button
- [ ] Native Apple modal appears — this is the biggest untested thing
- [ ] Choose "Share My Email" or "Hide My Email" — either is fine for testing
- [ ] Face ID or password confirm
- [ ] Metro shows `auth_attempted` with `auth_method: apple`
- [ ] Metro shows `user_signed_in` with `auth_method: apple`
- [ ] App navigates to Loading

### 4.2 Verify name was saved
- [ ] Open dev Supabase → `user_profiles` → find your new row
- [ ] Column `name` should be populated with your Apple name (assuming it was your first-ever Apple Sign In with this app/Apple ID)

**If name is NULL:** either Apple didn't provide it (subsequent sign-in) OR the fix has a bug. Sentry should have a log if the upsert failed.

### 4.3 Sign out + sign in again
- [ ] Settings → Sign Out (or Delete Account for clean state)
- [ ] Sign in again with Apple
- [ ] Apple does NOT prompt for name/email (correct — only on first authorization)
- [ ] Sign-in succeeds
- [ ] User row is still there in dev Supabase (or recreated cleanly)

---

## Section 5 — Restore Purchases (P0 #3)

**Setup:** Should still be subscribed from Section 3.3.

### 5.1 With active subscription
- [ ] Settings → Restore Purchases
- [ ] Button changes to "Restoring..." + spinner
- [ ] Alert appears: **"Restored — Your subscription has been restored."**
- [ ] Metro shows `restore_purchases_tapped` then `restore_purchases_completed` with `outcome: restored`

### 5.2 With NO subscription (harder to test but do if possible)
This requires either:
- **(a)** A fresh dev install with no purchase, OR
- **(b)** Signing into sandbox with a different Apple ID that hasn't purchased

- [ ] Try Restore Purchases
- [ ] Should get alert: **"No Purchases Found — No previous purchase was found for this Apple ID..."**
- [ ] Metro shows outcome `no_purchases`

### 5.3 Guard against re-tap
- [ ] Tap Restore Purchases
- [ ] While "Restoring..." is showing, tap it again
- [ ] Second tap should be ignored (no double alert)

---

## Section 6 — Kill switch (P0 #4 / P1 #12)

### 6.1 Verify inactive by default
- [ ] Cold start the app
- [ ] Force update modal does NOT appear (because `min_supported_ios_build = 0` in dev's `app_config`)

### 6.2 Trigger the kill switch
- [ ] Open dev Supabase → SQL editor
- [ ] Run:
  ```sql
  UPDATE public.app_config
  SET value = '9999'::jsonb, updated_at = now()
  WHERE key = 'min_supported_ios_build';
  ```
- [ ] Kill the app on iPhone, reopen
- [ ] After Splash, the **ForceUpdateModal** should appear (non-dismissible, "Update required")
- [ ] Modal shows "Update on App Store" button

### 6.3 Verify the button opens the RIGHT App Store page
- [ ] Tap "Update on App Store"
- [ ] Safari / App Store app opens
- [ ] Lands on **Kinderwell's real App Store page** (not a 404)
- [ ] URL contains `id6758403231`

**If 404:** the App Store ID fix didn't ship correctly.

### 6.4 Reset kill switch
- [ ] Run:
  ```sql
  UPDATE public.app_config
  SET value = '0'::jsonb, updated_at = now()
  WHERE key = 'min_supported_ios_build';
  ```
- [ ] Close + reopen app → normal flow (no modal)

---

## Section 7 — Demo mode (Apple review flow — DO NOT BREAK)

**Reset:** clean state, no signed-in user.

### 7.1 7-tap gesture
- [ ] Navigate to AuthScreen (through onboarding or via DevMenu)
- [ ] Tap the title text "Save your progress" **7 times fast** (< 3 sec between taps)
- [ ] Alert appears: **"Demo Mode Activated — You now have full access to all premium features for review purposes."**
- [ ] Tap Continue
- [ ] App navigates through Loading → Root → LearnScreen
- [ ] LearnScreen renders lesson list (no paywall!)

### 7.2 Verify demo user has full access
- [ ] Tap into any lesson → content shows
- [ ] Go to Settings → user shown as `demo@kinderwell.app` (synthetic user)

**If demo mode does NOT unlock the app:** App Store review will reject. This is the #1 must-not-break invariant.

### 7.3 Verify demo user is NOT in Supabase
- [ ] Check dev Supabase → Authentication → Users
- [ ] `demo@kinderwell.app` does NOT appear (synthetic, no real session)

---

## Section 8 — Sentry (P1 #8)

Sentry catches things PostHog doesn't (native crashes, memory issues, sourcemap-symbolicated JS). We're checking three things: JS error path, native context, and sourcemap upload.

### 8.1 JS error path (reportError helper)
- [ ] DevMenu → "Send test error to Sentry"
- [ ] Alert confirms sent
- [ ] Wait ~30 seconds

### 8.2 Verify JS error in Sentry dashboard
- [ ] Open https://kinderwell.sentry.io → project (react-native)
- [ ] Issue titled "Sentry test error @ ..." appears
- [ ] Tags show `environment: dev`
- [ ] Release shows `kinderwell@1.1.0`
- [ ] Tap into the issue → Stack Trace tab
- [ ] Stack trace shows real file names + line numbers (e.g. `DevMenuScreen.tsx:37`) — NOT minified gibberish like `chunk-abc123.js:1:52341`

**If stack trace is minified:** sourcemap upload during EAS build failed. Symptomatic of missing/wrong SENTRY_AUTH_TOKEN — fixable by re-checking EAS env vars.

### 8.3 Native context check
Even without a real native crash, verify Sentry knows about the device:
- [ ] In the same issue, look at the "Context" section
- [ ] Should show device model (iPhone11,8 for XR or similar), OS version (18.7.9), app version (kinderwell@1.1.0)

**If context is missing:** Sentry native init didn't wire properly.

### 8.4 Actual native crash (optional but valuable)
The safest way to force a real native crash in a dev build is:
- Open Sentry docs → your project → "Get Started" → JavaScript / React Native section usually has a snippet you can drop into a screen temporarily
- OR: intentionally trigger something crash-y — e.g. `Sentry.nativeCrash()` if the SDK exposes it, called from DevMenu

**Skip this test unless the JS test in 8.1 fails to land** — it's belt-and-suspenders. If Sentry accepts our `reportError()` events with real stack traces, the wiring is working; native crashes travel the same pipeline.

**If no event lands in Sentry within 2 min:** SDK wiring is broken. Common causes:
- SENTRY_DSN wrong in eas.json / .env
- Sentry init didn't run (check Metro logs for `[Sentry] initialized (env=dev, release=kinderwell@1.1.0)`)
- Network / firewall blocking Sentry endpoint

---

## Section 9 — PostHog verification

### 9.1 Full funnel appears
- [ ] Open PostHog dashboard
- [ ] Filter by `environment = dev`
- [ ] Recent events include:
  - `Application Installed`, `Application Opened`
  - `$screen` events for onboarding steps
  - `onboarding_step_completed` with answers
  - `user_signed_in`
  - `paywall_dismissed` or `subscription_purchased`
  - `lesson_tapped` **and** `lesson_started` — the split matters. `lesson_tapped` fires on TAP (top-of-funnel, "how many people even try"). `lesson_started` only fires AFTER the paywall gate lets you through ("content actually opened"). Prior code fired `lesson_started` on tap so paywall bounces counted as starts; Fable review #8 fixed this and the two events now measure different questions.
    - Positive-path test: subscribed test user taps a lesson → **both** events appear with matching properties.
    - Negative-path test: unsubscribed test user taps a lesson → `lesson_tapped` appears, `lesson_started` does NOT (paywall gate blocks the second event). If `lesson_started` fires without a purchase, the split regressed.
  - `restore_purchases_tapped` / `restore_purchases_completed`

**Note:** the earlier version of this section listed only `lesson_started` and framed it as the tap event, which contradicted the shipped code. A tester following the pre-fix version would have marked a working analytics split as a bug. Corrected 2026-07-05 by Fable re-review pre-flight punch list item 6.

### 9.2 User properties populated
- [ ] Find your test user in PostHog Persons
- [ ] Properties: `user_type`, `age`, `children_count`, `experience_level`, etc.
- [ ] `environment: dev` present

---

## Section 10 — Structural prod guard (P1 #11 partial)

**This one is tricky to test live because it requires overwriting `.env` with prod values.** SKIP this section during the smoke test unless you specifically want to verify. If you do:

- [ ] Backup: `cp .env .env.dev.bak`
- [ ] Point to prod: `cp .env.prod .env`
- [ ] `npx expo start`
- [ ] iPhone opens app → should throw immediately with the "REFUSING to connect to PROD from a __DEV__ build" error
- [ ] Restore: `cp .env.dev.bak .env`

---

## Section 11 — Prod remains untouched

**Critical final check:**
- [ ] Open **prod** Supabase → Authentication → Users
- [ ] Confirm none of your test users from this session appear
- [ ] Open prod → Table Editor → `user_profiles` → same check
- [ ] Open **prod** → `app_config` → run `SELECT * FROM app_config` → confirm the table does NOT exist yet (still pending v1.1.0 release)

If a test user leaked into prod → we have a bug that let dev writes go to prod. Investigate immediately.

---

## Section 12 — Post-Fable-review regression addendum (added 2026-07-05)

**Why this section exists:** Sections 0–11 were written before we did the Fable review pass. Since then ~40 commits touched auth, onboarding, lesson progress, delete-account, and Supabase typing. These are the checks that specifically cover **only** what changed since the last time this plan was run — running Section 12 is the difference between "we retested the whole app" and "we retested the whole app *and* the Fable-review deltas."

Run this section AFTER Sections 1–9, before Section 11.

### 12.1 Delete-account is a feature (not just a reset button) — Fable-related fixes

Delete-account got 5 discrete changes: subscription warning, single confirmation (not two-step), onboarding cache clear, Superwall reset, Sentry user reset. All of them touch the flow you'll take when the reviewer taps "Delete Account", so this is Apple-review-critical.

**Setup:**
- [ ] Sign in with Google (or Apple).
- [ ] Complete onboarding.
- [ ] Trigger a paywall + sandbox-subscribe so `isSubscribed: true`.
- [ ] Complete at least one lesson section so AsyncStorage progress exists.

**Do the delete:**
- [ ] Settings → Delete Account. **Alert shows a subscription warning** ("Your subscription will remain active until end of billing period, cancel via Apple Subscriptions if needed" or similar). If missing, this fix regressed.
- [ ] Tap Delete. **ONE confirmation only** — no second "are you really really sure?" step. If a second modal appears, the fix regressed.
- [ ] Delete succeeds (no 401 — this exercises the `refreshSession()` + Edge Function auth chain). If you see "session expired" or 401, the refresh path broke.
- [ ] Land on Welcome / Splash screen, not on a stale Home.

**Verify local cleanup happened (open Metro / device console):**
- [ ] `[useOnboardingStore] clearState called` or equivalent onboarding-cache-cleared log.
- [ ] Superwall reset log (or verify by re-signing-in and seeing paywall render, not cached "you're subscribed" state).
- [ ] Sentry user detached — if you trigger a `reportError` after delete but before next sign-in, the Sentry event should have no `user.id` attached.

**Verify server-side cleanup:**
- [ ] Open dev Supabase → Auth → Users → confirm the user is deleted.
- [ ] Same user's row in `user_profiles` is gone (or `deleted_at` set — check the migration schema).

### 12.2 Returning-user re-sign-in (the pushback we documented + the flag-leak fix)

Fable flagged two related bugs on this path. **We kept one behavior deliberately** (fresh-answer discard on returning-user re-onboarding) and **fixed the other** (the `has_reached_auth` flag was leaking across sessions, so a later cold launch after logout landed the user on Auth instead of Welcome).

The Fable re-review 2026-07-05 caught that this test was asserting on the wrong path — the fix fires specifically when the user takes the **signup** path (Get Started → onboarding → Auth) and signs in with an OAuth identity that already has an account, NOT when they take the "I already have an account" path. This section now covers both.

**12.2a — Signin-path smoke test (existing signed-in behavior, easy):**

- [ ] From delete-account state (or Section 12.1 exit state), still logged out.
- [ ] Tap "I already have an account" on the Welcome screen (not "Get Started").
- [ ] Auth screen appears with the "use the same option you signed up with" hint visible. If missing → the hint from unify-auth work regressed.
- [ ] Sign in with the same OAuth provider as before.
- [ ] User lands DIRECTLY on the Home / Learn screen (NOT onboarding, NOT paywall as a new user). If routed to onboarding: `hasUserCompletedOnboarding` isn't classifying signed-in users correctly.

**12.2b — Fresh-answer discard on returning-user redo-onboarding (the documented pushback):**

- [ ] Still signed in from 12.2a.
- [ ] Sign out (Settings → Sign Out).
- [ ] Tap **"Get Started"** on Welcome (NOT "I already have an account" — this is the path the fix fires on).
- [ ] Rush-tap through onboarding, providing DIFFERENT answers than your original ones (e.g. change parent type).
- [ ] Reach the Auth screen at the end of onboarding.
- [ ] Sign in with the same OAuth provider (existing account).
- [ ] Land on Home / Learn. Verify (via dev Supabase → `user_profiles` row inspection, or PostHog `identifyUserWithOnboarding` event) that your **original** answers are still there — the fresh answers from this rush-through were discarded. This is the documented pushback (see `FABLE_LATEST_REVIEW.md` Response 2026-07-04 for finding #3), not a bug.

**12.2c — `has_reached_auth` flag-leak fix (the actual bug that was fixed):**

The flag used to leak across sessions. Before the fix: after signing out, a cold launch would skip Welcome and go straight to Auth because AsyncStorage still said `has_reached_auth = true`. After the fix (`fa27f90`), the flag is cleared on sign-out so cold launch correctly lands on Welcome.

- [ ] Continue from 12.2b (signed in, on Home).
- [ ] Sign out (Settings → Sign Out).
- [ ] **Force-quit the app entirely** (swipe up in the app switcher).
- [ ] Wait a few seconds.
- [ ] Reopen the app cold.
- [ ] **Verify:** you land on the **Welcome screen**, NOT the Auth screen. If you land on Auth, the `has_reached_auth` flag leak has regressed.

**12.2d — Signin as a user who never onboarded (edge case):**

- [ ] From logged-out state, tap "I already have an account".
- [ ] Sign in with a fresh Google/Apple identity that has NO row in `user_profiles`.
- [ ] User is routed to onboarding (`signin` mode + `no_onboarding` branch of the discriminated union). NOT dropped straight into an empty home.

### 12.3 Onboarding-check error branch (Fable #2 — the paywall-bypass-adjacent bug)

Silent onboarding-check errors used to route users to signup, letting a re-run overwrite their real data. Now returns a discriminated union `has / no / error`. Test the error branch explicitly.

- [ ] Sign in.
- [ ] Complete onboarding fully (so `user_profiles` row exists with `user_type` set).
- [ ] Sign out.
- [ ] Enable Airplane Mode.
- [ ] Attempt to sign back in (tap "I already have an account", sign in via OAuth — OAuth itself may work if Google/Apple's cached, or may fail; if it fails, disable airplane briefly for auth then re-enable before Home routing).
- [ ] The `hasUserCompletedOnboarding` call should hit the `error` branch. The app must NOT silently route you to re-onboarding. Expected behavior: show an error state / "couldn't verify your account, please retry" / any non-silent surface. If it drops you into onboarding — the fix regressed and the v1.0.0 paywall-bypass class of bug is back.
- [ ] Turn Airplane Mode off, retry — should now land you on Home normally.

### 12.4 Emotional Sandbags Section 1 + 2 (the orphan-key fix we caught mid-refactor)

The AsyncStorage-keys centralization surfaced a real bug: `SandbagsSec1Screen3` and `SandbagsSec2Screen10` were writing to the wrong key (`@sandbags_completed_sections`) while the hub read `@emotional_sandbags_completed_sections` via `emotionalSandbagsProgress`. Fixed by routing both screens through the utility. Verify on-device that Section 1 + Section 2 completion actually persists.

- [ ] Fresh install or clean state (delete account or clear app data).
- [ ] Sign in → onboarding → hit paywall → sandbox-subscribe (need a subscription to reach lesson content).
- [ ] Navigate to Emotional Sandbags lesson from the Learn screen.
- [ ] Complete **Section 1** (SandbagsSec1Screen1 → 2 → 3 → tap Next).
- [ ] You should land on SandbagsSec2Screen1.
- [ ] Complete **Section 2** end-to-end through SandbagsSec2Screen10 → tap Complete.
- [ ] You should return to the Emotional Sandbags hub.
- [ ] **On the hub: Section 1 AND Section 2 must both show as complete.** If either is missing → the orphan-key fix regressed.
- [ ] Force-quit the app.
- [ ] Reopen, navigate back to the Emotional Sandbags hub.
- [ ] Section 1 + Section 2 still complete (persistence works across the key change).

### 12.5 Lesson progress survives the AsyncStorage-key refactor (broader check)

The centralization touched 20 files. Same paranoia as 12.4 but for other lessons:

- [ ] Complete one section each in: Sprinklers, Naming Emotions (Lesson 5), and one other lesson-container-based lesson.
- [ ] Force-quit + reopen.
- [ ] Each lesson's hub reflects the completed sections. If any regressed, the utility → screen wiring got its constant wrong.

### 12.6 ChildrenCountScreen lazy-init (returning-user re-onboarding hydration)

`ChildrenCountScreen` used to hydrate `selectedAges` from the store via an effect (caused a cascading render). We switched to `useState(() => ...)` lazy init. Verify a returning user hitting the onboarding restart path still sees their previous ages pre-selected.

- [ ] Sign in as user who completed onboarding.
- [ ] Trigger the onboarding restart path (Settings → Restart Onboarding, or by manual QA route if that entry doesn't exist).
- [ ] Reach ChildrenCountScreen.
- [ ] Age chips that were previously selected are **pre-highlighted** on first render. If they render un-selected and only fill in a beat later — the lazy-init regressed (effect version had a visible flash; lazy-init should be flash-free).
- [ ] Add/remove a child age → tap Continue → back to ChildrenCountScreen via back button → state preserved.

### 12.7 Sign-in dedupe — both providers behave identically

`handleGoogleSignIn` and `handleAppleSignIn` are now one-liners over a shared `runProviderSignIn` helper. Regression risk: one provider's analytics tag / Alert copy / error path is wrong.

- [ ] Google sign-in from cold start — succeeds, lands on Home (or onboarding for new user).
- [ ] Trigger a Google sign-in failure (cancel the browser modal, or Airplane Mode partway). Alert copy reads "Could not sign in with Google. Please try again." (or the exact string from AuthScreen).
- [ ] Sign out.
- [ ] Apple sign-in from cold start — succeeds identically.
- [ ] Trigger an Apple sign-in failure (dismiss the Apple prompt). Alert copy reads "Could not sign in with Apple. Please try again."
- [ ] PostHog dashboard: `user_signed_in` event has correct `auth_method: 'google' | 'apple'` for each attempt.
- [ ] `auth_attempted` and `auth_abandoned` events fire with correct tags.

### 12.8 Supabase types wiring — smoke test only

The `createClient<Database>` change shouldn't affect runtime, but verify:
- [ ] Any code path that upserts a `user_profiles` row (onboarding complete, Apple-name-save) still works. Covered incidentally by 12.1, 12.2, 12.6 — no dedicated new test needed, just don't get a Supabase 400 / 42703 "column does not exist" error in Metro logs during those flows.

### 12.9 Loading screen "Parent" name filter (defense-in-depth verification)

The Apple-name-clobber fix is a two-layer defense (LoadingScreen + service). Both layers should filter `name === 'Parent'`. Verify at least one path:

- [ ] Fresh install, Apple Sign-In (must be a fresh Apple ID that will actually surface `credential.fullName` — subsequent sign-ins skip it; use a new sandbox Apple ID).
- [ ] During onboarding, leave the name field blank on NameAgeScreen (accept the "Parent" default).
- [ ] Complete onboarding.
- [ ] Check dev Supabase `user_profiles.name` — should show the **real Apple name** from the credential, NOT the literal "Parent". If "Parent" is in the DB, one layer of the two-layer defense broke.

### 12.10 Kill switch idempotence + cap (the sanity-cap addition)

Section 6 covers basic kill-switch. This adds the cap check:

- [ ] In dev Supabase `app_config`, set `min_supported_ios_build` to `9999` (a value ABOVE the cap of 40).
- [ ] Launch the dev app.
- [ ] Force-update modal should NOT appear — the sanity cap refused the config.
- [ ] Metro / console log should show something like "kill switch min exceeds cap, ignoring". If the modal appears with 9999 → the cap fix regressed.
- [ ] Reset `min_supported_ios_build` to `0`.

### 12.11 Version display is dynamic

Fable #14 caught `SettingsScreen.tsx:337` hardcoding "Kinderwell v1.0.0" while shipping 1.1.0.
- [ ] Settings screen → scroll to bottom → version reads "v1.1.0 (build 9)" or whatever the current `Constants.expoConfig.version` + `ios.buildNumber` are. Not hardcoded.

### 12.12 Restore Purchases — full outcome matrix (Fable #1, defining behavior of the fix)

Section 5 covers only the `restored` and `no_purchases` outcomes. The
defining bug the fix closed (a reinstalling subscriber with
`subscriptionStatus === 'UNKNOWN'` getting a false "No Purchases Found"
and having to contact support) has NEVER been tested end-to-end.
Fable re-review 2026-07-05 flagged this as the missing test.

The restore flow can land on **five** discrete PostHog `outcome` values:
`restored`, `no_purchases`, `unknown`, `failed`, `threw`. Each maps to a
distinct user-facing alert. Verify each below — for the ones that are
hard to induce directly (`unknown`, `threw`), verify by reading Metro
logs during the natural attempts rather than trying to force the state.

**Setup (once):** dev IPA installed, on a device with a StoreKit sandbox
Apple ID (see `STOREKIT_SETUP_GUIDE.md`). Sign in fresh.

**12.12.1 — `restored` outcome (already covered by 5.1, re-verify here):**
- [ ] Sandbox-subscribe via paywall first.
- [ ] Uninstall + reinstall app.
- [ ] Sign back in.
- [ ] Settings → Restore Purchases.
- [ ] Alert reads exactly **"Restored — Your subscription has been restored."**
- [ ] Metro/PostHog: `restore_purchases_completed` with `outcome: 'restored'`.

**12.12.2 — `no_purchases` outcome (already covered by 5.2, re-verify):**
- [ ] Fresh install with a sandbox Apple ID that has NO prior Kinderwell subscription.
- [ ] Sign in, land on paywall.
- [ ] Settings → Restore Purchases (either dismiss paywall first, or if the paywall has its own Restore button use that).
- [ ] Alert reads exactly **"No Purchases Found — No previous purchase was found for this Apple ID. Make sure you're signed in with the Apple ID you used to subscribe."**
- [ ] Metro/PostHog: `restore_purchases_completed` with `outcome: 'no_purchases'`.

**12.12.3 — `unknown` outcome ("Still Syncing" — the reinstall race condition; THIS is the bug the fix closed):**

This is the outcome that used to silently mis-classify as `no_purchases`
before the fix. It happens when `restorePurchases()` completes but
Superwall's `subscriptionStatus` hasn't finished resolving yet — usually
right after a fresh install of a real subscriber, or after
force-quitting and reopening the app before Superwall has warmed up.
Hard to induce reliably on demand; two attempts:

- [ ] **Cold-start attempt:** fresh install, sign in as a subscriber, immediately Settings → Restore Purchases within ~2 seconds of the app opening (before Superwall has finished warming up). If you hit the race, alert reads exactly **"Still Syncing — We're still checking with the App Store. Please try again in a moment."** Metro/PostHog: `restore_purchases_completed` with `outcome: 'unknown'`. Retry immediately and it should now resolve to `restored`.
- [ ] **Airplane-mode attempt:** enable Airplane Mode → Settings → Restore Purchases. Depending on Superwall internals this may land as `unknown` (still syncing) or `failed` (network error) — either is acceptable evidence the code isn't silently mis-classifying as `no_purchases`.
- [ ] **Fallback: read the code path.** If you can't induce it in a session, confirm the branch exists and its exact copy by grepping `src/screens/SettingsScreen.tsx` for `'Still Syncing'` — the assertion is that the branch is reachable, not that we always hit it during smoke test. If the string doesn't grep, the fix regressed.

**12.12.4 — `failed` outcome (restore call itself errors):**
- [ ] Trigger a Restore Purchases attempt while offline hard (Airplane Mode on, Wi-Fi off, cellular off, or physical network detach if simulator).
- [ ] Alert reads **"Restore Failed"** with the underlying error message (or fallback: "Something went wrong. Please check your connection and try again.").
- [ ] Metro/PostHog: `restore_purchases_completed` with `outcome: 'failed'` and an `error` property.
- [ ] Reachable Metro-log evidence for the branch is sufficient if the exact error copy varies by device.

**12.12.5 — `threw` outcome (synchronous exception before the restore call resolves):**

The synchronous exception path (`catch (error)`) is very rarely
reachable in production since the SDK returns `{ result: 'failed' }`
for most failure modes rather than throwing.

- [ ] Best-effort: confirm the branch exists by grepping
      `src/screens/SettingsScreen.tsx` for `outcome: 'threw'`. If it
      doesn't grep, the catch handler regressed.
- [ ] Not required to reproduce in a session.

**12.12.6 — Guard against re-tap (already covered by 5.3, re-verify here):**
- [ ] Tap Restore Purchases → button disables while `isRestoring` is true → does not fire twice.

**Reporting bar:** 12.12.1 and 12.12.2 must succeed as end-to-end tests
(same as Section 5). 12.12.3 must at minimum pass the grep-check
(fallback); a live reproduction is a bonus. 12.12.4 must pass either as
end-to-end or Metro-log-only evidence. 12.12.5 is grep-only. If ANY of
12.12.1 / 12.12.2 / 12.12.3-grep fails, the Restore Purchases fix has
regressed and this IPA is not shippable.

---

## What to report back

After running through:
1. **Which sections passed?** (Pass count / total)
2. **Which failed?** Copy the exact behavior + relevant Metro log lines
3. **Any unexpected behavior** not covered by a specific test

**Bar for proceeding to RELEASE_CHECKLIST Phase 3 (version bump):**
- All Section 12 items pass (they cover code we just changed — regressions are unacceptable).
- Sections 1–9 pass at ≥ 90%. Any fail requires an explicit "we know why, and it's not a shipping blocker" note; otherwise fix + rebuild + retest.
- Section 10 (structural prod guard) is optional but valuable if you have 5 min.
- Section 11 (prod remains untouched) is a hard gate — any test user in prod = STOP, investigate.

If Section 12 fails on anything → do NOT proceed to RELEASE_CHECKLIST. Fix, rebuild the dev IPA, retest the failed 12.x items. Section 12 is where the Fable-review-era regression risk lives; passing it is what makes the dev IPA "shippable-quality" rather than just "compiles."

---

## Post-verification tasks (if all green)

- [ ] Merge PR `setup/dev-environment` → `main`
- [x] Move `docs/DEV_SETUP_LOG_2026-07-01.md` to `docs/archive/` (done 2026-07-09 — SPEC-10 doc-drift pass)
- [ ] Keep `appreview` public repo mirrored (used for external reviews — do NOT delete)
- [ ] Move `docs/IPHONE_TEST_PLAN_V1.1.0.md` to `docs/archive/` ONLY after v1.1.0 has actually shipped (App Store live). Before then it's still the active plan.
- [ ] Following `RELEASE_CHECKLIST.md` from Phase 3 onwards is the next step — bump build number, EAS prod build, TestFlight, mandatory UPGRADE test (Phase 8.3), 4 external actions (Superwall dashboard, prod migration, App Privacy questionnaire, submit for review).
