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
are tagged as internal. Every test session (mandeepv98@gmail.com,
sandbox testers, TestFlight users) currently pollutes prod
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

Adding ESLint (Fable 🟡) surfaced ~200 warnings — mostly
`@typescript-eslint/no-unused-vars` (destructured-but-unused
callback args), `react-hooks/refs` (`useRef(new Animated.Value(0)).current`
pattern), and `react-hooks/exhaustive-deps` on animation effects.
None are errors; CI now catches new errors but tolerates the
warning baseline.

Most of the volume lives in duplicated lesson screens under
`src/screens/sprinklers/` and `src/screens/serveReturn/` — item
18 (v1.2 lesson data-driven refactor) will collapse those into a
few shared components, and the warnings vanish with them.

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

### 9d. Finish branch protection on GitHub 🟡

**Problem**: `.github/workflows/ci.yml` runs on every PR (typecheck,
lint, version-drift), but the main branch protection rule doesn't
require the jobs to pass before merge. A failing CI can be merged.

**Fix**: GitHub → Settings → Branches → main → edit rule → check
"Require status checks to pass before merging" and select
`typecheck`, `lint`, `version-drift`. No code change.

**Effort**: ~2 min in the GitHub UI.

**Blocks**: nothing. But leaving it unlocked means CI signal is
advisory rather than enforced.

**Origin**: Fable review 🟡 docs/process bucket.

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

### 9g. Script prod DB pushes 🟡

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

### 9h. Pre-migration prod dump 🟡

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

### 9i. Rotate prod DB password 🟡

**Problem**: The prod Supabase DB password has never been rotated
since prod was provisioned. Baseline security hygiene — even
without a specific exposure event, long-lived credentials increase
blast radius if something leaks later.

**Fix**: Supabase dashboard → Kinderwell prod → Database →
Settings → Reset database password. Update `.env.prod` and any
local scripts that reference the old password. Nothing in the app
runtime uses the DB password directly (client uses anon key), so
no code change.

**Effort**: ~15 min.

**Blocks**: nothing. Pure hygiene.

**Origin**: Fable review 🟡 security bucket. Deferred earlier in
the review pass — Mandeep chose to focus on ship-blockers first.

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

### 12. Lesson progress not synced to Supabase 🟡

`src/services/lessonProgressService.ts` has 7 functions querying
the `lesson_progress` table in Supabase — but **nothing in the app
calls any of them**. The service is 100% dead code, and the
matching `lesson_progress` table in Supabase is dead schema (empty
for every user).

Lesson progress today is stored per-lesson in AsyncStorage via
utility files like `src/utils/sprinklersProgress.ts`,
`src/utils/communicationMistakesProgress.ts`, etc. Each lesson has
its own storage key.

**Consequences**:
- Force-quit + reopen → progress survives (AsyncStorage persists) ✅
- Uninstall + reinstall → progress lost ❌
- Signed in on second device → no progress there ❌
- User buys new iPhone → starts over ❌

**Fix scope**:
- Modify each of the ~8 progress-tracking utility files to also
  write to Supabase (upsert into `lesson_progress` keyed on user_id
  + lesson_id)
- Add a hydration step on app launch that pulls the user's Supabase
  progress into AsyncStorage if it's more complete
- Handle the merge-conflict case (device has progress, so does
  server) with last-write-wins or a smarter merge

**Effort**: 2-3 hours. Prod has always worked this way; users on
the same device don't notice. Cross-device is a real feature to
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

Multiple dead-code paths surfaced during v1.1.0 work:
- `lessonProgressService.ts` — all 7 functions unused (see #12)
- `ChildrenGenderScreen.tsx` — registered as a route, nothing
  navigates to it
- `updateChildGender` action in onboarding store — never called
- The dead `showPersonalization` toggle inside `ChildrenCountScreen`
  (commented out but the state variable + section still exist)

**Fix**: grep for orphaned exports and delete. Reduces bug
surface. TypeScript will catch anything that actually needs the
removed code.

**Effort**: ~30 min

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

---

## How to add items

- **Onboarding UX issue** → add to v1.1.1 section
- **Something we found during v1.1.0 work but deferred** → v1.1.1+
- **Something that needs Pro-tier, DNS, or another external
  dependency** → v1.2.x
- Keep entries short: problem, fix, effort, blocks. If effort is >1
  day or blocks another item, promote it to its own doc.
</content>
