# Prod bug hunt — v1.0.0 (Build 8) on iPhone XR

Use this checklist while poking at the currently-live App Store version to
find bugs before v1.1.0 ships. Categorize each finding as you go.

**What we've already found today** (all fixed on `setup/dev-environment` for
v1.1.0):
- Paywall bypass: dismiss paywall → force-quit → reopen → free lesson access
- Delete-account: 401 from expired JWT, silent failure
- Apple Sign-In: name written to wrong DB column (silently lost)
- Restore Purchases: didn't actually re-sync with StoreKit
- Sign in with Apple/Google from Welcome creates account without warning
- Onboarding UX issues (already captured in BACKLOG.md (v1.1.1 section))

## How to use this

For each test:
- ✅ = works as expected
- 🔴 = bug found, money-critical or data corruption — must fix in v1.1.0
- 🟡 = bug found, UX polish — defer to v1.1.1+
- 🟢 = works but has a suggestion for improvement
- ⏭️ = skipped (write why)

At the end of each section, note anything surprising in the "Notes" line.

**Setup**:
- iPhone XR running iOS 18.7.9
- A fresh Apple ID (never used with Kinderwell before) for signup tests
- Optional: a second Apple ID for cross-account tests
- Prod app installed from App Store (v1.0.0 Build 8)

---

## Section 1 — Auth flows (already 2 bugs, high suspicion of more)

### 1.1 Google Sign-Up (fresh account)
- [x] Open app → complete onboarding → AuthScreen → Continue with Google
- [x] Verify redirected to Google → picks up email → back to app
- [x] Verify lands on Loading → paywall → dismiss → LearnScreen
- [x] Check prod Supabase → auth.users → new user row exists
- [x] Check user_profiles → name field is populated correctly

Notes:
- 2026-07-04, Mandeep on iPhone XR against prod v1.0.0 Build 8.
- Sign-in worked, user row created, most onboarding fields populated
  correctly (name, age, children_count, improvement_goals, experience,
  etc.).
- 🔴 Paywall has NO dismiss control on prod — no X button, no
  swipe-down. The only way past it is force-quit + reopen. That's the
  same code path that then lands users on LearnScreen with free access
  (the money-leak paywall bypass bug we already fixed for v1.1.0).
  Prod v1.0.0 has effectively no functioning paywall for anyone who
  figures out force-quit.
- 🔴 Every child in the DB has `gender: 'boy'` even though onboarding
  never asks for gender. Onboarding does ask for ageRange, so children
  save as e.g. `[{gender:'boy', ageRange:'13-17'}]`. Fixed in v1.1.0
  commit 33ea4f0 — new users will no longer get a fake gender written.
- user_profiles has no `email` column (auth.users has it, not
  user_profiles). Fine as-is — email is available via auth.getUser(),
  we don't need to duplicate it.

### 1.2 Google Sign-In (existing account, from Welcome)
- [x] Force-quit + delete app data (or delete account first)
- [x] Reinstall from App Store
- [x] Open → Welcome → "I already have an account" → Continue with Google
- [x] Same email as 1.1
- [x] Expected: lands at Root (LearnScreen), NOT onboarding
- [x] 🔴 bug if goes to onboarding

Notes:
- 2026-07-04, Mandeep. Sign-in worked as expected — Welcome → I
  already have an account → Continue with Google → briefly saw
  "Welcome back" → LearnScreen. No re-onboarding, no data loss. ✅
- 🟡 iOS OAuth system dialog reads "supabase.co wants to sign in"
  instead of "kinderwell.com". Trust/polish issue, not a bug. Deferred
  to v1.2 — needs Supabase custom auth domain + DNS setup. Added to
  BACKLOG.md (v1.2 section).
- Observation about paywall: Mandeep saw paywall on first-launch
  after sign-up (1.1), force-quit, reopened → LearnScreen with free
  access. This is the same paywall-bypass money leak we already fixed
  for v1.1.0 (via useLessonGate hook). No re-verification needed.

