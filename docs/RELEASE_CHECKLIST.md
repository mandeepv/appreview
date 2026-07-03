# Release Checklist

**Purpose:** the single ordered list of things to do when shipping a new version of Kinderwell. Use this every release, top to bottom, don't skip steps.

**Related docs:**
- [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) — the git tagging convention (referenced in Phase 4)
- [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) — dev/prod switching, kill switch, migrations
- [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md) — where the 3 version files live
- [`BEST_PRACTICES.md`](./BEST_PRACTICES.md) — ongoing gap tracking

---

## Phase 0: Decide

- [ ] What are you actually shipping? Write a one-line release note now, not later.
  - Bug fix only? → next patch (`1.1.0` → `1.1.1`)
  - New feature? → next minor (`1.1.0` → `1.2.0`)
  - Breaking user-facing change or major redesign? → next major (`1.1.0` → `2.0.0`)
- [ ] Is this a good time to ship? (Avoid Fridays if possible — Apple review + weekend response times = bad combo.)

---

## Phase 1: Build on dev

- [ ] Confirm `.env` points at dev — `cat .env | grep SUPABASE_URL` shows `xbkkjqvbsnroenqlqkmi`
- [ ] All schema changes for this release exist as migration files in `supabase/migrations/` (create with `supabase migration new <name>`)
- [ ] Migration files applied to dev via `supabase db push --linked` (currently linked to dev — verify with `supabase migration list --linked`)
- [ ] Do NOT touch prod DB during development
- [ ] If accidental test signups happened on prod, delete them from prod Supabase → Auth → Users

---

## Phase 2: Pre-release verification (on dev)

- [ ] **Backward-compat check:** if schema changed, install the currently-live app version (from TestFlight or previous build), point it at dev, verify it still works
- [ ] **Full flow smoke test on dev — Apple + Google both:**
  - Fresh sign-up → onboarding → paywall → sandbox purchase → complete a lesson → log out → log back in
- [ ] **Delete account flow works** (tests Edge Function)
- [ ] **Kill switch works on dev:** temporarily set `min_supported_ios_build` to 9999 in dev, launch dev app, verify force-update modal appears; reset to `0` after
- [ ] **Analytics events show up** in PostHog dashboard for the flows you tested

---

## Phase 3: Bump version numbers

All three files must match. Rules in [`VERSION_MANAGEMENT.md`](./VERSION_MANAGEMENT.md).

- [ ] `app.json` — `version` + `ios.buildNumber` + `android.versionCode`
- [ ] `ios/Kinderwell/Info.plist` — `CFBundleShortVersionString` + `CFBundleVersion`
- [ ] `ios/Kinderwell.xcodeproj/project.pbxproj` — `MARKETING_VERSION` + `CURRENT_PROJECT_VERSION`
- [ ] Sanity check — run:
  ```bash
  grep -E "\"version\"|buildNumber" app.json
  grep -A 1 "CFBundleShortVersionString\|CFBundleVersion" ios/Kinderwell/Info.plist
  grep "MARKETING_VERSION\|CURRENT_PROJECT_VERSION" ios/Kinderwell.xcodeproj/project.pbxproj | head -4
  ```
  All numbers should match.
- [ ] Build number is strictly greater than the last submitted to App Store Connect (bump even for rejected builds)

---

## Phase 4: Apply schema migrations to prod

**Highest-risk step. Slow down.**

- [ ] **⚠️ Backup reality check.** As of 2026-07-04, prod has NO automated backups (Free tier). If this migration breaks something in a way we can't roll forward, there is no recovery. Review the SQL one more time; make sure `--dry-run` output matches expectations exactly. See `BEST_PRACTICES.md` item #2 for the deferred-fix options.
- [ ] Confirm every SQL file in `supabase/migrations/` that's new since last release is backward-compatible (see [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Schema migrations — backward compatibility"). If it's a breaking change → STOP, refactor to expand-only.

**How to actually verify backward compat (do this, don't just say it's fine):**
- [ ] Install the CURRENTLY-LIVE App Store version of Kinderwell on your iPhone (from App Store, not TestFlight) — this is what most users are running
- [ ] Sign in with a test account
- [ ] Use the app normally — go through onboarding, complete a lesson, hit the paywall, etc.
- [ ] Verify no visible errors, no data corruption, no crashes
- [ ] **This is testing the OLD app against the NEW schema.** If the old app breaks, users on the old version WILL break the moment you push the migration.
- [ ] Only if the old app works cleanly → proceed.
- [ ] Link CLI to prod: `supabase link --project-ref zqwzdyjfxytvedghujsd`
- [ ] Dry-run to see what will apply: `supabase db push --linked --dry-run`
- [ ] Confirm the dry-run lists only the migrations you expect. If it lists something unfamiliar → STOP.
- [ ] Apply to prod during a low-traffic window: `supabase db push --linked`
- [ ] Verify: `supabase migration list --linked` shows both Local and Remote in sync
- [ ] **IMMEDIATELY re-link back to dev** so accidental follow-up commands hit dev, not prod:
  ```bash
  supabase link --project-ref xbkkjqvbsnroenqlqkmi
  ```
