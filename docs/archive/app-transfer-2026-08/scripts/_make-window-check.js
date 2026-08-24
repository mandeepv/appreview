// Build window-signup-check.sql — finds Apple identities created during the
// transfer window (CSV export ~18:47 IST → completion ~19:14 IST) whose
// provider_id is in NEITHER the bridge's old_subs NOR new_subs. Those are the
// potential orphans the CSV missed. Read-only.
//
// Window in UTC (IST is +5:30): 18:47 IST = 13:17 UTC, 19:14 IST = 13:44 UTC.
// We widen slightly (13:10–13:50 UTC) to be safe.
const fs = require('fs');
const path = require('path');

const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'migration-bridge.json'), 'utf8'));
const rows = Object.values(d.users);
// Every sub we already know about — old (in CSV) and new (post-exchange).
const known = new Set();
rows.forEach((x) => { if (x.old_sub) known.add(x.old_sub); if (x.new_sub) known.add(x.new_sub); });

const knownValues = [...known].map((s) => `('${s}')`).join(',\n');

const sql = `-- Window-signup check (read-only): Apple identities created during the
-- transfer window that are in NEITHER the bridge old_subs NOR new_subs.
-- Any rows here = users the CSV missed → candidate orphans to mop up.
WITH known(sub) AS (VALUES
${knownValues}
)
SELECT u.id AS user_id,
       u.email,
       u.created_at,
       i.provider_id,
       (SELECT count(*) FROM public.user_profiles p WHERE p.id=u.id) AS has_profile,
       (SELECT count(*) FROM public.lesson_progress lp WHERE lp.user_id=u.id) AS lessons
FROM auth.identities i
JOIN auth.users u ON u.id = i.user_id
WHERE i.provider='apple'
  AND u.created_at BETWEEN '2026-08-21 13:10:00+00' AND '2026-08-21 13:50:00+00'
  AND i.provider_id NOT IN (SELECT sub FROM known)
ORDER BY u.created_at;
`;

fs.writeFileSync(path.join(__dirname, 'window-signup-check.sql'), sql);
console.log(`Wrote window-signup-check.sql (${known.size} known subs excluded)`);
