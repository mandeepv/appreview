# App Store Release Process

This document outlines the process for tagging and tracking App Store releases for the Kinderwell app.

## Overview

We use a dual-tag system to mark App Store releases:
1. **Build-specific tag** (e.g., `v1.0.0-build-8`) - Marks the exact build number
2. **Production marker tag** (e.g., `appstore-live-v1.0.0`) - Indicates the current live version

This approach helps distinguish between builds that were submitted but rejected vs. builds that were approved and went live.

## Release Tagging Process

### When to Tag

Tag your release **after App Store approval** and before the app goes live (or immediately after it goes live).

### Step-by-Step Instructions

1. **Verify your version and build number**
   ```bash
   # Managed workflow: version lives in app.json + package.json
   node -e "console.log('app.json:', require('./app.json').expo.version, 'build', require('./app.json').expo.ios.buildNumber)"
   node -e "console.log('package.json:', require('./package.json').version)"
   ```

2. **Create the build-specific tag**
   ```bash
   # Format: v{VERSION}-build-{BUILD_NUMBER}
   # Example for version 1.0.0, build 8:

   git tag -a v1.0.0-build-8 -m "$(cat <<'EOF'
   App Store release v1.0.0 (build 8) - APPROVED

   Approved: March 3, 2026
   Live date: March 4, 2026
   Previous builds 1-7 were not submitted/rejected
   EOF
   )"
   ```

3. **Create the production marker tag**
   ```bash
   # Format: appstore-live-v{VERSION}
   # Example:

   git tag -a appstore-live-v1.0.0 -m "Current live version on App Store - v1.0.0 (build 8)"
   ```

4. **Push tags to remote**
   ```bash
   git push origin v1.0.0-build-8
   git push origin appstore-live-v1.0.0
   ```

### For Subsequent Releases

When releasing a new version (e.g., v1.1.0):

1. **Delete the old production marker** (locally and remotely):
   ```bash
   # Delete locally
   git tag -d appstore-live-v1.0.0

   # Delete from remote
   git push origin :refs/tags/appstore-live-v1.0.0
   ```

2. **Create new tags** following steps 2-4 above with the new version/build numbers

3. **Keep all build-specific tags** - Never delete these! They provide a complete history.

## Tag Naming Conventions

### Build-Specific Tags
- Format: `v{MAJOR}.{MINOR}.{PATCH}-build-{BUILD_NUMBER}`
- Examples:
  - `v1.0.0-build-8`
  - `v1.0.1-build-12`
  - `v2.0.0-build-1`
- Purpose: Marks specific builds, including rejected ones

### Production Marker Tags
- Format: `appstore-live-v{MAJOR}.{MINOR}.{PATCH}`
- Examples:
  - `appstore-live-v1.0.0`
  - `appstore-live-v1.0.1`
  - `appstore-live-v2.0.0`
- Purpose: Quickly identify what's currently live on the App Store
- Note: Only one production marker should exist per platform at a time

## Viewing Tags

```bash
# List all tags
git tag

# List tags matching a pattern
git tag -l "v1.0.*"
git tag -l "appstore-live-*"

# View tag details
git show v1.0.0-build-8

# View what code was in a specific tag
git checkout v1.0.0-build-8
```

## Best Practices

1. **Always tag after approval** - Wait for App Store approval before creating tags
2. **Include approval/live dates** - Helps track timeline in the future
3. **Document rejected builds** - Note in the tag message if previous builds were rejected
4. **Never delete build tags** - Keep complete history of all builds
5. **Update production marker** - Move the `appstore-live-*` tag for each new release
6. **Create GitHub Releases** - Optionally create GitHub releases from these tags with release notes

## Troubleshooting

### If you tagged the wrong commit
```bash
# Delete the tag locally
git tag -d v1.0.0-build-8

# Delete from remote
git push origin :refs/tags/v1.0.0-build-8

# Recreate on the correct commit
git checkout <correct-commit-hash>
git tag -a v1.0.0-build-8 -m "Your message"
git push origin v1.0.0-build-8
```

### If you need to see what was released
```bash
# Check out the production tag
git checkout appstore-live-v1.0.0

# Or just view the files without checking out
git show appstore-live-v1.0.0:path/to/file
```

## Example Release Timeline

**Version 1.0.0 Release:**
- Builds 1-7: Rejected or not submitted (no tags)
- Build 8: Approved ✓
  - Tag: `v1.0.0-build-8`
  - Tag: `appstore-live-v1.0.0`

**Version 1.0.1 Release (bug fix):**
- Build 9: Rejected (optional: tag as `v1.0.1-build-9`)
- Build 10: Approved ✓
  - Tag: `v1.0.1-build-10`
  - Delete: `appstore-live-v1.0.0`
  - Tag: `appstore-live-v1.0.1`

**Version 2.0.0 Release (major update):**
- Build 1: Approved ✓
  - Tag: `v2.0.0-build-1`
  - Delete: `appstore-live-v1.0.1`
  - Tag: `appstore-live-v2.0.0`

---

**Last Updated:** March 3, 2026
**Current Live Version:** v1.0.0 (build 8)
