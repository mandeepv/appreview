> **SNAPSHOT — frozen as of 2026-07-10. Do not follow as current process; see docs/README.md for the live docs.**

# Kinderwell Re-Review — Beta & Release Readiness

**Date:** 2026-07-05
**Branch:** `setup/dev-environment @ 67c3972` (v1.1.0, build 9)
**Question:** Is the app ready for internal TestFlight beta → external TestFlight beta → App Store release?

**Method:** Four verification passes — adversarial fix verification of all
tracker claims, regression hunt across the fix commits, docs/test-plan
review, stage-gated release readiness. All claims verified by reading
code or executing tools (`tsc`, `eslint`, `bump-version.sh` were run,
not just read).

---

## ⚡ Do right away — before the first TestFlight build

Everything below appears in detail later in this doc; this is the
consolidated punch list.

### Fix in code (all small)

- **`authStore.ts:94-96`** — remove `$set: { email }` from launch-time
  `posthog.identify()` (defeats the shipped privacy fix; tracker
  wrongly marks it done).
- **`eas.json`** — add `"appVersionSource": "local"` to the CLI block
  (or first build may ignore `buildNumber` 9 / prompt interactively).
- **`DEV_PROD_ENVIRONMENT.md:381`** — remove the `SHOW_DEMO_BUTTON=true`
  instruction (deleted env var, in a duplicate release workflow).
- **`DEMO_MODE.md`** — fix monitoring signal name (`demo_mode_activated`,
  not `authMethod: "demo"`); add the "~20/week threshold check" to
  Phase 11.
- **Test plan** — Section 9.1: `lesson_started` → `lesson_tapped` /
  post-gate script; Section 12: add the Restore Purchases failure/"still
  syncing" outcome test.
- **`FABLE_LATEST_REVIEW.md`** — deploy-order step 2 — now stale:
  delete-account edge function DID change (CORS); Phase 5 redeploy is
  mandatory this release.

### Check outside the repo (only you can)

- Confirm `SENTRY_AUTH_TOKEN` exists as an EAS secret.
- Real repo's Supabase production ref is **identical** in:
  - `src/lib/env.ts`
  - `eas.json` production profile
  - `app.config.js`
  (review copy was sanitized; drift = new guard crashes builds at
  launch)
- Privacy policy URL returns HTTP 200.
- Tell the 3 testers: paywall has **no close button yet** — force-quit
  and reopen is the escape.

### Explicitly NOT needed before internal beta

(Gated later, already sequenced)

- Superwall close button
- `app_config` migration
- edge-function redeploy
- DB password rotation
- PostHog person deletion
- App Privacy questionnaire

---

## Confidence statement — what makes each stage "good to go"

### Testing (internal beta)

**Good to go unconditionally** once the punch list above is done.

Build it and hand it to the Homies.

The code has been through **seven adversarial review passes across two
rounds**, the fixes verified, the regressions hunted.

At the code level, this is a well-reviewed app.

### Submission

**Good to go conditionally** — and the conditions are written down, not
vague.

Two things stand between beta and submission:

1. **The gated tasks:**
   - Superwall close button
   - `app_config` migration
   - edge-function redeploy
   - delete-account retest
   - App Privacy questionnaire
   - PostHog person deletion (or policy amendment)

   All known, all sequenced in the `RELEASE_CHECKLIST`.

2. **The test results themselves.**
   No amount of review can pre-clear this part.
   Phase 8.3 (upgrade over the live build, airplane-mode entitlement,
   restore, delete-account) has to actually pass, and the beta has to
   run without Sentry surfacing something the reviews missed.

Confidence is high that it will — but the honest sequencing is:

> submission is good to go when the tests say so, not when the fixes
> land.

Pre-blessing the submission before the upgrade test runs is the thing
that shipped v1.0.0.

### Is this a good app for production?

**Yes** — with the accurate framing:

The code follows good practices where it counts, every known gap is
either fixed or consciously accepted and documented, and — most
importantly — the machinery now exists (monitoring, kill switch,
phased rollout, upgrade tests) to catch and contain whatever nobody
caught.

That's what a production-grade app actually looks like.

Nobody honest can promise "no issues"; what this app has is "no known
issues unaccounted for," which is the real standard.

### The chain

