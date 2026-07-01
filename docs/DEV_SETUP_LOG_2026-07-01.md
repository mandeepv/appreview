# Dev Environment Setup Log — 2026-07-01

**Purpose:** point-in-time record of every change made setting up the `kinderwell-dev` Supabase environment. Use this to retrace and debug if something in dev doesn't work as expected.

**After Saturday's smoke test passes:** move this file to `docs/archive/` (or delete). It's a receipt, not an ongoing reference. The permanent guide is `DEV_PROD_ENVIRONMENTS.md`.

**Related session:** Claude Code chat, 2026-07-01, `~4pm–7pm IST`.

---

## What we set up

### 1. Supabase dev project created
- **Name:** `kinderwell-dev`
- **Project ref:** `xbkkjqvbsnroenqlqkmi`
- **URL:** `https://xbkkjqvbsnroenqlqkmi.supabase.co`
- **Anon (publishable) key:** `sb_publishable_vsR2RDq_4WE4KKK9f22k0Q_6BKJbwJU`
- **Region:** us-west-1 (prod is us-west-2 — different, both fine)
- **DB pooler host:** `aws-1-us-west-1.pooler.supabase.com`
- **DB password:** ⚠️ SAME AS PROD (should be rotated — see task #7 and Best Practices item 8)

### 2. Schema cloned from prod
- Dumped prod schema with `pg_dump 17.10` (installed via `brew install postgresql@17`) since prod is on Postgres 17 and existing `pg_dump 14` couldn't handle it
- File saved to `supabase/prod_schema.sql` (185 lines, in repo but not committed)
- Applied to dev via `psql`
- **Tables created on dev:** `user_profiles`, `lesson_progress`
- **RLS policies created:** 7 (all `USING (auth.uid() = user_id / id)` pattern)
- **FKs:** both tables reference `auth.users(id) ON DELETE CASCADE`
- **Extension needed:** `uuid-ossp` (Supabase enables by default — no action taken)

### 3. Edge Function deployed to dev
- **Function:** `delete-account`
- **Command used:** `supabase functions deploy delete-account --project-ref xbkkjqvbsnroenqlqkmi`
- **Source:** `supabase/functions/delete-account/index.ts` (unchanged from prod)
- **Uses env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (auto-provided by Supabase runtime)

### 4. Apple Sign In wired to dev

**On Apple Developer portal (Services ID `com.kinderwell.app.auth`):**
- Added Domain: `xbkkjqvbsnroenqlqkmi.supabase.co`
- Added Return URL: `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- **Existing prod entries preserved:** `zqwzdyjfxytvedghujsd.supabase.co` and its callback URL

**On dev Supabase (Auth → Providers → Apple):**
- Enabled: ✅
- **Client IDs:** `com.kinderwell.app,com.kinderwell.app.auth`
- **Secret Key (JWT):** freshly generated via `node generate_apple_jwt.js` — valid 180 days (expires ~2026-12-28)
- **Callback URL (auto-shown):** `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- Allow users without email: OFF

**Apple credentials used (shared with prod, non-sensitive):**
- Team ID: `DX4F38J8H4`
- Services ID: `com.kinderwell.app.auth`
- Key ID: `8SVB695TG5`
- Private key: `~/Downloads/AuthKey_8SVB695TG5.p8`

### 5. Google Sign In wired to dev

**On Google Cloud Console (OAuth 2.0 client):**
- Added Authorized redirect URI: `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- **Existing prod URI preserved:** `https://zqwzdyjfxytvedghujsd.supabase.co/auth/v1/callback`

**On dev Supabase (Auth → Providers → Google):**
- Enabled: ✅
- **Client IDs:** `737394030212-cdrh1o3lomp3oi29rsovfcoion32oh9j.apps.googleusercontent.com`
- **Client Secret:** reused prod's (revealed from prod Supabase Auth panel)
- **Callback URL (auto-shown):** `https://xbkkjqvbsnroenqlqkmi.supabase.co/auth/v1/callback`
- Skip nonce checks: OFF
- Allow users without email: OFF

### 6. Auth redirect URLs on dev Supabase (URL Configuration)
- **Site URL:** `kinderwell://`
- **Redirect URLs allowlist:**
  - `kinderwell://`
  - `kinderwell://auth/callback`
  - `kinderwell://*`

### 7. Local `.env` repointed to dev
- **Backup saved:** `.env.prod` (gitignored) — the original file pointing at prod
- **`.env` now contains:**
  ```
  SUPABASE_URL=https://xbkkjqvbsnroenqlqkmi.supabase.co
  SUPABASE_ANON_KEY=sb_publishable_vsR2RDq_4WE4KKK9f22k0Q_6BKJbwJU
  SUPERWALL_API_KEY=pk_FkXYLnmCtS4lGjBnjkBHR   (unchanged — Superwall shared)
  SKIP_PAYWALL=false
  SHOW_DEMO_BUTTON=true
  ```
- **`.gitignore`:** added `.env.prod` line

### 8. `eas.json` updated
- **`development` profile:** added `env` block pointing at dev Supabase
- **`preview` profile:** added `env` block pointing at dev Supabase
- **`production` profile:** ⚠️ UNTOUCHED — still points at prod

### 9. Startup env indicator added to app
- **File modified:** `src/lib/supabase.ts`
- **What it does:** On startup in `__DEV__` builds only, logs one of:
  - `[Supabase] Env: DEV ✅ | Project: xbkkjqvbsnroenqlqkmi`
  - `[Supabase] Env: PROD ⚠️ | Project: zqwzdyjfxytvedghujsd`
  - `[Supabase] Env: UNKNOWN | Project: <ref>`
- Silent in production/release builds (`__DEV__` false)

### 10. Supabase CLI relinked to dev
- **Before session:** linked to prod (`zqwzdyjfxytvedghujsd`)
- **After session:** linked to dev (`xbkkjqvbsnroenqlqkmi`)
- **File updated:** `supabase/.temp/project-ref`
- **Why dev is safer as default link:** any accidental `supabase db ...` or `supabase functions deploy` will hit dev, not prod

---

## What we did NOT change (prod is unchanged)

- Prod Supabase project — no schema edits, no auth changes, no function deploys
- Prod DB — no data touched, only `pg_dump` (read-only)
- Prod app builds — `production` profile in `eas.json` still points at prod
- Prod app users — none affected
- Superwall — same API key, same campaigns (shared by design)
- Apple IAP products — unchanged (sandbox handles dev isolation automatically)
- App Store Connect — no submissions or changes

---

## Files changed in the repo

| File | Change | Committed? |
|---|---|---|
| `.env` | Repointed to dev Supabase | Gitignored — will never commit |
| `.env.prod` | New — backup of old prod-pointing .env | Gitignored |
| `.gitignore` | Added `.env.prod` | Not committed yet |
| `eas.json` | Added dev env blocks to `development` and `preview` profiles | Not committed yet |
| `src/lib/supabase.ts` | Added startup env indicator | Not committed yet |
| `supabase/prod_schema.sql` | New — dumped from prod | Not committed yet (contains schema only, no data) |
| `supabase/.temp/project-ref` | Changed prod ref → dev ref | Gitignored |
| `docs/DEV_PROD_ENVIRONMENTS.md` | New — permanent env guide | Not committed yet |
| `docs/BEST_PRACTICES.md` | New — prioritized gap list | Not committed yet |
| `docs/README.md` | New — docs index | Not committed yet |
| `README.md` | Added Documentation section | Not committed yet |
| `docs/*` (10 files moved from root) | Reorganized | Move tracked via `git mv` |

---

## Saturday verification checklist

Before doing anything on Saturday, plug the iPhone in and prep:

- [ ] Confirm iPhone shows in `xcrun xctrace list devices` (or Xcode → Window → Devices and Simulators)
- [ ] Confirm you're signed into the developer Apple ID in Xcode
- [ ] Confirm sandbox Apple ID created in App Store Connect (see `STOREKIT_SETUP_GUIDE.md`) and signed in on iPhone (Settings → App Store → Sandbox Account)
- [ ] Confirm local `.env` still points at dev: `cat .env | grep SUPABASE_URL` → should show `xbkkjqvbsnroenqlqkmi`

### Step 1: Build and install dev client on iPhone

```bash
npx expo run:ios --device
```

- [ ] Build succeeds
- [ ] App installs on iPhone
- [ ] Metro logs show `[Supabase] Env: DEV ✅ | Project: xbkkjqvbsnroenqlqkmi`
  - ❌ If it shows `PROD ⚠️`, stop. Something's wrong. Check `.env` file.
  - ❌ If it shows `UNKNOWN`, stop. The URL doesn't match either known project. Check `.env`.

### Step 2: Fresh sign-up with Apple

- [ ] Tap "Sign in with Apple" on onboarding
- [ ] Sign-in sheet appears (Apple's native modal)
- [ ] Complete sign-in with your Apple ID
- [ ] App proceeds past auth screen (no error, no hang)
- [ ] Onboarding flow starts
- [ ] Verify user appears in **dev** Supabase: dashboard → Authentication → Users → new row with your Apple email
- [ ] Verify user does NOT appear in **prod** Supabase Users list

**If sign-in fails or hangs:**
- Most likely cause: Apple Services ID Return URL missing dev callback → recheck Apple portal
- Second most likely: dev Supabase Apple provider client ID mismatch → recheck `com.kinderwell.app,com.kinderwell.app.auth`
- Third: `Site URL` / redirect URLs missing on dev Supabase → recheck URL Configuration

### Step 3: Complete onboarding and check DB writes

- [ ] Fill out onboarding to completion
- [ ] Verify a row exists in **dev** Supabase → `user_profiles` matching your auth user ID
- [ ] Verify RLS: try `SELECT * FROM user_profiles;` in dev SQL editor as anon → should return only your row (or fail if you're not authed)

### Step 4: Sign out and back in

- [ ] Sign out from app Settings
- [ ] Sign in again with Apple
- [ ] App recognizes returning user, shows onboarding completed state

### Step 5: Google Sign-In

- [ ] Delete the account via app Settings ("Delete Account" button — this hits the Edge Function)
- [ ] Verify user is gone from **dev** Supabase Users list
- [ ] Verify the corresponding `user_profiles` row is gone (FK cascade)
- [ ] Sign up fresh with Google
- [ ] Google OAuth browser flow completes, redirects back to `kinderwell://`
- [ ] App proceeds past auth, onboarding starts

**If Google sign-in fails at the redirect step:**
- Most likely: Google Cloud Console missing dev callback URI → recheck
- Second: dev Supabase Google client secret wrong → recheck by revealing it in dashboard

### Step 6: Paywall + sandbox purchase

- [ ] Complete onboarding, reach paywall
- [ ] Paywall renders (Superwall config loaded)
- [ ] Tap a subscription option
- [ ] Sandbox purchase sheet appears (shows "[Environment: Sandbox]" or similar)
- [ ] Complete purchase with sandbox Apple ID
- [ ] App receives success, unlocks content

**If real money would be charged:** you're NOT in a sandbox build. Stop, verify you built via `expo run:ios --device` (debug) not a store-signed build.

### Step 7: Delete account (Edge Function)

- [ ] Settings → Delete Account
- [ ] Confirm deletion
- [ ] Check dev Supabase Edge Functions → `delete-account` → Logs → see the invocation
- [ ] Verify user is gone from Users list
- [ ] Verify `user_profiles` row is gone

### Step 8: Verify prod is untouched

- [ ] Open prod Supabase → Authentication → Users. Confirm NONE of your Saturday test users appear there.
- [ ] Open prod Supabase → Table Editor → `user_profiles` → same check.

---

## If anything fails during verification

1. **First:** re-read the corresponding section above ("What we set up") and cross-check the exact values against what's in the dashboard now
2. **Second:** check Metro logs (Xcode → Devices → Console) for the actual error text
3. **Third:** ask Claude with the exact error and the section number from above

Most common failure modes and their fix:
- **Apple sign-in hangs after user consents** → Apple Services ID missing dev Return URL, or dev Supabase Apple provider has wrong client ID
- **Google sign-in returns to browser with an error** → Google Cloud Console missing dev redirect URI, or client secret mismatch
- **App shows `[Supabase] Env: PROD ⚠️`** → `.env` file was reverted somehow, run `cat .env | grep SUPABASE_URL` and swap back if needed
- **Test user shows up in PROD, not dev** → same as above — the app is pointing at prod

---

## After Saturday passes

1. Move this file: `mv docs/DEV_SETUP_LOG_2026-07-01.md docs/archive/`
2. Commit the whole dev setup:
   ```bash
   git add eas.json src/lib/supabase.ts supabase/prod_schema.sql docs/ README.md
   git commit -m "chore: set up dev Supabase environment + document processes"
   ```
3. Move on to `BEST_PRACTICES.md` item #1 (migration tracking) when you have time.
