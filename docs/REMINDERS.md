# Post-Transfer Reminders — browse this ~once a month

Kinderwell was transferred to **The Account Holder's Apple account** (Team `APPLETEAMID`) on **2026-08-21**.
Everything is done and verified. This file is just the handful of **time-based** things that can't be "finished" now. Skim it monthly; act only when a date is near.

Full story if you ever need it: `docs/archive/app-transfer-2026-08/APP_TRANSFER_RUNBOOK.md` (archived — you should never need to open it).

---

## ⏰ Dated reminders (check the date, act only if near)

### ~ Early October 2026 — final payout from OLD account
- Sales on your **old** account before the transfer (up to Aug 21) still pay out to the **old account's bank**, arriving ~a month after the fiscal month closes (~early Oct).
- **DO:** nothing. **DON'T:** change/close the **old** Apple account's bank account, tax forms, or agreements until this final payment has landed. After it lands, the old account can be left/closed freely.

### ~ October 20, 2026 — TN3159 recovery window closes + KEEP MANDEEP'S (OLD) MEMBERSHIP ACTIVE
- **TN3159 window:** the 60-day Sign-in-with-Apple migration window (from the ~Aug 21 transfer) closes. Migration is verified clean (0 orphans), so **normally nothing to do**. It only matters as a *recovery deadline*: if any Apple-login weirdness ever surfaces before this date, the fix (transfer back to old account + redo) is only possible until ~Oct 20. Watch app-store reviews / support for "can't sign in with Apple" complaints until then; almost certainly a no-op.
- **the owner's (OLD) Apple Developer membership** must stay **active/paid until at least ~Oct 20** — the recovery path above needs the old account alive. **DO:** if it would lapse before late Oct, renew it. (After ~Oct 20, once the final payout has also landed, the old account can be left to expire.)

### June 2027 — renew MANOJ's (NEW/current) Apple Developer membership
- the account holder's Apple Developer Program membership ($99/yr) is what now keeps **Kinderwell live on the App Store**. If it lapses, the app can be removed — **this is the single most important recurring bill; it keeps your income live.**
- **DO:** ensure it auto-renews or is paid in/around June 2027. (If you ever want to confirm the exact renewal date: developer.apple.com → Membership, signed in as the account holder.)

### ~ February 3, 2027 — rotate the Supabase Apple JWT (2 weeks before it expires ~Feb 17)
- The Apple Sign-In provider JWT in Supabase expires **~2027-02-17** (180 days from Aug 21). **If it lapses, all NEW Apple sign-ins + logout/login fail silently** — you'd find out via 1-star reviews.
- **DO:** follow `docs/APPLE_JWT_ROTATION.md` (already updated to the new team/key). ~15-min job: run `generate_apple_jwt.js` with the new `.p8`, paste the JWT into both Supabase projects' Apple provider. Then update the expiry date in that doc + this file for the next cycle (~Aug 2027).

---

## 🔑 Key files — what's what (for your Google Drive uploads)

You're storing these in Drive (no password manager). **These are sensitive** (private keys + a user-data mapping) — keep the Drive folder private, not shared. Suggested Drive folder name: `Kinderwell-Apple-Transfer-2026-08`.

| File | What it is | Keep until |
|---|---|---|
| `AuthKey_APPLEKEYID0.p8` | **Apple Sign-In key** (NEW team `APPLETEAMID`). Used to regenerate the Supabase provider JWT every 6 months (see Feb reminder). **This is the important one to keep long-term.** | Keep indefinitely (until you rotate to a newer SIWA key) |
| `AuthKey_WF7WWBZHZN.p8` | **App Store Connect API key** (Superwall's App Store Connect integration). In Downloads. Already uploaded to Superwall; this is your backup copy. | Keep while Superwall uses it |
| ~~`AuthKey_824C9LPD38.p8`~~ | **In-App Purchase key** (Superwall). ⚠️ **The .p8 file did NOT save locally** (macOS blocked the download during setup) — Apple only lets you download a key once, so there is **no local backup**. This is FINE: the key is already uploaded and working in Superwall (Revenue Tracking shows Key ID `824C9LPD38`). You'd only need the file to re-upload elsewhere, which you won't. If a backup ever becomes necessary, generate a fresh IAP key in the account holder's account and swap it into Superwall. | n/a — lives only in Superwall |
| `kinderwell-migration-bridge-BACKUP-2026-08-21.json` | The **old→new Apple ID mapping** for all 3,775 migrated users. Only needed if a migration issue surfaces before the TN3159 window closes. Contains user identifiers — keep private. | **Can DELETE after ~Oct 20, 2026** (window closed) |
| `AuthKey_8SVB695TG5.p8` (OLD) | The **old-team** Apple Sign-In key. No longer used (superseded by APPLEKEYID0). Keep only as historical backup during the recovery window. | Can delete after ~Oct 20, 2026 |

**Also on the phone/account side (not files, but don't lose):** durable 2FA access to **the account holder's** Apple account (`owner-account@example.com`) — your income lives there now. Make sure you (not just dad's phone) can pass its 2FA. If it's only on dad's device, add a trusted device/number you control.

---

## ✅ Reference: what's already DONE (so you don't re-worry)
- App transferred; 3,774 Apple users migrated + verified at scale (0 dupes/orphans/lost); window-signup gap checked (0 orphans).
- New Apple Sign-In key + Supabase provider JWT (both projects). Superwall re-keyed (API + IAP), SBP effective 2026-08-15 (15%, no gap). New shared secret. Orphan account cleaned up.
- EAS: distribution cert + provisioning profile + submit API key + push key all on new team; `eas.json` updated. Transfer config committed (`c98f2b6`).
- Docs updated: APPLE_JWT_ROTATION, OPS_STATE, DEV_PROD_ENVIRONMENTS, RELEASE_CHECKLIST, v1.3.0/v1.4.0.

## 📌 Not migration — your normal v1.3.0 release gates (only when you next ship)
Handled via `docs/RELEASE_CHECKLIST.md`, listed here only so they're not forgotten: prod migration `add_onboarding_variant_columns` (via `db-push-prod.sh`); flip PostHog onboarding `variant_b` to 0%; create a Sandbox tester under the account holder's ASC + recreate TestFlight internal testing + re-check demo-mode review creds.
