#!/usr/bin/env bash
# Run supabase/tests/database/*.sql (pgTAP) against a throwaway local Postgres,
# without Docker (SPEC-20 R9).
#
#   scripts/db-test-local/run.sh
#
# What it does, all inside a temp directory that is deleted on exit:
#   1. builds pgTAP's SQL from source (no system install);
#   2. starts Homebrew Postgres 17 on a private socket — it never listens on a
#      network port and never touches dev or prod;
#   3. loads bootstrap.sql (the slice of Supabase the schema needs), then every
#      migration in supabase/migrations/ in order;
#   4. runs each test file and fails on any "not ok".
#
# It is a fast local check, not the authority: CI runs the same files with
# `supabase test db` against the real Supabase stack (.github/workflows/ci-db.yml).
# Needs: Homebrew postgresql@17, curl. Override the binaries with PG_BIN=...
# VERBOSE=1 prints every test line and server message, not just failures.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PG_BIN="${PG_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
PGTAP_VERSION=1.3.3
WORK="$(mktemp -d "${TMPDIR:-/tmp}/kinderwell-dbtest.XXXXXX")"

cleanup() {
  "$PG_BIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

[ -x "$PG_BIN/postgres" ] || { echo "Postgres not found at $PG_BIN (brew install postgresql@17, or set PG_BIN)"; exit 2; }

echo "· building pgTAP $PGTAP_VERSION"
curl -fsSL "https://github.com/theory/pgtap/archive/refs/tags/v$PGTAP_VERSION.tar.gz" | tar xz -C "$WORK"
# pgTAP's Makefile does exactly this for Postgres >= 10 (no compat patches).
sed -e 's,MODULE_PATHNAME,$libdir/pgtap,g' -e 's,__OS__,darwin,g' -e 's,__VERSION__,1.33,g' \
  "$WORK/pgtap-$PGTAP_VERSION/sql/pgtap.sql.in" > "$WORK/pgtap.sql"

echo "· starting a throwaway Postgres"
"$PG_BIN/initdb" -D "$WORK/data" -U postgres --auth=trust -E UTF8 >/dev/null
"$PG_BIN/pg_ctl" -D "$WORK/data" -l "$WORK/postgres.log" -w \
  -o "-c listen_addresses='' -k $WORK -p 5432" start >/dev/null

# client_min_messages: the migrations' DROP ... IF EXISTS notices are noise here.
db() {
  PGOPTIONS='-c client_min_messages=warning' \
    "$PG_BIN/psql" -h "$WORK" -p 5432 -U postgres -d postgres -X -q -v ON_ERROR_STOP=1 "$@"
}

echo "· loading the Supabase stand-in, pgTAP and the migrations"
db -f "$ROOT/scripts/db-test-local/bootstrap.sql"
db -c 'set search_path = extensions' -f "$WORK/pgtap.sql" >/dev/null
for migration in "$ROOT"/supabase/migrations/*.sql; do
  db -f "$migration" >/dev/null
done

status=0
for test in "$ROOT"/supabase/tests/database/*.sql; do
  echo "· $(basename "$test")"
  # pgTAP is already loaded into `extensions`; the files' CREATE EXTENSION
  # line is for the real stack, where it is installed as an extension.
  if ! output="$(sed '/create extension if not exists pgtap/d' "$test" | db -t -A 2>&1)"; then
    echo "$output"; status=1; continue
  fi
  if [ -n "${VERBOSE:-}" ]; then echo "$output"; else echo "$output" | grep -E '^(not ok|# )' || true; fi
  if echo "$output" | grep -qE '^not ok|# Looks like'; then status=1; fi
  echo "  $(echo "$output" | grep -c '^ok') passed, $(echo "$output" | grep -c '^not ok') failed"
done

exit $status
