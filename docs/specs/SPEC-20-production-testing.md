# SPEC-20 — Production-grade testing: cover the seams, automate the release gate

> ORIGIN: written 2026-10-05 by Claude at the owner's request, from a coverage audit of `feat/web-purchase-unlock` (v1.3.0).
>
> **Status (2026-10-06):** Phases 1–4 and 6 are built, on `release/1.3.0`. That's R1–R9, R11 and R13, with R12's alerts recorded in OPS_STATE for the owner to create. 730 Jest tests, 31 Deno tests and 65 database tests pass (Jest was 300 at the start), and line coverage went from 16% to 74%. CI now enforces per-file coverage floors, and every Tier A file is at or above 80% branch coverage with `__DEV__` guards excluded. Each requirement's tests were checked by breaking the code they guard: sabotage items 1–12, 14–16, 18 and 24, plus the R3–R9 guards. Neither the gate nor delete-account had a bug; all 26 R3 cases held. **Not done:** Phase 5 (E2E, R10) is waiting on the owner prerequisites. Two R11 items wait on it: mapping and archiving `IPHONE_TEST_PLAN_V1.1.0.md`, and slimming the manual device pass. BACKLOG 9e/9f also weren't updated, because another session holds uncommitted BACKLOG edits. The working reference is `docs/TESTING.md`. Supersedes the deliberately narrow scope SPEC-04 set in `jest.config.js`, and closes BACKLOG 9f and 9e.
>
> Numbered 20 because SPEC-15 to SPEC-19 were used by the July 2026 release train. That train was the onboarding A/B experiment through to the streak system, bumped to 1.6.0 but never shipped; its branches were deleted on 2026-10-05. This spec was briefly called SPEC-17, and commit `db0ef73` still uses that name.

## Why

**Where we are.** 20 test files, 300 tests, ~6 s, all green. Line coverage is 16 % (Appendix B). The pure decision functions are at or near 100 %: `routingPolicy`, `entitlementCache`, `webEntitlement`, `units`, `lessonCompletion`, `onboardingService`. Everything that *calls* them is at 0 %: every screen, `authStore`, `configStore`, `onboardingStore`, `purchaseService`, `authService`, `lessonProgressService`, `App.tsx`, and the `delete-account` edge function. There are no RLS tests and no end-to-end tests.

**Why that's the wrong 16 %.** `INVARIANTS.md` opens by saying every bug the 2026-07 audit found was "at an integration seam — none were in unit-level logic." The fix history since then agrees:

| Bug (fix commit subject) | What broke | Test added with the fix |
|---|---|---|
| a signed-in user who quit mid-flow could pay with an empty profile | Splash → Loading wiring | kernel (`resolveSignedInLaunch`); the Splash wiring is still untested |
| back button was dead after resuming an interrupted signup | Splash resume wiring | kernel (`resolveResumeStack`); the wiring is still untested |
| load path progress — the rail never read it | `LearnScreen` never called the read | kernel (`units.test`); the screen is still untested |
| swipe-back from Root re-entered the onboarding questions after paying | `OnboardingNavigator` options | none |
| "Delete account" promised to delete progress and did not | `authService.deleteAccount` | none |
| reset the PostHog identity on the escape-hatch sign-out | `LoadingScreen` | none |
| `lesson_started` fired on every screen | `LessonController` | source-scan only |
| Sprinklers' Phase 2 answer was the Phase 3 answer | lesson content | none |
| delete-account rejected ES256 tokens (SPEC-FIX-06) | edge function vs the real gateway | none |

People found every one, in a review round or during device testing. No test could have caught them. Where a fix did add a test, it tested the extracted decision function. The part that actually broke was the screen or store wiring around it, and that stayed untested. That's why releases are slow: the safety net is a 786-line manual checklist plus a six-lens review, and both only run at release time.

**What this spec buys.** Every invariant that code can check gets checked on every PR. The money, auth and data paths get tested where they connect, not just in the decision functions. A release candidate gets an automated end-to-end run on the simulator, including an upgrade over the previous build. The manual device pass shrinks to the few things a machine can't do (R11).

**What it can't promise.** Zero bugs. Tests catch the kinds of bug they're written for. The aim is narrower: every kind of bug that has already hurt us, or that would cost money, data or trust, has an automated check. When something new still gets through, it's noticed fast (R12) and gets a test in the same fix. Visual polish stays a human review. About half the 2026-09 fix commits were layout and copy, and nothing here targets those.

## Scope

**In:** the app (`src/`, `App.tsx`, `app.config.js`), the `delete-account` edge function, the schema and RLS in `supabase/migrations/`, CI, and the testing steps of `RELEASE_CHECKLIST.md`.

**Out:**
- The web repo (`~/kinderwell-web2app`, including the Dodo webhook). It has its own tests; a matching spec there is separate work.
- Snapshot and pixel tests. The SPEC-04 rule stands: concrete assertions, no snapshots. With the design still changing, snapshots would mostly be noise.
- Automating real StoreKit purchases. Sandbox purchase stays a device step.
- 100 % global coverage. Thresholds are set per risk tier (R11).
- OTA content updates (parked in BACKLOG; a separate decision).

## The layers

| Layer | What it checks | Tool | When it runs | Time budget |
|---|---|---|---|---|
| 0. Static | types, lint, invariant rules | `tsc`, ESLint, `deno check` / `deno lint` | every PR | < 1 min |
| 1. Decision functions | pure logic (existing suite) | Jest | every PR | layers 1–3 together < 90 s |
| 2. Stores and services | `authStore`, `configStore`, services; SDKs mocked | Jest | every PR | |
| 3. Screens | gate, launch/auth routing, Settings, Learn, lessons | Jest + React Native Testing Library | every PR | |
| 4. Backend | edge function; RLS and migrations | `deno test`; pgTAP (SQL unit tests) via `supabase test db` | PRs touching `supabase/**`; release gate | < 5 min |
| 5. End to end | the real build on the iOS simulator, against **dev** | Maestro (taps through the real app from YAML scripts) | release gate (local); optional nightly | < 15 min |
| 6. Production | tripwires and alerts | Sentry, PostHog | always | — |

Rules for every layer. The existing suite already follows these, from SPEC-04:
- Mock only at the SDK boundary: Supabase client, Superwall, PostHog, Sentry, AsyncStorage. Never mock the module under test.
- Use concrete assertions, never snapshots.
- Use fake timers for every timer path. The gate alone has six: the 1.2 s mount wait, the 10 s theatre and its 600 ms tail, the 300 ms re-present, the 5 s watchdog and the 3 s retry.
- A regression test names the incident it locks in, in a why-comment (house style).
- A flaky test is fixed or quarantined within a day, with a BACKLOG entry. It is never retried quietly.

## Requirements

### R1 — Invariants as lint errors, not reviewer memory

Invariant 1 is currently enforced as "grep for it in review." This requirement moves each mechanical invariant into `eslint.config.js` as an **error**. CI fails only on errors, so the ~107-warning baseline doesn't get in the way. Each rule below can land as an error straight away. The only existing hits were nine `navigate('Root')` calls in `DevMenuScreen`. INVARIANTS #1's own grep (`replace('Root')`) never saw them. They're harmless because DevMenu is registered only under `__DEV__`, so it's exempt, and a test fails if that guard is ever removed.

