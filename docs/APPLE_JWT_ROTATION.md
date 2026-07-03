# Apple Sign In JWT Rotation

**Purpose:** every 6 months you must regenerate the Apple Sign In JWT secret. This doc is the recipe.

**Current JWT expires:** ~2026-12-28 (generated 2026-07-01, 180 days validity).

**Set a calendar reminder for 2026-12-15** — 2 weeks before expiry. Repeat every 6 months.

---

## What happens when the JWT expires (why you MUST rotate)

- **Existing signed-in users:** unaffected — they use Supabase session tokens, not the JWT
- **New sign-in attempts (both new users and returning after logout):** fail silently. User sees a generic "Sign In Failed" alert. Apple returns a token verification failure to Supabase, Supabase returns an error to the app.
- **No warning from Apple.** No warning from Supabase. You find out via 1-star reviews.

**Time-to-detect if you forget:** typically 1-3 days (via review notifications).
**Time-to-fix once you notice:** ~15 minutes (this recipe).

---

## Prerequisites (still true from initial setup)

- Apple Team ID: `DX4F38J8H4`
- Apple Key ID: `8SVB695TG5`
- Services ID: `com.kinderwell.app.auth`
- Private key file at: `~/Downloads/AuthKey_8SVB695TG5.p8`

If the private key file is missing (you cleaned up Downloads, wiped Mac, etc.), you'll need to generate a NEW key from Apple Developer. See "If you don't have the private key" below.

---

## The rotation procedure (~15 min)

### Step 1: Generate a new JWT

```bash
cd /Users/mandeepverma/mamalearn
npm install --no-save jsonwebtoken
node generate_apple_jwt.js
```

Output: a fresh JWT starting `eyJhbGciOi...`. Copy it — you'll paste it into two dashboards.

The JWT is valid for another 180 days from generation. Do NOT paste it in chat.

### Step 2: Update prod Supabase Apple provider

1. Open **prod** Supabase → https://supabase.com/dashboard/project/zqwzdyjfxytvedghujsd
2. Authentication → Providers → Apple
3. **Secret Key (for OAuth)** field → click "Reveal" if needed → clear it → paste the new JWT
4. Save

### Step 3: Update dev Supabase Apple provider

Same steps but on dev project (`xbkkjqvbsnroenqlqkmi`).

### Step 4: Verify sign-in still works

1. On a real device (iPhone), open the current app version
2. Sign out if signed in
3. Sign in with Apple
4. Should succeed

If it fails on prod:
- Check you pasted the WHOLE JWT (no truncation)
- Wait 1-2 minutes and try again (Apple sometimes takes a moment to propagate)
- Compare with dev — if dev works and prod doesn't, it's specific to prod's save

### Step 5: Update the calendar reminder

Set the next reminder for 6 months from now — 2 weeks before the new JWT expires.

Update this doc's "Current JWT expires" line at the top with the new expiry date.

---

## If you don't have the private key file

If `~/Downloads/AuthKey_8SVB695TG5.p8` is missing, you need to generate a new Sign In with Apple key.

1. Go to https://developer.apple.com/account → **Certificates, Identifiers & Profiles** → **Keys**
2. Click **+** to add a new key
3. Name: `Kinderwell Sign In With Apple (rotated YYYY-MM-DD)`
4. Enable **Sign In with Apple** capability → click **Configure** → primary App ID `com.kinderwell.app`
5. Continue → Register → **Download** the `.p8` file. You can only download it once.
6. Note the new **Key ID** (10-char string) shown on the download page
7. Save the `.p8` file somewhere safe (`~/Downloads/` is fine)
8. Update `generate_apple_jwt.js`:
   - `KEY_ID` → new key ID
   - `fs.readFileSync(...)` → new file path if different
9. Run `node generate_apple_jwt.js` → new JWT
10. Update Supabase (Step 2 + Step 3 above)
11. **Optional:** revoke the OLD key at Apple Dev → Keys → click old key → Revoke. Do this only AFTER verifying the new key works.

---

## Why not automate?

Options considered:

1. **Cron job to auto-regenerate every 5 months** — technically possible, but the JWT regeneration needs the private key on some server. Storing that key on a server is a security tradeoff. For a solo app at this scale, manual rotation with calendar reminders is safer.
2. **Longer JWT validity** — Apple caps at 180 days. Not configurable.
3. **Move to Sign In with Apple REST verification without a JWT** — Supabase requires the JWT for its Apple provider. Not an option.

**Best practice:** manual rotation, calendar reminder, this doc.

---

## What to update when you rotate

- [ ] Prod Supabase Apple provider Secret Key
- [ ] Dev Supabase Apple provider Secret Key
- [ ] "Current JWT expires" line at the top of this doc
- [ ] Calendar reminder for next rotation (~5.5 months from now)
- [ ] `BEST_PRACTICES.md` "Done" section — add a "Rotated Apple JWT — YYYY-MM-DD" entry
