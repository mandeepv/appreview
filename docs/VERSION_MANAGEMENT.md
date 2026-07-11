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

## Branching & release train

*(Added SPEC-FIX-11 R7. This is the version/release-mechanics home; the
release-run steps live in `RELEASE_CHECKLIST.md`, which points here from its
"Tag the release" step.)*

The repo runs a **two-branch train**, not a single branch. This section is the
canonical description so a future session doesn't re-derive it.

### 1. Roles

- **`main`** = the shipped / shipping branch. It always equals what is **live on
  the App Store or in release testing**. It is **FROZEN** while a release is in
  test — nothing lands on `main` that hasn't been through a release.
- **`develop`** = the accumulation trunk for post-release work. Feature branches
  (`spec-*`, `fix-*`) PR into **`develop`**, never into `main`.

### 2. Checkpoints

Each version boundary on `develop` gets a **version-bump commit + an `rc/x.y.z`
tag**. An `rc` tag is a **CODE checkpoint** — it marks the commit whose code is
exactly version x.y.z. The final **build integer is assigned at release time**
(see §4), not when the rc tag is cut, so the rc tag's bump commit may carry a
placeholder build that the release branch overwrites.

### 3. Releasing (cut a release branch from the rc tag)

1. `git checkout -b release/x.y.z rc/x.y.z`
2. First commit on it: `./scripts/bump-version.sh x.y.z <next GLOBAL build integer>`
   (see §4). This is where the real, final build number is assigned.
3. Re-run CI on that commit (the manual release gate).
4. Build / submit from that commit per `RELEASE_CHECKLIST.md`.
5. Tag the built commit `vX.Y.Z-build-N`; move `appstore-live-*` per the checklist.

**Strict version order:** one version is live and healthy before the next one
builds — each version's code contains the previous one's (the train is a
superset chain). E.g. 1.4.0 builds only after 1.3.0 is live.

### 4. Build numbers (kill-switch INVARIANT #12)

Build numbers are **bare integers, globally monotonic in UPLOAD order across all
versions, forever**. Never reuse a number, never go backwards; a resubmission of
the same version re-bumps to the next integer. Because the remote-config kill
switch compares bare build integers globally, 1.4.0 can NOT ship as build 12
after 1.3.0 has shipped as build 15 — the integer must increase in the order
builds are actually uploaded, regardless of marketing version.

Worked numbering (the v1.2.0→v1.6.0 train): 1.2.0 rebuild = 11; 1.3.0 = 15
(retro-created checkpoint, next unused after 12–14 were burned in develop's bump
history); develop's HEAD re-bumped to build 16 so it's never behind the highest
assigned integer; 1.4.0/1.5.0/1.6.0 finals are assigned at release time from
their `release/x.y.z` branches.

### 5. Reconciling `main` (the "safe merge" procedure)

After vX.Y.Z is live and healthy, advance `main` to the released commit — by
**fast-forward only**:

```
git checkout main
git merge --ff-only <released-commit>
```

- If `--ff-only` FAILS, `main` has commits `develop` doesn't (a hotfix — see §6).
  **STOP** and reconcile the other direction first. Never force-push `main`,
  never resolve a merge conflict on `main` with a generated resolution.
- Verify before pushing: `git merge-base --is-ancestor main <released-commit>`
  is true, CI is green on that commit, and the release tags exist on it.
- Consequence: `main` only ever advances to already-shipped, already-tested
  commits.

### 6. Hotfixes while `main` is frozen

Fix on a branch off **`main`**, ship it per the emergency checklist, then
**immediately merge `main` into `develop`** so the trunk is a superset again (the
train's later releases must contain every shipped fix). A hotfix's build number
takes the next global integer like any other upload.

### 7. Worked example — the v1.2.0 → v1.6.0 train

`main` frozen at the v1.2.0 RC. `develop` accumulated SPEC-15…19 as five version
boundaries: 1.3.0 (A/B framework), 1.4.0 (SPEC-16+17), 1.5.0 (SPEC-18), 1.6.0
(SPEC-19). The 1.3.0 boundary was skipped during development and **retro-created**
by SPEC-FIX-11 R1: `release/1.3.0` cut from the SPEC-15 merge commit, bumped to
build 15, the AuthScreen experiment-hygiene fix cherry-picked onto it, tagged
`rc/1.3.0`. The 1.4.0/1.5.0/1.6.0 bump commits got their `rc/*` tags; `develop`
was re-bumped to 1.6.0/build 16. `main` stays frozen until 1.3.0 ships, then
advances by ff-only per §5.

### 8. Splash config — which governs

Two splash configs live in `app.json`: the modern `expo-splash-screen` plugin
block (under `plugins`) and the legacy top-level `expo.splash` block. On SDK 54
the **plugin block governs**; the top-level block is kept in sync (same image /
resizeMode / backgroundColor) only for tooling that still reads it. When changing
splash geometry, change the **plugin** block (e.g. `imageWidth`) — SPEC-FIX-11
R5.6 pinned `imageWidth: 220` there to match the JS splash handoff.

## History note

Prior to the managed-workflow migration (Fable review P0 #4, commit
around 2026-07-03) the version lived in three files: `app.json`,
`ios/Kinderwell/Info.plist`, and `ios/Kinderwell.xcodeproj/project.pbxproj`.
The old `bump-version.sh` touched all three. When `ios/` was deleted
in the migration, the script exited with code 2 at the first grep and
`package.json` silently drifted to `1.0.0` while `app.json` moved to
`1.1.0`. Fable review #7 caught this. The script now touches only
`app.json` + `package.json`.