### 1.3 Apple Sign-Up (fresh account)
- [x] Same as 1.1 but with Apple ID that's never signed into Kinderwell
- [x] Enter your name when Apple asks (first time only)
- [x] Verify Supabase → user_profiles → `name` column populated
- [x] 🔴 bug if `name` is null (we already fixed this in v1.1.0)

Notes:
- 2026-07-04, Mandeep. Apple sign-in worked end-to-end. Email captured
  correctly (chose "Share My Email"). user_profiles row created with
  name populated. ✅
- Caveat: user_profiles.name came from the NameAge onboarding screen
  (the user typed a name during onboarding), not from Apple's
  credential.fullName. Prod v1.0.0 writes Apple's fullName to
  non-existent columns (`full_name`, `email`) so it silently drops on
  the floor — but the onboarding-typed name masks this at the UI
  level. Fixed in v1.1.0 (writes to correct `name` column) for
  correctness even though the user visible symptom in prod is nil.
- Phantom "boy" gender bug reproduces here too — same fix as 1.1.

### 1.4 Apple Sign-In (existing account, from Welcome)
- [x] Same as 1.2 but Apple
- [x] Expected: lands at Root

Notes:
- 2026-07-04, Mandeep. Log Out → Welcome → "I already have an
  account" → Sign in with Apple → Face ID → LearnScreen. All ✅.

### 1.5 Sign in with Apple when NO account exists (the bug you found)
- [x] Fresh Apple ID that has NEVER signed into Kinderwell
- [x] Open → Welcome → "I already have an account" → Sign in with Apple
- [x] 🔴 Expected in v1.0.0: creates account, sends to onboarding (bad)
- [x] ✅ Expected in v1.1.0: creates account (unavoidable via OAuth), sends
      to onboarding correctly (since user has no prior progress)

Notes:
- 2026-07-04 — bug reproduced by Mandeep earlier in the session. Prod
  v1.0.0 creates a new account and drops user into onboarding when
  they tap "I already have an account" without ever having signed up.
- Fixed in v1.1.0 by unifying SignInScreen + AuthScreen into a single
  AuthScreen that adapts copy/routing based on a `mode` param. See
  commit 2beeea1 for details.
- Not re-testing on prod v1.0.0 since we already have direct
  reproduction and a fix is in place.

### 1.6 Sign in with Google when NO account exists (same bug, different provider)
- [x] Fresh Google account that has NEVER signed into Kinderwell
- [x] Same flow as 1.5 → same expected behavior

Notes:
- 2026-07-04 — SKIPPED. Same underlying code path as 1.5. Fixed by
  the same unified-auth refactor (commit 2beeea1). Both providers go
  through the same handlePostSignin routing that respects
  hasUserCompletedOnboarding.

### 1.7 Multi-provider on same email
- [x] Sign up with Apple using apple-id@icloud.com
- [x] Sign out
- [x] Sign in with Google using SAME apple-id@icloud.com
- [x] What happens? Same account? Duplicate?
- [x] 🔴 if duplicate accounts get created

Notes:
- 2026-07-04, Mandeep. ✅ Supabase merged into a SINGLE account.
  UID 4fb6885d-... has providers listed as "Apple, Google". Landed on
  LearnScreen (returning user path) as expected.
- Only concern: users who chose Apple "Hide My Email" get a
  privaterelay email that won't match their Google email, so
  identity-linking wouldn't merge them. Deferred to v1.2 as UX advice
  ("use Share My Email") since that's user education not a bug.

### 1.8 Sign out from Settings → sign back in
- [x] Settings → Log Out
- [x] Expected: land on Welcome
- [x] Sign back in with same provider
- [x] Verify progress / onboarding data still there

Notes:
- 2026-07-04 — implicitly verified in Sections 1.2 and 1.4 (both
  covered Log Out → Welcome → sign in → LearnScreen with returning
  data intact). ✅

### 1.9 Uninstall / reinstall / sign in
- [x] Uninstall app (long-press home → delete)
- [x] Reinstall from App Store
- [x] Sign in via same provider
- [x] Verify progress restored from Supabase

