# iPhone Smoke Test Plan — v1.1.0 Dev Build

**Purpose:** end-to-end verification of every meaningful change we've made this weekend before merging `setup/dev-environment` to `main`. If ANY test fails, we fix and re-verify before the merge.

**Device:** iPhone XR (Apple ID: `kinderwelltry1@gmail.com`)
**Build:** dev IPA from `eas build --profile development --platform ios` (bundle: `com.kinderwell.app.dev`, name: "Kinderwell Dev")
**Backend:** dev Supabase (`xbkkjqvbsnroenqlqkmi`)
**Prerequisites:**
- ✅ TestFlight installed and signed in with `kinderwelltry1@gmail.com`
- ✅ Sandbox Apple ID `sandeepv98@gmail.com` created in App Store Connect
- ✅ Mac connected to same wifi as iPhone (for Metro logs)
- ✅ `npx expo start` running on Mac

**How to reset between tests:** Kinderwell Dev app → Settings → Delete Account (clears everything). Then close/reopen app.

---

## Section 0 — Install & connect

### 0.1 Install the dev build
- [ ] TestFlight notification for "Kinderwell Dev" arrives → tap Install
- [ ] App icon shows as **"Kinderwell Dev"** (not "Kinderwell") on home screen
- [ ] If prod v1.0.0 is also installed: they appear as TWO separate icons (proves bundle ID split works)
- [ ] Launch the dev app — no crash

**If fail:** bundle ID split broken → managed workflow migration issue

### 0.2 Connect to Metro
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

**Architecture note (updated 2026-07-04)**: v1.1.0 uses two distinct
Superwall placements:
- `show_paywall` (Non-Gated) fires from `LoadingScreen` after onboarding
  as the sales pitch. Same as prod v1.0.0 behavior, preserved for
  backward compat.
- `learn_access` (Gated) fires from `useLessonGate` hook when the user
  taps a lesson. This is the real gate — `feature()` only fires if
  Superwall confirms an active `pro` entitlement.

The refactor removed the old `subscriptionStatusResolved` / bounce-back
pattern. LearnScreen renders lesson list normally for everyone;
gate happens at lesson tap.

### 3.1 Paywall renders after onboarding
- [ ] After Google sign-up, LoadingScreen fires `show_paywall`
- [ ] Superwall paywall appears (real UI)
- [ ] Metro shows Superwall `onPresent` log

### 3.2 Dismiss paywall → land on LearnScreen (no gate here)
- [ ] With paywall showing: swipe down or tap X
- [ ] Metro shows `paywall_dismissed` event
- [ ] App navigates to Root → LearnScreen renders lesson list normally
- [ ] Do NOT expect a bounce here — the gate is at tap time, not screen mount

### 3.3 Tap a lesson without entitlement (P0 #1 fix, the real test)
- [ ] Tap any lesson (Lesson 1, Sprinklers, whatever)
- [ ] Metro shows `[useLessonGate] entitlement confirmed` NOT firing
- [ ] Superwall paywall re-appears via `learn_access` placement
- [ ] Dismiss again — you stay on LearnScreen (lesson does NOT open)
- [ ] Repeat 3x — every tap re-shows paywall, no bypass path

**If lesson opens without an active subscription: 🔴 gate broken.**

### 3.4 Force-quit + reopen bypass attempt (the exact bug you reproduced on prod)
- [ ] With paywall showing: dismiss it (X or swipe)
- [ ] Force-quit app (swipe up in app switcher, swipe Kinderwell away)
- [ ] Reopen app → Splash → LearnScreen
- [ ] Tap a lesson → paywall re-appears
- [ ] 🔴 If lesson opens directly: same bug as prod, fix is broken

### 3.5 Complete a sandbox purchase (in TestFlight, not this build)
Sandbox mode requires either Xcode developer mode setup (~30 min) or
TestFlight. Defer purchase tests to the TestFlight build.

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
  - `lesson_started`
  - `restore_purchases_tapped` / `restore_purchases_completed`

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

## What to report back

After running through:
1. **Which sections passed?** (Pass count / total)
2. **Which failed?** Copy the exact behavior + relevant Metro log lines
3. **Any unexpected behavior** not covered by a specific test

If ≥ 90% passes: merge the PR.
If < 90%: fix, rebuild if native, retest.

---

## Post-verification tasks (if all green)

- [ ] Merge PR `setup/dev-environment` → `main`
- [ ] Delete the temporary `appreview` public repo: `gh repo delete mandeepv/appreview --yes`
- [ ] Move `docs/DEV_SETUP_LOG_2026-07-01.md` and this file to `docs/archive/` (they've served their purpose)
- [ ] Ready to start on P2 items or ship prep
