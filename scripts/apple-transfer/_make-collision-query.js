// Emits find-collisions.sql — lists every mapping (user_id, old_sub, new_sub)
// as a VALUES CTE and joins against auth.identities to find any target new_sub
// that ALREADY exists in the DB on a DIFFERENT row (the collisions that aborted
// the apply). Read-only diagnostic query.
const fs = require('fs');
const path = require('path');

const bridgePath = path.join(__dirname, 'migration-bridge.json');
const d = JSON.parse(fs.readFileSync(bridgePath, 'utf8'));
const u = Object.values(d.users).filter((x) => x.status === 'exchanged' && x.new_sub);

const values = u
  .map((x) => `('${x.user_id}','${x.old_sub}','${x.new_sub}')`)
  .join(',\n');

const sql = `-- Collisions: our target new_sub already present in auth.identities on a DIFFERENT user row.
WITH mapping(user_id, old_sub, new_sub) AS (VALUES
${values}
)
SELECT m.user_id AS our_user,
       m.old_sub,
       m.new_sub,
       i.user_id AS existing_owner_of_new_sub
FROM mapping m
JOIN auth.identities i
  ON i.provider = 'apple' AND i.provider_id = m.new_sub
WHERE i.user_id <> m.user_id::uuid;
`;

fs.writeFileSync(path.join(__dirname, 'find-collisions.sql'), sql);
console.log(`Wrote find-collisions.sql (${u.length} mappings)`);
