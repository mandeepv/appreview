# Backlog

Single source of truth for deferred work. Replaces
V1.1.1_ONBOARDING_POLISH.md + V1.1.1_PLUS.md + V1.2_LATER.md, which
previously carried the same information in three files and led to real
drift (one item was already lost between them per Fable review 🟡
"one backlog" concern).

Organized by target release. Each entry has a **problem**, **fix**,
**effort**, and **blocks** so triage is fast. If an item's effort ends
up being >1 day or blocks another item, promote it to its own doc.

**Legend:**
- 🔴 data corruption or user-blocking
- 🟡 hurts conversion or looks unprofessional
- 🟢 nice-to-have polish

---

## v1.3.0 review — minors (fix opportunistically or track)

From the release/1.3.0 review (2026-07-20). The blockers + real majors were
fixed in-branch; these are the low-impact remainders. None block ship.

### R1. Auto-advance swallows a corrective tap 🟡
**Problem**: on a single-select screen, if the user taps option A then quickly
taps option B within the ~350ms auto-advance window, the second tap is ignored
and they advance on A — a mis-tap they must fix with Back. `OptionList.tsx` ~392.
**Fix**: on a tap of a *different* option before the timer fires, reset the
selection + restart the timer (or cancel-and-reselect) instead of hard-locking
the first choice. **Effort**: ~1h. Annotate PostHog — per-step timing/rates
shift once fixed.

### R2. `gate_wait_exceeded` over-fires 🟢
**Problem**: the event fires when the paywall presents, not only on a genuine
long wait (`LoadingScreen.tsx` ~665) — inflates the "slow gate" signal.
**Fix**: gate the capture on the actual watchdog threshold. **Effort**: ~30m.

### R3. CalculatingView timer not cleaned on unmount 🟢
**Problem**: the final 350ms "settle" `setTimeout` before `onDone` isn't cleared
if the screen unmounts first — a benign late setState warning in dev.
**Fix**: track + clear it in the effect cleanup. **Effort**: ~15m.

### R4. Self-referential tests 🟢
**Problem**: `analyticsStepNames.test.ts` compares hard-coded lists to each
other rather than to the real exports; `loadingMode.test.ts` tests a local
re-implementation. They pass but the advertised guards don't fully guard.
**Fix**: assert against the real modules where feasible. **Effort**: ~1h.

### R5b. Variant super-property lost across a relaunch 🟢
**Problem**: `hydrateOnboardingVariant()` (re-registers the `onboarding_variant`
super-property from the persisted key on app start) is **never called** at
startup — grep finds no caller outside experiments.ts. So if a user completes
onboarding, kills the app, relaunches, then purchases, `subscription_purchased`
fires WITHOUT the `onboarding_variant` event property (it's still `$set` on the
person, so cohort analysis survives, but event-level breakdown of the primary
metric is lost for relaunch-then-purchase users). Related: the sticky variant
key is never cleared on the sign-in path (`clearState()` doesn't remove
`ONBOARDING_VARIANT`; only `clearOnboardingVariant()` in LoadingScreen does), so
a "re-save on next sign-in" sticks the old assignment for any future fresh
signup on that device.
**Fix**: call `hydrateOnboardingVariant()` once at app bootstrap (App.tsx/root);
decide the intended clear-point for the sticky key on the sign-in path.
**Effort**: ~1h. Neither blocks the dark ship, but both matter before the 50/50
ramp (they affect the A/B readout). **Blocks**: accurate 50/50 experiment readout.

