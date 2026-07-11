#!/usr/bin/env bash
# Back up the PROD Supabase database to two local .sql files (schema + data).
#
# Why this exists: prod is on the free tier, which has no automated backups.
# Before any prod schema push we take a manual dump so a bad migration is
# recoverable. See docs/DEV_PROD_ENVIRONMENTS.md.
#
# Usage:
#   ./scripts/backup-prod.sh
#
# The CLI must already be linked to the PROD project ref before running —
# this script does NOT link for you (linking is a deliberate, owner-only
# action; db-push-prod.sh handles the link+backup+push sequence). If the CLI
# is linked to anything other than prod, the script FAILS LOUDLY rather than
# silently dumping dev and mislabelling it a prod backup.
#
# Intern note: to test the mechanics, temporarily `supabase link` to the DEV
# ref and run this — it will refuse (dev ref != prod ref). That refusal IS
# the test. The first real prod run is owner-only.

set -euo pipefail

# --- Identity (source of truth: docs/DEV_PROD_ENVIRONMENTS.md, "Credentials
# reference"). These are project refs, not secrets — they're already in the
# committed docs and app.config.js. Do NOT invent them.
PROD_REF="zqwzdyjfxytvedghujsd"

# --- Backup mechanism: pg_dump directly, NOT `supabase db dump` (2026-07-11).
# Why the change: `supabase db dump` runs pg_dump inside a Docker container, so
# it needs Docker Desktop (~1GB, a daemon) just to take a logical backup — a
# heavy dependency for a plain pg_dump over the network. We call pg_dump
# directly instead: no Docker, same dump.
#
# Two requirements this introduces (both checked below, fail-closed):
#   1. PROD_DB_URL — the prod Postgres connection string WITH password. Source
#      it from the environment (export it, or put it in the gitignored .env and
#      `set -a; . .env; set +a` before running). It is a SECRET: never commit
#      it, never echo it. Get it from Supabase dashboard → Settings → Database →
#      Connection string (URI). Use the direct/session connection.
#   2. A pg_dump whose version is >= the prod server's Postgres major version.
#      pg_dump REFUSES to dump a newer server than itself. macOS default is
#      often an older Homebrew pg_dump (e.g. 14) which fails against Supabase's
#      PG15+/17. We therefore prefer an explicit newer binary if present and
#      let PG_DUMP override it.
#
# PG_DUMP resolution order: explicit $PG_DUMP env → postgresql@17 keg → PATH.
if [[ -n "${PG_DUMP:-}" ]]; then
  PG_DUMP_BIN="$PG_DUMP"
