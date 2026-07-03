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
- [ ] All schema changes for this release exist as migration files in `supabase/migrations/`
- [ ] Migration files applied to dev — verify by opening the affected tables in dev dashboard
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

- [ ] Confirm every SQL file in `supabase/migrations/` that's new since last release is backward-compatible (see [`DEV_PROD_ENVIRONMENTS.md`](./DEV_PROD_ENVIRONMENTS.md) → "Schema migrations — backward compatibility"). If it's a breaking change → STOP, refactor to expand-only.
- [ ] Note the exact SQL you applied to dev.
- [ ] Apply to prod during a low-traffic window:
  ```bash
  export PROD_DB_URL='postgresql://postgres.zqwzdyjfxytvedghujsd:PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres'
  /opt/homebrew/opt/postgresql@17/bin/psql "$PROD_DB_URL" -f supabase/migrations/YYYYMMDD_description.sql
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
  - Demo account credentials (or note that `SHOW_DEMO_BUTTON=true` + 7 taps on Auth title activates demo mode)
  - Screenshots up to date? If UI changed, update them
- [ ] Submit for review

---

## Phase 10: After Apple approval

- [ ] Follow [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) — create build-specific tag `v1.1.0-build-9`
- [ ] Move production marker tag `appstore-live-v1.1.0`
- [ ] Push tags to GitHub
- [ ] Delete test users from prod Supabase → Authentication → Users
- [ ] Update `docs/BEST_PRACTICES.md` "Done" section with this release date

---

## Phase 11: Post-release monitoring (first 24-72 hours)

- [ ] Watch App Store Connect → Analytics → Crashes for spikes on the new version
- [ ] Watch PostHog dashboard for:
  - Funnel drop-off changes
  - Auth failure spikes (`user_signed_in` vs `auth_attempted` ratio)
  - Paywall conversion changes
- [ ] Watch Supabase → Reports for query latency or error spikes
- [ ] Check ratings & reviews on App Store for early user reports

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
