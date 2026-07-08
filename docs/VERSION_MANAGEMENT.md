# Version Management

How to bump Kinderwell's marketing version and build number.

## Current state

Two files carry the version. **They must agree** — CI enforces this
(see `.github/workflows/ci.yml` → `version-drift` job).

| File | Field | Purpose |
|---|---|---|
| `app.json` | `expo.version` | Marketing version (e.g. `1.1.0`). What EAS reads at build time and what shows up in App Store Connect. |
| `app.json` | `expo.ios.buildNumber` | iOS build number (e.g. `9`). Must strictly increase per App Store submission. |
| `app.json` | `expo.android.versionCode` | Android version code. Not user-visible, must strictly increase per Play Store submission. |
| `package.json` | `version` | npm/release metadata. Kept in sync with `app.json.expo.version` for git-blame consistency and release automation. |

**Managed workflow**: `ios/` and `android/` folders are NOT committed —
they're generated fresh by `expo prebuild --clean` on every EAS build.
There is no `Info.plist` or `project.pbxproj` to keep in sync. If you
find yourself grep-ing for `CFBundleVersion` or `MARKETING_VERSION`,
you're on the wrong path — those get generated from `app.json` at
build time.

**How EAS actually reads the version**: `eas.json`'s `cli` block sets
`"appVersionSource": "local"`. Without this, modern EAS CLI defaults
to `remote` — EAS Cloud manages the build number and ignores
`app.json.expo.ios.buildNumber` entirely (it either prompts
interactively on first build or auto-increments a server-side
counter). Both would silently break the `bump-version.sh` doctrine.
The `local` mode makes `app.json` the single source of truth, which
is what every other version-related check in this repo assumes —
CI's `version-drift` job, Sentry's `dist` tag, and the kill switch's
`currentBuild` comparison all rely on this. If you ever see EAS
prompt "which build number?" during `eas build`, `appVersionSource`
was reverted — put it back.

## Bump the version

**Always use the script.** It's the only supported way to bump
without introducing drift.

```bash
./scripts/bump-version.sh <new-version> <new-build>
```

Examples:
```bash
./scripts/bump-version.sh 1.1.1 10   # bug-fix release
./scripts/bump-version.sh 1.2.0 10   # minor feature release
./scripts/bump-version.sh 2.0.0 10   # major release
```

The script:
- Reads current versions from `app.json` + `package.json`
- Refuses to run if they're already out of sync (protects against
  compounding drift; if they are, sync them manually then re-run)
- Writes new values with `python3 -c` JSON manipulation (safe,
  preserves formatting)
- Verifies afterwards and errors if anything didn't apply

## Bump rules

- **Marketing version** (e.g. `1.1.0`) — bump on any user-facing
  release. Follow semver: patch (`1.1.1`) for bug fixes, minor
  (`1.2.0`) for features, major (`2.0.0`) for breaking changes.
- **Build number** — must strictly increase for every submission to
  App Store Connect. Even a build with the same marketing version
  (e.g. a fix during App Review) needs a new build number.
- **When bumping marketing version**: you may reset the build number
  to `1` or continue incrementing. Continuing is safer because App
  Store Connect enforces monotonic-increasing per app, so if the
  Play Store rejects your `1` submission you can still land the
  new build number without conflict. We continue.

## After bumping

```bash
git add app.json package.json
git commit -m "chore: bump to X.Y.Z (build N)"
git push
```

CI's `version-drift` check runs and fails if the two versions
disagree.

Then build:
```bash
eas build --profile production --platform ios
```

Then submit:
```bash
eas submit --profile production --platform ios
```

## History note

Prior to the managed-workflow migration (Fable review P0 #4, commit
around 2026-07-03) the version lived in three files: `app.json`,
`ios/Kinderwell/Info.plist`, and `ios/Kinderwell.xcodeproj/project.pbxproj`.
The old `bump-version.sh` touched all three. When `ios/` was deleted
in the migration, the script exited with code 2 at the first grep and
`package.json` silently drifted to `1.0.0` while `app.json` moved to
`1.1.0`. Fable review #7 caught this. The script now touches only
`app.json` + `package.json`.
