> **SNAPSHOT — frozen as of 2026-09-15. Do not follow as current process; see docs/README.md for the live docs.**

# Response — "Onboarding, Paywall & Path Walkthrough" user-journey review

**Branch:** `design/onboarding-lesson-revamp` · **Reviewed at:** `8665f20` · **Responded:** 2026-09-15

The review walked the app as a simulated user across four lenses (onboarding, paywall gate, path
& lessons, cross-flow seam) and raised **7 confirmed majors (W1–W7)** plus ~22 minors.

This document records, for every item: what we did, what we deliberately did not do, and why.
It is a snapshot of one decision session — the decisions are recorded here; the parked items that
still need tracking are noted as such at the bottom.

---

## Verification posture

Every finding was re-checked against the code before acting. The review was accurate on the
specifics — line references landed, and the claim that `scope: 'local'` would not fix the offline
sign-out was verified directly against `@supabase/auth-js` 2.91.1 (`GoTrueClient._signOut` returns
the network error at the `admin.signOut` call *before* `_removeSession()`, regardless of scope).

**Two findings were wrong and were not acted on** (see "Refuted" below). Two attributions were
also imprecise; noted inline.

---

## Fixed

### W1 — Swipe-back re-entered onboarding after paying 🔴
**`src/navigation/OnboardingNavigator.tsx`**

The post-onboarding stack is nine pushed screens (Welcome + eight questions) with `Auth` on top.
`Auth.replace('Loading')` and `Loading.replace('Root')` each swap only the top entry, so all nine
survived underneath `Root` — a parent who had just paid could swipe right into
"How have you been feeling lately?". The demo path was worse: `DevMenuScreen` *navigates* to
Loading rather than replacing, leaving `Auth` on the stack too, i.e. exposure precisely during
App Review sessions.

**Fix:** `gestureEnabled: false` on `Loading` and `Root` at the navigator level, so all five
`replace('Root')` sites inherit it rather than being patched per-call-site.

### W2 — Signed-in-but-unfinished users were silently reclassified as onboarded 🔴
**`src/navigation/routingPolicy.ts` (new `resolveSignedInLaunch`), `src/screens/onboarding/SplashScreen.tsx`**

The worst finding. `SplashScreen` sent every signed-in user straight to `Loading` without ever
calling `loadState()`. `LoadingScreen` treats a null `userType` as "we've saved before, skip the
upsert" — so a user who signed in and quit partway through the questions (an iOS background kill
suffices) was gated as though onboarded, **could subscribe, and landed in `Root` with no profile
row ever written.** Their half-given answers sat unread in AsyncStorage permanently. Because
Supabase OAuth mints an account on first sign-in, a brand-new user who mistapped "I already have
an account" fell into the same cohort.

**Fix:** a new pure kernel function `resolveSignedInLaunch({ lastScreen, hasReachedAuth })`
returns `gate` or `resume` + the stack to restore. `hasReachedAuth` is what separates "finished
the questions" from "quit partway". Splash now consults it, resumes the questions when they are
genuinely unfinished, and `loadState()`s on the gate path too so a stranded payload can be
retried. Unit-tested (8 new cases) alongside the rest of the routing kernel.

### W3 — A failed onboarding save was completely silent 🔴
**`src/screens/onboarding/LoadingScreen.tsx`**

The Supabase upsert runs once; on failure the catch did a `__DEV__` console.error and
"continued anyway". No Sentry, no user feedback, no retry — while the user watched the theater
reach 100% and paid. This also violated the house error pattern (money/auth paths get
`reportError`).

**Fix:** `reportError` in the catch, plus a **launch-time re-save**. `clearState()` only runs on
success, so a non-empty store on a signed-in user's launch already means "never persisted" — and
with the W2 fix rehydrating the store, the existing save effect retries the upsert on the next
launch with no extra branch. The two fixes are deliberately coupled: W3's retry does not work
without W2's `loadState()`.

### W5 (partial) — "Delete account" did not delete progress 🟡
**`src/services/authService.ts`, `src/constants/storageKeys.ts`**

The confirmation dialog promises deleting "all your data (progress, preferences, children)", but
every lesson-progress key survived on disk and resurfaced. To a user deleting for privacy,
deletion visibly did not do what it said — and the sign-in union-merge would then push the deleted
account's progress into whichever account signed in next on that device.

**Fix:** `deleteAccount` now `multiRemove`s `LESSON_PROGRESS_KEYS` plus `LESSONS_COMPLETED`,
`ACTIVE_DAYS` and `FLOW_BACKFILL_DONE` (the last one matters — without it the flow backfill would
not re-run for the next account). `LESSON_PROGRESS_KEYS` already existed for exactly this purpose
and was documented as "used nowhere yet". Stale comments in both files corrected.

