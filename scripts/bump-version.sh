#!/usr/bin/env bash
# Bump the Kinderwell version across all files that Xcode/EAS read from.
#
# Usage:
#   ./scripts/bump-version.sh <new-marketing-version> <new-build-number>
#   ./scripts/bump-version.sh 1.2.0 10
#
# Verifies before/after and refuses to run if the current state is inconsistent.
# See docs/VERSION_MANAGEMENT.md for the rules.

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <new-marketing-version> <new-build-number>"
  echo "Example: $0 1.2.0 10"
  exit 1
fi

NEW_VERSION="$1"
NEW_BUILD="$2"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_JSON="$REPO_ROOT/app.json"
INFO_PLIST="$REPO_ROOT/ios/Kinderwell/Info.plist"
PBXPROJ="$REPO_ROOT/ios/Kinderwell.xcodeproj/project.pbxproj"

# Semver-ish sanity check on marketing version
if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+(\.[0-9]+)?$ ]]; then
  echo "Marketing version must look like 1.2.0 or 1.2 — got '$NEW_VERSION'" >&2
  exit 1
fi

if [[ ! "$NEW_BUILD" =~ ^[0-9]+$ ]]; then
  echo "Build number must be an integer — got '$NEW_BUILD'" >&2
  exit 1
fi

# MARKETING_VERSION in project.pbxproj is x.y or x.y.z. Strip trailing .0 to
# keep it consistent with the existing format Xcode created.
PBXPROJ_MARKETING="$NEW_VERSION"

echo "Checking current versions..."

CURRENT_APP_JSON_VER=$(grep -E '"version"' "$APP_JSON" | head -1 | sed -E 's/.*"version": "([^"]+)".*/\1/')
CURRENT_APP_JSON_BUILD=$(grep -E '"buildNumber"' "$APP_JSON" | head -1 | sed -E 's/.*"buildNumber": "([^"]+)".*/\1/')
CURRENT_PLIST_VER=$(grep -A 1 "CFBundleShortVersionString" "$INFO_PLIST" | tail -1 | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/')
CURRENT_PLIST_BUILD=$(grep -A 1 "CFBundleVersion" "$INFO_PLIST" | tail -1 | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/')
CURRENT_PBXPROJ_BUILD=$(grep -E "CURRENT_PROJECT_VERSION = " "$PBXPROJ" | head -1 | sed -E 's/.*CURRENT_PROJECT_VERSION = ([0-9]+);.*/\1/')

echo "  app.json:            version=$CURRENT_APP_JSON_VER build=$CURRENT_APP_JSON_BUILD"
echo "  Info.plist:          version=$CURRENT_PLIST_VER build=$CURRENT_PLIST_BUILD"
echo "  project.pbxproj:     build=$CURRENT_PBXPROJ_BUILD"

# Refuse to run if builds are already out of sync — the whole point of this script
# is to keep them synced, don't let a drift compound.
if [[ "$CURRENT_APP_JSON_BUILD" != "$CURRENT_PLIST_BUILD" ]] || [[ "$CURRENT_PLIST_BUILD" != "$CURRENT_PBXPROJ_BUILD" ]]; then
  echo ""
  echo "ERROR: Current build numbers don't match across files." >&2
  echo "Fix the drift manually first, then re-run." >&2
  exit 1
fi

if [[ "$CURRENT_APP_JSON_VER" != "$CURRENT_PLIST_VER" ]]; then
  echo ""
  echo "ERROR: Current marketing versions don't match across files." >&2
  echo "Fix the drift manually first, then re-run." >&2
  exit 1
fi

echo ""
echo "Bumping to version=$NEW_VERSION build=$NEW_BUILD..."

# app.json
python3 -c "
import json, sys
p = '$APP_JSON'
with open(p) as f: d = json.load(f)
d['expo']['version'] = '$NEW_VERSION'
d['expo']['ios']['buildNumber'] = '$NEW_BUILD'
with open(p, 'w') as f:
    json.dump(d, f, indent=2)
    f.write('\n')
"

# Info.plist — use PlistBuddy so we don't corrupt the XML
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $NEW_VERSION" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion $NEW_BUILD" "$INFO_PLIST"

# project.pbxproj — sed is fine, Xcode uses uniform formatting
sed -i '' "s/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = $NEW_BUILD;/g" "$PBXPROJ"
sed -i '' "s/MARKETING_VERSION = [0-9.]*;/MARKETING_VERSION = $PBXPROJ_MARKETING;/g" "$PBXPROJ"

echo ""
echo "Verifying after bump..."
NEW_APP_JSON_VER=$(grep -E '"version"' "$APP_JSON" | head -1 | sed -E 's/.*"version": "([^"]+)".*/\1/')
NEW_APP_JSON_BUILD=$(grep -E '"buildNumber"' "$APP_JSON" | head -1 | sed -E 's/.*"buildNumber": "([^"]+)".*/\1/')
NEW_PLIST_VER=$(grep -A 1 "CFBundleShortVersionString" "$INFO_PLIST" | tail -1 | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/')
NEW_PLIST_BUILD=$(grep -A 1 "CFBundleVersion" "$INFO_PLIST" | tail -1 | sed -E 's/.*<string>([^<]+)<\/string>.*/\1/')
NEW_PBXPROJ_BUILD=$(grep -E "CURRENT_PROJECT_VERSION = " "$PBXPROJ" | head -1 | sed -E 's/.*CURRENT_PROJECT_VERSION = ([0-9]+);.*/\1/')
NEW_PBXPROJ_MARKETING=$(grep -E "MARKETING_VERSION = " "$PBXPROJ" | head -1 | sed -E 's/.*MARKETING_VERSION = ([0-9.]+);.*/\1/')

echo "  app.json:            version=$NEW_APP_JSON_VER build=$NEW_APP_JSON_BUILD"
echo "  Info.plist:          version=$NEW_PLIST_VER build=$NEW_PLIST_BUILD"
echo "  project.pbxproj:     version=$NEW_PBXPROJ_MARKETING build=$NEW_PBXPROJ_BUILD"

if [[ "$NEW_APP_JSON_VER" != "$NEW_VERSION" ]] || [[ "$NEW_PLIST_VER" != "$NEW_VERSION" ]]; then
  echo "ERROR: marketing version didn't apply everywhere" >&2
  exit 1
fi

if [[ "$NEW_APP_JSON_BUILD" != "$NEW_BUILD" ]] || [[ "$NEW_PLIST_BUILD" != "$NEW_BUILD" ]] || [[ "$NEW_PBXPROJ_BUILD" != "$NEW_BUILD" ]]; then
  echo "ERROR: build number didn't apply everywhere" >&2
  exit 1
fi

echo ""
echo "✅ Version bumped to $NEW_VERSION (build $NEW_BUILD)"
echo "Next: git commit the changes, then run 'eas build --profile production --platform ios'"
