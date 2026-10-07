#!/usr/bin/env bash
# Run the simulator E2E flows (SPEC-20 R10) against DEV Supabase.
#
#   scripts/e2e/run.sh [flow-file ...]      (default: every .maestro/flows/*.yaml)
#
# Needs: the app built and installed (scripts/e2e/build.sh), a booted
# simulator, Maestro, Java 17, and .env.e2e (dev keys, git-ignored).
#
# Every flow gets its own fresh test accounts (scripts/e2e/seed.mjs), so a
# flow that deletes, refunds or advances its buyer can't disturb the next.
# They are all tagged with this run's id and deleted on exit, pass or fail.
# It never touches prod: both this script and seed.mjs refuse the prod ref.
#
# A flow asks the runner for work it can't do itself with a marker line:
#   # RUNNER: raise-min-build        dev's kill switch set one above this build
#                                    for the flow, then restored (shared config!)
#   # RUNNER: buyer-must-be-deleted  after the flow, the buyer must be gone from dev

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROD_REF=prodprojectref00000x
cd "$ROOT"

envval() { grep -m1 "^$1=" "$2" | cut -d= -f2-; }
SUPABASE_URL="$(envval E2E_SUPABASE_URL .env.e2e)"
APP_ID="$(envval IOS_BUNDLE_ID .env)"
case "$SUPABASE_URL" in *"$PROD_REF"*|"") echo "Refusing: .env.e2e is missing or points at PROD."; exit 1;; esac
[ -n "$APP_ID" ] || { echo "IOS_BUNDLE_ID missing from .env"; exit 1; }

export JAVA_HOME="${JAVA_HOME_17:-/opt/homebrew/opt/openjdk@17}"
MAESTRO="${MAESTRO:-$HOME/.maestro/bin/maestro}"

CONTAINER="$(xcrun simctl get_app_container booted "$APP_ID" 2>/dev/null)" \
  || { echo "$APP_ID is not installed on a booted simulator — run scripts/e2e/build.sh"; exit 1; }
BUILD="$(plutil -extract CFBundleVersion raw "$CONTAINER/Info.plist")"

seed() { node scripts/e2e/seed.mjs "$@"; }
field() { node -pe "JSON.parse(process.argv[1]).$1" "$2"; }

RUN="e2e$(date +%s)"
ORIGINAL_MIN=""
restore_min_build() {
  if [ -n "$ORIGINAL_MIN" ]; then
    seed min-build "$ORIGINAL_MIN" >/dev/null \
      || echo "!! dev kill switch NOT restored — run: node scripts/e2e/seed.mjs min-build $ORIGINAL_MIN"
    ORIGINAL_MIN=""
  fi
}
HELPER_PID=""
cleanup() {
  if [ -n "$HELPER_PID" ]; then kill "$HELPER_PID" 2>/dev/null; wait "$HELPER_PID" 2>/dev/null; fi
  restore_min_build
  seed cleanup "$RUN" >/dev/null || echo "!! test users not deleted — run: node scripts/e2e/seed.mjs cleanup $RUN"
}
trap cleanup EXIT

# The flows' helper holds the service key (seed.mjs explains why Maestro
# must never be given it). It serves only this run's test users.
# Started as `node` itself, not through seed(): killing a backgrounded shell
# function kills only its subshell, and the orphaned node then holds the
# terminal (or a pipe) open after the run ends.
PORT_FILE="$(mktemp)"
node scripts/e2e/seed.mjs serve "$RUN" "$PORT_FILE" >/dev/null &
HELPER_PID=$!
for _ in $(seq 50); do [ -s "$PORT_FILE" ] && break; sleep 0.1; done
[ -s "$PORT_FILE" ] || { echo "The E2E helper did not start."; exit 1; }
HELPER_URL="http://127.0.0.1:$(cat "$PORT_FILE")"
rm -f "$PORT_FILE"