- [ ] **Verify prod still works** — open the currently-live App Store app on your phone, test the affected feature. If broken, roll back before submitting.

---

## Phase 5: Deploy Edge Functions to prod (if changed)

- [ ] `supabase link --project-ref zqwzdyjfxytvedghujsd`
- [ ] `supabase functions deploy <name> --project-ref zqwzdyjfxytvedghujsd`
- [ ] **IMMEDIATELY re-link back to dev** so accidental commands hit dev, not prod:
  ```bash
  supabase link --project-ref xbkkjqvbsnroenqlqkmi
  ```

---

## Phase 6: Rotate secrets if any were exposed

- [ ] Any DB password, service_role key, Apple JWT, Google OAuth client secret exposed in chat / commits since last release? If yes, rotate before shipping.
- [ ] Update `.env`, `.env.prod`, and `eas.json` production profile with new values

---

## Phase 7: Build for App Store

- [ ] Any new native module or bundle ID change since last build? If yes, run `npx expo prebuild --clean` first
- [ ] Build:
  ```bash
  eas build --profile production --platform ios
  ```
- [ ] Wait for build to complete. Do NOT submit yet.

---

## Phase 8: Test the production build

- [ ] Confirm build shows up in App Store Connect → Kinderwell → TestFlight → Internal Testing → **Homies** group (has 3 testers: `mandeepv98@gmail.com`, `kinderwelltry1@gmail.com`, `jacobf1607@gmail.com`)
- [ ] Install via TestFlight app on iPhone (auto-notification within ~10 min of successful upload)
- [ ] Full flow smoke test on real device — same list as Phase 2, but against prod backend
- [ ] Sandbox Apple ID signed in (`sandeepv98@gmail.com`) so real IAP is exercised, not real money
- [ ] Any test users created during this? Note them so you can delete post-approval

---

## Phase 9: Submit to App Store

- [ ] `eas submit --profile production --platform ios`
- [ ] Fill out App Store Connect submission:
  - What to test (TestFlight notes)
  - What's new (user-facing release notes)
  - Demo account credentials — reference [`DEMO_MODE.md`](./DEMO_MODE.md). Reviewer instructions: "On the 'Save your progress' screen at the end of onboarding, tap the title text 7 times consecutively to activate Demo Mode."
  - Screenshots up to date? If UI changed, update them
- [ ] **Version Release** section → select **"Manually release this version"** (NOT "Automatically release"). Prevents the app from going live the second Apple approves it — you'll click a button when YOU'RE ready (early morning, low-traffic window, after final smoke test on prod build).
- [ ] **Phased Release for Automatic Updates** section → toggle **ON** (**"Release update over a 7-day period using phased release"**). Apple auto-rolls out over 7 days — ~1% day 1, ~2% day 2, etc. If crashes / bad reviews spike in the first days, you pause the rollout and only ~10% of users saw the bad build.

### 9a: App Privacy questionnaire (App Store Connect → App → App Privacy)

This section MUST match `PrivacyInfo.xcprivacy` and `legal/PRIVACY_POLICY.md`. If they diverge, App Store review rejects. For **v1.1.0**, the current answers are outdated — the previous submission omitted PostHog and Sentry, and mis-stated children's data. **Update these before submitting v1.1.0.**

The exact data types to declare (matching what our app actually does — see `legal/PRIVACY_POLICY.md` for full context):

**Contact Info:**
- **Email Address** — Linked to user, NOT used for tracking. Purposes: App Functionality, Analytics. (Supabase auth, PostHog identify.)
- **Name** — Linked to user. Purposes: App Functionality. (From Google/Apple Sign-In.)

