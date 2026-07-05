# Kinderwell Code Review — setup/dev-environment → main

**Date:** 2026-07-04

**Scope:** Full review of the `setup/dev-environment` branch (v1.1.0,
build 9) as if merged into main (v1.0.0, build 8 — live on the App
Store, revenue-generating).

**Method:** Seven parallel review passes — bugs, security, code
quality, docs/process, dev/prod separation, App Store compliance +
payments, and existing-user upgrade path. Every finding below was
verified against actual code, git history, or by executing scripts;
several were independently confirmed by 2–3 separate passes.

---

## Verdict

**Merge it — but don't submit to Apple yet.**

The branch is a large, genuine improvement over prod: real account
deletion (fully 5.1.1-compliant), real lesson gating that fixes the
force-quit paywall bypass, correct Apple sign-in nonce handling, RLS
properly owner-scoped on every table, sessions that survive the update
with zero data-migration risk, Sentry/PostHog observability, and a
kill switch. `tsc --noEmit` passes, no service-role key exists anywhere
in git history, and nothing in the diff corrupts prod data or breaks
the production build.

**The two most important takeaways:**

1. The branch's flagship fix — Restore Purchases — doesn't actually
   work, and `PROD_BUG_HUNT.md` marks it as fixed.
2. Revenue now depends on a Superwall dashboard setting (`learn_access`
   placement, Feature Gating = Gated) that no code review or
   fresh-install test can verify. Misconfigured, it either unlocks all
   paid content for free or turns lesson taps into silent dead buttons
   for paying subscribers.

---

## 🔴 Fix before merge (code changes, all small)

### 1. Restore Purchases still doesn't restore — CRITICAL (rejection risk 3.1.1 + revenue bug)

`src/screens/SettingsScreen.tsx:36-42`

The handler reads Superwall's cached subscription status and calls it
a restore. The comment claims `getSubscriptionStatus()` "re-syncs with
StoreKit"; the native implementation
(`node_modules/expo-superwall/ios/SuperwallExpoModule.swift:258–262`)
is a pure property read — no receipt refresh, no StoreKit sync:

```swift
AsyncFunction("getSubscriptionStatus") { (promise: Promise) in
    let subscriptionStatus = Superwall.shared.subscriptionStatus  // cached
    promise.resolve(subscriptionStatus.toJson())
}
```

The correct API — `SuperwallExpoModule.restorePurchases()` — exists in
the SDK and is never called. A reinstalling subscriber whose status is
still `UNKNOWN` gets a false "No Purchases Found." `docs/PROD_BUG_HUNT.md`
final tally item 3 claims this was fixed; the three-outcome UI shipped,
the sync did not.

**Fix:** call `restorePurchases()`, then re-check status; treat
`UNKNOWN` as "still syncing, try again," not "no purchases."

### 2. Silent onboarding-check failure re-onboards real users — HIGH

`src/services/onboardingService.ts:72-81`, consumed in
`src/screens/onboarding/AuthScreen.tsx` (handlePostSignin)

`catch (error) { return false; }` makes a transient network error
indistinguishable from "never onboarded" — an existing signed-in user
is routed back through full onboarding, and a re-run can overwrite
their real data. This is the same error-swallowed-to-default class as
the worst v1.0.0 prod bug.

**Fix (~10 lines):** return `boolean | 'error'` (or throw); on error
show "Couldn't verify your account — retry."

### 3. Returning users who redo onboarding lose their new answers + flag leak — MEDIUM

`src/screens/onboarding/AuthScreen.tsx:53-71`

A user who reinstalls, taps "Get Started," answers all ~15 onboarding
screens, and signs into their existing account is routed straight to
Root:

- fresh answers in the Zustand store are silently discarded (never
  persisted), and