FLOWS=("$@")
[ ${#FLOWS[@]} -gt 0 ] || FLOWS=(.maestro/flows/*.yaml)

# One attempt at a flow, on fresh accounts: 0 = passed.
attempts=0
attempt() {
  local flow="$1" name="$2"
  attempts=$((attempts + 1))
  local id="$RUN-f$attempts"

  BUYER="$(seed create buyer "$id")" \
    && BUYER_NO_PROFILE="$(seed create buyer-no-profile "$id")" \
    && UNENTITLED="$(seed create unentitled "$id")" \
    || { echo "✗ $name: could not seed accounts"; return 1; }

  if grep -q "^# RUNNER: raise-min-build" "$flow"; then
    ORIGINAL_MIN="$(seed min-build)" && seed min-build "$((BUILD + 1))" >/dev/null \
      || { echo "✗ $name: could not raise the kill switch"; restore_min_build; return 1; }
  fi

  local ok=1
  local out; out="$(mktemp)"
  "$MAESTRO" test "$flow" \
    -e APP_ID="$APP_ID" -e HELPER_URL="$HELPER_URL" \
    -e BUYER_EMAIL="$(field email "$BUYER")" -e BUYER_ID="$(field userId "$BUYER")" \
    -e BUYER_NO_PROFILE_EMAIL="$(field email "$BUYER_NO_PROFILE")" \
    -e BUYER_NO_PROFILE_ID="$(field userId "$BUYER_NO_PROFILE")" \
    -e UNENTITLED_EMAIL="$(field email "$UNENTITLED")" \
    -e FRESH_EMAIL="delivered+$id-fresh@resend.dev" \
    | tee "$out"
  [ "${PIPESTATUS[0]}" = 0 ] || ok=0
  if grep -q "E2E-EMAIL-LIMIT.*FAILED" "$out"; then EMAIL_LIMIT_HIT=1; fi
  rm -f "$out"

  restore_min_build

  # A deletion leaves its proof in the database, not on screen.
  if [ $ok = 1 ] && grep -q "^# RUNNER: buyer-must-be-deleted" "$flow"; then
    if [ "$(seed exists "$(field email "$BUYER")")" != "false" ]; then
      echo "✗ $name: the app said the account was deleted, but the buyer still exists in dev"; ok=0
    else
      echo "✓ $name: the buyer is gone from dev"
    fi
  fi

  [ $ok = 1 ]
}

# Flake budget (SPEC-20 R10): one retry per flow. A flow that passes only on
# the retry is reported as flaky, never as a plain pass: it's a bug to fix
# (two flaky runs in a row count as one), not noise to live with.
status=0
passed=()
flaky=()
failed=()
EMAIL_LIMIT_HIT=0
for flow in "${FLOWS[@]}"; do
  name="$(basename "$flow" .yaml)"
  echo "▶ $name"
  if attempt "$flow" "$name"; then
    passed+=("$name")
  elif [ $EMAIL_LIMIT_HIT = 1 ]; then
    # Not the app's fault, and a retry would only spend more of the limit.
    failed+=("$name (dev's email limit was used up)")
    status=1
  else
    echo "↻ $name failed — retrying once on fresh accounts"
    if attempt "$flow" "$name"; then flaky+=("$name"); else failed+=("$name"); fi
    status=1
  fi
done

echo
echo "E2E: ${#passed[@]} passed, ${#flaky[@]} flaky, ${#failed[@]} failed (build $BUILD, dev Supabase)"
for f in ${flaky[@]+"${flaky[@]}"}; do echo "  ~ $f (passed only on retry)"; done
for f in ${failed[@]+"${failed[@]}"}; do echo "  ✗ $f"; done
if [ $EMAIL_LIMIT_HIT = 1 ]; then
  echo "  Dev ran out of sign-in emails for this hour (Supabase → Authentication → Rate Limits)."
  echo "  The app is fine; wait for the hour to roll over, or raise the limit, and rerun the ✗ flows."
fi
exit $status
