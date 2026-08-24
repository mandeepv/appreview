#!/usr/bin/env node
// TN3159 Step A — GENERATE transfer identifiers (run by the OLD/transferring
// team, before the app transfer completes, and again as a mop-up pass any time
// within the 60-day window).
//
// What it does:
//   1. Reads the Apple users from a CSV you exported from Supabase's SQL editor
//      (user_id + provider_id = the current Apple sub). Option A — no DB changes,
//      no service-role key. See README "Export the Apple users".
//   2. Obtains ONE user.migration access token for the old team.
//   3. For each user, calls /auth/usermigrationinfo to mint a `transfer_sub`
//      targeting the recipient team.
//   4. Writes everything to the bridge JSON, per-user, RESUMABLE — a re-run
//      skips users already marked done. This is why a partial/interrupted run
//      is safe: nothing is lost, just re-run.
//
// It does NOT touch Supabase at all (reads a local CSV; only calls Apple).
//
// Usage:
//   APPLE_P8_PATH=/path/AuthKey_8SVB695TG5.p8 \
//   OLD_TEAM_ID=OLDTEAMID00 OLD_KEY_ID=8SVB695TG5 \
//   OLD_CLIENT_ID=com.kinderwell.app.auth \
//   TARGET_TEAM_ID=APPLETEAMID \
//   node scripts/apple-transfer/1-generate.js [--csv path.csv] [--dry-run] [--bridge path.json]
//
// See scripts/apple-transfer/README.md and docs/APP_TRANSFER_RUNBOOK.md § Phase 3.

const fs = require('fs');
const path = require('path');
const {
  makeClientSecret,
  getMigrationAccessToken,
  generateTransferSub,
  requireEnv,
  assertTeamIdFormat,
  loadBridge,
  saveBridge,
} = require('./_apple');

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const bridgeArgIdx = argv.indexOf('--bridge');
const BRIDGE_PATH = bridgeArgIdx !== -1
  ? argv[bridgeArgIdx + 1]
  : path.join(__dirname, 'migration-bridge.json');

// Read the Apple users from a CSV the operator exported from the Supabase SQL
// editor (Option A — no DB changes, no service-role key).
//
// WHY A CSV, not the admin API: on this Supabase version auth.admin.listUsers()
// returns users with an EMPTY identities array (verified 2026-08-21 — every user
// came back providers=[]), and the auth schema isn't exposed through PostgREST.
// Supabase's own guidance is that auth data is reached via SQL. So the operator
// runs the exact SELECT we already validated in the dashboard, downloads the
// result as CSV, and this script reads it. Nothing is added to the database.
//
// Expected CSV: a header row containing columns user_id, provider_id (aka
// old_sub / sub), and optionally email — in any order. We map provider_id → the
// Apple sub to migrate. See README "Export the Apple users".
function readAppleIdentitiesCsv(csvPath) {
  if (!fs.existsSync(csvPath)) {
    throw new Error(
      `CSV not found at ${csvPath}. Export the Apple users first (see ` +
      `scripts/apple-transfer/README.md → "Export the Apple users"), then pass ` +
      `--csv <path> (or place it at the default path).`,
    );
  }
  const text = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''); // strip BOM
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new Error(`CSV ${csvPath} has no data rows.`);

  // Minimal CSV parse (handles optional double-quotes; Apple subs + UUIDs have
  // no commas, so this is sufficient — no quoted-comma edge cases expected).
  const parseRow = (line) =>
    line.split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));

  const header = parseRow(lines[0]).map((h) => h.toLowerCase());
  const idxUser = header.indexOf('user_id');
  const idxSub = ['provider_id', 'old_sub', 'sub', 'data_sub'].map((n) => header.indexOf(n)).find((i) => i !== -1);
  const idxEmail = header.indexOf('email');
  if (idxUser === -1 || idxSub === undefined || idxSub === -1) {
    throw new Error(
      `CSV header must include 'user_id' and one of 'provider_id'/'old_sub'/'sub'. Got: ${header.join(', ')}`,
    );
  }

  const out = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseRow(lines[i]);
    const user_id = cols[idxUser];
    const old_sub = cols[idxSub];
    if (!user_id || !old_sub) continue; // skip malformed
    out.push({ user_id, old_sub, email: idxEmail !== -1 ? (cols[idxEmail] || null) : null });
  }
  return out;
}

