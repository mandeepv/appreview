# Apple Sign-in user migration (TN3159) — app transfer scripts

These two scripts migrate existing **Sign in with Apple** users when Kinderwell
is transferred to another Apple developer team. Without them, every existing
Apple user gets a brand-new (empty) account on their next sign-in, because Apple
user identifiers are **team-scoped**. See `docs/APP_TRANSFER_RUNBOOK.md` § Phase 3
for the full context; this README is the operational how-to.

**What the transfer moves vs. what these scripts do:** the app transfer moves
the app + Services ID to the new team. These scripts move the *user identities*
so each person's new-team Apple `sub` maps back to their existing Supabase
account (their `auth.users.id` UUID never changes, so all their data survives).

## Files

| File | Role |
|---|---|
| `_apple.js` | Shared helpers: client-secret JWT (ES256), access token, generate/exchange calls. |
| `1-generate.js` | **Step A**, OLD team. Reads Apple users from Supabase, mints a `transfer_sub` per user, writes `migration-bridge.json`. Read-only on the DB. |
| `2-exchange.js` | **Step B**, NEW team. Exchanges each `transfer_sub` for the new `sub`, then writes a **reviewable** `apply-migration.sql`. Does NOT touch the DB. |
| `migration-bridge.json` | The bridge (generated). Maps `user_id → old_sub → transfer_sub → new_sub`. **Never committed** (gitignored) — losing it means re-running generate. |
| `apply-migration.sql` | Reviewable UPDATEs (generated). You run this deliberately. Gitignored. |

## Prerequisites

- Node 20, and `npm install` done (uses `@supabase/supabase-js` + `jsonwebtoken`, both already deps).
- **Old team** SIWA key on disk: `AuthKey_8SVB695TG5.p8` (team `OLDTEAMID00`, Services ID `com.kinderwell.app.auth`).
- **New team** SIWA key: created under the recipient account (the account holder, team `APPLETEAMID`) during runbook Phase 6 — needed only for Step B.
- Supabase **service-role** key for the target project.

## Timing (from the runbook)

1. **Step A** — run at/after you initiate the transfer, and again as a mop-up any time within the 60-day window (the generate endpoint stays active the whole window, including after completion).
2. Transfer completes → wait **up to 24h** for Apple's SIWA config to propagate.
3. **Step B** — run, review the SQL, apply it, then run the Phase 7 real-Apple-user smoke test.

## ⚠️ Test on DEV first

Before ever pointing at prod, run the whole loop against the **dev** Supabase
project (`devprojectref000000x`) with a throwaway Apple account:

```bash
# DEV dry run — see counts, hit nothing
SUPABASE_URL=https://devprojectref000000x.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<dev service role> \
APPLE_P8_PATH=/path/AuthKey_8SVB695TG5.p8 \
OLD_TEAM_ID=OLDTEAMID00 OLD_KEY_ID=8SVB695TG5 OLD_CLIENT_ID=com.kinderwell.app.auth \
TARGET_TEAM_ID=APPLETEAMID \
node scripts/apple-transfer/1-generate.js --dry-run
```

Drop `--dry-run` to actually generate. (A real end-to-end exchange requires the
app to actually be transferred, so dev fully validates Step A + the Supabase
read + the SQL shape; Step B is validated for real during the transfer window.)

## Run — Step A (generate), OLD team

```bash
APPLE_P8_PATH=/path/AuthKey_8SVB695TG5.p8 \
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service role> \
OLD_TEAM_ID=OLDTEAMID00 OLD_KEY_ID=8SVB695TG5 OLD_CLIENT_ID=com.kinderwell.app.auth \
TARGET_TEAM_ID=APPLETEAMID \
node scripts/apple-transfer/1-generate.js
```

Resumable: re-run to retry failures (successful users are skipped). Exit code 1 if any failed.

## Run — Step B (exchange + emit SQL), NEW team

```bash
APPLE_P8_PATH_NEW=/path/AuthKey_<newkey>.p8 \
NEW_TEAM_ID=APPLETEAMID NEW_KEY_ID=<new key id> NEW_CLIENT_ID=com.kinderwell.app.auth \
node scripts/apple-transfer/2-exchange.js
```

Then review `apply-migration.sql` — check the **sanity header** (row count, no
duplicate subs) — and apply it deliberately:

```
BEGIN;
\i scripts/apple-transfer/apply-migration.sql   -- note: file self-rolls-back; see below
```

The generated SQL wraps everything in `BEGIN; ... ROLLBACK;` so an accidental
run changes nothing. To actually apply: review, then replace the final
`ROLLBACK;` with `COMMIT;` (or run the UPDATEs inside your own transaction and
COMMIT once the row count matches).

## Never commit

`migration-bridge.json` and `apply-migration.sql` contain real user identifiers.
They are gitignored. Keep the bridge file safe during the transfer window; it is
the only record tying old subs to transfer_subs.