### R5. Onboarding-mode LoadingScreen retry copy 🟢
**Problem**: the offline retry path shows a 100%-complete checklist for ~9s
before the escape hatch, with no "check your connection" message (gate mode has
its copy; onboarding mode doesn't).
**Fix**: add a connection hint in onboarding retry state. **Effort**: ~30m.

### R6. Housekeeping / process 🟢
- `ci.yml` triggers only on PRs into main/develop, so direct pushes to
  `release/*` never run CI (CI has NEVER run on release/1.3.0). Trigger manually:
  `gh workflow run CI --ref release/1.3.0`. (Runbook Phase 2/4 corrected to the
  release branch — main is frozen at 1.2.0.) Consider adding `release/**` to the
  CI trigger so this isn't manual every release.
- **`rc/1.3.0` tag points at the old pre-re-cut tip (`c7aa36e`)** — code that
  will never ship (the narrow branch we replaced when rebuilding at bigger
  scope). Move it to the real release commit or delete it. NOTE: `rc/1.4.0`
  (`df6f0cc`) is FINE — it's an ancestor of the current release/1.3.0, so it's
  not stranded; leave it. (v1.4.0 as a distinct checkpoint is gone — its scope
  shipped in v1.3.0 — but the tag itself points at real, contained history.)
- Delete the throwaway `develop` branch — but ONLY after confirming nothing
  unique is stranded on it. Verified 2026-07-20: the R4 anti-contamination fix is
  already extracted → release/1.3.0. **`spec-18-lesson-redesign-locking` (9
  commits) and `spec-19-streak-system` (16 commits) hold real future work and
  exist as their own branches** — those must survive develop's deletion (they
  will, they're independent refs). Salvage anything else off develop first, then
  delete.
- `app.json` splash plugin lacks the RN 5.6 `imageWidth` pin; a redundant
  top-level splash block remains. Minor prebuild hygiene.

---

## v1.1.1 — onboarding polish sprint

**Scope**: UX polish + one data-corruption bug from Mandeep's
prod-app testing on iPhone XR (2026-07-04).
**Not shipping until**: v1.1.0 is on the App Store and stable.
**Estimated total**: ~10-15 hours of focused work; ~1 week end-to-end.

Testing before merging v1.1.1:
- Fresh install on iPhone XR with a brand-new Apple ID
- Complete onboarding start-to-finish, verify every screen looks and behaves right
- Verify DB: no phantom child appears when you don't enter one
- Verify DB: name field is required and saved correctly
- Check onboarding funnel completion rate in PostHog before + after (compare with v1.1.0 baseline once collected)

### 1. Splash flash bug 🟡

For a split second before the splash screen shows up, the logo
appears super-huge across the screen with a green background behind
it.

**Fix**: iOS launch screen (`expo-splash-screen`) is showing the app
icon at wrong dimensions before React Native has mounted the JS
splash screen, or JS-side splash is racing the native one.
Investigation:
- Check `app.config.js` splash config for image dimensions
- Verify `SplashScreen.preventAutoHideAsync()` / `hideAsync()` are
  called at the right lifecycle points
- Verify `assets/splash.png` is the right size for iPhone screens

**Effort**: 1-2 hours (native-side debugging)

_(Note: the green-flash / huge-logo variant above was addressed by SPEC-16 R1.
The re-introduction issue below is a separate, still-open item.)_

### 1b. Logo "re-introduces itself" on reopen (gate-path polish) 🟡

**Reported 2026-07-19 (owner, on device).** Closing the paywall and
reopening the app shows the Kinderwell logo again for a beat before the
paywall — feels unprofessional / like a double-launch. Deferred from the
1.3.0 loading-screen work because the fix is on the **subscription-gate /
auth path** (INVARIANT #1: every path into Root goes through Loading; the
v1.1.0 sign-in bypass was a violation right here) and wasn't worth the risk
to rush at the end of a session.

**Root cause (investigated, not a visual mismatch):** the three glyph
stages — native splash → JS `SplashScreen` → `LoadingScreen` gate glyph —
already use the *identical* asset (`splash.png`), size (220px) and cream bg,
deliberately (SPEC-16). The seam is **structural/timing**, not visual: on a
returning signed-in launch the JS Splash still plays its full branded intro
(wordmark "Kinderwell" + "Your parenting journey starts here" + the 800ms
`SPLASH_MIN_DWELL_MS` dwell) before re-mounting into the gate glyph. That
branded re-intro is the "logo again" feeling.

**Proposed fix (the careful version):** for a *returning signed-in* user,
skip the branded wordmark + dwell so it reads native-splash → gate → paywall
as one continuous glyph; first-time users keep the full brand intro.
Optionally also tighten `GATE_REVEAL_DELAY_MS` (400ms) so Splash→Loading has
no perceptible beat.

**Constraints / do NOT:** don't change *whether* signed-in users route
through Loading (that's the gate). Only the branded-intro presentation may be
conditionally skipped. Verify after: unsubscribed signed-in reopen still hits
the paywall; `grep "replace('Root')"` still only in LoadingScreen.

**Effort**: ~2-3 hours + on-device verification. Needs its own focused pass,
not a tail-end change.

### 2. Splash vs "Get Started" screens look identical 🟡

No sense of progress. User sees the same visual, feels like the app
is hung, not moving forward.

**Fix ideas**:
- Add subtle transition (fade, scale, motion)
- Make "Get Started" screen visually distinct — different layout,
  different animation, or a proper welcome hero
- Or eliminate the redundant screen entirely

**Effort**: 1-2 hours

### 3. "Who are you parenting as" screen copy 🟡

"The next few questions help us personalize blah blah" reads as
placeholder text.

**Fix**: rewrite copy to sound like the rest of the app, or remove
the intro line entirely; the question itself tells the story.

**Effort**: 30 min

### 4. "Let's personalize this for you" screen 🔴 + 🟡

**4a. Keyboard auto-loads 🟡**
Aggressive UX. Investigate: is `autoFocus={true}` on the TextInput?
Remove it OR ensure the Continue button is visible.

**4b. Continue button not visible 🟡**
User can't see Continue until they fill in the field and tap Done.
Use `KeyboardAvoidingView` properly OR make the Continue button
float above the keyboard.

**4c. Name field is optional but shouldn't be 🔴**
We're missing data on a lot of users. Make Name required. Update
the field label. Update onboarding data validation to require it.
Existing users with null name are fine — don't rewrite history.

**Effort**: 4b + 4c bundled with the theme-A footer fix (~2-3
hours total across screens). 4a: 15 min.

### 5. Age input is tedious 🟡

The +/- stepper requires too many taps. Someone who's 34 taps
30+ times.

**Fix ideas** (pick one):
- Text input with numeric keyboard, validate range
- Wheel picker (iOS-native)
- Preset buttons: "Under 25", "25-34", "35-44", "45+"
- Skip the age question entirely if it's not driving personalization

**Data question**: what are we actually using `age` for? If it's
not feeding personalization or analytics segmentation, we might
not need it at all. Cutting a question improves completion rate.

**Effort**: 2-4 hours (UI decision + implementation)

### 6. "What feels hardest right now" — Continue button hidden by scroll 🟡

Button doesn't show unless you scroll down. "Scroll for more
options" text looks out of place.

**Fix**: make Continue sticky at the bottom. Remove the "Scroll
for more options" hint. Verify on iPhone XR (smaller viewport).

**Effort**: bundled with 4b footer fix

### 7. "How have you been feeling lately" — same scroll problem 🟡

Same fix as #6. Audit ALL onboarding screens for this class of
bug and fix them in one pass. Consistency > per-screen fixes.

### 8. Phantom "boy" child bug 🔴 (data corruption)

Even when users don't input any child information, the onboarding
data table gets a "boy" child added. We're recording something
the user didn't tell us.

**Investigation first**:
- Check `onboardingStore.children` default value in the Zustand
  store
- Check `saveUserOnboardingData` — does it push a placeholder child
  if the array is empty?
- Check the children screen UI — does it pre-populate a "boy"?
- Query prod for how many users have exactly one "boy" child with
  no other data — sanity check on prevalence

**Fix**: children array must reflect exactly what the user
entered. Empty = empty. No defaults.

**Effort**: 1 hour investigation + 30 min fix

### 9. Cross-cutting themes (design decisions, not per-screen fixes)

**Theme A: Continue button visibility.** Multiple screens have
Continue buttons hidden behind the keyboard or below the fold.
This is a design-system problem — the onboarding navigation footer
should be a standard component that's always visible whether
keyboard is up or not.

**Theme B: iPhone-small-screen QA gap.** Screens tested fine on
iPhone Pro simulators (bigger) but break on iPhone XR (smaller
viewport, older aspect ratio). Add "test on iPhone XR (or
SE-class simulator)" to RELEASE_CHECKLIST.

**Theme C: Placeholder copy leaked into prod.** "blah blah" style
copy suggests team was iterating in staging and some leaked. Add
copy review as a pre-ship checklist item.

### 9n. Make NameAgeScreen name field required + delete 'Parent' fallback machinery 🟡

**Problem**: NameAgeScreen falls back to the literal string `'Parent'`
when the user leaves the field blank. That fallback then triggers a
two-layer defensive filter (`LoadingScreen.tsx` + `onboardingService.ts`)
to keep 'Parent' out of the DB. All of that machinery exists because
the field is optional and the fallback is a sentinel value.

**Context**: on 2026-07-05 we also removed the `authService.signInWithApple`
code that silently captured Apple's credential.fullName. That means brand-new
Apple users who leave the NameAgeScreen field blank now end up with
`name = null` in the DB (previously would have been the Apple name,
which felt invasive to end users). Honest, but suboptimal.

**Fix**: make the name field on NameAgeScreen required.
- Remove the `'Parent'` fallback default in NameAgeScreen state.
- Disable the Continue button until a non-empty name is entered.
- Delete the two-layer filter in LoadingScreen.tsx (`nameToSave` logic)
  and onboardingService.ts (`name === 'Parent'` filter).
- Update any tests or docs referencing 'Parent' as a sentinel.

**Effort**: ~30 min. Small change; the tricky part is auditing every
place that reads `name` to make sure they handle a required-non-empty
string correctly (they should — nothing today special-cases empty).

**Blocks**: nothing today. UI polish + code simplification. Ship
whenever comfortable in v1.1.1 or later.

**Origin**: user directive 2026-07-05 during on-device Section 12
testing — after seeing their Apple name in the DB despite leaving
onboarding blank, flagged that it "will spook people out regarding
privacy." Correct read. The Apple-name capture was removed
immediately (2026-07-05 commit); this backlog item is the code
simplification that becomes possible once the field is required.

### 9o. Configure PostHog internal / test user filter 🟢

**Problem**: PostHog dashboards have a "Filter out internal and
test users" toggle that currently filters nothing — no test users
are tagged as internal. Every test session (the owner's test
account, sandbox testers, TestFlight users) currently pollutes prod
funnels once we ship. Blast radius is small (dev events are already
tagged `environment: dev` so filtering by that gives clean prod
funnels), but it's annoying whenever anyone opens PostHog and
forgets to add the environment filter.

**Complication**: Apple anonymizes user data at the OS / OAuth
level for many users. Specifically:
- **Sign in with Apple** — users can choose "Hide My Email,"
  which gives us `xxx@privaterelay.appleid.com` instead of a real
  email. That relay email is stable per user + app but doesn't
  identify anyone we already know.
- **Regular App Store signups** — email is entirely between the
  user and Apple; we only know what they chose to share via
  Sign in with Apple or via Google Sign In.

So the naive fix ("mark any user whose email ends in
@kinderwell.com as internal") only catches users who explicitly
handed us a matching email. It does NOT catch:
- Anyone who tests with an anonymized Apple relay email
- Anyone who signs in with a personal Google account for
  testing
- The @privaterelay.appleid.com Apple reviewer signups

**Fix (two parts)**:
1. Configure PostHog Settings → Project Settings → "Internal and
   test users" with rules for:
   - Specific known distinct_id UUIDs (add your own test users
     as they appear — `24faa206-...`, `b18d3d48-...`, etc. from
     2026-07-05 session)
   - Email domain matches (@kinderwell.com etc.)
2. On the app side: emit an explicit `is_internal` person
   property when a known-internal identity signs in. Options:
   - Hard-coded list of Apple user IDs / Google emails for the
     Kinderwell team
   - Check for an env-var or feature flag like `KINDERWELL_TEAM`
     and set `$is_internal: true` in the PostHog identify call
   - Whenever we activate demo mode (7-tap), set
     `$is_internal: true` — reviewers ARE internal-adjacent
     traffic, and this catches most Apple Review sessions

**Effort**: ~30 min for dashboard config + 1-2h for the app-side
identity-based flagging.

**Blocks**: nothing; the environment tag already keeps prod
funnels clean if you remember to filter by it. This is quality-of-
life so we can view "all events" without pollution.

**Origin**: user observation 2026-07-05 during PostHog verification
— noticed the internal-user filter did nothing to their own test
sessions. The Apple email anonymization nuance is the reason a
simple email-domain filter isn't sufficient.

### 9m. In-app edit of onboarding answers 🟡

**Problem**: Settings currently has no way for a user to correct
or update their onboarding answers (parent type, age, children's
age ranges, goals, etc.) without deleting the account and starting
over. The privacy policy was quietly overpromising this ("They can
update it any time within the app") until the Fable re-review
2026-07-05 caught the mismatch. The policy has been amended to
say "email us to update" and "in-app editing planned for a future
release" — but this only makes the mismatch honest, it does not
close it.

**Why it matters now that the policy is honest**: users may email
kinderwellteam@gmail.com asking for corrections, and there's no
workflow for handling that beyond hand-editing DB rows in the
Supabase dashboard. Once we have more than 3 friends using the
app, that becomes a real support-ticket sink.

**Fix**: build an Edit-Profile section in Settings that lets the
user re-visit each onboarding screen and update their answers.
Reuse the onboarding-store setters and the same field validation
as onboarding itself. Should NOT reset lesson progress or
subscription state — this is a data-correction feature, not a
reset.

**Effort**: ~4-6 hours. Not conceptually hard; touches ~10 screens
plus the store. Wire each onboarding screen so it can be launched
in "edit" mode (return-to-Settings on save, no navigation to the
next onboarding screen).

**Blocks**: nothing user-facing today; becomes near-blocking the
moment we receive our first "please update my info" email.

**Origin**: Fable re-review 2026-07-05 privacy-policy audit
follow-up. Policy amendment landed on the kinderwell-legal repo
(commit `6d85d95`); this is the code side of the same fix.

---

## v1.1.1+ or v1.1.2 — deferred from prod bug hunt

### 9b. Clear ESLint warning backlog 🟢

Adding ESLint (Fable 🟡) originally surfaced roughly two hundred
warnings — mostly
`@typescript-eslint/no-unused-vars` (destructured-but-unused
callback args), `react-hooks/refs` (`useRef(new Animated.Value(0)).current`
pattern), and `react-hooks/exhaustive-deps` on animation effects.
None are errors; CI catches new errors but tolerates the warning
baseline.

**Update (2026-07-10):** most of that volume lived in the duplicated
lesson screens under `src/screens/sprinklers/` etc. — SPEC-09/SPEC-13
deleted them (data-driven engine + hub consolidation), so the baseline
dropped to **~107**. The remainder is the residual animation-ref /
exhaustive-deps pattern in the surviving onboarding + component screens.

Standalone cleanup (before or after that refactor):
- Delete truly unused imports flagged by unused-vars
- For `useRef(new Animated.Value(0)).current`, decide once whether
  to keep the pattern (and add an eslint-disable-next-line + rule
  suppression) or switch to `useRef(...).current` reads inside
  handlers only

**Effort**: 1-2 hours if done standalone; ~0 hours if done as
part of the lesson refactor (they collapse together).

**Blocks**: nothing. This is hygiene.

### 9c. Navigator param typing 🟢

**Problem**: `RootStackParamList` / `OnboardingStackParamList` /
`LessonStackParamList` are typed, but a few navigator params use
`as any` casts (see `SprinklersSec2Screen10.tsx:29` for the pattern:
`navigation.navigate('EmotionalSandbagsLesson' as any)`). Every
`as any` bypasses the compile-time check that would catch a rename
or a missing route.

**Fix**: grep for `navigation.navigate.*as any` and
`navigation.replace.*as any` across `src/screens/`. For each
occurrence, either add the missing route to the correct ParamList
or fix the caller. When done, add an ESLint rule barring
`as any` on navigation calls so nothing regresses.

**Effort**: ~20-30 min (small tree, most casts are drive-by).

**Blocks**: nothing. Hygiene, but real value — a renamed screen
today would compile clean and crash at runtime.

**Origin**: Fable review 🟡 (last subitem of the "small dedupe
batch"; sign-in dedupe + AsyncStorage keys already done).

### 9d. Finish branch protection on GitHub — CLOSED (risk-accepted)

Moved out of the work queue: mechanical branch protection is a paid
GitHub feature on private repos and the owner decided (2026-07-10) to
skip it. See `OPS_STATE.md` → "Accepted risks" ("No mechanical
merge-blocking on main") for the decision, the compensating controls
(PR-triggered CI + never-merge-on-red), and the revisit trigger (a
GitHub Team upgrade). Each risk lives in exactly one place.

### 9e. Fold adversarial tests into RELEASE_CHECKLIST permanently 🟡

**Problem**: The adversarial tests captured in
`docs/IPHONE_TEST_PLAN_V1.1.0.md` (never-used-credentials sign-in,
delete-account >1h after sign-in, demo-mode 7-tap, post-onboarding
DB row inspection, small-screen pass) currently live only in that
per-release doc, which is scheduled for archival post-merge.
Post-archive, no ongoing check captures them.

**Partial credit**: Phase 7.5 (Superwall dashboard checks) and
Phase 8.3 (mandatory UPGRADE test) already exist in
RELEASE_CHECKLIST. The rest don't.

**Fix**: pull each surviving adversarial check from
IPHONE_TEST_PLAN_V1.1.0.md into RELEASE_CHECKLIST Phase 2 or Phase
8. Then archive the per-release doc without losing the tests.

**Effort**: ~30 min.

**Blocks**: nothing today, but risks a regression if a v1.1.1
release skips one of these checks because they weren't visible in
the canonical checklist.

**Origin**: Fable review 🟡 docs/process bucket.

### 9f. First Jest unit tests 🟡

**Problem**: Zero test coverage. Reviewer flagged three specific
targets where a single test would prevent a whole category of
regression:
1. `isBelowMinimumBuild` in `src/lib/appConfig.ts` — the kill
   switch calc. Test the cap boundary (build >= CAP refuses to
   force-update), zero-currentBuild guard, and the min-supported
   check.
2. `hasUserCompletedOnboarding` in `src/services/onboardingService.ts`
   — the discriminated union `{ status: 'has'/'no'/'error' }`. Test
   that the error branch is hit on network failure (the exact
   Fable review #2 regression).
3. `LESSON_NAV` coverage in `src/config/lessons.ts` (or wherever
   the map lives) — assert every lesson id in the constants map
   to a real route in the navigator. Catches the "lesson 10 is a
   placeholder" class of divergence.

**Fix**: install Jest + `@testing-library/react-native`; write the
three tests above; wire `npm test` into CI.

**Effort**: ~2-3 hours. Most of it is infra setup (Jest config for
Expo, mocking AsyncStorage + Supabase). Once the harness exists,
new tests are cheap.

**Blocks**: nothing, but every future 🟡 in this bucket is easier
with a test harness in place.

**Origin**: Fable review 🟡 quality/testing bucket.

### 9g. Script prod DB pushes ✅ DONE (2026-07-11)

**Status: shipped.** `scripts/db-push-prod.sh` exists and was used to apply the
v1.2.0 migrations to prod on 2026-07-11: typed confirmations, mandatory
same-day backup first, dry-run + second confirmation, and an unconditional
re-link-to-dev trap on every exit path (verified it fires on abort/error).
Original description retained below for context.


**Problem**: `supabase db push --linked` hits whichever project the
CLI was last linked to. The prod procedure is "the same command
plus 'remember to re-link'." One forgotten re-link = a dev
migration silently applied to the revenue DB.

**Fix**: `scripts/db-push-dev.sh` and `scripts/db-push-prod.sh`
with:
- Explicit `--project-ref` per script (no reliance on link state)
- `db-push-prod.sh` requires typed confirmation (`echo "type PROD-<date> to confirm"`)
- `db-push-prod.sh` runs `--dry-run` first, prints the diff,
  requires a second confirmation before the real push
- Both re-link back to dev at exit (defensive)

**Effort**: ~1 hour.

**Blocks**: nothing today, but every prod migration is currently a
manual invocation that could go wrong. This makes it structurally
safe.

**Origin**: Fable review 🟡 environment/infra bucket.

### 9h. Pre-migration prod dump ✅ DONE (2026-07-11)

**Status: shipped** — `scripts/backup-prod.sh` writes timestamped
`backups/prod_<ts>_{schema,data}.sql` and is wired into `db-push-prod.sh`
(no prod push without a fresh dump). **Correction to the original "Fix"
below:** it does NOT use `supabase db dump` — that runs pg_dump inside
Docker (~1GB daemon dependency), which blocked a Docker-less machine mid
prod-push on 2026-07-11. It now calls **`pg_dump` directly** (postgresql@17
keg; no Docker), using `PROD_DB_URL` from the gitignored `.env.prod`.
First real prod backup taken 2026-07-11. Pro-tier automated backups remain
the better long-term fix (see below). Original description retained for
context.


**Problem**: Prod has no automated backups (Supabase Free tier).
No down-migrations either. A migration that breaks something has
literally no recovery path — the phased-release + kill switch buy
us time but can't undo data corruption.

**Fix**: `scripts/backup-prod.sh` running `supabase db dump
--project-ref zqwzdyjfxytvedghujsd --data-only --schema-only` (or
whatever the correct incantation ends up being) into a timestamped
`.sql` file. Wired into `db-push-prod.sh` from item 9g — never
push to prod without a fresh dump.

**Blocked on**: Supabase Pro tier for their built-in daily
backups is a better fix. If we're paying for Pro anyway (custom
OAuth domain — item #18 — needs it), we get backups included and
this script becomes a belt-and-suspenders addition rather than the
sole line of defense.

**Effort**: ~1 hour for the script; the Pro-tier upgrade is a
billing decision, not engineering work.

**Blocks**: nothing today but expands the "cliff" — a bad prod
migration currently has no undo.

**Origin**: Fable review 🟡 environment/infra bucket.

### 9i. Rotate prod DB password — CLOSED (risk-accepted)

Moved out of the work queue: this is now a standing **accepted risk**,
not open work. See `OPS_STATE.md` → "Accepted risks" ("Prod DB
password never rotated") for the decision + revisit trigger. Each
risk lives in exactly one place; this is the pointer.

### 9j. PostHog person-delete on account deletion 🟡

**Problem**: When a user deletes their account, the Supabase row is
gone, but the PostHog "person" (identified by user ID) persists
indefinitely with all their onboarding answers and event history.
The privacy policy claims a clean delete; PostHog data is a
lingering violation.

**Fix**: PostHog exposes a delete-person endpoint that requires a
personal API token (different from the ingestion key). Steps:
1. Generate a PostHog personal API token, store as a Supabase
   Edge Function secret.
2. Extend the `delete-account` Edge Function (or add a new one)
   to call PostHog's delete-person API with the deleted user's id.
3. Handle the failure case gracefully — PostHog outage should not
   block the Supabase delete (already-succeeded above it in the
   flow).

**Effort**: ~2-3 hours. Not conceptually hard, but touches an
Edge Function that already ships to prod and has been reviewed
for correctness — testing needs care.

**Blocks**: nothing user-facing, but the privacy policy currently
overpromises. Ideally close before we get a DSAR/GDPR request
about it.

**Also fold in**: PostHog person-property cleanup for users whose
email was leaked into person properties by the
`authStore.initialize()` bug that lived on this branch until commit
`7c75ad5` (2026-07-05). Every signed-in user across the life of the
bug has `email` set on their PostHog person; when we add the
person-delete API integration, use the same personal API token to
run a one-time "remove email property from all existing persons"
sweep. Fable re-review 2026-07-05.

**Origin**: Fable review 🟡 security bucket; re-review 2026-07-05
added the historical-cleanup ask.

### 9k. Encrypt the Supabase session (SecureStore for refresh token) 🟡

**Problem**: Supabase session (access + refresh token) is currently
stored in AsyncStorage, which is unencrypted on iOS and Android.
Any process with app-container filesystem access reads the refresh
token in plaintext. iOS sandbox mitigates casual attack, but
jailbroken devices, malicious debug builds, and future backup
extraction all recover the token.

**Fix**: swap AsyncStorage for `expo-secure-store` as the Supabase
client's storage adapter. Migration path is delicate:
- Users updating from the current build have a session in
  AsyncStorage — must be read once, copied to SecureStore, then
  the AsyncStorage entry deleted. Otherwise every existing user
  gets kicked to sign-in on upgrade.
- Test the failure modes: SecureStore full, SecureStore denied on
  first launch, biometric prompt if enabled.

**Effort**: ~4-6 hours. Small code change, big test surface. Best
shipped in its own dedicated release with heavy TestFlight
coverage — do NOT bundle with a feature release.

**Blocks**: nothing today. The current threat model is "casual
attacker on unrooted device" which AsyncStorage sort of survives.
This closes the "device-image extraction" and "jailbroken device"
gaps.

**Origin**: Fable review 🟡 security bucket.

### 9l. DEV_PROD_ENVIRONMENTS.md drift audit ✅ (done — `e120245`)

**Status**: The release-workflow section — the drifty part — was
stubbed with a pointer to `RELEASE_CHECKLIST.md` in commit `e120245`
(2026-07-05), prompted by Fable re-review pre-flight punch list item
3. That commit removed ~120 lines of duplicated release-phase prose
and replaced them with a stub that explicitly names each way the
duplicated content was unsafe (including the `SHOW_DEMO_BUTTON=true`
landmine the reviewer flagged).

**Why stub instead of reconcile**: Any future edit to a reconciled
section would immediately re-drift because both docs live in the
same repo and neither is authoritative until this stub call. Making
one file the canonical source for release procedure removes the
drift permanently.

**What still lives in DEV_PROD_ENVIRONMENTS.md** (correctly owned
here, not release-workflow):
- Bundle IDs, env detection, structural guards
- Schema migration mechanics + backward-compat rules
- Kill switch operation + rollback plans
- Edge Function deploy commands
- Danger zone list

**Original problem statement** (kept for history): backup /
kill-switch procedures were partially duplicated across
DEV_PROD_ENVIRONMENTS.md, RELEASE_CHECKLIST.md, and
BEST_PRACTICES.md; if one got updated, the others silently rotted.
The release-workflow stub fixes the biggest offender; smaller
kill-switch / backup duplication surfaces are still worth a
follow-up sweep if drift ever bites, but is now a low-priority
BACKLOG item rather than a v1.1.0 punch-list one.

**Origin**: Fable review 🟡 docs/process bucket.

### 10. Revisit removing 7-tap demo mode (Fable review #13)

**Context**: The 7-tap gesture on AuthScreen's "Save your progress"
title activates demo mode. Fable review flagged this as a Guideline
2.3.1 concealment risk. Kept for v1.1.0 because:
- Kinderwell only supports OAuth (Sign in with Apple / Google) — no
  email/password field for the reviewer credentials Apple typically
  expects
- Prior submissions have shipped with 7-tap and been approved
- Removing it while making 14+ other v1.1.0 changes concentrates
  risk

**Decision for later releases**: revisit whether to remove the
7-tap once we have PostHog data on demo-mode activation volume
in prod.

**What to monitor**: check PostHog for the `demo_mode_activated`
event count. Filter by `$app_version = <latest>` +
`environment = prod`. Expected: 1-5 activations/week (Apple
reviewers only). **Threshold: ~20 activations/week** — above that,
the gesture has been discovered by end users and we should remove
it before Apple notices in review. This check is now on the
`RELEASE_CHECKLIST.md` "Between releases — recurring hygiene"
weekly list so it actually happens rather than living only in this
BACKLOG entry.

**Rip-out triggers** (revisit whichever fires first):
1. `demo_mode_activated` weekly count crosses ~20 in prod.
2. Apple raises 2.3.1 concealment concern in any submission review,
   even if the count is still low. Reviewer discretion is the
   binding constraint, not our internal threshold — one 2.3.1 flag
   means the gesture is unsafe to keep going forward.
3. We ship a real reviewer-credentials path (sandbox purchase docs
   plus successful reviewer feedback that it worked). Trigger 3 is
   the "we no longer need the fallback" case.

Fable re-review 2026-07-05 flagged that trigger 2 was in our
Response block in `FABLE_LATEST_REVIEW.md` but had never made it
into this BACKLOG entry — now included.

**When we do remove it**: update Apple Review Information to
remove the fallback path, keep only the sandbox-purchase primary
path. See `docs/DEMO_MODE.md` and `docs/RELEASE_CHECKLIST.md`
Phase 9 for the current dual-path text.

**Code cleanup on removal**:
- `src/screens/onboarding/AuthScreen.tsx` — remove
  `handleTitlePress` and the 7-tap state machine
- `src/store/authStore.ts` — remove `setDemoUser`, `isDemoUser`
  field, all demo-user branches
- `src/hooks/useLessonGate.ts` — remove the `isDemoUser`
  short-circuit
- `src/App.tsx` — remove the demo-user branch in
  `onSubscriptionStatusChange`
- Any other `isDemoUser` reference (grep to find)

**Effort**: ~1-2 hours code + 30 min App Store Connect notes
update

### 11. Lesson 10 (Helping Someone Process Emotions) is a placeholder

The live `HelpingSomeoneProcessEmotionsLessonScreen.tsx` renders
its sub-lessons as static `<View>` cards with "Coming Soon"
badges. No `onPress` handler, no navigation into lesson content.
Users who tap lesson 10 from LearnScreen get a marketing page and
can only go back.

**Context**: the full implementation existed in
`HelpingProcessEmotionsLessonScreen.tsx` (deleted 2026-07-04 as
dead code per Fable review #4). That file had 4 real sub-lessons
wired to LessonFlow navigation. Someone registered the placeholder
as live and orphaned the working file.

**Options**:
- (a) Accept placeholder as intended — update the LearnScreen card
  to say "Coming Soon" too so users don't feel bait-and-switched
- (b) Recover the deleted file's sub-lesson launcher logic from
  git history (commit `fa27f90`'s parent or earlier) and copy it
  into the live file so lesson 10 has real content

Current behavior matches prod v1.0.0 — this refactor didn't
regress anything, it just didn't fix it.

**Effort**: (a) 15 min. (b) ~1 hour.

**Fable re-review 2026-07-05 recommendation**: do option (a) BEFORE
external TestFlight beta, not after. Reasoning: internal beta with
3 Homies is fine because they know the app's state, but external
testers seeing a full lesson card that opens to "Coming Soon" reads
as bait-and-switch. Preempt with a "Coming Soon" label on the
LearnScreen card itself so nobody feels lied to. Option (b) is a
follow-up for v1.1.1 or later — actually shipping the content.

### 12. Lesson progress synced to Supabase — DONE (SPEC-13)

Superseded. `lessonProgressService.ts` is no longer dead code — SPEC-13
wired it as the account-scoped sync layer behind the
`createProgressStore` factory (local-first write + background DB upsert;
sign-in union-merge). The `lesson_progress` table gained a
`completed_sections` column and is populated. The two residual
refinements from the 2026-07-10 review live at #23 (union-before-push)
and #24 (missing `lesson_completed` derivation test). See those.
build later.

### 13. Notifications feature not implemented 🟡

Onboarding asks users if they want notifications. Preference saved
to `user_profiles.notifications_enabled`. But no code path anywhere
in the app actually schedules or sends any notification.
`expo-notifications` isn't imported for scheduling anywhere.

Every user in prod has been asked about notifications, said yes or
no, and never received any.

**Options**:
- Build the feature (schedule daily/weekly reminders based on
  preference). Not trivial — requires push notification server-side
  setup, deep-link handling on tap, permission timing.
- Remove the question from onboarding entirely so we're not
  dishonestly asking about a feature that doesn't exist.

**Effort**: build → 1-2 days. Remove the question → 30 min.

### 14. Alert.alert() error message rework 🟡

~14 different failure modes in the app all use the same
`Alert.alert("[X] Failed", "[Y] could not be completed. Please try
again[ or contact support]")` template. None tell the user what
actually went wrong, what to do about it, or how to escalate.

**Fix ideas**:
- Categorize errors: network / server / provider / user-cancelled /
  auth-expired
- Inline errors near the button that triggered them, not modal
  alerts (looks less like a crash)
- On repeat failures, offer a "Report this to support" button that
  copies the error object + a correlation ID for our Sentry logs
- Standardize the copy: "Something went wrong on our end" for
  server errors vs "Check your connection" for network errors

**Effort**: pattern is systemic, needs design pass, not a
per-alert fix. Multi-day.

### 15. Delete old / dead code 🟢

Dead-code paths surfaced during v1.1.0 work — corrected after the
2026-07-10 audit (some earlier entries were wrong):
- `ChildrenGenderScreen.tsx` — registered as a route (`OnboardingNavigator`),
  but nothing navigates to it. Genuine dead route.
- The dead `showPersonalization` toggle inside `ChildrenCountScreen`
  (commented out but the state variable + section still exist).
- ~~`lessonProgressService.ts` unused~~ — WRONG now: it's the SPEC-13 sync
  layer (see #12).
- ~~`updateChildGender` never called~~ — WRONG: it IS called from
  `ChildrenCountScreen.tsx:~202` (the gender picker). Keep the action.

**Fix**: delete only the confirmed-dead route (ChildrenGenderScreen) +
the dead `showPersonalization` toggle. TypeScript will catch anything
that actually needs the removed code.

**Effort**: ~20 min

### 16. Section 4: Data integrity checks not fully covered 🟢

The bug hunt Section 4 was mostly deferred:
- 4.2 (progress persistence) → covered by item #12 above
- 4.3 (cross-device sync) → needs a second device or e2e test
  harness
- 4.4 (edit onboarding answers) → does Settings even have
  edit-profile options? Not audited. Small check to add to v1.1.1
  test list.

### 17. Family Sharing subscription 🟢

Not tested. Needs a second Apple ID that's a family member of the
purchasing Apple ID. Defer to a real family testing setup or the
first customer complaint.

---

## v1.2.x — long-horizon improvements

### 18. Custom OAuth domain for Supabase auth callback 🟡

iOS's OAuth system dialog shows `supabase.co wants to sign in`
when a user taps Continue with Google. It reads as an unfamiliar
third-party domain to the user; even trust-conscious users will
pause.

**Fix**: Configure a Supabase custom auth domain (e.g.
`auth.kinderwell.com`) that CNAMEs to Supabase's callback
endpoint. After DNS + Supabase cert verification propagates, the
iOS dialog reads `kinderwell.com wants to sign in`.

**Requires**:
- Supabase Pro tier (custom domains are a paid feature; check
  current pricing before assuming this)
- DNS control of kinderwell.com (or wherever you host)
- Cert validation (Supabase handles issuance, we handle the DNS
  challenge)

**Effort**: ~30 min once Pro tier is confirmed and DNS is
available. Coordinate with any downstream config that references
the current Supabase callback URL (Google Cloud Console iOS
client redirect URIs, Apple Sign In service redirect URIs — both
would need the new domain added). See
`docs/DEV_PROD_ENVIRONMENTS.md` for the current callback URL
inventory.

### 19. Enable Supabase manual identity linking 🟡

When a user signs up with Apple Private Relay
(`xxx@privaterelay.appleid.com`) and later tries Google (with
their real email), Supabase can't auto-link the accounts because
emails don't match. Second account created; progress +
subscription orphaned.

**Fix**: Enable Manual Linking in the Supabase Auth dashboard so
we can call `linkIdentity({provider: 'google'})` from a support
flow. The v1.1.0 hint on AuthScreen ("Use the same option you
signed up with") prevents most cases, but the rare users who still
hit this need a support-side merge path.

**Requires**:
- Toggle Auth → Manual linking in Supabase dashboard (30 sec)
- A "Trouble signing in?" flow in-app OR a manual support process:
  the user contacts support, we verify identity (email
  confirmation, subscription receipt), then merge accounts via
  `linkIdentity()` server-side

**Effort**: ~30 min to enable + basic support runbook. Full
in-app "Trouble signing in?" UX is ~1 day.

**Blocks**: Nothing today. Only becomes urgent when we start
getting support tickets about "lost my subscription" from Private
Relay users.

### 20. Paywall UX polish (post-mandatory-fix) 🟡

**Not blocking v1.1.0.** The Phase 7.5 pre-submission check in
`RELEASE_CHECKLIST.md` forces us to add a dismiss control before
every Apple submission — the 3.1.2 rejection vector. This item is
the followup polish AFTER that mandatory fix lands.

**What to iterate on later**:
- Paywall design: current template ("Become the parent you want to
  be") could probably convert better with A/B testing on headline,
  imagery, price framing
- Consider a soft "not now" / "continue with limited access" that
  actually returns the user to a limited-content home instead of
  just closing
- QUITTR-style hard-paywall vs current soft-paywall discussed
  earlier; not settled — user chose "same paywall for both
  placements" for v1.1.0
- The paywall's Restore Purchases label / placement may not be
  prominent enough — some users won't notice it exists

**Effort**: ongoing product work, not a bug fix.

**Blocks**: nothing.

### 21. Third-party project separation (Superwall / PostHog / Sentry) 🟡

**Problem**: All three third-party services (Superwall, PostHog,
Sentry) currently point at a single project each, shared by dev
and prod builds. Environment separation is done via runtime tags
(`environment: 'dev' | 'prod'`), which works for filtering
dashboards but has real blast-radius costs:
- A misconfigured dev build spamming events into shared PostHog
  briefly pollutes prod funnels until the environment filter is
  reapplied.
- A Superwall paywall template change in the shared dashboard
  affects dev and prod simultaneously — no staging environment
  for paywall copy changes.
- Sentry issues from dev builds show up in the prod issue list
  until filtered; on-call risk (probably low today since we don't
  really have "on-call").
- URL scheme collision: `kinderwell://` is claimed by both dev
  and prod bundle IDs on the same device — a dev build installed
  alongside prod can intercept OAuth callbacks meant for prod.

**Fix**: separate projects per service:
- Superwall: create a "Kinderwell Dev" application, wire the dev
  API key through eas.json's development/preview profiles only
- PostHog: create a "Kinderwell Dev" project (free tier is fine
  for dev volume), separate API key. Environment tag becomes
  redundant but harmless.
- Sentry: create a "kinderwell-dev" project. DSN split at build
  time.
- URL scheme: `kinderwell.dev://` for the dev bundle so the
  scheme registration doesn't collide.

**Effort**: ~4 hours. Not hard, just fiddly — every third-party
config drift becomes a new source of "why doesn't this work in
dev?" until it's stable.

**Blocks**: nothing today. Tag filtering is enough for a solo dev
serving a small user base. Becomes worth doing when either:
1. A misconfigured dev build actually pollutes a prod funnel /
   dashboard in a way that costs real triage time
2. We need paywall A/B staging separate from prod paywall changes

**Origin**: Fable review 🟡 environment/infra bucket, flagged as
"blast radius" — real separation was called out as v1.2 territory
even by the reviewer.

### 22. Session Replay via PostHog (deliberate v1.2 decision) 🟢

**Context**: PostHog supports mobile session replay in
`posthog-react-native`. Would let us watch back real user sessions
to understand paywall drop-off, onboarding confusion, and lesson-
completion patterns. Highly useful for a new app trying to learn.

**Not added in v1.1.0** because it's an expansion of what we
collect from users, and every prerequisite for shipping it
responsibly is nontrivial:

1. **Privacy policy update.** Current policy explicitly enumerates
   what we DO NOT collect. Session recording is exactly the kind
   of data that would surprise users. Requires an explicit
   disclosure section.
2. **App Store Connect App Privacy questionnaire update.** Would
   need to declare Screen Interaction data collection with new
   purposes.
3. **Masking configuration.** Every sensitive input must be
   masked BEFORE first release (Apple credential prompt, Google
   OAuth flow, NameAgeScreen input, any payment sheet). Getting
   masking wrong = a compliance incident (PII in replay logs).
4. **App Store review scrutiny.** Apple review has increasingly
   scrutinized session-recording apps. Not a rejection guarantee
   but a real added risk vector.
5. **Cost.** Session replay volume is a real PostHog line item
   at scale. Zero cost on day 1, real cost at 10k+ users.

**Fix**: dedicated v1.2 release:
- Enable `posthog-react-native` session replay in config
- Author a masking-rules audit — every sensitive UI element gets
  `sensitive` prop or global masking rule
- Update `legal/privacy.html` with a session-recording disclosure
  section
- Update ASC App Privacy → declare Screen Interaction data
- Test masking end-to-end in TestFlight before shipping
- Communicate change to existing users (in-app modal on first
  launch of v1.2)

**Effort**: ~1-2 days total (mostly the audit + privacy work,
not the SDK toggle).

**Blocks**: nothing. Currently we have PostHog event analytics
(which is enough for funnel + retention). Session replay is
"nice to have" not "essential."

**Origin**: user asked 2026-07-05 during pre-build verification —
"we didn't add session recording?" Deliberate omission rather
than an oversight; documented here so future-us doesn't reflexively
enable it without doing the work first.

---

### 23. Progress sync — union-before-push 🟡

**Problem**: (from the 2026-07-10 SPEC-FIX-03 review.) The
per-completion background sync pushes the raw LOCAL completed-set.
In a narrow window — a fetch-error at sign-in + cross-device
divergence + activity before the next successful merge — it can
shrink a remote row and flip `completed` true→false. The SPEC-FIX-03
R1 fix made the SIGN-IN merge abort on a fetch error, but the
per-completion push still writes the local view directly.

**Fix**: fetch-and-union (or a full merge) before EVERY push, not
only at sign-in — so a background push can never overwrite a remote
row with a stale local subset.

**Effort**: ~half a day (read-modify-write in the sync, or a DB-side
array-union; add a concurrency test).

**Blocks**: nothing shipping — the exposure is a narrow multi-device
window. Do before heavy multi-device usage.

### 24. Missing test — `lesson_completed` derivation 🟢

**Problem**: (from the 2026-07-10 SPEC-FIX-03 review.) No test
asserts the `lesson_completed` event's fire conditions: fires once,
only when the completed-set reaches the registry's section count,
never on re-completion. The logic (SPEC-FIX-03 R3) was verified by
review inspection; an automated test is still owed. The controller
isn't cheaply unit-testable today, so this needs either a small
extraction of the derivation or a render-test harness.

**Effort**: ~1-2h.

**Blocks**: nothing.

### 25. Post-release dependency refresh 🟡

**Trigger: AFTER v1.2.0 settles — explicitly NOT before v1.2.0.** (From the
2026-07-10 audit's decision items; a concrete instance of the parked
"Dependency cadence" track below.)

- `@sentry/react-native` 7 → 8 — touches the crash path; read the changelog +
  do a full device smoke test before/after.
- Expo SDK 54 → 57 — plan the upgrade (multi-step; regenerate native config,
  re-verify build + gate + lessons on device).
- `npm audit` transitive criticals — build-tooling only, advisory; review and
  bump where low-risk.

**Effort**: ~1 day across the three (Expo SDK is the bulk).

**Blocks**: nothing shipping. Do NOT bundle with v1.2.0 — a runtime-dep bump
just before a release is exactly the kind of change that adds review risk.

---

## Parked work (registry — persisted here because the planning folder is NOT backed up; this repo is the only durable store)

Each track is parked, not dropped. It starts on its stated trigger.

- **Notifications (local reminders)** — parked by owner 2026-07-10; starts on explicit owner go, after the owner decides the reminder shape. Full spec arrives with the go (SPEC-11).
- **Android launch track** — starts on product demand (SPEC-12).
- **Reusable app-template track** — parked until a second app is on the horizon.
- **Ratings prompt at section completion** — parked; ~1h at the engine's completion point whenever activated; never near paywall/escape hatch; 3 prompts/yr Apple cap.
- **Content OTA via EAS Update (feasibility spike)** — revisit after v1.2.0 ships.
- **Secret escrow + break-glass doc** — deferred by owner 2026-07-09.
- **PostHog dashboards** — after v1.2.0; blueprint arrives as `docs/ANALYTICS_DASHBOARDS.md`.
- **Dependency cadence / PostHog person-deletion / feature flags / env separation / rejection playbook / session replay** — trigger-gated: next dep scare or SDK bump · first DSAR · first risky feature · first dashboard near-miss · first mid-rollout rejection · (after the prior two).

---

## How to add items

- **Onboarding UX issue** → add to v1.1.1 section
- **Something we found during v1.1.0 work but deferred** → v1.1.1+
- **Something that needs Pro-tier, DNS, or another external
  dependency** → v1.2.x
- Keep entries short: problem, fix, effort, blocks. If effort is >1
  day or blocks another item, promote it to its own doc.
</content>