elif [[ -x "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]]; then
  PG_DUMP_BIN="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
else
  PG_DUMP_BIN="pg_dump"
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUPS_DIR="$REPO_ROOT/backups"
# The CLI records the currently-linked project here. It's offline,
# unambiguous, and is literally the same state that `supabase db dump
# --linked` targets — so this guard can never disagree with what the dump
# actually hits. (Note: the supabase CLI writes linked-project.json, a JSON
# blob; older docs referred to a plain `project-ref` file that this CLI
# version no longer creates.)
LINKED_FILE="$REPO_ROOT/supabase/.temp/linked-project.json"

# --- Read the currently-linked ref. Fail CLOSED: a missing/unreadable file
# means we cannot prove we're on prod, so we refuse. Never guess.
if [[ ! -f "$LINKED_FILE" ]]; then
  echo "ERROR: $LINKED_FILE not found — the Supabase CLI does not appear to be linked to any project." >&2
  echo "Run 'supabase link --project-ref $PROD_REF' first (owner-only for a real prod backup)." >&2
  exit 1
fi

# Extract "ref":"..." without a jq dependency (constraint: coreutils only).
LINKED_REF="$(sed -n 's/.*"ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$LINKED_FILE")"

if [[ -z "$LINKED_REF" ]]; then
  echo "ERROR: could not read the linked project ref from $LINKED_FILE." >&2
  echo "Refusing to run rather than dump an unknown database." >&2
  exit 1
fi

if [[ "$LINKED_REF" != "$PROD_REF" ]]; then
  echo "ERROR: CLI is linked to '$LINKED_REF', not the PROD ref '$PROD_REF'." >&2
  echo "Refusing to run — this script only backs up PROD. Dumping a different" >&2
  echo "database and calling it a prod backup is exactly the mistake this guard" >&2
  echo "prevents." >&2
  echo "" >&2
  echo "To back up prod: supabase link --project-ref $PROD_REF   (then re-run)" >&2
  exit 1
fi

# --- pg_dump prerequisites. Fail CLOSED if either is missing — a backup we
# can't actually take must stop the release, not silently proceed.
if [[ -z "${PROD_DB_URL:-}" ]]; then
  echo "ERROR: PROD_DB_URL is not set — pg_dump needs the prod connection string." >&2
  echo "Set it (keep it OUT of git; the value is a secret with the DB password):" >&2
  echo "  export PROD_DB_URL='postgresql://postgres:<pwd>@db.${PROD_REF}.supabase.co:5432/postgres'" >&2
  echo "or put it in the gitignored .env and: set -a; . .env; set +a" >&2
  echo "Get it from Supabase dashboard → Settings → Database → Connection string." >&2
  exit 1
fi

if ! command -v "$PG_DUMP_BIN" >/dev/null 2>&1 && [[ ! -x "$PG_DUMP_BIN" ]]; then
  echo "ERROR: pg_dump not found at '$PG_DUMP_BIN'." >&2
  echo "Install a recent Postgres client (brew install postgresql@17) or set PG_DUMP." >&2
  exit 1
fi

# Cross-check: PROD_DB_URL must actually target the PROD ref. This closes the
# gap between the two guards — being linked to prod (checked above) AND dumping
# via a URL are otherwise independent; if PROD_DB_URL pointed at dev we'd dump
# dev while linked to prod and mislabel it. Both must name the prod ref.
if [[ "$PROD_DB_URL" != *"$PROD_REF"* ]]; then
  echo "ERROR: PROD_DB_URL does not contain the prod ref '$PROD_REF'." >&2
  echo "Refusing to run — the connection string must target PROD, not another" >&2
  echo "database. (Supabase direct/pooler hosts include the project ref.)" >&2
  exit 1
fi
echo "Using pg_dump: $("$PG_DUMP_BIN" --version)"

# --- Timestamped output paths. UTC so backups sort correctly regardless of
# the operator's timezone.
mkdir -p "$BACKUPS_DIR"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
SCHEMA_FILE="$BACKUPS_DIR/prod_${TS}_schema.sql"
DATA_FILE="$BACKUPS_DIR/prod_${TS}_data.sql"

echo "Backing up PROD ($PROD_REF) to:"
echo "  schema → $SCHEMA_FILE"
echo "  data   → $DATA_FILE"
echo ""

# Schema dump (--schema-only mirrors the CLI's default schema dump). Restrict
# to the public schema — that's what our migrations touch and what we'd restore
# from; Supabase-managed schemas (auth, storage, etc.) are not ours to dump.
echo "Dumping schema..."
"$PG_DUMP_BIN" "$PROD_DB_URL" --schema-only --schema=public -f "$SCHEMA_FILE"

# Data dump (public schema data only).
echo "Dumping data..."
"$PG_DUMP_BIN" "$PROD_DB_URL" --data-only --schema=public -f "$DATA_FILE"

# --- Sanity: both files must exist and be non-empty. A zero-byte "backup" is
# worse than no backup because it looks like protection that isn't there.
for f in "$SCHEMA_FILE" "$DATA_FILE"; do
  if [[ ! -s "$f" ]]; then
    echo "ERROR: $f is empty or missing after dump — backup is NOT valid." >&2
    exit 1
  fi
done

echo ""
echo "✅ Prod backup complete:"
echo "  $SCHEMA_FILE"
echo "  $DATA_FILE"