Notes:
- 2026-07-04 — implicitly verified in Section 1.2 (Mandeep deleted
  the app + reinstalled between tests, then signed in as returning
  user with data intact). ✅

---

## Section 2 — Subscription / purchase lifecycle

**⏭️ SKIPPED 2026-07-04**: 2.1–2.4 require sandbox mode, which on iOS
18 needs either Xcode dev-mode setup (~30 min) or a TestFlight build.
2.5 (Restore Purchases) and 2.6 (paywall bypass) already covered
elsewhere. 2.7 is edge-case. Best plan: retest 2.1–2.4 on the v1.1.0
TestFlight build, where sandbox is automatic. Added to test plan for
that release.


### 2.1 Subscribe monthly → verify entitlement
- [ ] Complete onboarding as new user → hit paywall
- [ ] Buy monthly subscription (use sandbox — see STOREKIT_SETUP_GUIDE.md)
- [ ] Verify lands at LearnScreen with full access
- [ ] Verify Superwall dashboard → user shows entitlement
- [ ] Verify our authStore.isSubscribed = true (only visible via analytics)

Notes:

### 2.2 Subscribe yearly instead
- [ ] Same as 2.1 but pick yearly
- [ ] Same verifications

Notes:

### 2.3 Cancel subscription in App Store → app should re-gate
- [ ] After 2.1 or 2.2, go to Settings → Apple ID → Subscriptions → Kinderwell
- [ ] Cancel
- [ ] Reopen Kinderwell → try to access a lesson
- [ ] Expected: paywall re-appears (once subscription reaches expiration date)
- [ ] For faster testing: use sandbox where subscription expires in minutes

Notes:

### 2.4 Family Sharing subscription
- [ ] Set up subscription with Family Sharing on the purchaser's device
- [ ] Sign in to Kinderwell on a family member's device with THEIR Apple ID
- [ ] Verify: family member has access without their own purchase
- [ ] 🔴 if family member is prompted to buy despite Family Sharing being on

Notes:

### 2.5 Restore Purchases (Settings → Restore)
- [ ] In app, Settings → Restore Purchases
- [ ] Expected in v1.0.0: probably fake (we know we fixed this in v1.1.0)
- [ ] Expected in v1.1.0: three outcomes clearly shown —
      "Restored", "No purchases to restore", "Failed"

Notes:

### 2.6 Paywall bypass — the money-losing bug
- [ ] Fresh install → new onboarding → paywall appears
- [ ] Do NOT purchase — dismiss paywall
- [ ] Force-quit app (swipe up on app switcher)
- [ ] Reopen → try to open a lesson
- [ ] 🔴 v1.0.0 bug: lesson opens for free
- [ ] ✅ v1.1.0: paywall re-appears when tapping lesson

Notes:

### 2.7 App crash mid-purchase
- [ ] Start a purchase → after Apple's payment sheet appears but before
      confirming, force-quit the app (hard, if possible)
- [ ] Reopen → check if subscription is active (or if Apple charged)
- [ ] Delete account only after verifying — you don't want to leak a
      real charge into prod

Notes:

---

## Section 3 — Delete account

### 3.1 Delete when unsubscribed
- [ ] Signed in but never subscribed
- [ ] Settings → Delete Account → confirm
- [ ] 🔴 v1.0.0: "Delete Failed" (we know why — 401 from expired JWT)
- [ ] ✅ v1.1.0: succeeds → back to Welcome, account gone from Supabase

Notes:

### 3.2 Delete when subscribed
- [ ] Signed in, active subscription
- [ ] Settings → Delete Account
- [ ] What happens to the Apple subscription? Is user warned they'll still
      be charged?
- [ ] 🔴 if user has no way to know subscription is orphaned

Notes:

### 3.3 Delete → sign up again with same provider
- [ ] Delete account fully
- [ ] Sign up again with same Apple/Google credentials
- [ ] Verify: fresh onboarding, no orphaned data from previous account

Notes:

### 3.4 Delete → app must not retain old user's data locally
- [ ] After delete, force-quit + reopen
- [ ] Verify: no cached onboarding, no cached progress, no cached user info
      from the deleted account