**User Content:**
- **Other User Content** — Linked to user. Purposes: App Functionality, Product Personalization. (Onboarding answers: user type, age, children's age ranges + gender, parenting styles, goals, challenges.)

**Identifiers:**
- **User ID** — Linked to user. Purposes: App Functionality, Analytics. (Supabase user id + PostHog identify.)
- **Device ID** — NOT linked to user. Purposes: Analytics. (PostHog anonymous events.)

**Purchases:**
- **Purchase History** — Linked to user. Purposes: App Functionality. (Superwall + Apple IAP subscription state.)

**Usage Data:**
- **Product Interaction** — Linked to user. Purposes: App Functionality, Analytics, Product Personalization. (PostHog screen views, event captures.)

**Diagnostics:**
- **Crash Data** — NOT linked to user. Purposes: App Functionality. (Sentry native crashes.)
- **Performance Data** — NOT linked to user. Purposes: App Functionality. (Sentry non-crash errors.)
- **Other Diagnostic Data** — NOT linked to user. Purposes: App Functionality. (Sentry breadcrumbs / context.)

**Data NOT collected (leave unchecked):**
- Precise Location, Coarse Location
- Financial Info, Payment Info (Apple handles all payments, we never see them)
- Contacts, Health & Fitness data
- Photos, Video, Audio, Voice
- Sensitive Info (race, orientation, religion, etc.)
- Browsing / Search History
- Any "Third-Party Advertising" data category

**Tracking:** Answer "No" — we do NOT use ATT-classified tracking. We don't build ad-targeting profiles or share data with data brokers.

- [ ] All 10 declared data types above are set correctly in App Store Connect → App Privacy
- [ ] Confirmed `PrivacyInfo.xcprivacy` (in `app.config.js`) declares the SAME types with matching Linked/Tracking/Purposes flags
- [ ] Confirmed the published privacy policy at `https://mandeepv.github.io/kinderwell-legal/privacy.html` describes the same collection and purposes as above
- [ ] Submit for review

---

## Phase 10: After Apple approval

- [ ] **Do NOT click "Release" immediately.** Apple has approved; the build is now in "Pending Developer Release" state. Take a beat.
- [ ] Install the approved build via TestFlight one more time and run the full smoke test on real device. Any last-minute issue? DO NOT release; go back and fix.
- [ ] If clean → click **"Release This Version"** in App Store Connect at a low-traffic window (early morning your timezone is fine).
- [ ] Follow [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) — create build-specific tag `v1.1.0-build-9`
- [ ] Move production marker tag `appstore-live-v1.1.0`
- [ ] Push tags to GitHub
- [ ] Delete test users from prod Supabase → Authentication → Users
- [ ] Update `docs/BEST_PRACTICES.md` "Done" section with this release date

---

## Phase 11: Post-release monitoring (phased rollout window — 24-72h then 7 days)

**During phased release, users get the new build gradually. This is your window to catch issues affecting <10% of users before the rollout hits everyone.**

Days 1-3 (heaviest monitoring):
- [ ] Watch App Store Connect → Analytics → Crashes for spikes on the new version
- [ ] Watch Sentry → Issues → filter to `environment=prod` and this release version
- [ ] Watch PostHog dashboard for:
  - Funnel drop-off changes
  - Auth failure spikes (`user_signed_in` vs `auth_attempted` ratio)
  - Paywall conversion changes
- [ ] Watch Supabase → Reports for query latency or error spikes
- [ ] Check ratings & reviews on App Store for early user reports

**If something bad shows up during phased release:**
- [ ] App Store Connect → your version → **"Pause Phased Release"** — freezes the rollout at current % until you unpause
- [ ] Diagnose the issue
- [ ] Fix + submit hotfix build (see Emergency section below)
- [ ] Once fixed, either release the hotfix build (recommended) or resume phased release with confidence

Days 4-7:
- [ ] Continue monitoring but less intensively
- [ ] By day 7, Apple has rolled out to 100%. This is now the new "live" version.

---

## Emergency: bad release rollback

Something's on fire post-release. In order of preference:

1. **Kill switch** — bump `min_supported_ios_build` in prod:
   ```sql
   UPDATE public.app_config
   SET value = 'NEXT_BUILD'::jsonb, updated_at = now()
   WHERE key = 'min_supported_ios_build';
   ```
   Ship the fix ASAP.
2. **Server-side toggle** — if the issue is a specific feature and you have a flag for it, disable via PostHog feature flag or DB update.
3. **Expedited Apple review** — https://developer.apple.com/contact/app-store/?topic=expedite — genuine emergency only.
4. **Schema rollback** — write a reverse migration and apply to prod. See [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Rollback plans".

---

## Between releases — recurring hygiene

- [ ] Weekly: check App Store Connect crashes + PostHog funnels
- [ ] Monthly: check `BEST_PRACTICES.md` gap list — anything worth doing?
- [ ] Every 6 months: rotate Apple JWT — see [`APPLE_JWT_ROTATION.md`](./APPLE_JWT_ROTATION.md)
- [ ] Every 6 months: rotate DB passwords for good hygiene
- [ ] Quarterly: verify backups exist and can restore — see [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Rollback plans"