| Rule | Invariant | How |
|---|---|---|
| Only `LoadingScreen.tsx` may `replace`, `navigate` or `reset` to `Root` | 1 | `no-restricted-syntax` on the call, with a file override for LoadingScreen |
| `src/screens`, `components`, `lessons`, `navigation`, `hooks` never import `lib/supabase` | CLAUDE.md DB rule | `no-restricted-imports`, scoped with `files` |
| No `posthog.capture(` outside `src/lib/analytics.ts` | CLAUDE.md analytics rule | `no-restricted-syntax` |
| No string literal as the key to `AsyncStorage.getItem/setItem/removeItem/multiRemove` | 10 | `no-restricted-syntax` on a `Literal` / `TemplateLiteral` first argument |
| No `insert/update/upsert/delete` chained on `.from('entitlements')` in `src/` | 24 | `no-restricted-syntax`. RLS (R9) is the real guard; this is an early warning |

Also add a Deno job that runs `deno check` and `deno lint` on `supabase/functions/`. Those files are excluded from ESLint today (`eslint.config.js:26`), and the comment there promises exactly this job.

**Acceptance:** adding `navigation.replace('Root')` to `AuthScreen.tsx` makes `npm run lint` exit non-zero.

### R2 — A test harness that can reach the seams

`jest.config.js` deliberately runs only `*.test.ts` and renders no components (its header comment, SPEC-04). That scope is why the seams are untested. Changes:

- Add `@testing-library/react-native`, using the major that supports React 19.1 / RN 0.81. Check peer dependencies at install, and pin `react-test-renderer` to exactly `19.1.0` if that major needs it.
- Add `**/__tests__/**/*.test.tsx` to `testMatch`. Rewrite the header comment so it no longer says "pure decision-function tests only."
- Put a shared harness in `src/test/`, excluded from coverage, with one file per boundary:
  - `superwall.ts` — a controllable fake of `expo-superwall`.
    - `usePlacement` records its latest `onPresent` / `onDismiss` / `onSkip` / `onError`, so a test can fire them.
    - It also fakes `registerPlacement`, `useUser().identify`, `useSuperwall`'s `dismiss`, and handler capture for `useSuperwallEvents`.
    - It fakes `SuperwallExpoModule.{reset, restorePurchases, getSubscriptionStatus}`.
  - `supabase.ts` — a chainable query builder with programmable results per table. It generalises the one in `onboardingService.test.ts`.
    - It fakes `auth.{getSession, onAuthStateChange, signOut, refreshSession, signInWithOtp, verifyOtp}`. `onAuthStateChange` captures the listener so a test can fire it.
    - It fakes `functions.invoke`.
  - `analytics.ts` — PostHog and Sentry spies that record every payload.
  - `navigation.ts` — a fake `navigation` prop with `replace`, `reset`, `navigate`, `push` and `goBack` spies. The screens take `navigation` as a prop, so no navigator is needed.
  - `factories.ts` — `makeUser`, `makeSession`, `seedAuthStore()`, `seedOnboardingStore()`, `seedConfigStore()`.
  - AsyncStorage uses the package's official jest mock.
- **Global PII guard (invariant 8).** Add a `setupFilesAfterEnv` hook that runs after every test. It scans every recorded PostHog `capture` / `identify` payload and every Sentry `setUser` / `captureException` context. If it finds anything shaped like an email address, or any child name used in the fixtures, the test fails. That makes invariant 8 a check on every test that touches analytics, not just `analytics.test.ts`.

**Acceptance:** a screen test renders `WelcomeScreen` and finds "Get started".

*As built (Phase 1):*
- **Library:** `@testing-library/react-native` 14 with `test-renderer`. In this version `render`, `renderHook` and `fireEvent` all return promises, so tests `await` them.
- **`expo-superwall` mapping:** the package's `exports` map has only an `import` condition, so Jest can't resolve it. `jest.config.js` maps the bare name to its `main` file.
- **No `require` in mock factories:** `setup.ts` passes the fakes to its `jest.mock` factories as `mock`-prefixed imports.
- **Superwall fake checked against the real SDK.** The real hooks keep their callbacks in a ref, so they always call the latest render's closures, and the fake does the same. Its `registerPlacement` also documents that the real promise resolves only when access is granted.