Notes:

---

## Section 4 — Data integrity

**⏭️ DEFERRED 2026-07-04**: Only 4.1 (phantom "boy" child) covered —
already verified in Section 1.1 and fixed in commit 33ea4f0. The rest
(4.2 progress persistence, 4.3 cross-device sync, 4.4 edit onboarding
answers) not tested yet. Mandeep suspects lesson progress may not be
fully implemented / persisted; needs proper investigation later, not a
30-second grep session. Deferred to a future hunt or bug triage.


### 4.1 Phantom "boy" child (the bug you reported)
- [ ] Complete onboarding WITHOUT adding any children (skip the children
      screens or leave the child fields empty)
- [ ] Check prod Supabase → user_profiles → check children column
- [ ] 🔴 if a "boy" appears there without you entering one

Notes:

### 4.2 Progress persistence across sessions
- [ ] Complete Lesson 1 through screen 5 (partial)
- [ ] Force-quit app
- [ ] Reopen → verify Lesson 1 resumes at screen 5, not screen 1

Notes:

### 4.3 Progress persistence across devices (if you have two)
- [ ] Complete a lesson on iPhone XR
- [ ] Sign in on a second device (or reinstall)
- [ ] Verify same lesson shows as completed

Notes:

### 4.4 Change onboarding answers after the fact
- [ ] Settings → look for edit-profile / edit-children options
- [ ] Change something (name, child age)
- [ ] Force-quit + reopen → is the change reflected?
- [ ] Check Supabase to verify persistence

Notes:

---

## Section 5 — Push notifications (if enabled)

**⏭️ DEFERRED 2026-07-04**: Grep shows the app COLLECTS notification
preference during onboarding but has no code path that actually schedules
or sends any notifications. `expo-notifications` isn't imported anywhere
for real notification scheduling. Not a v1.1.0 bug — an unimplemented
feature that either needs to be built or the onboarding question needs
to be removed. Logged for future release planning.


### 5.1 Notifications opt-in during onboarding
- [ ] During onboarding you're asked about notifications
- [ ] Grant permission → verify iOS permission granted
- [ ] Deny permission → verify iOS reflects denial

Notes:

