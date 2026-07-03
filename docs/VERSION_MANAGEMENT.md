# iOS Version Management Guide

This guide ensures you can increment versions and build numbers correctly without hit-and-trial.

## Current state (2026-07-03) — all synced ✅

- `app.json` → `version: 1.1.0`, `ios.buildNumber = "9"`
- `ios/Kinderwell/Info.plist` → `CFBundleShortVersionString = 1.1.0`, `CFBundleVersion = 9`
- `ios/Kinderwell.xcodeproj/project.pbxproj` → `MARKETING_VERSION = 1.1`, `CURRENT_PROJECT_VERSION = 9`

## The one command to bump versions (recommended)

Use the script — it keeps all three files in sync and refuses to run if they've drifted:

```bash
./scripts/bump-version.sh <new-version> <new-build>
```

Examples:
```bash
./scripts/bump-version.sh 1.1.1 10   # bug fix release
./scripts/bump-version.sh 1.2.0 10   # minor feature release
./scripts/bump-version.sh 2.0.0 10   # major release
```

The script:
- Reads the current state of all 3 files
- Refuses to run if any of them are out of sync (protects against compounding drift)
- Uses `PlistBuddy` for `Info.plist` (won't corrupt XML)
- Uses safe JSON write for `app.json`
- Uses `sed` for `project.pbxproj` (Xcode's format is stable)
- Verifies after and errors loudly if anything didn't apply

**On every bump, keep all THREE files in sync.** The build technically only reads from Xcode + `Info.plist`, but a stale `app.json` will confuse you or a future dev.

## Current Setup
- **Method**: Local version control (not EAS remote)
- **Config**: `eas.json` does NOT have `appVersionSource: "remote"`
- **Files to edit**: 2 iOS files need manual updates (plus `app.json` for parity)

---

## Checklist 1: Increment Build Number Only
**Use case**: New TestFlight build with same version (e.g., 1.0.0 build 3 → 1.0.0 build 4)

### Step 1: Update build number in 2 files

**File 1: `ios/Kinderwell.xcodeproj/project.pbxproj`**
```bash
# Find current build number
grep "CURRENT_PROJECT_VERSION" ios/Kinderwell.xcodeproj/project.pbxproj

# Update (replace X with new build number)
sed -i '' 's/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = X;/g' ios/Kinderwell.xcodeproj/project.pbxproj
```

**File 2: `ios/Kinderwell/Info.plist`**
```bash
# Manually edit or use sed (replace X with new build number)
sed -i '' 's/<string>[0-9]*<\/string>/<string>X<\/string>/' ios/Kinderwell/Info.plist
```

### Step 2: Verify changes
```bash
# Should show same number twice
grep "CURRENT_PROJECT_VERSION" ios/Kinderwell.xcodeproj/project.pbxproj

# Should show CFBundleVersion with new number
grep -A 1 "CFBundleVersion" ios/Kinderwell/Info.plist
```

### Step 3: Build
```bash
npx eas build --platform ios --profile production
```

### Step 4: Verify dashboard
- Check EAS build dashboard at expo.dev
- **MUST show**: `1.0.0 (X)` where X is your new build number
- **If wrong**: Cancel build (Ctrl+C) and fix files

### Step 5: Submit
```bash
npx eas submit --platform ios --latest
```

---

## Checklist 2: Bump Version Number
**Use case**: New App Store version (e.g., 1.0.0 → 1.0.1 or 1.1.0 or 2.0.0)

### Step 1: Update version in app.json
```json
// app.json
{
  "expo": {
    "version": "1.0.1",  // ← Change this
    "ios": {
      "buildNumber": "1"  // ← Reset to "1" for new version
    }
  }
}
```

### Step 2: Update build number in iOS files (same as Checklist 1)
Reset to build 1 for new version:

**File 1: `ios/Kinderwell.xcodeproj/project.pbxproj`**
```bash
sed -i '' 's/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = 1;/g' ios/Kinderwell.xcodeproj/project.pbxproj
```

**File 2: `ios/Kinderwell/Info.plist`**
Update `CFBundleVersion` to `1` and `CFBundleShortVersionString` to new version:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>  <!-- New version -->
<key>CFBundleVersion</key>
<string>1</string>       <!-- Reset to 1 -->
```

### Step 3: Verify changes
```bash
# Check version in app.json
grep '"version"' app.json

# Check iOS build number
grep "CURRENT_PROJECT_VERSION" ios/Kinderwell.xcodeproj/project.pbxproj

# Check Info.plist
grep -A 1 "CFBundleShortVersionString\|CFBundleVersion" ios/Kinderwell/Info.plist
```

### Step 4: Build
```bash
npx eas build --platform ios --profile production
```

### Step 5: Verify dashboard
- **MUST show**: `1.0.1 (1)` (new version, build 1)
- **If wrong**: Cancel build and fix files

### Step 6: Submit
```bash
npx eas submit --platform ios --latest
```

---

## Quick Reference: Files to Edit

| Scenario | Files to Update | What to Change |
|----------|----------------|----------------|
| **Increment build** (3→4) | 1. `ios/Kinderwell.xcodeproj/project.pbxproj`<br>2. `ios/Kinderwell/Info.plist` | `CURRENT_PROJECT_VERSION`<br>`CFBundleVersion` |
| **Bump version** (1.0.0→1.0.1) | 1. `app.json`<br>2. `ios/Kinderwell.xcodeproj/project.pbxproj`<br>3. `ios/Kinderwell/Info.plist` | `version`<br>`CURRENT_PROJECT_VERSION` → 1<br>`CFBundleShortVersionString` + `CFBundleVersion` → 1 |

---

## Important Notes

### ⚠️ Always verify BEFORE building
- **Takes 10-15 minutes per build**
- Check EAS dashboard shows correct `X.X.X (build)` format
- Cancel immediately (Ctrl+C) if wrong

### ⚠️ Don't use remote versioning
- Keep `eas.json` WITHOUT `appVersionSource: "remote"`
- This method is proven and reliable for this project

### ⚠️ Common mistakes to avoid
1. Forgetting to update `Info.plist` (only updating `project.pbxproj`)
2. Not verifying dashboard before letting build complete
3. Mismatched numbers between the 2 iOS files

---

## Troubleshooting

**Problem**: Dashboard shows wrong build number
**Solution**: Cancel build, verify both iOS files, rebuild

**Problem**: Submit fails with "already submitted"
**Solution**: Build number wasn't incremented properly, increment and rebuild

**Problem**: Build shows `(1)` when you set it to `(3)`
**Solution**: You only updated `project.pbxproj` but forgot `Info.plist`

---

## Current State (as of Feb 10, 2026)
- Version: `1.0.0`
- Latest build: `3`
- Next build number: `4`
- Next version: `1.0.1` (when ready for App Store update)