```
punch list
   ↓
build
   ↓
internal beta
   ↓
gated tasks
   ↓
Phase 8.3 pass
   ↓
external beta
   ↓
submit
```

Every arrow has a defined gate.

If all gates go green, ship with full confidence.

---

## Stage-gated verdict

| Stage | Verdict | Gate |
|---|---|---|
| Internal TestFlight (Homies, 3 testers) | ✅ GO now | 2 tiny pre-flight items below |
| External TestFlight | ⛔ NO-GO yet | Superwall close button + TestFlight test info + 3 recommended hardening items |
| App Store release | ⛔ NO-GO yet | Your own blockers callout, correctly sequenced, +2 additions |

---

## Fix quality

**Excellent.**

18 of 20 verifiable claims fully hold; several fixes (Restore Purchases,
analytics batch, storage keys) are better than the tracker describes.

The scary regression hypotheses all cleared:

- PKCE does NOT break Google sign-in (`authService.ts` already handled
  it)
- code change path before the flag flipped
- missing guard has no false-positive path
- Expo Go/dev-client/preview all verified safe
- no AsyncStorage key changed (no stranded user progress)
- existing sessions keep refreshing across the upgrade
- `tsc` clean
- eslint 0 errors / 199 warnings (matches claim)
- `bump-version.sh` executed correctly including refuse-on-drift

---

## The two fixes that didn't fully land

### 1. PostHog email leak survives — the fix is defeated by a second code path (MEDIUM, 2-line fix)

`src/store/authStore.ts:94-96`

Found independently by two passes.

`analytics.ts` was correctly cleaned, but `authStore.initialize()` runs
on every app launch for every signed-in user and still does:

```ts
posthog.identify(session.user.id, {
  $set: { email: session.user.email ?? null }
})
```

This call was added on this branch.

Email still lands in PostHog person properties, re-linked to the
emotional-challenge properties the original finding was about — for
**100% of signed-in users, including production.**

The tracker's ✅ is wrong.

**Fix:**

- Drop the `$set` (identify with bare user ID).
- Also queue a PostHog person-property cleanup for already-affected
  users.
- Do this **before the beta build** — it's a 2-line fix and this build
  eventually goes to the store.

### 2. CORS `"null"` is cosmetic, not a lockdown (LOW)

`supabase/functions/delete-account/index.ts:20-23`

`Access-Control-Allow-Origin: null` explicitly whitelists the literal
`null` origin (sandboxed iframes, `file://`).

The code comment has it backwards.

Zero app impact (native fetch ignores CORS).

**Real fix:**

- Remove the ACAO header entirely — fold into the Phase 5 redeploy you
  already owe this release.

---

## Pre-flight for internal beta (do these, then build)

1. **Add `"appVersionSource": "local"` to the CLI block in `eas.json`.**

   Modern EAS CLI defaults to remote version source, which ignores your
   carefully synced `buildNumber: 9` (and since this is your first
   production EAS build, likely prompts interactively at build time).

   Your whole `VERSION_MANAGEMENT` doctrine assumes `app.json` is truth.

   Verify the built IPA's `CFBundleVersion` is 9.

   This also keeps Sentry `dist` and the kill-switch comparison
   consistent.

2. **Fix the PostHog email line** (above).

3. **Confirm the `SENTRY_AUTH_TOKEN` EAS secret exists.**

4. **Tell your 3 testers the paywall escape hatch:**

   No close button exists yet, so:

   - if you see the paywall and don't want to buy: **force-quit and
     reopen**.
   - Verified this lands them in the app (Splash → Root for signed-in
     users), not a loop.

5. **Beta monitoring:**

   Your first-ever Sentry build means every production Sentry event
   during beta is a tester.

   In PostHog, testers land in production dashboards; filter by:

   ```
   $app_version = 1.1.0
   ```

   Expect `demo_mode_activated` noise from testers trying the 7-tap.

---

## Gate for external TestFlight

External TestFlight goes through Apple Beta App Review — your
checklist sequences compliance items as "before submission," but under
your internal→external plan they move earlier, to here.

### Blocking

- **Superwall paywall close button** — add to the template, then
  re-test BOTH placements (`show_paywall`, `learn_access`) on the
  current build (dashboard change, no new build needed). Your dismiss
  question is answered: no redirect config needed — the button just
  dismisses; your code already lands onboarding-dismissers on Root
  (`LoadingScreen.tsx:58-84`) and leaves lesson-tap-dismissers on
  LearnScreen with re-gating (`useLessonGate.ts`). For strangers, an
  undismissable paywall is beta-killing UX, not just an Apple risk.
