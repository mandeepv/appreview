#!/usr/bin/env bash
# Build the release app for the iOS simulator and install it, for the E2E
# flows (SPEC-20 R10). Release mode, so __DEV__ is false and the store-build
# code paths run; pointed at DEV Supabase through .env.
#
#   scripts/e2e/build.sh [--clean] [simulator-udid]
#
# ios/ is generated (expo prebuild) only when missing or with --clean. Use
# --clean after changing app.config.js, a native dependency or a config
# plugin; a JS-only change then rebuilds in minutes instead of ~25.
#
# Why not `npx expo run:ios`: it insists on finding Simulator.app, and the
# Xcode 27 install on this Mac has none — simctl and Maestro need only a
# booted simulator, no window. So: prebuild, xcodebuild, simctl install.
#
# PostHog and Sentry are blanked so test runs don't pollute dev dashboards;
# Sentry's symbol upload is skipped (it needs an auth token). Xcode 27
# rejects pod targets that still declare iOS 11–13, so the deployment target
# is raised to 15.1 on the command line, for this local build only.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PROD_REF=prodprojectref00000x
grep -q "^SUPABASE_URL=.*$PROD_REF" "$ROOT/.env" && { echo "Refusing: .env points at PROD."; exit 1; }

CLEAN=0
if [ "${1:-}" = "--clean" ]; then CLEAN=1; shift; fi
UDID="${1:-$(xcrun simctl list devices available | grep -m1 'iPhone 16 Pro (' | grep -oE '[0-9A-F-]{36}')}"
[ -n "$UDID" ] || { echo "No simulator found; pass a UDID (xcrun simctl list devices available)."; exit 2; }
DERIVED="${DERIVED_DATA:-${TMPDIR:-/tmp}/kinderwell-e2e-build}"

if [ $CLEAN = 1 ] || [ ! -d "$ROOT/ios" ]; then
  echo "· regenerating ios/ from app.config.js"
  (cd "$ROOT" && CI=1 npx expo prebuild --platform ios --clean >/dev/null)
fi

echo "· building (release, simulator) — several minutes"
(cd "$ROOT/ios" && POSTHOG_PROJECT_TOKEN= SENTRY_DSN= SENTRY_DISABLE_AUTO_UPLOAD=true \
  xcodebuild -workspace KinderwellDev.xcworkspace -scheme KinderwellDev -configuration Release \
  -sdk iphonesimulator -destination "platform=iOS Simulator,id=$UDID" -derivedDataPath "$DERIVED" \
  CODE_SIGNING_ALLOWED=NO IPHONEOS_DEPLOYMENT_TARGET=15.1 build -quiet)

APP="$(find "$DERIVED/Build/Products/Release-iphonesimulator" -maxdepth 1 -name '*.app' | head -1)"
echo "· installing $(basename "$APP") on $UDID"
xcrun simctl boot "$UDID" 2>/dev/null || true
xcrun simctl bootstatus "$UDID" -b >/dev/null
xcrun simctl install "$UDID" "$APP"
echo "Done. Run the flows: scripts/e2e/run.sh"