**Note on the review's attribution:** it cites the `authService` comment calling this
"BACKLOG #23 territory". That comment is real, but BACKLOG #23 is a *different* issue
(union-before-push on the per-completion sync). The shared-device bleed is not tracked anywhere —
see "Parked" below.

### #8 — A failed progress write was fully silent 🟡
**`src/lessons/progressStore.ts`**

The *remote* sync already reports to Sentry on a failure streak. The gap was the **local**
AsyncStorage write, which is what actually drives the rail: if it failed, the caller had already
fired `lesson_section_completed` (and possibly `lesson_completed`), so analytics said the parent
finished while the rail still asked them to do it again — and unlike the remote sync there is no
retry that heals it.

**Fix:** `reportError` on the local write failure, unconditionally (no streak threshold — a local
write failing is already anomalous, where a remote sync failing is routinely just "offline").

### #1 — Lesson 1's title was typo'd 🟢
`'What changed parenting Science?'` → `'What changed in parenting science?'`
(`src/lessons/content/lesson1.ts`). This is the marquee card every new subscriber sees first.
The old wording survives in `docs/archive/` and `docs/spec-09/CONTENT_ERRATA.md`, which are frozen
history and deliberately not edited.

### #2/#3 — The keyboard covered the Continue button 🟢
**`src/components/onboarding/OnboardingScreen.tsx`, `src/components/LessonContainer.tsx`**

`KeyboardAvoidingView` existed in `OnboardingContainer` but not in the shell the onboarding flow
actually renders through. Fixed in both shared shells rather than per-screen, which covers every
text-entry screen in onboarding *and* the lesson journaling screens at once.

### #5 — Retry copy blamed the user's network for our misconfiguration 🟢
**`src/screens/onboarding/LoadingScreen.tsx`**

`PlacementNotFound` means Superwall answered fine but the `subscription_gate` placement is
missing/renamed in the dashboard — our fault, not the user's. Telling them to check their
connection sent them chasing a problem they cannot fix.

**Fix:** a latched `retryCause` state. The `PlacementNotFound` branch (which already fires a
distinct event + `reportError`) now shows: *"We're having trouble loading your subscription
options. We're on it — please try again in a moment."* Everything else keeps the network copy.

### #6 — Two gate timers bypassed the `latestRunGateRef` fix 🟡
**`src/screens/onboarding/LoadingScreen.tsx`**

The theater-completion timer and the mount-wait timer called `runGate()` directly, holding an
`isSubscribed` captured up to ~10s earlier. If a subscription confirmed mid-retry, those paths
would still present the paywall to a paying customer — the exact bug `latestRunGateRef` was
written to prevent.

**Fix:** both now call `latestRunGateRef.current()`. The third direct call (in `applyGateOutcome`'s
re-present branch) was **deliberately left as-is** and commented: that function is declared above
the ref, so reading it there would depend on the timeout firing after render — true today, a trap
later. It is re-created every render, so its capture is already current.

### #10 — Providers could both be started at once 🟢
**`src/screens/onboarding/AuthScreen.tsx`**

`AppleAuthenticationButton` is a native view with no `disabled` prop, so it stayed tappable while
a Google sign-in was in flight. The guard now lives in **both handlers** (`if (isLoading) return`)
so it holds regardless of what the UI can express, and the Apple button is dimmed to match
Google's disabled state so the refusal is visible rather than silently inert.

### #11 — No back affordance on Auth in signup mode 🟢
**`src/screens/onboarding/AuthScreen.tsx`**

`onBack` was signin-only, so a user who had just walked eight question screens could not step back
to change an answer — despite the shell's own comment promising a back affordance.

**Decision:** there was a genuine tension here — the navigator deliberately disables swipe-back in
signup mode so the flow can't be re-entered by accident. Resolved by keeping the **gesture**
disabled and enabling the **explicit tap**. The shell only renders it when
`navigation.canGoBack()`, so the resumed-at-Auth case still correctly shows nothing.

### #12 — The build-theater subtitle stated ages we don't have 🟡
**`src/screens/onboarding/LoadingScreen.tsx`**

Onboarding collects age *bands*; the subtitle rendered the band's lower bound as fact — "5-7"
became "a 5-year-old". A parent of a 7-year-old read their child's age back to them **wrong**, on
the one screen whose entire job is to prove we were paying attention, immediately before the
paywall. It also produced "a 8-year-old" and the outright broken "a 18+-year-old".

**Fix (owner decision):** say only what the band actually supports —
baby / toddler / young child / school-age child / teenager / grown child. Every phrase is true for
every age inside its band. Also fixed the subject-verb agreement in the same sentence
("...where tantrums **is** the hard part"), which is plural for two goals and for inherently
plural single goals.

### #13 — Tapping a locked section did nothing 🟢
**`src/screens/LearnScreen.tsx`**