- **TestFlight Test Information**: beta app description, feedback
  email, privacy policy URL
  (`https://mandeepv.github.io/kinderwell-legal/privacy.html` — verify
  it returns 200), and the dual-path demo notes copy-pasted from
  `DEMO_MODE.md:55-67`.
- **Add a "Phase 8.4: External beta" section to
  `RELEASE_CHECKLIST.md`** — no external-beta path exists in any doc
  today (verified: zero hits for "external"/"Beta App Review" outside
  archive), including promotion criteria from internal (e.g., all 3
  testers through upgrade + fresh paths, zero Sentry P0s over N days).

### Strongly recommended before strangers' data arrives

- **Rotate the prod DB password** (`BACKLOG 9i`, ~15 min) — never
  rotated, coordinate leaked in git history, and prod has zero
  backups.
- **Take a manual `supabase db dump` of prod** — cheapest possible
  insurance given Free-tier no point-in-time restore.
- **Close the PostHog person-deletion gap** (`BACKLOG 9j`, 2–3h) or
  amend the privacy policy. The policy promises deleted users'
  analytics are "no longer linked to you"; the system doesn't do that,
  and your own `BACKLOG` admits the policy "overpromises." Academic
  for 3 friends; a real accuracy problem once strangers delete
  accounts. Becomes near-blocking at release.

---

## Gate for App Store submission

Your submission-blockers callout is accurate and correctly sequenced
(Phase 4 migration → Phase 7.5 paywall → Phase 8.3 upgrade test →
Phase 9a privacy questionnaire). Two additions and fixes:

- **Add the Edge Function redeploy to the blockers callout.** The
  `delete-account` function did change this branch (CORS), so Phase 5
  is mandatory for v1.1.0 — and `FABLE_LATEST_REVIEW.md` deploy-order
  step 2 ("verify, don't redeploy — the branch didn't change it") is
  now stale and says the opposite. Re-test delete-account from the app
  after deploying. Remove the ACAO header in the same deploy.
- **Neutralize the `SHOW_DEMO_BUTTON=true` landmine** —
  `DEV_PROD_ENVIRONMENTS.md:381` still instructs setting a deleted env
  var, inside a duplicate release workflow someone might follow during
  this release. Stub that section with a link to `RELEASE_CHECKLIST.md`
  now; don't wait for the 9i audit.
- **Phase 8.3 upgrade test** (already mandatory in your checklist) —
  the fail-open-for-subscribers airplane-mode step is especially
  load-bearing, since the in-memory flag means offline cold-start only
  works if Superwall's cache fires first.
- **Phase 9a App Privacy questionnaire update** (your doc says current
  ASC answers are outdated — real rejection vector).
- **PostHog person-deletion or policy amendment** (item 6 above) — the
  one "deferred" item I'd reclassify as a release blocker.

---

## Docs & test-plan assessment

### What held up

- `BACKLOG.md` consolidation lost nothing material (spot-checked
  against git history of all three old files)
- the previously-lost paywall-dismiss item is now tracked twice,
  including as a hard Phase 7.5 gate
- `VERSION_MANAGEMENT.md` matches the rewritten script
- versions synced with CI enforcement
- `SETUP_GUIDE` and `EDGE_FUNCTION_DEPLOYMENT` fixed
- `docs/README` index complete
- Phase 8.1–8.3 upgrade procedure matches the recommended one
  faithfully

### Test-plan gaps (add to Section 12 or accept explicitly)

- **Restore Purchases failure/UNKNOWN → "still syncing, try again"
  outcome** — the defining behavior of the fix — has no test.
- **4 of 5 analytics fixes untested;** Section 9.1 is stale — it lists
  `lesson_started` in the tap funnel, but code now fires
  `lesson_tapped` on tap and `lesson_started` post-gate; a tester
  following 9.1 verbatim gets wrong pass/fail.
- **The flag-leak fix is tested on the wrong path.** "12.2 tests"
  already have an account sign-in, but the fix fires on Get Started →
  redo onboarding → sign in to existing account, observable as "later
  logout → cold launch lands on Welcome, not Auth."
