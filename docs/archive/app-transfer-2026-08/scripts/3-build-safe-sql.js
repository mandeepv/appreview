#!/usr/bin/env node
// Regenerate apply-migration.sql with a COLLISION GUARD on every statement.
//
// Why: the first apply aborted because 1 user (of 3,775) had a target new_sub
// that ALREADY exists in auth.identities on a different row — a person who was a
// pre-transfer user AND signed in again during the transfer window, so Apple
// created a second (new-team) account for them. Migrating the old row would
// duplicate a provider_id and violate the unique constraint.
//
// The guard: each UPDATE only fires if NO OTHER apple identity already holds the
// target new_sub. So a colliding row is silently SKIPPED (UPDATE 0) instead of
// erroring — it can only ever skip, never overwrite the wrong row. Non-colliding
// rows (the other 3,774) update normally.
//
// This reads the bridge (already fully exchanged) — it makes NO Apple calls.
// Output: apply-migration.sql (overwrites), transaction-wrapped, ends in
// ROLLBACK for a safe dry run first.
//
// Usage: node scripts/apple-transfer/3-build-safe-sql.js

const fs = require('fs');
const path = require('path');

const bridgePath = path.join(__dirname, 'migration-bridge.json');
const outPath = path.join(__dirname, 'apply-migration.sql');

const d = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
const rows = Object.values(d.users).filter((x) => x.status === 'exchanged' && x.new_sub);

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// Sanity: dup check within our own set (should be clean — verified earlier).
const newSubs = rows.map((r) => r.new_sub);
const dupNew = newSubs.length !== new Set(newSubs).size;

const lines = [];
lines.push('-- Apple Sign-in user migration — provider_id repoint WITH COLLISION GUARD');
lines.push(`-- Generated: ${new Date().toISOString()}`);
lines.push(`-- Source: migration-bridge.json (${rows.length} exchanged mappings)`);
lines.push('--');
lines.push('-- SANITY:');
lines.push(`--   mapping rows: ${rows.length}`);
lines.push(`--   duplicate NEW subs within our set: ${dupNew ? 'YES ⚠️ STOP' : 'no'}`);
lines.push('--');
lines.push('-- COLLISION GUARD: each UPDATE fires only if no OTHER apple identity already');
lines.push('-- holds the target new_sub. A colliding row (e.g. a user who re-signed-in during');
lines.push("-- the transfer window and already has a new-team account) is SKIPPED (UPDATE 0),");
lines.push('-- never overwritten. Expected: total UPDATE count = mapping rows MINUS collisions.');
lines.push('-- Known collisions at build time: user 9c027738 (already has new-team acct dd7b7f5e).');
lines.push('--');
lines.push('-- Run BEGIN..ROLLBACK first (file ends in ROLLBACK). If the UPDATE-1 total looks');
lines.push('-- right and there are NO errors, change ROLLBACK->COMMIT and re-run to apply.');
lines.push('');
lines.push('BEGIN;');
lines.push('');
for (const r of rows) {
  // Guard subquery: is the target new_sub already used by a DIFFERENT apple row?
  // We compare on user_id so a row already correctly holding its own value is fine.
  lines.push(
    `UPDATE auth.identities AS t SET ` +
      `provider_id = ${sqlStr(r.new_sub)}, ` +
      `identity_data = jsonb_set(t.identity_data, '{sub}', to_jsonb(${sqlStr(r.new_sub)}::text), true) ` +
      `WHERE t.provider = 'apple' AND t.provider_id = ${sqlStr(r.old_sub)} ` +
      `AND NOT EXISTS (SELECT 1 FROM auth.identities x ` +
        `WHERE x.provider = 'apple' AND x.provider_id = ${sqlStr(r.new_sub)} AND x.user_id <> t.user_id); ` +
      `-- user_id ${r.user_id}`,
  );
}
lines.push('');
lines.push(`-- Expected total: ${rows.length} minus the number of collisions (skipped rows).`);
lines.push('-- Verify count, then flip the next line to COMMIT to apply for real.');
lines.push('ROLLBACK;  -- default safety — change to COMMIT after verifying');
lines.push('');

fs.writeFileSync(outPath, lines.join('\n'));
console.log(`Wrote ${outPath}`);
console.log(`  mapping rows: ${rows.length}`);
console.log(`  guard: skips any row whose new_sub already belongs to a different apple identity`);
console.log(`  ends in ROLLBACK — safe to run as a test first`);