### 5.2 Do notifications actually get sent?
- [ ] Grant permission → wait
- [ ] Check if any notifications arrive in the next 24 hours
- [ ] 🔴 if you granted permission but never receive anything (feature
      isn't wired up)

Notes:

### 5.3 Tap notification → what happens?
- [ ] If any notifications arrive, tap one
- [ ] Does it deep-link somewhere useful, or just open the app?

Notes:

---

## Section 6 — Settings screen

**2026-07-04 Mandeep tested prod v1.0.0 Build 8**:
- ✅ Manage Subscription → App Store subscriptions tab
- 🔴 Restore Purchases → also opens App Store subscriptions (fake).
  Already fixed for v1.1.0 in commit ee8d354 (real StoreKit sync).
- ✅ Contact Support → mailto prompt with provider picker
- ✅ Privacy Policy → github legal repo (correct URL)
- ✅ Terms of Service → github legal repo (correct URL)


### 6.1 All buttons functional?
- [ ] Manage Subscription → opens App Store subscription page ✅?
- [ ] Restore Purchases → covered in 2.5
- [ ] Privacy Policy → opens correct URL, correct content
- [ ] Terms of Service → opens correct URL, correct content
- [ ] Contact / Support → opens what? Email? Web? Working link?
- [ ] Delete Account → covered in 3.x
- [ ] Log Out → covered in 1.8

Notes:

### 6.2 Version / build number displayed correctly?
- [ ] Look for version display in Settings or About
- [ ] Should show 1.0.0 build 8 on prod
- [ ] 🔴 if wrong or missing

Notes:

---

## Section 7 — Onboarding flow (mostly deferred to V1.1.1)

Most of this is in `BACKLOG.md (v1.1.1 section)`. Only check here for
BLOCKING bugs, not polish.

### 7.1 Can you complete onboarding at all?
- [ ] Start-to-finish with a real Apple ID
- [ ] Note any screen that hangs, crashes, or won't advance

Notes:

### 7.2 What's in the DB after onboarding?
- [ ] After completing, check user_profiles for your test user
- [ ] Every field you entered should be there and correct
- [ ] 🔴 if data is missing / wrong (that's a serialization bug)

Notes:

### 7.3 Resume onboarding after crash
- [ ] Start onboarding → get to the "your children" screen
- [ ] Force-quit
- [ ] Reopen → should resume at the "your children" screen, not restart
- [ ] 🔴 if you have to start over

Notes:

---

## Section 8 — Edge cases (spot-check, don't be exhaustive)

**2026-07-04 Mandeep tested prod v1.0.0 Build 8**:
- 8.1 ✅ Open app in airplane mode → LearnScreen shows as normal.
  Signed-in state cached locally.
- 8.2 🟡 Log out in airplane mode → "Error — could not log out."
  `signOut()` awaits a Supabase server call that hangs. Not fixing
  in v1.1.0 — no real user hits this (users connect to WiFi before
  logging out). Logged for potential future polish.
- 8.3 🔴 Free lesson access in airplane mode. This is the same
  paywall-bypass bug seen in Section 1.1 (no gate on LearnScreen).
  Fixed in v1.1.0 by useLessonGate hook.
  ⚠️ **REGRESSION CONCERN**: v1.1.0's `useLessonGate` calls
  `registerPlacement('learn_access')` which makes a network call.
  Paying users offline may be locked out (feature() never fires
  because network throws). Need to verify Superwall SDK caches
  entitlement state locally so registerPlacement works offline for
  entitled users. TESTING REQUIRED on dev build (iPhone XR) before
  shipping v1.1.0. If regression is real, mitigation: cache
  isSubscribed locally with a fallback path in gateToLesson.
- 8.4 ✅ Force-quit mid-onboarding, reopen → resumed at same screen
  with previous inputs preserved. AsyncStorage LAST_SCREEN_KEY +
  onboarding store hydration working correctly.


### 8.1 Airplane mode during onboarding
- [ ] Turn on airplane mode BEFORE opening app
- [ ] Open app → does it hang, crash, or gracefully degrade?
- [ ] Try to complete onboarding — expected behavior?

Notes:

### 8.2 Airplane mode during paywall
- [ ] Complete onboarding online
- [ ] Turn on airplane mode
- [ ] Force-quit + reopen → paywall behavior?

Notes:

### 8.3 Airplane mode during lesson
- [ ] Subscribed user, in the middle of a lesson
- [ ] Turn on airplane mode
- [ ] Does the lesson continue? Or hang?

Notes:

### 8.4 Kill app randomly at various screens
- [ ] Onboarding NameAge screen — kill + reopen → resume?
- [ ] Onboarding ChildrenCount screen — kill + reopen → resume?
- [ ] Mid-lesson — kill + reopen → resume?

Notes:

---

## Section 9 — Rate the sad paths

**2026-07-04 audit of all Alert.alert() error messages in the app.**
The theme across nearly every one: "something failed, try again." No
context about what went wrong, no next step, no way to escalate.

### The bad ones (v1.0.0 prod + still in v1.1.0 without further work)

**Delete Failed** (SettingsScreen:198)
> "Could not delete account. Please try again or contact support."
- 🔴 Doesn't tell user what went wrong. Actual cause on prod was
  401 from expired JWT — user retrying without doing anything else
  will hit the same 401.
- v1.1.0 has the session-refresh fix, but the alert still doesn't
  distinguish server errors from network errors from auth errors.
- Better: "We couldn't delete your account right now. This is usually
  a network hiccup — please check your connection and try again. If
  it keeps failing, email kinderwellteam@gmail.com."

**Sign In Failed** (AuthScreen:169, similar block for Google)
> "Could not sign in with Apple. Please try again."
- 🟡 Same pattern. No hint whether the failure is network, cancelled,
  provider outage, or bad credentials.
- Better: distinguish network from provider errors, offer email/support
  fallback for repeated failures.

**Error — could not log out** (SettingsScreen:140)
> "Could not log out. Please try again."
- 🟡 Only fires in airplane mode (see Section 8.2). Users won't hit
  this in real life. Not worth fixing.

**Contact Support fallback** (SettingsScreen:214)
> "Please email us at kinderwellteam@gmail.com"
- ✅ This one is actually fine — user knows exactly what to do next.
  Only appears if mailto: can't open (very rare).

### The good ones

**Delete confirmation** (SettingsScreen:150, post-v1.1.0 fix)
- ✅ Now lists actual consequences ("progress, preferences, children")
  and warns about subscriptions if applicable. Not an error message
  per se but the clearest destructive-action prompt in the app.

**Purchase sandbox tag on iOS purchase sheet**
- ✅ Apple's system UI tells the user "[Environment: Sandbox]" — good
  guardrail we get for free. Not our code but worth noting: the app
  itself doesn't add its own "test purchase" indicator, which is fine.

### Cross-cutting pattern to fix in v1.1.1+

Every error message in the app follows the template:
> "[Something] Failed. [Action] could not be completed. Please try
> again[ or contact support]."

This template is applied to ~7 different failure modes (delete, log
out, sign in Apple, sign in Google, restore, purchase abandon,
purchase fail). None of them tell the user:
1. What actually went wrong (network? server? provider? user
   cancelled?)
2. What to do about it (retry? update app? contact support with
   what info?)
3. How to escalate (support email visible, or is it buried?)

**Recommendation for v1.1.1**: pick a better error UX pattern. Some
options: inline errors near the button that triggered them (not modal
Alert), plus a shared "something broke, here's what we know" pattern
that Sentry-reports the actual error object and shows the user a
correlation ID they can quote in support emails. Airbnb, Notion, and
Linear all do variants of this.


Not testing — just judging.

### 9.1 What does the app do wrong when things go wrong?
For each error path you saw during testing, ask:
- Does the error tell the user what went wrong?
- Does the error tell them what to do about it?
- 🔴 "Something went wrong. Please try again." is a bad answer.

Notes:

---

## Section 10 — Final tally

Compiled 2026-07-04 end-of-day after ~6 hours of prod testing.

### 🔴 Money-critical / data-corruption bugs found on prod v1.0.0 Build 8

All 6 have code fixes on the `setup/dev-environment` branch ready
for v1.1.0:

1. **Paywall bypass** — dismiss + force-quit = free lesson access
   forever. Every single user who force-quits after seeing the paywall
   is using the app for free.
   Fixed: ee8d354, 00e5347, 86d205f, c65e61d (Superwall SDK-native
   `usePlacement` pattern + Gated placement + central `useLessonGate`
   hook + upgrade to Superwall 1.1.6).

2. **Delete-account 401** — silent failure. Every user who tries to
   delete their account after their JWT expires (default 1 h from
   sign-in) gets a bare "Delete Failed" alert with no explanation.
   Fixed: 0a7500a (refresh session before invoking Edge Function).

3. **Restore Purchases is fake** — button just opens App Store
   subscriptions and lies to PostHog with a `purchases_restored`
   event. Compliance risk with Apple guideline 3.1.1.
   Fixed: ee8d354 (real StoreKit sync + three-outcome pattern).

4. **Sign-in creates duplicate accounts** — user taps "I already have
   an account" without ever having signed up → Supabase creates a new
   account. Duplicate accounts, orphaned subscriptions.
   Fixed: 2beeea1 (unified AuthScreen), e49102f (Private Relay hint).

5. **Delete-account no subscription warning** — App Store guideline
   5.1.1(v) requires disclosing that Apple continues billing after
   account delete for subscribed users.
   Fixed: 27559ec (conditional warning in alert body).

6. **Phantom "boy" child gender** — every user's children default to
   `gender: 'boy'` in the DB because the onboarding gender screen is
   commented out but the store default sticks.
   Fixed: 33ea4f0 (no default gender written).

### 🟡 UX / polish issues fixed for v1.1.0

7. **Two-step delete confirmation theater** ("Really? / Really really?")
   → single clear confirmation with real consequences. Commit 27559ec.

8. **Delete didn't clear local cache** → onboarding progress could
   haunt next signup. Fixed in 27559ec.

9. **Delete didn't reset Superwall / Sentry identity** → next user on
   the device would inherit stale entitlement / error attribution.
   Fixed in 27559ec.

10. **Apple Sign-In name written to wrong DB column** → silently
    dropped. Prod users' names came from the onboarding NameAge
    screen, not Apple's identity token. Fixed dcecfab.

### 🟡 UX / polish — deferred (BACKLOG.md (v1.1.1 section))

11. Paywall UI has no dismiss button — users force-quit to escape
    (which then triggers the money leak). v1.1.0 fixes the leak; the
    paywall UI itself needs redesign or Superwall configuration to
    add a close button.
12. Onboarding splash flash before splash screen
13. Splash vs "Get Started" screens visually identical
14. Continue button hidden below fold on multiple screens
15. Age input +/- stepper is tedious (30 taps to get to 34)
16. Name field optional but should be required
17. Placeholder "blah blah" copy leaked to prod
18. iPhone XR / small-screen QA gap
19. Unprofessional "next few questions help us personalize" intro

### 🟡 UX — deferred (BACKLOG.md (v1.2 section))

20. Custom OAuth domain (currently shows `supabase.co` on iOS OAuth
    sheet).
21. Enable Supabase manual identity linking + "Trouble signing in?"
    support flow for Private Relay duplicate-account edge cases.

### 🔴 Regression risk to verify on dev build BEFORE shipping v1.1.0

22. **Offline entitlement gate** (Section 8.3, Section 3.7 of iPhone
    Test Plan): v1.1.0's `useLessonGate` needs Superwall network call
    to fire `feature()`. Paying users offline may be locked out.
    Need to verify on iPhone XR + add cached-`isSubscribed` fallback
    if it fails.

### 🟢 Unimplemented features (deferred)

23. **Notifications**: onboarding asks user, saves to DB, but no
    code path schedules any notifications. Feature not built.
24. **Lesson progress persistence**: Mandeep flagged concerns.
    `lessonProgressService.ts` exists but wasn't audited today.
    Needs proper investigation.
25. **Family Sharing subscription**: not tested. Requires second
    Apple ID.

### Not tested (needs sandbox / TestFlight)

26. Section 2.1–2.4 (subscribe, cancel, renew, family) — all need
    sandbox mode. iOS 18 requires Xcode dev-mode setup for sandbox
    Apple ID sign-in on prod builds. Defer to TestFlight build of
    v1.1.0 where sandbox is automatic.

### What must be done before shipping v1.1.0

**Blockers**:
- Verify #22 (offline gate regression) on iPhone XR
- Run iPhone test plan on the dev build
- Complete Section 2 purchase tests via TestFlight after IPA is
  submitted

**Not blockers, defer to v1.1.1 / v1.2**:
- Everything else listed above

### Session takeaways

- Prod has zero server observability. Every bug we found was silent.
  Fable review flagged this months ago; Sentry install in v1.1.0
  starts fixing it.
- The `Alert.alert(X + " Failed", "Please try again")` pattern is
  systemic — see Section 9 for a v1.1.1 rework proposal.
- Every "we removed X from the flow" decision (gender screen,
  notifications, etc.) left dead code behind. Doing a "delete unused
  code" pass in v1.1.1 would materially reduce bug surface.

**What's fixed on v1.1.0 branch already**:
(cross-reference against your findings — anything not covered goes into
the v1.1.0 fix list or v1.1.1 polish doc)

**What must be fixed in v1.1.0 based on this hunt**:

**What can wait to v1.1.1+**:

---

## For Claude, when you come back with findings

Bring me:
1. The completed checklist above (mark each item)
2. Anything unexpected in the Notes lines
3. Any question you want answered before I write more code

I'll categorize, prioritize, and either fix now (v1.1.0) or add to
BACKLOG.md (v1.1.1 section) / a new v1.2.0-ideas.md doc.