*Added in Phase 2:*
- **`src/test/timers.ts` `advance()`** steps fake time in 50 ms chunks with a render between each. One long `act()` holds re-renders until it ends, so effect-started intervals (the retry loop) and timers scheduled from state updates (the theatre's hand-off) would never run mid-advance.
- **`src/test/render.tsx` `renderScreen()`** provides the fake navigation as context as well as the prop, for screens whose children call `useNavigation()`, such as `OnboardingScreen`.
- **The safe-area library's own Jest mock** is installed globally.
- **A mocked module whose factory reads a test-file variable must read it lazily, through a getter.** The factory runs while the screen is being imported, before the test file's `const`s exist. The first draft of R3 #4 passed for exactly this wrong reason.
- **A device check for R3 #22** (none of the 26 cases found a bug). After a failed sign-out, "Use a different account" depends on Superwall firing `onDismiss` for the programmatic `dismiss()`. Without it, the gate's in-flight guard is never released, and the user would sit on Loading with no retry. Confirm on device that dismissing reports `declined`.

### R3 — The Loading gate

`src/screens/onboarding/LoadingScreen.tsx` is the only way into `Root`, and it has 0 % coverage. `routingPolicy` decides what each outcome *means*, but nothing checks that `runGate` (`:516`) asks in the right order or that the callbacks act on the answer. Write characterisation tests against the component as it is today. Don't refactor the money path to make it testable before it has tests.

All tests use fake timers. Below, "Root" means `navigation.replace('Root')` was called, and "paywall" means `registerPlacement({ placement: 'subscription_gate' })` was called.

**Order and short-circuits**
1. Demo user → Root after the 1.2 s mount wait. `identify` and `registerPlacement` are never called.
2. Cached subscriber with source `superwall` → Root. No paywall, no web check.
3. Cached subscriber with source `web` → Root, *then* a background `checkWebEntitlement`.
   - A `not_entitled` answer for the same, still signed-in user clears the flag.
   - An `error` answer, for example when offline, keeps the flag.
   - A sign-out in between makes the answer a no-op (`recheckWebEntitlement`, `:76`).
4. `SKIP_PAYWALL=true` with `__DEV__` set to false → the paywall still runs (invariant 5, runtime layer).
5. Web check returns `entitled` → `setIsSubscribed(true, 'web')`, then Root. No paywall. `web_entitlement_checked` fires.
6. Web check returns `error`, `not_entitled`, or times out at the real 4 s cap → the paywall runs (invariant 23).
7. Unentitled user → `identify(user.id)` resolves *before* `registerPlacement`.

**Kill-switch interplay** (SPEC-01 R5, SPEC-FIX-01 R1)

8. Config is `loading` at mount → no paywall. When config flips to `ok` → **exactly one** `registerPlacement`. This is the two-scheduler regression.
9. Config is `ok` at mount → exactly one `registerPlacement`, counting both the mount timer and the config effect.
10. Config is `force_update` → no paywall, ever. Advance 60 s to check.

**Callbacks**

11. `onDismiss` with `purchased` or `restored` → `setIsSubscribed(true)`, then Root. The event is `subscription_purchased` for a purchase and `subscription_restored` for a restore.
12. `onDismiss` with `declined` → no Root. The paywall is registered again after 300 ms.
13. `onSkip`:
    - `Holdout` or `NoAudienceMatch` → Root.
    - `PlacementNotFound` → no Root. `paywall_placement_not_found` fires and `reportError` is called. The retry copy is the "misconfigured" text, not the network text (invariant 2).
14. `onError`:
    - unsubscribed user → retry state, no Root;
    - subscribed user → Root (fail open).
15. `registerPlacement` rejects → same outcome as 14.

**Timers and retry**

16. `registerPlacement` resolves but `onPresent` never fires → retry state at 5 s (the watchdog), and not before.
17. In the retry state:
    - the gate re-attempts every 3 s;
    - the escape hatch (Restore / Sign out / Contact support) shows from the third attempt;
    - `gate_escape_hatch_shown` fires once.
18. `isSubscribed` flips to true *while* the retry screen is up → the next tick goes to Root. This is the stale-closure regression, SPEC-FIX-01 R1 minor #3.
19. A second scheduler call while a gate attempt is in flight → no second `registerPlacement`.

**Escape hatch and switch account**

20. Restore:
    - `restored` → Root, with `subscription_restored {source: 'escape_hatch'}`;
    - `no_purchases`, `unknown`, `failed` or `threw` → the matching inline message, no Root.
21. Sign out → `resetPostHog` is called **before** `signOut` (the 2026-09-15 regression), then the stack resets to Welcome.
22. The `switch_account` custom action:
    - calls `dismiss`, then `resetPostHog`, then `signOut`;
    - resets the stack to `[Welcome, Auth(signin)]`;
    - the `declined` dismiss it causes does **not** re-present the paywall;
    - if sign-out fails, the gate runs again.

**Onboarding save** (the launch-time re-save)

23. Store has answers → `saveUserOnboardingData` is called once. Its payload has no `name` when the name was blank or `'Parent'` (invariant 7). The store is cleared on success.
24. The save throws → `reportError` is called and the store is **not** cleared. The gate still runs.
25. Demo user with answers → no Supabase call. The store is cleared.

**Web buyers on the retry screen**

26. No cached flag. On the first attempt, the web check errors and Superwall is unreachable → retry state. On a later retry the web check returns `entitled` → Root. This checks that the retry loop re-runs the whole gate, web check included, not just Superwall.

### R4 — Auth store and the Superwall status listener

These tests cover `src/store/authStore.ts`, the code that passes the session user to `resolveCachedEntitlement` (`:243`).

- `initialize`:
  - an owned record and the same user → `isSubscribed` is true, with the stored source;
  - a different user → false, and the key is removed;
  - no session → false, and the key is removed;
  - a legacy bare `'true'` → false;
  - `getSession` returns an error → `isLoading` becomes false, with no throw.
- `initialize` with a session → `posthog.identify(id)` is called with no second argument, and the Sentry user is the id only.
- Auth listener:
  - session goes to null → the key is removed and state is reset;
  - `SIGNED_IN` → `mergeRemoteIntoLocal` is called once;
  - `TOKEN_REFRESHED` and `INITIAL_SESSION` → it is not called.
- `setIsSubscribed`:
  - with no user → nothing is written *and* nothing is cleared (the SPEC-FIX-08 startup-race fix);
  - with a user → an owned record is written, with its source.
- `signOut`:
  - removes the key and calls `SuperwallExpoModule.reset`;
  - a failed Superwall reset doesn't block sign-out;
  - a failed Supabase sign-out rethrows.
- The cross-user case, at store level:
  1. User A is subscribed and the flag is persisted.
  2. A's sign-out throws.
  3. The next launch's `initialize` runs with B's session.
  4. B is **not** subscribed.

The `onSubscriptionStatusChange` listener at `App.tsx:96-113` can't be reached without rendering the whole app. Move it, unchanged, into a `useSubscriptionStatusSync` hook and test the hook. *(As built: the hook lives in `src/store/authStore.ts`, not `src/hooks/`. A new import line in `App.tsx` would add an `import/first` warning, since `App.tsx` initialises Sentry before its imports, and `App.tsx` already imports `authStore`.)* Cases:
- `ACTIVE` → subscribe, with source `superwall`;
- `INACTIVE` with source `web` → kept (invariant 25);
- `INACTIVE` with source `superwall` → cleared;
- `UNKNOWN` → kept;
- demo user → ignored.

`App.tsx` needs a one-line change: it calls `useSubscriptionStatusSync()`.

### R5 — Launch and sign-in routing

`SplashScreen`:
- A signed-in user with half-finished onboarding → `loadState()` is awaited **before** routing to Loading. This is the "pay with an empty profile" regression.
- Each `resolveSignedInLaunch` outcome → the matching `reset` / `replace`.
- Signed-out users:
  - `hasReachedAuth` → Auth;
  - a saved `lastScreen` → the `resolveResumeStack` stack, so Back works (the "dead back button" regression);
  - an unknown `lastScreen` → Welcome.

`AuthScreen`:
- After sign-in:
  - `has_onboarding` → Loading in both modes, never Root;
  - `no_onboarding` in signin mode → UserType;
  - `error` → `reportError`, an alert, then `signOut`. Never UserType (invariant 6).
- Signup → `identifyUserWithOnboarding` with `$set` and no email. Signin → no `$set`.
- Email OTP: send, then verify, then the same post-sign-in routing. A wrong code shows the inline error. Only `unknown`-class errors are reported; that class includes `email_address_not_authorized`. Rate-limit and offline errors are not reported.
- Seven taps on the title → `setDemoUser`, then Loading.

**Contract tests (invariants 26 and 27):**
- `WelcomeScreen` renders "Get started", "Already have an account?" and "Sign in". `AuthScreen` renders "Continue with Email". The failure message should say the website quotes these words.
- `AuthScreen` renders Sign in with Apple whenever it renders Google or Email.

### R6 — Money, account and config services

- `purchaseService.restorePurchases`: all five outcomes, driven by the mocked `SuperwallExpoModule`.
- `authService.deleteAccount`:
  - refresh fails → `functions.invoke` is not called, and `reportError` is;
  - invoke returns `subscription_cancel_failed` → `SubscriptionCancelError`. **Nothing local is cleared and the user stays signed in**, because the account still exists;
  - any other invoke error → rethrown, nothing cleared;
  - success → assert the order of every step:
    1. `multiRemove` includes every `LESSON_PROGRESS_KEYS` entry, `LESSONS_COMPLETED`, `ACTIVE_DAYS`, `FLOW_BACKFILL_DONE` and `IS_SUBSCRIBED` (the "delete didn't delete progress" regression).
    2. The onboarding store is cleared.
    3. Superwall is reset.
    4. `signOut` runs.
    5. The Sentry user is cleared last.
- `configStore`:
  - `checkConfig` runs once (`hasStarted`);
  - fetch `ok` → `ok`;
  - a 3 s timeout → `ok` (fail open, invariant 18);
  - a fetch that lands after the timeout never flips a cold launch to `force_update`;
  - `maybeRecheckConfig` skips within 6 h, re-fetches after, and never overlaps itself;
  - a foreground recheck can move to `force_update` but never back to `ok`.
- `appConfig.ts`: every parse-guard branch, taking it from 54 % to the Tier A floor.
- **Kill-switch headroom (found while building R6).** `isBelowMinimumBuild` ignores any minimum above `MIN_SUPPORTED_BUILD_CAP` (40), so once the shipping build nears 40, the kill switch silently stops working. A test now fails while there are still 5 builds of headroom (shipping build + 5 must still be enforceable). When it fires, raise the cap and update RELEASE_CHECKLIST's kill-switch test value. At build 12 the test has 24 builds to go before it fires (it fails from build 36), which could be under a year at a weekly cadence.
- `onboardingStore`:
  - a save/load round trip works;
  - `clearState` removes all three keys;
  - corrupt JSON → defaults.
- `lessonProgressService`: `skipped` with no session; `failed` on a query error.
- `useLessonGate` (invariant 13): `gateToLesson` calls `onEntitled` immediately and touches nothing else.
- `src/lib/supabase.ts` (invariant 17; 22 % today): with `__DEV__` true and the prod ref, the import throws. With the dev ref it doesn't.
- `app.config.js` (invariants 5, 15, 16), in a `@jest-environment node` test:
  - `SKIP_PAYWALL=true` with the prod URL → throws;
  - a prod build missing a required env var → throws;
  - dev env → returns a config;
  - `app.json`'s `buildNumber` matches `^\d+$`.

### R7 — Settings, the Learn path and lessons

- `SettingsScreen`:
  - the kinderwell.app/manage row shows only when `isSubscribed && subscriptionSource === 'web'` (invariant 26);
  - Apple subscribers get App Store management;
  - each Restore outcome → the right alert;
  - Delete → `SubscriptionCancelError` gets its specific message, and anything else gets the generic one;
  - Log out calls `resetPostHog` before `signOut`.
- `LearnScreen`:
  - it reads progress on mount (the "rail never read it" regression);
  - tonight's card is the earliest unfinished section (invariant 11);
  - tapping a locked node does nothing;
  - the current node navigates to `LessonScreen` with `entry: true`.
- `LessonController`:
  - `lesson_started` fires once per visit, even though each screen is a new `navigation.push`. This behavioural test supersedes the source-scan in `lessonStartedSemantics.test.ts`. Keep the source-scan too; it's cheap;
  - `lesson_completed` fires only on the write that completes the set.
- **Render smoke test for every screen.** One parametrised test renders each screen in `src/screens/**` and `src/lessons/*Screen.tsx` with realistic store state, and asserts it mounts without throwing. It's cheap, and it catches import-time crashes and `undefined` reads when a state shape changes.
- **Content rules**, added to `content.test.ts`:
  - each single-choice graded question has exactly one correct option;
  - option texts are unique within a question;
  - no two graded questions in one lesson share a correct-answer text.

  The last rule targets the kind of bug fixed in a939018, where Sprinklers' Phase 2 correct answer was the Phase 3 answer. It can't judge meaning, so content review stays human.

  *As built (Phase 4):* only **exact** repeats are caught, plus generic answers such as True/False or "All of the above" being excluded. a939018 itself was a paraphrase, with a word overlap of 0.57; a dozen legitimate pairs elsewhere score as high or higher, so no threshold separates the two. One exact repeat is a recorded, reviewed exception: dissociation's "Notice it and name it", asked at the end of section 2 and again as the opener of section 3. The owner should confirm it.
- **Allowed URLs (invariant 26).** A source-scan test lists every `http(s)://` URL in `src/` and fails on any URL missing from an explicit allowlist. Today's allowlist would be: the two legal pages, kinderwell.app/manage, the two apps.apple.com links, play.google.com, the PostHog host and one Supabase docs link. A link to the web funnel can't slip in unreviewed.

*As built (Phase 4):*
- **Settings: 14 tests.** The manage row and its link, every restore alert, both delete warnings, the cancel-failed message, the demo-user delete, and log-out order.
- **Learn: 8 tests.** These cover the progress read, the earliest gap, `entry: true`, the locked hint and the closing note.
  - One thing isn't tested here: the rail opening scrolled to the card when two or more sections are done. React Native's FlatList then draws rows only after the device reports the content's size, which the test renderer never does. That's left to R10.
- **`LessonScreen.test`: 4 tests**, through the real screen and controller. `lesson_started` fires once per visit; `lesson_completed` fires only on the completing write and not on replay.
- **`everyScreenRenders.test`:** all 29 screen files, plus a completeness check against the folders.
- **`allowedUrls.test`:** 8 reviewed URLs, plus a stale-entry check.
- **`renderScreen()`** now provides the route as context too, for screens that call `useRoute()`.
- **Gotcha:** React Native's Jest setup already makes `Linking.openURL` a mock, so `jest.spyOn` returns that same function and calls carry across tests. Clear it in `beforeEach`.

### R8 — The `delete-account` edge function

`supabase/functions/delete-account/index.ts` is 394 lines of money and security code with no tests.

- **Refactor, with no behaviour change.** Move the body of `serve(...)` into an exported `handler(req, deps)` in `handler.ts`, where `deps` is `{ env, createAdminClient, fetch }`. `index.ts` becomes `serve((req) => handler(req, liveDeps))`. Keep `jose` real: the tests sign their own tokens, so the real verification code is what gets tested.
- **Tests**, run with `deno test` (already installed locally):
  - Basic requests:
    - `OPTIONS` → 200;
    - no `Authorization` header → 400 at step `read_auth_header`;
    - an unreadable token header → 401.
  - HS256 tokens:
    - valid → proceeds;
    - bad signature or expired → 401;
    - no `JWT_SECRET` set → 500.
  - ES256 tokens, using a generated key pair served from a fake JWKS URL:
    - valid → proceeds;
    - signed by a different key → 401.
  - `alg: none`, an unsupported alg, or a valid token with no `sub` → 401.
  - **Money order (invariant 28):**
    - An `active` or `past_due` Dodo row whose cancel fails → 409 `subscription_cancel_failed`. **No** delete is called on any table or on `auth.admin.deleteUser`.
    - Cancel succeeds → deletes run in order: `lesson_progress`, then `user_profiles`, then the auth user.
    - A `cancelled`, `expired` or `revoked` row, or a row without `dodo_subscription_id` → no cancel call.
    - The entitlements read fails → 400, and nothing is deleted.
  - Each delete step failing → 400 naming that step. Later steps don't run.
  - Pin the Dodo request: URL by environment, method and body. It's a copy of the web repo's `_shared/dodo.ts` and can drift.
- **Invariant 9 as tests:**
  - parse `supabase/config.toml` and assert `verify_jwt = true` for `delete-account`;
  - scan `src/`, `app.config.js` and `eas.json` (read only) for service-role key names.

*As built (Phase 3):*
- **The split ships with 1.3.0.** `delete-account` is `handler.ts` (all the logic, taking `{ env, fetch, createAdminClient, remoteJwks }` as arguments) plus `index.ts` (the live wiring). 1.3.0 already redeploys the function for the Dodo cancel, so the split rides along; the runbook's deploy step says so.
- **`handler_test.ts`, 31 tests.** Tokens are really signed with jose and verified by the handler's own code against an in-memory key set. That covers ES256, HS256, a wrong key, expiry, `alg: none`, HS512, HS256 relabelled as ES256, a wrong secret, no `sub`, and the fail-closed 500.
- **One sabotage that can't be caught:** removing the algorithm pin on the asymmetric path. The explicit ES256/RS256 check just before it already rejects every other algorithm, so the pin is a redundant second layer.
- **Invariant 9** is in `src/config/__tests__/edgeFunctionGuards.test.ts`.
- **`deno.lock` is gitignored.** The URL imports are version-pinned.

### R9 — Database: RLS and migrations

RLS is the only thing that stops a signed-in user from writing their own `entitlements` row, which would mean free access. Nothing in this repo tests it.

- **Start from the web repo's tests.** `~/kinderwell-web2app/kinderwell-web/supabase/tests/database/` already has pgTAP tests for this same database:
  - `access_test.sql` D1–D8: RLS on every table; a user reads only their own entitlement and can change none; the service-only tables; the security-definer functions; cascade on user delete;
  - `functions_test.sql`: the expiry sweep's grace periods.

  Port them rather than rewriting. The `web2app` migration header names this repo as the canonical home of the migrations. Then add this repo's own tables on top.
- **Migration parity.** On 2026-10-05 the web repo had `20261005000000_event_ordering.sql`, which this repo's `supabase/migrations/` didn't have yet. Add a release-time script that diffs the two folders and fails when they differ.
- **Where the tests run.** pgTAP tests go in `supabase/tests/` and run with `supabase test db`, against a local stack built from `supabase/migrations/`.
  - Docker isn't installed on the owner's machine, so CI is the first home. GitHub's Ubuntu runners have Docker, so the job runs `supabase start`, then `supabase db reset`, then `supabase test db`.
  - The reset also proves that the whole migration chain applies cleanly from scratch.
  - `supabase/config.toml` is intentionally minimal; its header says no local stack is run. Confirm that `supabase start` works with it. If it doesn't, use a CI-only config, and don't widen the committed one without updating its header.
- **Tests**, run as `anon` and as `authenticated` users A and B (via `request.jwt.claims`). The web repo's tests already cover most of the list; `user_profiles`, `lesson_progress` and `app_config` are the additions:
  - `entitlements`: A reads A's own row but not B's. A cannot insert, update or delete any row (invariant 24).
  - `user_profiles` and `lesson_progress`: own rows only, for every verb. An UPDATE can't move a row to another `user_id` (the `WITH CHECK` from `20260710010000`).
  - `app_config`: anon can read; nobody can write.
  - `funnel_sessions`, `webhook_events`, `unlinked_purchases`, `waitlist`, `email_opt_outs`, `rate_limit_hits`: no access for anon or authenticated.
  - `get_user_id_by_email`, `expire_stale_entitlements`, `hit_rate_limit`: anon and authenticated can't execute them.
  - **Catch-all:** every table in `public` has RLS enabled, so a new table without RLS fails CI.
- **Type drift.** After the reset, `supabase gen types typescript --local` must match `src/types/supabase.ts`. This catches a skipped `npm run gen:supabase-types` (RELEASE_CHECKLIST Phase 1). Check output parity on the first run, because the committed file was generated from dev with `--linked`.
- **First-run check.** If dev or prod hold objects created in the dashboard rather than in `supabase/migrations/`, the local stack won't have them. Record any gap in `OPS_STATE.md`.
- **Cost.** A few minutes per run. It runs on PRs that touch `supabase/**`, and on the release-gate dispatch.

*As built (Phase 3):*
- **`supabase/tests/database/`** holds `access_test.sql` and `functions_test.sql`, ported unchanged from the web repo, plus `app_tables_test.sql` for `user_profiles`, `lesson_progress` and `app_config`. That's 65 tests.
- **CI:** `.github/workflows/ci-db.yml` mirrors the web repo's proven job: `supabase start`, then `supabase test db`, then a type-drift diff. The diff is advisory until a first run shows the types agree.
- **Without Docker:** `scripts/db-test-local/run.sh` builds pgTAP from source, starts a throwaway Homebrew Postgres 17 on a private socket, loads a Supabase stand-in (`bootstrap.sql`: the API roles, `auth.users`, `auth.uid()`, and Supabase's default grants), applies the migrations and runs the files. It's a fast check; CI is the authority.
- **Gotcha: an UPDATE `WITH CHECK` test must not use `WHERE`.** When an UPDATE reads columns, Postgres also checks the new row against the SELECT policy, which blocks the move by itself and hides a missing `WITH CHECK`. Tests A4 and A7 issue the move unconditionally.
- **Each of 9 loosened policies, added as a throwaway migration, failed a test.** They were: user-insertable entitlements; a table without RLS; both UPDATE `WITH CHECK`s; public read of profiles; writable kill switch (two ways); anon lookup of accounts by email.
- **`scripts/check-migration-parity.sh`.** On 2026-10-06 it reports the web repo's `20261005000000_event_ordering.sql` missing here (still the owner's call to copy it in).

### R10 — End to end on the iOS simulator

This is the only layer that runs the real binary: real navigation, the real Superwall SDK, and real Supabase (dev). It replaces most of the Phase 2 smoke test and half of the Phase 8.3 upgrade test.

**Tool: Maestro.** Maestro needs no native code in the build. Detox needs a config plugin and a separate native test build. For a solo, managed-workflow app, Maestro's setup is much lighter.

**Build.** A release-mode simulator build pointed at dev. The owner adds an `e2e` profile to `eas.json` (owner-only file):
- extends `preview`;
- `ios.simulator: true`;
- dev Supabase env;
- **blank** `POSTHOG_PROJECT_TOKEN` and `SENTRY_DSN`, so test runs don't pollute the dashboards.

In release mode `__DEV__` is false, so the tests exercise the prod code paths.

**testIDs.** Add stable `testID`s to every element a flow taps or checks: the Learn root, tonight's card, path nodes, Settings rows, the Loading screen and the escape-hatch buttons. Use static strings only, because PostHog autocapture records `testID` (`App.tsx:179`).

**Accounts and data.** The runner calls `scripts/e2e/seed.mjs`, which:
- reads a dev service-role key from an untracked `.env.e2e`;
- **refuses to run if the URL contains the prod ref**, the same guard `app.config.js` uses;
- creates fresh users for each run with the admin API:
  - a *fresh* user with no profile;
  - a *web buyer*, seeded with **exactly what the Dodo webhook writes** and nothing the app would write itself:
    - an `entitlements` row: `source dodo`, `status active`, and **no** `dodo_subscription_id`, so delete-account never calls Dodo;
    - the `user_profiles` row the webhook inserts from the quiz answers (`03-app-changes.md` §5 in the web2app folder). Seeding a profile the app would never see from a real buyer would test the wrong journey;
  - a *web buyer without a profile*, the case where the webhook's profile insert failed;
  - a *returning unentitled* user, with a profile and no entitlement;
- deletes those users and their rows on exit, pass or fail, via a `trap` in the runner.

Web entitlements make this workable. A seeded `entitlements` row gets a test user past the hard paywall on dev for free and predictably, with no StoreKit involved.

**Sign-in.** Email OTP is the only sign-in a machine can drive; Apple and Google open native sheets. Recipients use Resend's test address (`delivered+<label>@resend.dev`), so runs never send to real inboxes or hurt the sender reputation of `hello@kinderwell.app`. Watch dev's emails-per-hour limit (OPS_STATE, custom SMTP row).

**Spike S1 — do this first, about half a day.**
- Confirm that after the app calls `signInWithOtp`, the harness can get a code the app accepts. The candidate: `auth.admin.generateLink({ type: 'magiclink', email })` returns `properties.email_otp`, and `verifyOtp({ type: 'email' })` should accept it.
- Confirm that Resend's test address supports `+label`.
- **If S1 fails, stop and choose a fallback with the owner. Never add an auth bypass to the app binary.**

**Flows** (`.maestro/`)

| # | Flow | Asserts | Replaces |
|---|---|---|---|
| 1 | Fresh install → onboarding → email sign-up → Loading | paywall shows ("Restore" is visible; Apple requires it, so it's stable); Learn never appears within 30 s | Phase 2 smoke, first half; invariant 1 end to end |
| 2 | Web buyer, fresh install, signs in with the purchase email | no questionnaire, no paywall, Learn | the web-unlock path |
| 2b | Web buyer without a profile signs in | reaches Learn **without ever seeing the paywall**; the questionnaire on the way is acceptable | the web buyer is never charged twice when the webhook half-fails |
| 3 | …opens tonight's card, finishes a section, kills and relaunches the app | section checked, card advanced, no paywall flash | progress persistence |
| 4 | Swipe back / Back from Learn | stays in Root; onboarding questions never reappear | the 2026-09-15 swipe-back regression |
| 5 | Sign out → an unentitled user signs in | paywall, not Learn | invariant 3 end to end (account switch) |
| 6 | Settings → Delete account (entitled user) | lands on Welcome; the seed script confirms the user and rows are gone from dev | Phase 2 delete check; the SPEC-FIX-06 kind of bug, against the real gateway |
| 7 | Seven taps on the Auth title | Learn | demo mode for App Review |
| 8 | Runner sets dev `min_supported_ios_build` above the build, launches, then restores it | force-update modal; the paywall never shows | Phase 2 kill-switch check |
| 9 | **Upgrade.** Install the previous release's `e2e` build and run flows 2–3. Then `xcrun simctl install` the new build over it and relaunch | still signed in; Learn shows (not Welcome or the paywall); the finished section is still checked; tonight's card is unchanged | Phase 8.3, the local-data half |
| 10 | **Refund.** The runner marks the web buyer's row `revoked`, then relaunches the app twice | first launch: Learn (cached flag, background re-check); second launch: paywall | the refund path, end to end |
| 11 | **Whole purchase chain** (run when either repo changed the purchase path). Buy in Dodo **test mode** through the dev web funnel, using the web repo's Playwright setup; the dev webhook writes the rows; the app signs in with that email | Learn with no paywall; refunding in Dodo test mode then gates the second launch | the only check that the real webhook and the real app agree |

Flow 8 changes shared dev config, so the runner restores it in its exit trap.

Flow 11 depends on the web repo's dev environment being able to make a Dodo test-mode purchase against dev Supabase. If it can't, flow 11 stays a manual release step until it can.

Flow 9 needs the previous release's `e2e` simulator build. From now on, build `e2e` at each release tag and record the build id in that release's runbook. The first release that can use it is the one *after* v1.3.0, because older builds can't unlock through web entitlements.

**Where it runs.** Locally, with `npm run test:e2e` (`scripts/e2e/run.sh`).
- Before it can run on this machine, accept the Xcode license (`sudo xcodebuild -license`) and install Maestro.
- macOS minutes on GitHub Actions bill at 10× the Linux rate, so local is the default.
- Revisit CI after three releases: GitHub macOS runners, or the Maestro job in EAS Workflows (check plan pricing).

**Flake budget.** At most one automatic retry per flow. A flow that passes only on retry is reported as flaky in the run summary. Two flaky runs in a row count as a bug.

### R11 — Thresholds, CI and the release gate

**Coverage by risk tier, as a ratchet.**
- **Tier A (money, auth, data):**
  - Files: `routingPolicy`, `entitlementCache`, `webEntitlement`, `entitlementService`, `authStore`, `useSubscriptionStatusSync`, `configStore`, `appConfig`, `purchaseService`, `authService`, `onboardingService`, `lessonProgressService`, `progressStore`, `units`, `LoadingScreen`, `SplashScreen`, `AuthScreen`.
  - Each gets a per-file `coverageThreshold` in `jest.config.js`. Set it to the file's measured value when its requirement lands, rounded down to the nearest 5, with a **minimum of 80 % branches**.
- **Tier B:** everything else in `src/` except presentational components and content. One global floor, set at the measured value.
- **Tier C:** presentational components, illustrations, `theme.ts` and content files. No threshold; the render smoke test (R7) covers them.
- Thresholds only go up. A PR that lowers one explains why in its description.

**CI** (`.github/workflows/`):
- The `test` job runs `npm test -- --ci --coverage`, which enforces the thresholds.
- New workflow `ci-deno.yml`: `deno check`, `deno lint` and `deno test`.
- New workflow `ci-db.yml`: the local stack, pgTAP, and the type-drift check.
- Both new workflows filter with `paths:`, `supabase/functions/**` and `supabase/**` respectively. They must be separate workflow files because GitHub applies `paths` to a whole workflow, not to single jobs. Both also run on `workflow_dispatch`, the release gate.
- Still no `push:` trigger; that's the owner's decision on metered minutes, unchanged.

**The release gate.** Edit RELEASE_CHECKLIST Phases 2 and 8 when this lands:
1. The CI dispatch is green on the exact commit, across all workflows.
2. `npm run test:e2e` is green on that commit's `e2e` build. Paste the run output into the runbook.
3. A manual device pass, now covering only what a machine can't do:
   - a sandbox **purchase** and **restore** on a real iPhone (StoreKit);
   - Sign in with Apple and Google (native sheets);
   - a web buyer signing in with Google, and with Apple sharing the purchase email → Learn; and with Apple Hide My Email → paywall → "Use a different account" → Learn (R13);
   - the cold-start-offline subscriber check (the simulator can't toggle airplane mode);
   - Superwall dashboard checks (Phase 7.5) and App Privacy (Phase 9a), unchanged;
   - a look at the changed screens on the smallest supported device, for layout.

Map each item in `IPHONE_TEST_PLAN_V1.1.0.md` Section 12 and the Phase 2 smoke list to either a test or the manual list above. Then archive that plan. This closes the overdue `docs/README.md` item and BACKLOG 9e.

**Docs.**
- Create an evergreen `docs/TESTING.md` covering how to run each layer, the harness, the rules above, and Appendix A's matrix as the living copy.
- Add it to the core table in `docs/README.md`.
- Add one line to CLAUDE.md "Commands", and one to "Conventions": *every bug fix ships with a regression test at the lowest layer that reproduces it.*

*As built (Phase 6):*
- **Floors.** `jest.config.js` has 16 Tier A per-file floors plus a Tier B global floor. Jest subtracts path-listed files from the global figure, so the global floor was measured over Tier B alone: statements 55, branches 35, functions 40, lines 55.
- **CI.** The Jest job runs with `--coverage`. Dropping the auth-store tests fails the run on all four of that file's floors.
- **Gap-fills to reach 80% (excl. `__DEV__`).** Google and Apple sign-in, including Apple getting the hashed nonce and Supabase the raw one. Provider failure and email back-out on AuthScreen. Session helpers. progressStore's storage failures and cross-device sign-in merge.
- **Docs.** RELEASE_CHECKLIST Phase 2 and Phase 7 gate on all three workflows, and Phase 4 starts with the migration-parity check. `docs/TESTING.md` is new and in the docs index. CLAUDE.md lists the commands and the regression-test rule.

### R12 — Catch what still gets through, fast

No suite catches everything. What's left is how fast a leaked bug gets noticed. These alerts live in dashboards, so they're owner-only; track each as an `OPS_STATE.md` row:
- PostHog alert: any `paywall_placement_not_found` in prod within an hour.
- PostHog alert: `paywall_skipped_by_superwall` above 1 % of `paywall_presented` (the Phase 11 pause threshold, automated).
- PostHog alert: day-over-day purchases down more than 50 % (also a Phase 11 threshold).
- Sentry: crash-free sessions below 99 % on the newest release.
- PostHog alert: `demo_mode_activated` above ~20 a week in prod. Today this is a weekly manual count (RELEASE_CHECKLIST, "Between releases"), and real users discovering the 7-tap is a leakage path.
- PostHog alert: `web_entitlement_checked` with result `error` or `timeout` well above its baseline. A failing web check silently sends web buyers without a cached flag to the Apple paywall.
- Already in place: Sentry new-issue and spike rules (OPS_STATE, verified 2026-07-10). These also catch the first `web_entitlement_check` error, which the service reports.

And, per the R11 convention, every production bug's fix PR includes the test that would have caught it.

### R13 — Paywall leakage and web-buyer access, end to end

Two failures matter equally:
- **Leakage:** an unpaid user gets in. That's lost revenue, and unfair to the people who pay.
- **Lockout:** a paying user is kept out. At best that's a refund request. At worst a web buyer pays Apple a second time.

This section lists every path once, with the check that covers it. It's the summary to read when the question is "are we covered?"

**Every way into Root.** All of these live in LoadingScreen, and R1's lint rule keeps the list closed.

| Way in | Must hold | Checked by |
|---|---|---|
| Demo user | only via the 7-tap; no session; never writes data | R3 #1, R5, R10 flow 7, R12 alert |
| Cached flag | honoured only for the same signed-in user | `entitlementCache.test`, R4, R10 flow 5 |
| `SKIP_PAYWALL` | dev builds only | R6, R3 #4 |
| Web entitlement | only a proven `entitled`; never on error or timeout | `webEntitlement.test`, `entitlementService.test`, R3 #5–6 |
| Purchase or restore on the paywall | only `purchased` and `restored`; `declined` re-presents | R3 #11–12 |
| Superwall skip | only `Holdout` and `NoAudienceMatch`; `PlacementNotFound` retries | R3 #13 |
| Superwall error | only for a cached subscriber | R3 #14–15 |
| Escape-hatch restore | only on `restored` | R3 #20 |

The server side of leakage: a client can't write `entitlements` or read another user's row (R9), and the background re-check clears a refunded buyer's cached flag (R3 #3, R10 flow 10).

**Every web-buyer situation**

| Situation | Expected | Checked by |
|---|---|---|
| Fresh install; signs in with the purchase email (OTP) | no questionnaire, no paywall, Learn | R10 flow 2; flow 11 for the real chain |
| …and the webhook failed to write their profile | Learn without ever seeing the paywall | R10 flow 2b |
| Signs in with Google or Apple using the purchase email | same Supabase user (identity linking), Learn | manual device step (native sheets) |
| Signs in with Apple Hide My Email | a different user → paywall → "Use a different account" → email sign-in → Learn | R3 #22 for the app side; manual device step for the whole. Needs the Superwall button, which OPS_STATE lists as not yet built |
| Email typed in a different case or with spaces | same user | `emailOtp.test` (`normalizeEmail`); the web repo's `get_user_id_by_email` test |
| Cached web flag, normal launch | Root at once, then a background re-check | R3 #3 |
| Cached web flag, offline | Root; the flag is kept (same leniency as Apple subscribers) | R3 #3 |
| No cache; web check failing and Superwall unreachable | retry screen; a later retry that gets a web answer → Root | R3 #26 |
| Superwall reports `INACTIVE` (it always does for web buyers) | flag kept | R4 hook |
| Renewal; webhook on time | access uninterrupted | contract table (below) |
| Renewal; webhook late (the P1-8 scenario) | access kept for 6 days past period end (fixed 2026-10-05, see below) | `webEntitlement.test` (incl. the sweep-interval check); contract table |
| Card failing while Dodo retries (`on_hold` / `past_due`) | access kept for the webhook's 3-day floor | contract table |
| Cancels | access until period end, then the paywall | `webEntitlement.test`; contract table |
| Refund or chargeback | the paywall from the next launch | R3 #3; contract table; R10 flow 10 |
| Deletes their account | Dodo cancelled before anything is deleted; a failed cancel deletes nothing | R6, R8, R10 flow 6 |
| Opens Settings | the kinderwell.app/manage row; never prices or funnel links | R7 |

**The webhook ↔ app contract.** Each repo tests its own half. The web repo's webhook tests check which row each Dodo event writes; this repo's tests check what a row means. Nothing checks that the two agree, and they've already drifted once (see the late-renewal fix below). The fix:
- Add a contract table, `src/store/__tests__/webEntitlementContract.ts`, with one entry per Dodo event fixture in the web repo (`supabase/functions/_fixtures/dodo/`).
- Each entry holds the row the webhook writes, and the access the app must grant at several moments: before period end, just after, 2 days after, and 6 days after.
- This repo's test runs every entry through `isWebEntitled`.
- The web repo's webhook tests should assert the same rows. That's a task for that repo.
- A release-time script diffs the two copies of the table.
- *As built (Phase 3):* `src/store/__tests__/webEntitlementContract.test.ts` covers 9 Dodo events, with 21 access checks around the billing date. When the web repo is checked out next to this one, the test also re-reads its code (the event → status map, the 3-day past_due floor, revoke on refund and dispute, the sweep's grace). That replaces the copied-table diff. In CI the cross-check is skipped.

**Fixed 2026-10-05 — a late renewal webhook locked paying web subscribers out.**
- Web review P1-8 (fixed 2026-09-30) found that a late `subscription.renewed` webhook locked out customers who had just been billed. The fix was on the server: the sweep now waits 5 days for `active` rows and checks with Dodo before expiring them.
- The app never got the matching change. Its own date check (`isWebEntitled`, `src/store/webEntitlement.ts`) had no grace, so it cut access the moment `current_period_end` passed. The server only re-checks with Dodo after its 5 days, so a payer whose renewal webhook was lost met the Apple paywall for up to 5 days, and could pay a second time.
- **The fix:** `active` rows now keep access for `ACTIVE_LATE_RENEWAL_GRACE_MS`, which is 6 days: the server's 5 plus one, so a late-running hourly sweep never leaves a gap.
  - The cost: an `active` row whose subscription really ended keeps access until the sweep expires it, at the latest one day after the server's own 5-day window.
  - Once the sweep has expired a row, its status decides, so the grace no longer applies.
- `past_due` and `cancelled` keep the strict date check, because the webhook already sets their dates: a 3-day floor, and never moved earlier.
- `webEntitlement.test` reads the newest migration that defines `expire_stale_entitlements()`, and fails if the sweep ever waits longer than the app's grace minus a day.
- **Web repo follow-ups (not done here):**
  - Its `hasAccess` (`supabase/functions/_shared/entitlement.ts`) still says it is "the same rule the iOS app applies" with no grace. That rule drives the checkout duplicate-purchase guard and the resume link, so the owner should decide whether those also honour the grace.
  - `02-payments-entitlements.md` still describes the old app rule.

## Phasing

Each phase ships on its own and is useful alone. Estimates are rough, in AI-assisted working days.

| Phase | Requirements | Estimate | Why this order |
|---|---|---|---|
| 1 | R1, R2, R4, R6 | 1.5–2 d | Cheapest risk reduction: invariant 1 enforced; the cache's user binding tested at the store; delete, restore and config tested |
| 2 | R3, R5 | 2 d | The gate and launch routing, the single highest-value block |
| 3 | R8, R9 | 1.5–2 d | The backend money and security paths |
| 4 | R7 | 1–1.5 d | User-visible flows, the render smoke test, content rules |
| 5 | R10, starting with spike S1 | 2–3 d | Needs owner prerequisites; the most setup |
| 6 | R11, R12 | 0.5 d | Lock in thresholds; rewrite the release gate |

### Where the work lives

- **Branch: `release/1.3.0`.** This is the single 1.3.0 branch: the redesign, web-purchase unlock, the late-renewal fix, and this spec's work, as one line of history. It replaced `design/onboarding-lesson-revamp`, `feat/web-purchase-unlock` and `test/spec-17` on 2026-10-05, owner decision. Those three were a strict stack, so no commit was lost.
- **Tests go into 1.3.0 too.** 1.3.0 hasn't shipped, and its riskiest change is the paywall gate (web unlock, "Use a different account"), so Phase 2's gate tests are worth the most before it ships. Tests, lint rules, CI and the harness don't go into the app binary.
- **Two requirements change shipped code.** Each is a behaviour-preserving move in its own commit, and the tests that land with it show nothing changed:
  - **R4** (done) moves the Superwall status listener from `App.tsx` into `useSubscriptionStatusSync` in `src/store/authStore.ts`. It's app code, so it ships in the 1.3.0 binary.
  - **R8** splits `delete-account` into `handler.ts` plus a thin `index.ts`. It's a deployed edge function, so it needs a redeploy (RELEASE_CHECKLIST Phase 5) and the usual dev-first acceptance check. Schedule it for after 1.3.0 unless that release is already redeploying the function.
- **A bug the new tests find in 1.3.0 code** gets its own `fix(...)` commit with its regression test. The late-renewal fix (`b26186f`) was the first.
- **Shipping:** one PR, `release/1.3.0` → `main`, then build from `main` (runbook `docs/releases/v1.3.0.md` §A).

R13 is a cross-check, not a separate phase. Each of its rows lands with the phase that owns its check. The exception is the contract table, which goes in Phase 3 alongside the backend work.

## Owner-only prerequisites

CLAUDE.md doesn't let an AI session do these:
- Add the `e2e` profile to `eas.json` (R10).
- Accept the Xcode license. On this machine Apple's `git` also refuses to run until it's accepted; Homebrew's `/opt/homebrew/bin/git` works meanwhile.
- Create `.env.e2e` with the **dev** service-role key. It stays untracked; `.env*` is already ignored.
- Raise dev's emails-per-hour limit if the E2E runs hit it.
- Set up the PostHog and Sentry alerts (R12).
- Optional: install Docker Desktop, OrbStack or Colima, to run pgTAP locally instead of only in CI.

## Decisions for the owner

1. **A fast lane for content-only releases.** If a release changes only `src/lessons/content/**`, can CI plus E2E replace the manual device pass? That would make content releases nearly free.
2. **Where E2E runs.** Locally to start (recommended), or pay for macOS CI or EAS Workflows now.
3. **Test users on dev.** E2E creates and deletes users on the shared dev project. Is that acceptable, or should tests get a third Supabase project?
4. ~~**Grace for late renewal webhooks** (R13).~~ Decided and fixed 2026-10-05: `active` web rows keep access for 6 days past period end (the server's 5 plus one).

## Acceptance — the sabotage list

Coverage numbers don't prove that tests catch anything. The spec is done when each breakage below, made one at a time on a scratch branch, turns CI red (or E2E, where marked):

1. Add `navigation.replace('Root')` to `AuthScreen` after sign-in.
2. Swap the order of the web-entitlement check and `registerPlacement` in `runGate`.
3. Map `PlacementNotFound` to `enter_root`.
4. Drop the `wasDeferredRef` check, so the config effect always runs the gate.
5. Make `persistSubscription` clear the record when there's no user.
6. Make `authStore.initialize` honour the cached flag without comparing user ids.
7. Make the `INACTIVE` handler clear a flag whose source is `web`.
8. Remove `IS_SUBSCRIBED` from `deleteAccount`'s `multiRemove`.
9. In `delete-account`, delete `lesson_progress` before the Dodo cancel.
10. Accept an HS256 token when the project issues ES256.
11. Add an `insert` policy on `entitlements` for `authenticated`.
12. Add a table in a migration without enabling RLS.
13. Put `email` into `identifyUserWithOnboarding`'s `$set`.
14. Remove `loadState()` from Splash's signed-in branch.
15. Change "Continue with Email" to "Continue with email".
16. Remove `entry: true` from the Learn → LessonScreen navigation.
17. *(E2E)* Re-enable the back gesture on Root.
18. *(E2E)* Drop the progress read when Learn mounts.
19. Add `expired` to `ENTITLING_STATUSES` (leakage).
20. Remove `cancelled` from `ENTITLING_STATUSES` (lockout).
21. Make `resolveWebRecheck` clear the flag on `error` (offline web buyers locked out).
22. Treat a timed-out web check as `entitled`.
23. Make the retry loop call Superwall directly, skipping the web check.
24. Remove the `active` late-renewal grace from `isWebEntitled`, or shrink it to the sweep's 5 days. Both were checked on 2026-10-05: removing it fails 3 tests, and shrinking it fails the sweep-interval check.

Optional later: run Stryker mutation testing quarterly on Tier A files, to find what this list missed.

## Appendix A — invariant → check

| # | Invariant | Checked automatically by | Stays manual |
|---|---|---|---|
| 1 | Only Loading enters Root | R1 lint; R10 flow 1 | — |
| 2 | onSkip reasons | `routingPolicy.test`; R3 #13; R12 alert | dashboard audience (Phase 7.5) |
| 3 | Cache bound to the user | `entitlementCache.test`; R4; R10 flow 5 | — |
| 4 | `show_paywall` kept for v1.0.0 | — | dashboard (Phase 7.5) |
| 5 | SKIP_PAYWALL never in prod | R6 `app.config.js`; R3 #4 | — |
| 6 | Onboarding error ≠ no_onboarding | `onboardingService.test`, `routingPolicy.test`; R5 | — |
| 7 | No `'Parent'` placeholder writes | `onboardingService.test`, `profileSummary.test`; R3 #23 | — |
| 8 | No PII to PostHog/Sentry | `analytics.test`; R2 global guard | Sentry `sendDefaultPii` in the dashboard |
| 9 | `verify_jwt` on; service key server-only | R8 config and source scan | the flag on the actual deploy |
| 10 | Storage keys only via `storageKeys.ts` | R1 lint; `upgradeFromV120.test` | — |
| 11 | Sequential lock, earliest gap | `units.test`; R7 Learn | — |
| 12 | Every section on the path | `units.test` | — |
| 13 | Per-lesson gate is a no-op | R6 `useLessonGate` | — |
| 14 | One source of truth for progress | `lessonCompletion.test`, `pathProgress.test` | — |
| 15 | Prod builds fail on missing env | R6 `app.config.js` | — |
| 16 | `buildNumber` is a bare integer | R6 | — |
| 17 | `__DEV__` never on the prod DB | R6 `supabase.ts` | — |
| 18 | Kill switch fails open, capped | `appConfig.test`; R6 `configStore`; R10 flow 8 | — |
| 19–22 | Process: backups, CLI link, tags, doc pruning | — | release checklist |
| 23 | Web check error ≠ entitled | `routingPolicy.test`, `entitlementService.test`; R3 #6 | — |
| 24 | Client never writes `entitlements` | R9 pgTAP; R1 lint | — |
| 25 | Superwall clears only `superwall` flags | `entitlementCache.test`; R4 hook | — |
| 26 | App Store 3.1.3: no web pricing or links | R7 URL allowlist and Settings manage row; R5 Apple-button rule | copy review |
| 27 | Labels quoted by the website | R5 contract test | — |
| 28 | Cancel Dodo before deleting | R8 | — |

## Appendix B — coverage when this was written (2026-10-05)

Overall: statements 16.08 %, branches 12.13 %, functions 12.29 %, lines 15.64 %.

Tier A files at 0 %, with coverable lines: `LoadingScreen` 296, `AuthScreen` 161, `authService` 135, `onboardingStore` 64, `authStore` 62, `SplashScreen` 47, `configStore` 40, `lessonProgressService` 31, `purchaseService` 13. Partly covered: `appConfig` 54 %, `analytics` 64 %, `supabase.ts` 22 %, `streak` 79 %.
