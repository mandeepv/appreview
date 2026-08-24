// Build verify-migration.sql that cross-references the ACTUAL bridge (the 3,775
// old->new mapping) against the live DB. Definitive proof the migration landed:
// every migrated user's row should now hold the NEW sub, resolve to a real
// auth.users row, and still have its profile. Read-only.
const fs = require('fs');
const path = require('path');

const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'migration-bridge.json'), 'utf8'));
const rows = Object.values(d.users).filter((x) => x.status === 'exchanged' && x.new_sub);

const values = rows
  .map((x) => `('${x.user_id}','${x.old_sub}','${x.new_sub}')`)
  .join(',\n');

const sql = `-- Post-migration verification (read-only), cross-referencing the bridge.
\\echo ==== CHECK 1: no duplicate apple provider_ids (expect 0) ====
SELECT provider_id, count(*) FROM auth.identities
WHERE provider='apple' GROUP BY provider_id HAVING count(*)>1;

\\echo ==== CHECK 2: no orphan apple identities — every one maps to a real user (expect 0) ====
SELECT count(*) AS orphan_identities FROM auth.identities i
LEFT JOIN auth.users u ON u.id=i.user_id
WHERE i.provider='apple' AND u.id IS NULL;

\\echo ==== CHECK 3: provider_id vs identity_data.sub agree for ALL apple rows (mismatch expect 0) ====
SELECT count(*) FILTER (WHERE provider_id=identity_data->>'sub') AS agree,
       count(*) FILTER (WHERE provider_id<>identity_data->>'sub') AS mismatch
FROM auth.identities WHERE provider='apple';

\\echo ==== CHECK 4: of our 3,775 mapped users, how many now hold the NEW sub in the DB? ====
\\echo (expect ~3774 landed on NEW; the 1 skipped collision 9c027738 stays on old / is gone)
WITH mapping(user_id, old_sub, new_sub) AS (VALUES
${values}
)
SELECT
  count(*) FILTER (WHERE i.provider_id = m.new_sub) AS on_new_sub,
  count(*) FILTER (WHERE i.provider_id = m.old_sub) AS still_on_old_sub,
  count(*) FILTER (WHERE i.provider_id IS NULL)     AS user_row_gone
FROM mapping m
LEFT JOIN auth.identities i
  ON i.user_id = m.user_id::uuid AND i.provider='apple';

\\echo ==== CHECK 5: migrated users still have their profiles intact? (sample 10, expect has_profile=1) ====
WITH mapping(user_id, old_sub, new_sub) AS (VALUES
${values}
)
SELECT m.user_id,
       (SELECT count(*) FROM public.user_profiles p WHERE p.id = m.user_id::uuid) AS has_profile,
       (SELECT count(*) FROM public.lesson_progress lp WHERE lp.user_id = m.user_id::uuid) AS lesson_rows,
       (i.provider_id = m.new_sub) AS on_new_sub
FROM mapping m
LEFT JOIN auth.identities i ON i.user_id = m.user_id::uuid AND i.provider='apple'
LIMIT 10;
`;

fs.writeFileSync(path.join(__dirname, 'verify-migration.sql'), sql);
console.log(`Wrote verify-migration.sql (cross-references ${rows.length} bridge mappings)`);
