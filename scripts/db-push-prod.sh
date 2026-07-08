#!/usr/bin/env bash
# Guarded PROD migration push. The ONLY sanctioned way to apply schema
# migrations to the production Supabase database.
#
# Why a script and not the raw commands: pushing to prod by hand is the
# highest-consequence action in this repo. The manual procedure had multiple
# easy-to-forget steps (back up first, dry-run first, re-link to dev after)
# and one fatal failure mode — leaving the CLI linked to prod, so the next
# innocent `supabase db push --linked` during dev work hits production. This
# script makes the safe sequence the only sequence, and guarantees the CLI is
# re-linked to dev on exit no matter how it exits.
#
# Usage:
#   ./scripts/db-push-prod.sh
#
# Follows docs/DEV_PROD_ENVIRONMENTS.md (migration section) and
# RELEASE_CHECKLIST.md. Run only during a release.

set -euo pipefail

# --- Identity (source of truth: docs/DEV_PROD_ENVIRONMENTS.md, "Credentials
# reference"). Project refs, not secrets. Do NOT invent them.
PROD_REF="zqwzdyjfxytvedghujsd"
DEV_REF="xbkkjqvbsnroenqlqkmi"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_SCRIPT="$REPO_ROOT/scripts/backup-prod.sh"
LINKED_FILE="$REPO_ROOT/supabase/.temp/linked-project.json"

# Read the currently-linked ref from the CLI's own state file (offline,
# unambiguous, same state `--linked` targets). Prints nothing on failure —
# callers check for emptiness. No jq dependency (coreutils only).
read_linked_ref() {
  [[ -f "$LINKED_FILE" ]] || return 0
  sed -n 's/.*"ref"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$LINKED_FILE"
}

# --- (8) ALWAYS re-link to dev on exit, including error and abort paths.
# This trap is the single most important safety property of the script: even
# if the operator Ctrl-C's mid-push, even if a command errors under `set -e`,
# we end up back on the dev ref so subsequent dev work can't accidentally hit
# prod. The re-link is unconditional (idempotent — linking to dev when
# already on dev is a harmless no-op), then we ASSERT the state file now reads
# dev and warn LOUDLY if not, so even a failed re-link can't leave you
# silently pointed at prod.
relink_to_dev() {
  local exit_code=$?
  echo ""
  echo "→ Re-linking CLI to DEV ($DEV_REF) [cleanup]..."
  # Don't let a re-link failure be swallowed by set -e inside the trap.
  if supabase link --project-ref "$DEV_REF" >/dev/null 2>&1; then
    :
  else
    echo "⚠️  WARNING: 'supabase link --project-ref $DEV_REF' returned nonzero." >&2
  fi

  local now
  now="$(read_linked_ref)"
  if [[ "$now" == "$DEV_REF" ]]; then
    echo "✓ CLI is back on DEV ($DEV_REF)."
  else
    echo "" >&2
    echo "🚨🚨 CRITICAL: after cleanup the CLI is linked to '$now', NOT dev ($DEV_REF)." >&2
    echo "🚨🚨 DO NOT run 'supabase db push --linked' until you fix this:" >&2
    echo "        supabase link --project-ref $DEV_REF" >&2
  fi

  exit "$exit_code"
}
trap relink_to_dev EXIT

# Helper: read a typed confirmation and abort unless it matches exactly.
confirm_exactly() {
  local expected="$1" prompt="$2" answer
  read -r -p "$prompt" answer
  if [[ "$answer" != "$expected" ]]; then
    echo "Aborted — you typed '$answer', expected '$expected'." >&2
    exit 1
  fi
}

echo "=========================================================="
echo "  PROD migration push — $PROD_REF"
echo "  This applies schema migrations to the PRODUCTION database."
echo "=========================================================="
echo ""

# --- (1) First typed confirmation.
confirm_exactly "push to PRODUCTION" \
  "Type exactly 'push to PRODUCTION' to continue: "

# --- (2) Same-day backup. No push without a backup taken today. backup-prod.sh
# itself refuses unless the CLI is linked to prod, so we link to prod FIRST
# (step 3's link is idempotent if already done) — but the spec sequence lists
# backup before the explicit link step, so we link here specifically to
# satisfy backup-prod.sh's guard, then continue. The trap still guarantees we
# return to dev on any exit.
echo ""
echo "→ Linking to PROD ($PROD_REF) so we can back it up..."
supabase link --project-ref "$PROD_REF"

echo ""
echo "→ (2) Taking a same-day prod backup before any push..."
if [[ ! -x "$BACKUP_SCRIPT" ]]; then
  echo "ERROR: $BACKUP_SCRIPT is missing or not executable." >&2
  exit 1
fi
"$BACKUP_SCRIPT"

# --- (3) Ensure linked to prod ref (idempotent — we linked above; re-assert
# via the state file so we never push against the wrong DB).
echo ""
echo "→ (3) Verifying CLI is linked to PROD ($PROD_REF)..."
CURRENT_REF="$(read_linked_ref)"
if [[ "$CURRENT_REF" != "$PROD_REF" ]]; then
  echo "ERROR: expected to be linked to prod ($PROD_REF) but state file reads '$CURRENT_REF'." >&2
  exit 1
fi
echo "✓ Linked to prod."

# --- (4) Print migration list for eyeballing.
echo ""
echo "→ (4) Current migration state (Local vs Remote):"
supabase migration list --linked

# --- (5) Dry-run — show exactly what WOULD apply, apply nothing.
echo ""
echo "→ (5) Dry-run (nothing is applied):"
supabase db push --linked --dry-run

# --- (6) Second typed confirmation, AFTER seeing the dry-run output.
echo ""
confirm_exactly "apply" \
  "Review the dry-run above. Type exactly 'apply' to push for real: "

# --- (7) The real push.
echo ""
echo "→ (7) Applying migrations to PROD..."
supabase db push --linked

echo ""
echo "✅ Prod push complete. (CLI will be re-linked to dev on exit.)"

# (8) is handled by the EXIT trap above — runs on success, error, and abort.
