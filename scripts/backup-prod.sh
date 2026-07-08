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

# Schema dump (default = schema only).
echo "Dumping schema..."
supabase db dump --linked -f "$SCHEMA_FILE"

# Data dump.
echo "Dumping data..."
supabase db dump --linked --data-only -f "$DATA_FILE"

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
