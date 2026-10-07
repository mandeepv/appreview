#!/usr/bin/env bash
# Migration parity with the web repo (SPEC-20 R9).
#
# The app and kinderwell.app share one Supabase project, and each repo keeps
# supabase/migrations. This repo holds the canonical set — it is what
# scripts/db-push-prod.sh pushes — while the web repo often writes a new one
# first. A web migration missing here never reaches prod; a copy that differs
# means the two repos believe different things about the schema.
#
#   scripts/check-migration-parity.sh [path/to/kinderwell-web]
#
# Fails if a web-repo migration is missing here or differs from this repo's
# copy, or if the two copies of supabase/functions/_shared/access_rule_cases.json
# differ. Migrations only this repo has (the app's own tables) are expected.
# Run before any prod db push and at release time.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB="${1:-$HOME/kinderwell-web2app/kinderwell-web}"
APP_DIR="$ROOT/supabase/migrations"
WEB_DIR="$WEB/supabase/migrations"

[ -d "$WEB_DIR" ] || { echo "Web repo migrations not found at $WEB_DIR (pass its path as the first argument)"; exit 2; }

status=0
for web_file in "$WEB_DIR"/*.sql; do
  name="$(basename "$web_file")"
  if [ ! -f "$APP_DIR/$name" ]; then
    echo "MISSING here: $name — copy it into supabase/migrations/ (see its header for apply order)"
    status=1
  elif ! cmp -s "$web_file" "$APP_DIR/$name"; then
    echo "DIFFERS: $name"
    diff -u "$APP_DIR/$name" "$web_file" | head -20 || true
    status=1
  fi
done

# The web access rule's table of cases (web2app review 2026-10-07, AP-3):
# the website's hasAccess, the app's isWebEntitled and redeem-handoff's
# hasWebAccess each run over their repo's copy, so the copies must agree.
CASES=supabase/functions/_shared/access_rule_cases.json
if [ ! -f "$WEB/$CASES" ] || [ ! -f "$ROOT/$CASES" ]; then
  echo "MISSING: $CASES (in one of the repos)"
  status=1
elif ! cmp -s "$WEB/$CASES" "$ROOT/$CASES"; then
  echo "DIFFERS: $CASES — the access rule's cases disagree between the repos"
  diff -u "$ROOT/$CASES" "$WEB/$CASES" | head -20 || true
  status=1
fi

[ $status -eq 0 ] && echo "OK: every web-repo migration is here, unchanged, and the access-rule cases match."
exit $status