- `@kinderwell_has_reached_auth` is never cleared, so after a later
  logout, cold launch strands them on the Auth screen ("Save your
  progress," back-gesture disabled) instead of Welcome.

Regression vs main, where `LoadingScreen` always cleared state
post-sign-in.

**Response (2026-07-04, Mandeep + Claude):**

Half-agreed, half-disagreed. Both effects addressed in commit that
follows the review by calling `onboardingStore.clearState()` in
`handlePostSignin`'s `has_onboarding` branch. `clearState()` wipes
all three AsyncStorage keys (`ONBOARDING_STORAGE_KEY`,
`LAST_SCREEN_KEY`, `HAS_REACHED_AUTH_KEY`) and resets the Zustand
slice to initial state, which:

- ✅ Closes the flag leak. After the next logout, Splash sees
  `hasReachedAuth() === false` and routes to Welcome, not Auth.
- ⚠️ Does NOT persist the fresh onboarding answers to Supabase.

We deliberately did not persist. Reviewer's framing implies the
"silent discard" is a bug; on further reflection, we believe fresh
answers from a rush-tap-through-to-reach-sign-in are lower quality
than the user's real profile row from a prior session. Overwriting
real preferences with quick-tap-throughs is worse than losing the
quick-tap-throughs.

The right long-term fix is upstream: detect at "Get Started" time
that a Supabase session exists (or would resolve) and skip onboarding
entirely for those users. That's the reviewer's approach C — bigger
refactor, deferred.

### 4. This branch gated DEAD screens; live lesson 10 may be unreachable — HIGH

- `src/screens/ServeReturnLessonScreen.tsx` — registered in
  `LessonNavigator.tsx:1094`, nothing navigates to it (dead). Its live
  twin is `ServeAndReturnLessonScreen.tsx`
  (`RootNavigator.tsx:12,48`). The branch added `gateToLesson()` to
  both, with different analytics keys (`servereturn_` vs
  `serveandreturn_`), and their content disagrees (3 vs 6 sections).
- `src/screens/HelpingProcessEmotionsLessonScreen.tsx` — not imported
  by any navigator (dead), yet received gating. The live
  `HelpingSomeoneProcessEmotionsLessonScreen.tsx` has no sub-lesson
  launcher at all — lesson 10's content may be unreachable in the
  shipped UI.

**Fix:** delete both dead files + navigator registrations; manually
tap-test lesson 10 end-to-end.

**Response (2026-07-04):**

Verified the reviewer's grep. Both dead files confirmed:
- `ServeReturnLessonScreen` had zero navigators pointing at
  `'ServeReturnLesson'` — dead registration.
- `HelpingProcessEmotionsLessonScreen` had zero references anywhere —
  full orphan.

Deleted both files plus the LessonNavigator import + `Stack.Screen` +
param-list entry for `ServeReturnLesson`. `tsc --noEmit` = 0 errors.

**Lesson 10 investigation:** the live
`HelpingSomeoneProcessEmotionsLessonScreen.tsx` is a placeholder — its
two sub-lessons render as `<View>` (not `<TouchableOpacity>`) with
"Coming Soon" badges (lines 82-116). No `onPress` handler exists.
So users CAN reach lesson 10 but see two greyed-out cards.

Meanwhile the dead `HelpingProcessEmotionsLessonScreen.tsx` had 4 real
sub-lessons wired to `LessonFlow` navigation targets. Someone appears
to have started rewriting lesson 10 as a placeholder while the finished
implementation was still around, then registered the placeholder as
live and left the working one orphaned.

**Product decision punt:** Mandeep to review whether lesson 10 should
be marked "Coming Soon" for real (accept the placeholder as the live
UX), or the dead file's working sub-lesson launcher logic should be
copied into the live placeholder to actually ship the built-but-orphaned
content. Not a blocker for v1.1.0 — logged in docs/BACKLOG.md item
#11 as a follow-up. Users' current experience (placeholder cards) is unchanged
from prod v1.0.0 — this refactor didn't regress anything, it just
didn't fix anything either.

### 5. Apple-provided name is clobbered minutes after the fix saves it — MEDIUM

`src/services/authService.ts:191–220` vs
`src/screens/onboarding/LoadingScreen.tsx:100–139` +
`NameAgeScreen.tsx:31`

`signInWithApple` now correctly upserts `{ id, name: fullName }` — but
Apple only sends `fullName` on first authorization (brand-new users),
and every brand-new user then flows through `LoadingScreen`, which
upserts `name: onboardingStore.name.trim() || 'Parent'`. Left blank,
the real Apple name is permanently replaced with `'Parent'`.

**Fix:** in the LoadingScreen upsert, don't overwrite a non-empty
existing name with the `'Parent'` fallback.

### 6. SKIP_PAYWALL works in store builds — HIGH (revenue)

`src/screens/onboarding/LoadingScreen.tsx:142–150`

No `__DEV__` guard — the bypass is controlled purely by the env var
baked at build time. Today `eas.json` production pins `"false"`, but
one copy-paste error ships a revenue-free App Store build, silently.

**Fix:** `const shouldSkipPaywall = __DEV__ && skipPaywall === 'true';`
(and/or throw in `app.config.js` when `SKIP_PAYWALL == 'true'` with the
prod bundle ID).

### 7. bump-version.sh is broken; version docs are wrong — HIGH (release-day landmine)

`scripts/bump-version.sh:24–26` hardcodes `ios/Kinderwell/Info.plist`
and `project.pbxproj` — but `ios/` was deleted in the managed-workflow
migration.

Executed during review: exits code 2 at the first grep. Three docs
still describe the old three-file flow (`VERSION_MANAGEMENT.md` —
which also contradicts itself with two different "current state"
sections and a "reset buildNumber to 1" instruction;
`RELEASE_CHECKLIST.md` Phase 3; `DEV_PROD_ENVIRONMENTS.md:63`). Real
drift exists now: `package.json` = 1.0.0, `app.json` = 1.1.0.

**Fix:** rewrite the script to touch `app.json` + `package.json` only;
rewrite the docs around it; add a 5-line CI check that the two
versions agree.

### 8. Analytics fire before outcomes / pollute funnels — MEDIUM (batch these while in there)

- `AuthScreen.tsx:42–47` — `onboarding_completed` fires on every
  AuthScreen mount in signup mode; parked users re-emit it every app
  open (`SplashScreen` resumes them into Auth with no params →
  defaults to signup). Conversion funnels will be inflated.
- `AuthScreen.tsx:85,127` + `analytics.ts:71–88` — sign-in mode calls
  `identifyUserWithOnboarding` with an empty store, overwriting real
  PostHog person properties with nulls.
- `SettingsScreen.tsx:169–174` — `account_deleted` fires before
  `deleteAccount()` runs; failures are recorded as successes.
- `posthog.reset()` wipes the registered `environment` / `app_env`
  super-properties for the rest of the session — post-logout events
  silently vanish from env-filtered dashboards (`@posthog/core reset()`
  → `clearProps()`).
- `LearnScreen.tsx:148` — `lesson_started` fires before the gate;
  paywall bounces count as lesson starts. Rename to `lesson_tapped` or
  move after entitlement.

---

## 🟠 Fix before App Store submission (ops/config, not code)

### 9. Configure the Superwall `learn_access` placement BEFORE build 9 ships — CRITICAL (revenue, both directions)

`src/hooks/useLessonGate.ts:43–52` routes every lesson tap through
`registerPlacement({ placement: 'learn_access', ... })`.

- Placement not configured → Superwall's default for an unmatched
  placement runs `feature()` → all paid content free for everyone.
- Superwall can't evaluate (outage / offline cold start before config
  caches) → `useLessonGate.ts:53–59` deliberately fails closed → a
  paying subscriber taps a lesson and nothing happens (silent dead
  button; on main their tap always navigated).

