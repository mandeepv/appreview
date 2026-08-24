#!/usr/bin/env node
// TN3159 Step B — EXCHANGE transfer identifiers for the new-team sub, then
// EMIT a reviewable SQL file. Run by the NEW/recipient team AFTER the app
// transfer completes and after Apple's Sign-in-with-Apple config has propagated
// (up to 24h — see runbook Phase 6).
//
// What it does:
//   1. Reads the bridge JSON produced by 1-generate.js.
//   2. Obtains a user.migration access token for the NEW team (using the new
//      team's SIWA key — created under the recipient account in Phase 6).
//   3. For each 'generated' user, exchanges transfer_sub -> { new sub, email }.
//   4. Records new_sub in the bridge (status 'exchanged').
//   5. Writes apply-migration.sql: reviewable UPDATE statements that repoint
//      each existing Apple identity's provider_id (and identity_data.sub) from
//      the old sub to the new sub. It does NOT run them.
//
// WHY IT DOESN'T WRITE TO THE DB ITSELF: auth.identities is Supabase's auth
// system of record. At 2k-row scale one bad mapping is very hard to reverse, so
// the irreversible mutation is a deliberate, reviewed step YOU run (psql / SQL
// editor) after eyeballing the file's sanity header. See runbook Q4 rationale.
//
// The auth.users.id (UUID) is UNCHANGED by all this — only the Apple identity's
// provider_id moves — so user_profiles / lesson_progress (keyed on the UUID)
// stay intact automatically.
//
// Usage:
//   APPLE_P8_PATH_NEW=/path/AuthKey_<newkey>.p8 \
//   NEW_TEAM_ID=APPLETEAMID NEW_KEY_ID=<new key id> \
//   NEW_CLIENT_ID=com.kinderwell.app.auth \
//   node scripts/apple-transfer/2-exchange.js [--dry-run] [--bridge path.json] [--out apply-migration.sql]
//
// (NEW_CLIENT_ID: use the Services ID that now lives under the recipient team.
//  Confirm its value in the recipient account before running — Q-SIWA.)

const fs = require('fs');
const path = require('path');
const {
  makeClientSecret,
  getMigrationAccessToken,
  exchangeTransferSub,
  requireEnv,
  assertTeamIdFormat,
  loadBridge,
  saveBridge,
} = require('./_apple');

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes('--dry-run');
const bridgeArgIdx = argv.indexOf('--bridge');
const BRIDGE_PATH = bridgeArgIdx !== -1 ? argv[bridgeArgIdx + 1] : path.join(__dirname, 'migration-bridge.json');
const outArgIdx = argv.indexOf('--out');
const OUT_SQL = outArgIdx !== -1 ? argv[outArgIdx + 1] : path.join(__dirname, 'apply-migration.sql');

// Postgres single-quote escape for a string literal.
function sqlStr(s) {
  return `'${String(s).replace(/'/g, "''")}'`;
}