`openNode` returned silently for a locked node, so the rail read as broken rather than sequential
and nothing anywhere explained the lock rule. Added a transient hint —
*"Finish the section you're on to unlock this one."* — floating above the rail (so showing it
never shifts rows under the user's finger), auto-clearing after 2.6s and cleared on blur.

---

## Refuted — not fixed, because the finding was wrong

### #17 — "The rail's 'opens at the card on the first frame' claim doesn't hold"
The review claimed the list mounts empty so the scroll is a late correction with a top-of-rail
flash. **It already works as documented.** `LearnScreen` uses fixed row heights so `getItemLayout`
is exact and `initialScrollIndex` lands on the first frame with no scrolling — the comments record
three earlier attempts that failed before this approach. The empty list the reviewer saw is
`data={loaded ? nodes : []}`, a *deliberate* hold that prevents drawing the wrong lesson as
tonight's card. Fixing this would have reintroduced the bug it prevents.

### #7 — "Notifications: permission is never requested"
Half right, and the half that's wrong matters. There is **no notifications question in onboarding
at all** — `setNotificationsEnabled` exists but nothing calls it, and there is no permission
request anywhere in the app.

So it is not "dead plumbing the user filled in": it is a field hardcoded to `false`, written to
the Supabase profile and sent to PostHog as `notifications_enabled` for every user. Nothing breaks,
but **that column is not evidence that users declined notifications** — they were never asked.
Left as-is; noted here so it isn't misread on a dashboard later.

---

## Parked — real, deliberately not done now

| Item | Why parked |
|---|---|
| **W4 — escape hatch** (overflows small screens; `Sign out` fails offline) | Needs "offline or Superwall outage" **and** a small screen **and** being stuck 9s+. The sign-out half is the far-reaching part: fixing it properly means changing sign-out app-wide to clear local session when the network call fails, which touches the auth path the review otherwise confirmed solid. **Cheap 80% available later:** wrapping the gate content in a `ScrollView` fixes the "can't reach the button" half in isolation. |
| **W5 — cross-user merge** (A's progress becomes B's cloud data) | Requires a shared/handed-down device. Low exposure at current scale. The copy-contract half (delete-account) was fixed; the posture question — keying the merge by user, or clearing progress on ordinary sign-out — is **untracked**: BACKLOG #23 is a different issue. Worth a BACKLOG entry before shared-device usage grows. |
| **W6 — lessons have no exits and no endings** | Confirmed accurate: 49 sections, exactly **1** `sectionComplete` screen (sprinklers §1); no X-to-exit anywhere; `screenIndex` not persisted; the 49th section ends on the rail with only an italic line far below the fold. **Mechanics work** — progress saves and the return-to-rail is correct — so this is flatness, not breakage. Product/design work, deferred to the redesign. |
| **W7 — double auth / duplicate accounts** | Needs an unlikely sequence, and the W2 fix shrinks the affected cohort substantially. Note the compounding detail: the "use the same option you signed up with" hint renders **only in signin mode**, so the person most at risk is the one who cannot see it. Revisit if support volume justifies it. |
| **#4** "TONIGHT · FIVE MINUTES" hardcoded regardless of time of day | Cosmetic; owner chose to keep. |
| **#9** Journaling input discarded | Documented as deliberate in `schema.ts` ("EPHEMERAL"). The fair complaint is narrower — it *looks* like a journal and Back wipes it with no warning. Either label it or persist it, later. |
| **#14–16, #18, #20–21** quiz reset, progress indicator, tab-switch re-read flicker, stale "Section X of Y" labels and retired CTAs, resume-off-by-one, subscriber briefly seeing the paywall after sign-out/in | Polish and copy drift. #21 is worth watching in the wild — "I'm paying and it's asking me to pay again" generates support mail out of proportion to its severity. |
| **#19** present-watchdog double-register; backgrounding freezes theater progress | Edge cases in gate machinery the review otherwise found sound. |
| **#22** the plan-theater promise has no payoff | The most strategic item in the review: 10s of "Building your plan" for named children → a rail that never mentions the plan, the name, or the answers, because the answers personalize nothing downstream today. Explicitly deferred. Suggested ladder when picked up: (1) reflect the answers back on the Learn screen, (2) reorder the path from the stated hardest thing, (3) genuinely personalized curriculum. |

---

## Verification

- `npx tsc --noEmit` — clean
- `npm test` — 215 passed / 215 (was 207; +8 new `resolveSignedInLaunch` cases)
- `npx eslint .` — 114 warnings, **identical to the pre-change baseline** (zero added)
- INVARIANTS re-checked: `grep -rn "replace('Root')" src/` still hits only `LoadingScreen`;
  no new AsyncStorage key introduced outside `storageKeys.ts`; no PII added to analytics.

**Doc drift noted:** `CLAUDE.md` states the lint baseline is "~107 warnings". The actual baseline
at `8665f20` is **114**. Not corrected here (out of scope of this response); flagged for whoever
next touches that line.