Invisible to fresh-install testing against dev. Safe to configure
early — the live build never fires `learn_access`.

### 10. Verify the paywall template in the Superwall dashboard — HIGH (rejection risk 3.1.2)

The last prod audit found the live paywall has no dismiss control
(`PROD_BUG_HUNT.md:48–51`) — a rejection vector on its own — and that
deferred item's tracking pointer dangles (it exists in no backlog
file). While there: visible price + billing period, working close
button, Terms of Use (EULA) and Privacy Policy links. None of this
lives in the repo.

### 11. Apply the app_config migration to prod — MEDIUM

The kill switch is inert on prod until
`20260703200000_add_app_config_table.sql` is applied (`app_config`
exists on dev only; prod snapshot confirms). The fail-soft fetch
(`appConfig.ts:44–48`) hides the omission. Minor: the migration's
`CREATE POLICY` lacks an idempotence guard — if the table/policy was
ever hand-created on prod, `db push` fails.

### 12. Run an UPGRADE test, not a fresh-install test — HIGH

Install the current App Store build → sign in → sandbox-subscribe →
complete lesson sections → install build 9 over it. Verify: still
signed in and lands on Root; lesson progress intact; lesson taps open
content with no paywall (including cold start in airplane mode);
Restore returns "Restored"; delete-account round-trips. App Store
releases cannot be rolled back — a bad upgrade is forward-fix-only.

