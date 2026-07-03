# Archived Supabase files

Historical database artifacts kept for reference. **Nothing here is used at
runtime or by any tooling.**

## What's here

### `prod_schema_2026-07-01_snapshot.sql`
Raw `pg_dump` output of prod as of 2026-07-01. Was used as the baseline for
setting up the dev Supabase project (see `docs/DEV_SETUP_LOG_2026-07-01.md`).

**Do not re-apply this file.** It has psql-specific directives (`\restrict`,
`\unrestrict`) that only work through `psql`, not through `supabase db push`.
It also assumes an empty `public` schema, which is not true on either dev or
prod anymore.

If you need to recreate a database from scratch, run migrations in order:
```bash
supabase db push --linked
```
which replays `supabase/migrations/*.sql`, starting from the idempotent
`20260101000000_initial_schema.sql`.

## Why keep it

- Debugging: if we're ever unsure what prod looked like on a specific date,
  this file is a snapshot.
- Historical record: it's what generated the initial migration file.

## When to add to this folder

- pg_dump snapshots after major schema changes (optional, for archaeology)
- Old migration files that got replaced by refactored versions (rare)
- Never: things that are still active or referenced by tooling