- **Section 3.7 still frames the subscriber fail-open as hypothetical**
  ("if this fails, mitigation...") — it shipped; make 3.7 a hard
  assertion.
- **No explicit PKCE OAuth-callback assertion** (implicitly covered by
  any Google sign-in test).
- **Demo-mode monitoring is half-operational:** the ~20/week rip-out
  threshold lives only in the review doc; `DEMO_MODE.md` names the
  wrong signal (`authMethod: "demo"` — actual event is
  `demo_mode_activated`); and no recurring checklist (Phase 11 or
  hygiene list) includes checking it, so nobody will. Put the event +
  threshold into Phase 11.

### Minor doc drift found

- `bump-version.sh` never touches `android.versionCode`, but
  `VERSION_MANAGEMENT.md` and `DEV_PROD_ENVIRONMENTS.md:63` claim it
  does (harmless while iOS-only).
- `BEST_PRACTICES.md` still says the script updates "all 3 files"
  (lines 90/260) while line 30 says two.
- Tracker heading says "7 items" over 8 rows.
- `authStore.ts:12-14` comment still forbids gating on `isSubscribed`,
  which `useLessonGate` now (deliberately) does — stale comment,
  future footgun.

### Beta-process gaps

(write one paragraph each, during the beta is fine)

- no tester feedback mechanism documented;
- no beta exit criteria;
- no beta-window monitoring instruction (Phase 11 starts at phased
  release).

---

## Assessment of your objections

### #3 — fresh-answer discard on returning-user re-signin

**I agree with your call.**

Rush-tap-through answers overwriting a real profile is worse than
discarding them; the flag-leak half (the actual bug) is fixed and
verified; the upstream fix (detect existing session at "Get Started")
is correctly deferred.

**One ask:** the test plan asserts this on the wrong path (see above).

### #13 — demo mode kept for v1.1.0

**Defensible and well-documented.**

Your reasoning that a sandbox reviewer account doesn't fit an
OAuth-only auth flow is sound, the dual-path review notes follow
Apple's actual recommendation, and the risk acceptance is explicit
with revisit triggers.

Two follow-throughs to make it real:

- fix the event-name drift in `DEMO_MODE.md`
- put the threshold check into a recurring checklist so the monitoring
  actually happens.

Note the "Apple raises 2.3.1" trigger in your response never made it
into `BACKLOG` #10.

### #4 — lesson 10 punt

**Fine.**

Placeholder UX is unchanged from live prod; `BACKLOG` #11 carries the
recovery pointer to the orphaned working implementation.

Consider a "Coming Soon" label on `LearnScreen` (~15 min) to preempt
bait-and-switch reviews.

---

## Remaining low findings (for the backlog)

- Live-build users' sandbags progress written under the orphaned key
  isn't migrated — was already invisible pre-fix, so this is a missed
  recovery, not a loss; affected upgraders re-complete 2 sub-lessons
  (`BACKLOG`-worthy, not blocking).
- Sign-in error path can double-alert and fire `auth_abandoned` for a
  sign-in that succeeded (`AuthScreen.tsx:78-84` — if the post-error
  `signOut()` also fails on the same bad network). Cosmetic +
  analytics noise.
- A user literally named "Parent" can't save their name (exact-match
  filter). Trivially rare.
- `MIN_SUPPORTED_BUILD_CAP = 40`: when builds exceed 40, the kill
  switch silently disarms unless the cap is bumped — documented
  runway, worth a `BACKLOG` line.
- If the Supabase project ref is ever rotated, `src/lib/env.ts` must
  be updated in lockstep with `eas.json` or every build crashes at
  launch (would be caught on first dev run). One-time check that the
  real repo's three copies match.
- ESLint requires Node ≥18 locally (crashes on Node 16; CI pins
  Node 20 so CI is fine).

---

## Bottom line

**Ship the internal beta this week:**

- fix the PostHog email line,
- set `appVersionSource`,
- build,
- and hand it to the Homies with the force-quit note.

Use the beta window to do the dashboard close-button work, the
external-beta checklist section, the DB password rotation, and the
PostHog deletion function — then external beta gates cleanly, and
submission needs only the already-sequenced Phase 4/5/8.3/9a plus the
doc landmine fix.

The fix work since the last review was genuinely strong: **18 of 20
claims held under adversarial verification, and zero user-facing
regressions were introduced across 27 commits.**