### 13. Decide on the 7-tap demo mode — MEDIUM (2.3.1 concealment risk + revenue leak)

`AuthScreen.tsx:157–189` → `authStore.setDemoUser()`
(`isSubscribed: true`) → `useLessonGate.ts:37–40` short-circuits
Superwall entirely. Flagged independently by three review passes:

- Ships to every user; 7 taps on the auth-screen title = full premium,
  no account, no purchase (session-scoped, but re-activation takes 5
  seconds — TikTok-discoverable).
- `docs/DEMO_MODE.md:3`'s "Apple-mandated" claim is wrong — Apple asks
  for demo credentials in App Review notes, not a hidden unlock
  gesture. Hidden switches are the textbook 2.3.1 example. Tolerated
  in build 8; each re-review is a new roll of the dice.

**Minimum:** monitor `authMethod: 'demo'` volume in PostHog.
**Better:** replace with a sandbox reviewer account (Superwall fully
supports sandbox purchases).

**Response (2026-07-05, Mandeep + Claude):**

Kept for v1.1.0. Full disagreement path:

1. **The concealment concern is real, and we adopted the "minimum" the
   reviewer suggested.** `demo_mode_activated` PostHog event is now
   captured on every 7-tap activation (`AuthScreen.tsx:212–217`).
   Expected volume in prod: ~1–5 activations/week (Apple reviewers
   only). Any spike above ~20/week means end users have discovered the
   gesture and we should rip it out before the next Apple review.
2. **Why we didn't adopt the "better" (sandbox reviewer account)
   fix now:** Kinderwell auth is Apple + Google OAuth only — there is
   no email/password field on `AuthScreen` for a reviewer to type
   credentials into. A sandbox Apple ID handed to App Review would
   land them on the same OAuth flow real users see, which still
   dead-ends at a paywall unless we ship real sandbox-purchase
   instructions in App Review notes. That's a documentation change,
   not a code fix, and it can ship after v1.1.0.
3. **What we did instead** (`400d993`):
   - Corrected `docs/DEMO_MODE.md` — removed the false "Apple-mandated"
     framing; explicit that this is a Kinderwell reviewer-testing aid.
   - Wrote a "Dual-Path App Review Notes" section with (a) the
     sandbox-purchase primary path Apple's own docs recommend for
     auto-renewing subscriptions, and (b) the 7-tap fallback. Primary
     path first so Apple sees the documented workflow before the
     hidden gesture.
   - Added `demo_mode_activated` monitoring per point 1.
4. **When to revisit** — logged as `BACKLOG.md` item #10 with the
   trigger conditions: PostHog spike, or Apple raises 2.3.1 in review.
   The switch to a sandbox-purchase-only App Review flow is ~1 hour
   of docs + testing when we make it.

