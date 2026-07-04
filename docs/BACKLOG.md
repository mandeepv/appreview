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

**What to monitor**: After v1.1.0 is live for ~2 weeks, check
PostHog for the `demo_mode_activated` event count. Filter by
`environment: prod`. Expected: 1-5 activations/week (Apple
reviewers only). If we see meaningfully more, the gesture has been
discovered by end users and we should remove it before Apple
notices.

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

---

## How to add items

- **Onboarding UX issue** → add to v1.1.1 section
- **Something we found during v1.1.0 work but deferred** → v1.1.1+
- **Something that needs Pro-tier, DNS, or another external
  dependency** → v1.2.x
- Keep entries short: problem, fix, effort, blocks. If effort is >1
  day or blocks another item, promote it to its own doc.
</content>