function buildSql(rows, meta) {
  const oldSubs = rows.map((r) => r.old_sub);
  const newSubs = rows.map((r) => r.new_sub);
  const dupOld = oldSubs.length !== new Set(oldSubs).size;
  const dupNew = newSubs.length !== new Set(newSubs).size;

  const lines = [];
  lines.push('-- Apple Sign-in user migration — provider_id repoint (TN3159 Step B result)');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push(`-- Source bridge meta: oldTeam=${meta?.oldTeamId} targetTeam=${meta?.targetTeamId} supabase=${meta?.supabaseUrl}`);
  lines.push('--');
  lines.push('-- SANITY CHECK BEFORE RUNNING:');
  lines.push(`--   rows to update: ${rows.length}`);
  lines.push(`--   duplicate OLD subs in set: ${dupOld ? 'YES ⚠️ STOP — investigate' : 'no'}`);
  lines.push(`--   duplicate NEW subs in set: ${dupNew ? 'YES ⚠️ STOP — investigate' : 'no'}`);
  lines.push('--');
  lines.push('-- Each statement repoints ONE existing Apple identity from its old-team sub');
  lines.push('-- to its new-team sub. WHERE clause is pinned to provider=apple AND the exact');
  lines.push('-- old provider_id, so it can only ever affect the intended single row.');
  lines.push('-- Review, then run inside a transaction. Recommended:');
  lines.push('--   BEGIN;  \\i apply-migration.sql   -- inspect row counts, then COMMIT or ROLLBACK;');
  lines.push('');
  lines.push('BEGIN;');
  lines.push('');
  for (const r of rows) {
    // Repoint provider_id AND the mirrored sub inside identity_data JSON.
    lines.push(
      `UPDATE auth.identities SET ` +
        `provider_id = ${sqlStr(r.new_sub)}, ` +
        `identity_data = jsonb_set(identity_data, '{sub}', to_jsonb(${sqlStr(r.new_sub)}::text), true) ` +
        `WHERE provider = 'apple' AND provider_id = ${sqlStr(r.old_sub)}; ` +
        `-- user_id ${r.user_id}`,
    );
  }
  lines.push('');
  lines.push('-- Verify the update count equals the row count above before COMMIT.');
  lines.push('-- COMMIT;   -- <- run this yourself after verifying');
  lines.push('ROLLBACK;  -- default safety: file ends rolled back so a blind \\i is a no-op');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const p8Path = requireEnv('APPLE_P8_PATH_NEW');
  const newTeamId = assertTeamIdFormat('NEW_TEAM_ID', requireEnv('NEW_TEAM_ID'));
  const newKeyId = requireEnv('NEW_KEY_ID');
  const newClientId = requireEnv('NEW_CLIENT_ID');

  console.log(`\n[exchange] New team (iss): ${newTeamId}  key: ${newKeyId}  client: ${newClientId}`);
  console.log(`[exchange] Bridge file: ${BRIDGE_PATH}`);
  console.log(`[exchange] SQL out: ${OUT_SQL}`);
  console.log(`[exchange] Mode: ${DRY_RUN ? 'DRY RUN (no Apple calls, no SQL written)' : 'LIVE'}\n`);

  const bridge = loadBridge(BRIDGE_PATH);
  const all = Object.values(bridge.users || {});
  // Retry BOTH not-yet-tried ('generated') AND previously-failed exchanges
  // ('exchange_failed') — the latter are usually transient (invalid_client
  // token blips, or invalid_request from Apple config not fully propagated for
  // that user when we exchanged moments after generate). A later retry clears
  // most of them.
  const pending = all.filter((u) => (u.status === 'generated' || u.status === 'exchange_failed') && u.transfer_sub);
  const alreadyExchanged = all.filter((u) => u.status === 'exchanged');
  const failedGen = all.filter((u) => u.status === 'failed');

  console.log(`[exchange] bridge: total=${all.length} to-exchange=${pending.length} already-exchanged=${alreadyExchanged.length} failed-at-generate=${failedGen.length}`);
  if (failedGen.length) {
    console.log('[exchange] NOTE: users that failed at generate are NOT exchangeable — re-run 1-generate.js for them first.');
  }

  if (DRY_RUN) {
    console.log(`[exchange] DRY RUN: would exchange ${pending.length} transfer_subs and (re)write SQL for ${pending.length + alreadyExchanged.length} rows.`);
    return;
  }

  // Only touch Apple (and therefore only need the new-team key) when there is
  // actually something to exchange. This lets you re-emit apply-migration.sql
  // from an already-exchanged bridge without credentials, and avoids a spurious
  // key/JWT error when pending == 0.
  let clientSecret;
  let accessToken;
  if (pending.length > 0) {
    clientSecret = makeClientSecret({ teamId: newTeamId, keyId: newKeyId, clientId: newClientId, p8Path });
    accessToken = await getMigrationAccessToken({ clientId: newClientId, clientSecret });
  } else {
    console.log('[exchange] Nothing to exchange (pending=0) — re-emitting SQL from existing bridge only.');
  }

  let done = 0, failed = 0;
  for (const u of pending) {
    try {
      const result = await exchangeTransferSub({
        accessToken,
        transferSub: u.transfer_sub,
        clientId: newClientId,
        clientSecret,
      });
      u.new_sub = result.sub;
      u.new_email = result.email ?? null;
      u.is_private_email = result.is_private_email ?? null;
      u.status = 'exchanged';
      u.exchangedAt = new Date().toISOString();
      done += 1;
      if (done % 100 === 0) {
        saveBridge(BRIDGE_PATH, bridge);
        console.log(`[exchange]   ...${done} exchanged`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/expired|invalid_client|invalid_grant/i.test(msg)) {
        try {
          clientSecret = makeClientSecret({ teamId: newTeamId, keyId: newKeyId, clientId: newClientId, p8Path });
          accessToken = await getMigrationAccessToken({ clientId: newClientId, clientSecret });
          console.log('[exchange]   (re-minted access token)');
        } catch (e2) {
          console.error(`[exchange]   token re-mint failed: ${e2.message}`);
        }
      }
      u.status = 'exchange_failed';
      u.error = msg;
      u.failedAt = new Date().toISOString();
      failed += 1;
      console.error(`[exchange]   FAIL user ${u.user_id} (transfer_sub ${u.transfer_sub}): ${msg}`);
    }
  }
  saveBridge(BRIDGE_PATH, bridge);

  // Build SQL from ALL exchanged rows (this run + any prior), so the file is
  // always the complete set to apply.
  const exchanged = Object.values(bridge.users).filter((u) => u.status === 'exchanged' && u.new_sub);
  const sql = buildSql(exchanged, bridge.meta);
  fs.writeFileSync(OUT_SQL, sql);

  console.log(`\n[exchange] Done. exchanged(this run)=${done} failed=${failed} total-exchanged=${exchanged.length}`);
  console.log(`[exchange] Wrote ${OUT_SQL} (${exchanged.length} UPDATE statements).`);
  console.log('[exchange] REVIEW the SANITY CHECK header, then apply the SQL deliberately (BEGIN; \\i ...; verify count; COMMIT;).');
  console.log('[exchange] The file ends with ROLLBACK by default — a blind run changes nothing until you COMMIT.');
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error('[exchange] FATAL:', e);
  process.exit(1);
});