Documented as a deliberate acceptance of ongoing 2.3.1 risk, not an
oversight.

### 14. First production EAS build checks — LOW

- `SENTRY_AUTH_TOKEN` EAS secret must exist for the new
  `@sentry/react-native/expo` plugin (sourcemap upload).
- On the TestFlight build, confirm Sentry/PostHog report
  `environment: prod` (derived from the baked-in Supabase URL).
- `expo-notifications` as a plugin makes prebuild request the push
  entitlement — confirm it's expected.
- Cosmetic: `SettingsScreen.tsx:337` hardcodes "Kinderwell v1.0.0"
  while shipping 1.1.0.

---

## 🟡 Fix soon after (hardening — what prevents the NEXT bad release)

### Environment / infrastructure

- **Guard the reverse misconfiguration.** The only pairing check is
  `__DEV__ && isProdRef` (`supabase.ts:27–34`) — a store build pointed
  at the dev DB, or missing env vars (Superwall gets `''` → dead
  paywall; universal links silently fall back to the DEV host,
  `app.config.js:20`) all pass build, CI, and runtime silently. **Fix:**
  runtime bundle-ID↔project-ref assertion + ~20 lines of env validation
  in `app.config.js` when the bundle ID is prod + a CI check parsing
  `eas.json` pairings.
- **Script prod DB pushes.** `supabase db push --linked` hits whichever
  project the CLI was last linked to; the prod procedure is the same
  command plus "remember to re-link." One forgotten re-link = a dev
  migration on the revenue DB. **Fix:** `db-push-dev.sh` /
  `db-push-prod.sh` with explicit `--project-ref`, prod requiring
  typed confirmation + mandatory `--dry-run`.
- **Pre-migration prod dump.** Prod has zero backups (accepted risk)
  and no down-migrations. A `scripts/backup-prod.sh` running
  `supabase db dump` before every prod push costs ~2 minutes and
  removes the "no recovery" cliff.
- **Fix or delete the dead escape hatch.** `ALLOW_DEV_PROD_ACCESS`
  (`supabase.ts:25`) can never activate — only `EXPO_PUBLIC_*` vars
  are inlined into client bundles. The documented workflow
  (`DEV_PROD_ENVIRONMENTS.md:116–122`) doesn't work and invites
  someone to hack the guard out.
- Env detection regex duplicated in 3 files (`supabase.ts`,
  `posthog.ts`, `sentry.ts`) → centralize in `src/lib/env.ts`. Sentry
  release lacks `dist` (dev+prod builds of one version merge).
  Migration nit: `CREATE EXTENSION "uuid-ossp"` should pin `WITH SCHEMA
  extensions` to match prod.
- **Third-party blast radius:** dev builds write into prod's
  Superwall/PostHog/Sentry projects (tag-filtered only); both apps
  share the `kinderwell://` scheme (deep-link ambiguity when
  coexisting — make the scheme env-driven).

### Security

- **PKCE:** set `flowType: 'pkce'` in `createClient`
  (`src/lib/supabase.ts`) — currently the implicit flow puts live
  session tokens in a custom-scheme redirect that any Android app
  could register and hijack (full account takeover). One line;
  mandatory before any Android release. Also: the `kinderwell` scheme
  used by `makeRedirectUri` is never registered in `app.config.js`
  (it registers the bundle ID instead).
- **Encrypt the session:** refresh token sits in plaintext AsyncStorage;
  use the SecureStore-keyed pattern from Supabase's React Native docs.
- **Rotate the prod DB password** — shared with dev, connection
  coordinates leaked in main's git history (`supabase/.temp/` deletion
  doesn't scrub history), rotation explicitly deferred in your own
  docs. Rotation makes the history leak harmless. If the repo ever
  goes public, `git filter-repo` the `.temp` path first.