async function main() {
  const p8Path = requireEnv('APPLE_P8_PATH');
  const oldTeamId = assertTeamIdFormat('OLD_TEAM_ID', requireEnv('OLD_TEAM_ID'));
  const oldKeyId = requireEnv('OLD_KEY_ID');
  const oldClientId = requireEnv('OLD_CLIENT_ID');
  const targetTeamId = assertTeamIdFormat('TARGET_TEAM_ID', requireEnv('TARGET_TEAM_ID'));

  const csvArgIdx = argv.indexOf('--csv');
  const CSV_PATH = csvArgIdx !== -1 ? argv[csvArgIdx + 1] : path.join(__dirname, 'apple-users.csv');

  console.log(`\n[generate] Reading Apple users from CSV: ${CSV_PATH}`);
  console.log(`[generate] Old team (iss): ${oldTeamId}  key: ${oldKeyId}  client: ${oldClientId}`);
  console.log(`[generate] Target (recipient) team: ${targetTeamId}`);
  console.log(`[generate] Bridge file: ${BRIDGE_PATH}`);
  console.log(`[generate] Mode: ${DRY_RUN ? 'DRY RUN (no Apple calls, no writes)' : 'LIVE'}\n`);

  const identities = readAppleIdentitiesCsv(CSV_PATH);
  console.log(`[generate] Loaded ${identities.length} Apple users from CSV.\n`);

  const bridge = loadBridge(BRIDGE_PATH);
  bridge.meta = {
    ...(bridge.meta ?? {}),
    csvPath: CSV_PATH,
    oldTeamId,
    targetTeamId,
    lastGenerateAt: new Date().toISOString(),
  };

  if (DRY_RUN) {
    let would = 0;
    for (const id of identities) {
      const existing = bridge.users[id.user_id];
      if (!existing || existing.status !== 'generated' && existing.status !== 'exchanged') would += 1;
    }
    console.log(`[generate] DRY RUN: ${identities.length} Apple users; would generate ${would} transfer_subs (rest already done).`);
    return;
  }

  // One access token for the whole batch (no rate limit; token valid ~ minutes,
  // but we re-mint if we ever see it expire mid-run to be safe on huge sets).
  let clientSecret = makeClientSecret({ teamId: oldTeamId, keyId: oldKeyId, clientId: oldClientId, p8Path });
  let accessToken = await getMigrationAccessToken({ clientId: oldClientId, clientSecret });

  let done = 0, skipped = 0, failed = 0;
  for (const id of identities) {
    const prior = bridge.users[id.user_id];
    if (prior && (prior.status === 'generated' || prior.status === 'exchanged')) {
      skipped += 1;
      continue; // resumable: already have a transfer_sub for this user
    }
    try {
      const transfer_sub = await generateTransferSub({
        accessToken,
        sub: id.old_sub,
        targetTeamId,
        clientId: oldClientId,
        clientSecret,
      });
      bridge.users[id.user_id] = {
        user_id: id.user_id,
        old_sub: id.old_sub,
        email: id.email,
        transfer_sub,
        status: 'generated',
        generatedAt: new Date().toISOString(),
      };
      done += 1;
      if (done % 100 === 0) {
        saveBridge(BRIDGE_PATH, bridge); // checkpoint so a crash loses <100
        console.log(`[generate]   ...${done} generated`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // If the access token expired on a very large set, re-mint once and retry
      // this user on the next loop iteration by not advancing status.
      if (/expired|invalid_client|invalid_grant/i.test(msg)) {
        try {
          clientSecret = makeClientSecret({ teamId: oldTeamId, keyId: oldKeyId, clientId: oldClientId, p8Path });
          accessToken = await getMigrationAccessToken({ clientId: oldClientId, clientSecret });
          console.log('[generate]   (re-minted access token, retrying user)');
        } catch (e2) {
          console.error(`[generate]   token re-mint failed: ${e2.message}`);
        }
      }
      bridge.users[id.user_id] = {
        user_id: id.user_id,
        old_sub: id.old_sub,
        email: id.email,
        status: 'failed',
        error: msg,
        failedAt: new Date().toISOString(),
      };
      failed += 1;
      console.error(`[generate]   FAIL user ${id.user_id} (sub ${id.old_sub}): ${msg}`);
    }
  }

  saveBridge(BRIDGE_PATH, bridge);
  console.log(`\n[generate] Done. generated=${done} skipped(already)=${skipped} failed=${failed}`);
  if (failed > 0) {
    console.log('[generate] Re-run this script to retry failed users (successful ones are skipped).');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('[generate] FATAL:', e);
  process.exit(1);
});