- **PostHog privacy:** email + emotional-challenge answers
  (anxious/overwhelmed/burned-out) linked as person properties at a US
  processor. Identify by Supabase user ID, drop email from `$set`.
  Your privacy policy promises deletion unlinks analytics —
  `posthog.reset()` is device-local only; add PostHog person-deletion
  API to the account-deletion runbook. Confirm DPAs with PostHog and
  Sentry.
- **Low:** delete-account CORS `*` (tighten for hygiene); kill-switch
  sanity cap (ignore `min_supported_ios_build` absurdly above the
  current build so one bad config row can't brick the fleet — the
  modal is undismissable and `getCurrentBuildNumber()` returns 0 on
  parse failure); `generate_apple_jwt.js` references a `.p8` in
  `~/Downloads` (move to a secret manager).

### Quality / testing

- **Generate Supabase DB types** (`supabase gen types typescript` +
  `createClient<Database>`) — turns "wrote to a nonexistent column"
  (your worst historical bug class: the Apple-name loss) into a
  compile error your existing CI already catches. Highest-ROI single
  change.
- Add ESLint (`eslint-config-expo`) + a lint job in CI. There's
  currently an `eslint-disable` comment in the repo for a linter that
  isn't installed.
- First unit tests (Jest): `isBelowMinimumBuild`, the
  `hasUserCompletedOnboarding` error path, `LESSON_NAV` covers all 13
  module IDs.
- **v1.2: data-driven lesson refactor.** ~370 copy-pasted content
  screens + a 1,100-line `LessonNavigator` is the structural root of
  the gated-dead-screen bug this branch introduced. One
  `LessonHubScreen` + one `LessonContentScreen` + a typed `lessons.ts`
  collapses it to ~3 components; gate/progress keys become derivable
  instead of hand-typed (they've already diverged).
- Dedupe `handleGoogleSignIn` / `handleAppleSignIn` (~45 identical
  lines each — the prod bug hunt shows both providers shared the same
  bug before). Type the composite navigator params so the 22
  `navigate('LessonFlow' as any)` casts disappear. Centralize
  AsyncStorage keys; note `deleteAccount` wipes only the 3 onboarding
  keys — lesson progress survives account deletion (next device user
  inherits "completed" sections).

### Docs / process

- **Fold the adversarial tests into RELEASE_CHECKLIST.md permanently.**
  The recurring checklist catches zero of the six v1.0.0 prod bugs
  (mapped one-by-one). The tests that would — dismiss-paywall→
  force-quit→reopen, Restore three-outcomes, offline entitlement,
  never-used-credentials sign-in, delete-account >1h after sign-in,
  demo-mode 7-tap, post-onboarding DB row inspection, small-screen
  pass — live only in `IPHONE_TEST_PLAN_V1.1.0.md`, which is scheduled
  for archival post-merge. Salvage before archiving. **This is the
  single change most likely to prevent the next bad release.**
- **One backlog.** Deferred work is spread across 7 markdown files;
  one item is already lost ("paywall has no dismiss button" —
  deferred to a file it isn't in, and it's the very UX driving the
  force-quit bypass). Merge into one `BACKLOG.md` (or GitHub Issues)
  + a Phase-0 checklist line: "sweep the backlog."
- **Kill duplicated procedures.** `DEV_PROD_ENVIRONMENTS.md`'s embedded
  release workflow and gap list have both measurably drifted from
  `RELEASE_CHECKLIST.md` / `BEST_PRACTICES.md` (stale
  `SHOW_DEMO_BUTTON` instruction, done-items listed as pending).
  Replace with links. Fix `SETUP_GUIDE.md` (teaches abandoned
  `react-native-dotenv`) and `supabase/EDGE_FUNCTION_DEPLOYMENT.md`
  (opens with linking to PROD, contradicting your own
  always-linked-to-dev rule; indexed nowhere). Update `docs/README.md`
  (7 of 19 active docs missing from its index).
- **Finish branch protection:** "require status checks" was left
  disabled as an untracked follow-up — CI is currently advisory. Apple
  JWT expires ~2026-12-28 on a calendar reminder; the rotation doc
  hardcodes a machine-specific path.

---

## What was verified as sound (no action)

- **Account deletion is fully 5.1.1(v)-compliant** — edge function
  authenticates the caller's JWT, deletes `lesson_progress` →
  `user_profiles` → auth user in FK-safe order; client refreshes
  session first (fixes the 401 bug); correct "subscription continues
  after deletion" warning.
- **RLS correct on all three tables** (`auth.uid()`-scoped;
  `app_config` read-only to clients — writes require service role). No
  service-role key in code or git history; the keys in `eas.json` are
  all publishable-class.
- **Sign in with Apple compliant (4.8)** — official button, correct
  hashed-nonce pattern, Private Relay duplicate-account hint.
- **Upgrade path is storage-safe** — Supabase client config
  byte-identical between branches (no mass logout); every AsyncStorage
  key unchanged (progress survives); deleted `SignIn` route can't be
  rehydrated; no Zustand persist to migrate; old `gender: 'boy'` rows
  are display-only and read null-safely.
- **Kill switch fails open correctly** — fetch errors return
  zero-minimums; missing prod table cannot crash, hang, or
  false-block startup.
- **Privacy manifest present** via `app.config.js` `privacyManifests`
  (standard reason codes, `NSPrivacyTracking: false`, no
  ATT-requiring SDKs); privacy policy matches actual data flows
  including PostHog disclosure; child data minimal (gender optional +
  age range, no names/birthdates); COPPA posture defensible (18+
  audience).
- **Build config safe** — production EAS profile pins prod bundle
  ID/Supabase/display name; version 1.1.0/build 9 > shipped build 8;
  `SignInScreen` deletion left zero orphaned references; DevMenu
  correctly `__DEV__`-gated; console logging consistently
  `__DEV__`-wrapped; dependency additions coherent; `expo-superwall`
  pinned exact; lockfile clean (registry-only sources); CI
  (`pull_request` / `push`, no secrets) has no injection surface;
  `tsc --noEmit` passes.
- Gender-fix (d239d5e) complete; the phantom-write is gone and all
  reads are undefined-safe.

---

## Deploy order for this release

1. **Prod DB:** verify `supabase migration list` shows the baseline
   repaired-as-applied → `db push` the `app_config` migration →
   confirm seed rows (0/0) + anon read works. Purely additive; the
   live build never touches it.
2. **Redeploy the prod `delete-account` edge function.** ⚠️ **This
   step was corrected 2026-07-05 by the re-review.** The original
   deploy-order text here said "verify, don't redeploy — the branch
   didn't change it." That is no longer true: the branch tightened
   CORS on this function (commit `5510406`), so the function's source
   diverges from what's live on prod. Phase 5 redeploy is mandatory
   for v1.1.0 or the CORS change never reaches users.

   Additional fold-in from the re-review: `Access-Control-Allow-Origin:
   null` is not the lockdown the code comment claims — the literal
   string `null` is a real origin (sandboxed iframes, `file://` docs)
   that browsers will happily send. Remove the ACAO header entirely
   before this redeploy (zero app impact — native fetch ignores CORS
   entirely — this is purely a browser-side hygiene call). Track
   under the same commit as the redeploy so the deploy and the
   header-removal ship as one atomic change.

   Post-deploy: re-test delete-account from the app on prod to
   confirm the 401 / refreshSession path still works end-to-end.
3. **Superwall dashboard:** create `learn_access` placement, campaign
   with Feature Gating = Gated, audience covering all users,
   unknown-status handled conservatively; verify paywall template
   (dismiss, price, terms/EULA links). Safe to do early.
4. **Merge** (after the 🔴 fixes) → build with
   `eas build --profile production` only.
5. **TestFlight upgrade test** per item 12 (over the live App Store
   build, including airplane-mode cold start), plus confirm
   `environment: prod` in Sentry/PostHog.
6. **Release** with kill-switch minimums at 0; 7-day phased rollout.
   Never set `min_supported_ios_build` above the newest shipped build.
7. **Monitor:** Sentry `lesson_gate` / `lesson_gate_register` contexts
   (silent-dead-button signal), PostHog `lesson_gate_error`,
   `paywall_dismissed`, and demo auth volume.

---

## Finding index by severity

| Sev | Finding | Where |
|---|---|---|
| Critical | Restore Purchases doesn't restore (docs claim fixed) | `SettingsScreen.tsx:36–42` |
| Critical | Superwall `learn_access` placement = unverifiable revenue dependency | `useLessonGate.ts:43–59` + dashboard |
| High | Silent catch re-onboards users on network blip | `onboardingService.ts:72–81` |
| High | Gated dead duplicate screens; live lesson 10 possibly unreachable | `ServeReturnLessonScreen.tsx`, `HelpingProcessEmotionsLessonScreen.tsx` |
| High | SKIP_PAYWALL ungated in store builds | `LoadingScreen.tsx:142–150` |
| High | `bump-version.sh` broken + version docs wrong + version drift | `scripts/bump-version.sh:24–26` |
| High | No guard: store build with wrong/missing config ships silently | `app.config.js`, `supabase.ts:27–34` |
| High | Prod DB pushes ride on ambient CLI link state | `DEV_PROD_ENVIRONMENTS.md:219, 419–426` |
| High | OAuth implicit flow — token hijack via custom scheme (Android) | `supabase.ts:45–56`, `authService.ts:19–110` |
| High | Session refresh token in plaintext AsyncStorage | `supabase.ts:45–56` |
| High | Release checklist catches none of the six v1.0.0 prod bugs | `RELEASE_CHECKLIST.md` vs `PROD_BUG_HUNT.md` |
| Medium | Redo-onboarding answers discarded + `has_reached_auth` leak | `AuthScreen.tsx:53–71` |
| Medium | Apple name clobbered with `'Parent'` by LoadingScreen upsert | `authService.ts:191–220`, `LoadingScreen.tsx:100–139` |
| Medium | 7-tap demo mode: 2.3.1 concealment risk + free-premium leak | `AuthScreen.tsx:157–189`, `authStore.ts:41–58` |
| Medium | Paywall template unverified; no-dismiss finding lost from backlogs | Superwall dashboard; `PROD_BUG_HUNT.md:48–51` |
| Medium | `app_config` migration not applied to prod (kill switch inert) + non-idempotent policy | `20260703200000_*.sql` |
| Medium | PostHog: email + emotional-health answers linked; deletion promise unmet | `analytics.ts:54–89`, `authStore.ts:94–96` |
| Medium | Shared DB password dev/prod; `.temp` coordinates in git history | history; setup log |
| Medium | Analytics fire before outcomes; funnels inflated/nulled | `AuthScreen.tsx:42–47, 85, 127`; `SettingsScreen.tsx:169–174`; `LearnScreen.tsx:148` |
| Medium | Third parties unseparated (Superwall/PostHog/Sentry shared; shared URL scheme) | `eas.json`; `app.json:27` |
| Medium | Deferred-work tracking across 7 files; one item already lost | `docs/` |
| Medium | No backups + no down-migrations for prod DB | `BEST_PRACTICES.md #2` |
| Low | `ALLOW_DEV_PROD_ACCESS` escape hatch is dead code | `supabase.ts:25` |
| Low | `posthog.reset()` wipes environment super-property until restart | `posthog.ts:43` |
| Low | Lesson progress survives account deletion (device-local) | `onboardingStore.ts:151` |
| Low | CORS `*` on delete-account; kill-switch no sanity cap; Sentry no `dist`; stale `docs/` index; v1.0.0 hardcoded in Settings | various |
