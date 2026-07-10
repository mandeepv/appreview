<!-- ORIGIN: owner-supplied planning artifact, copied into the repo verbatim per OWNER_TODO Task 6 (the planning folder is not backed up; this repo is the durable store). Future work package — parked on product demand. -->

# SPEC-12 — Android readiness (code-side)

Context: plan Part D (Tier 10), items 10.1, 10.2 (code side), 10.4, 10.5, 10.6. Goal: everything that can be built and verified on an emulator **without any store/dashboard access**. The owner-only track (10.3 Superwall/Play Billing, 10.7 Play Console) is listed at the end so nothing is silently dropped — do not attempt any of it. Depends on SPEC-01 merged (the gate code this spec extends must be the fixed version).

Files: `app.config.js`, `scripts/bump-version.sh`, `src/lib/appConfig.ts`, `src/components/ForceUpdateModal.tsx`, `src/screens/onboarding/LoadingScreen.tsx`, `src/screens/onboarding/AuthScreen.tsx`, a new migration under `supabase/migrations/`, `docs/VERSION_MANAGEMENT.md`, `docs/DEV_PROD_ENVIRONMENTS.md`, asset files for adaptive icon/splash.

## R1 — Build & version plumbing (plan 10.1)

- `app.config.js`: add the `android` block — `package` (ask owner for the exact reverse-DNS id if not already decided; likely mirrors the iOS bundle id), `versionCode` sourced exactly like `buildNumber` (same env/arg path, and the same fail-loud rule from SPEC-02: missing value throws at config-evaluation time, no silent fallback), `adaptiveIcon` (foreground + background + monochrome) and splash config reusing the existing brand assets.
- `scripts/bump-version.sh`: also write `android.versionCode`, guarded by the same bare-integer regex as buildNumber (`^[0-9]+$`) — invariant #12 applies to both stores. Keep iOS behavior byte-identical for existing invocations.
- Update `VERSION_MANAGEMENT.md` and `DEV_PROD_ENVIRONMENTS.md` where they describe bump-version.sh — after this change their "touches android.versionCode" claim becomes TRUE (it was a documented lie; note that in the PR description).
- Do NOT touch `eas.json` (owner-only). If an Android build profile is missing, list exactly what the owner needs to add in the PR description instead.

## R2 — Kill switch, platform-aware (plan 10.4)

- Migration (run against **dev** only; prod application is owner-run via `scripts/db-push-prod.sh`): add `min_supported_android_build` to `app_config`. Do not rename or alter the existing iOS column — shipped v1.1.x binaries read it by name.
- `src/lib/appConfig.ts`: select the column via `Platform.OS`. Preserve every existing guard for both platforms: fail-open on missing table/row/network, ignore minimum ≤ 0, ignore non-numeric, respect `MIN_SUPPORTED_BUILD_CAP` (define the Android cap next to the iOS one with a why-comment). Compare against `versionCode` on Android via the config value plumbed the same way `buildNumber` is.
- `src/components/ForceUpdateModal.tsx`: on Android open `market://details?id=<package>` with a web `https://play.google.com/store/apps/details?id=<package>` fallback; keep the existing try/catch + inline failure copy from SPEC-01.
- Run `npm run gen:supabase-types` after the migration and commit the regenerated types.

## R3 — Hardware back-button audit (plan 10.5)

- `BackHandler` handling (or `preventDefault` on navigation `beforeRemove`, whichever matches the navigator setup) so that hardware back can NOT:
  - escape LoadingScreen while the gate is running/presenting/retrying (back during the gate = potential paywall bypass — invariant #1's Android-shaped twin; add a why-comment saying exactly that),
  - dismiss ForceUpdateModal (back-dismissing a kill switch defeats it),
  - pop out of the paywall presentation window into a stale screen.
- Everywhere else, default back behavior stays — do not globally swallow the back button (instant Play review rejection territory and hostile UX). Add a short "Android back behavior" note to `docs/PAYWALL_MODEL.md` documenting the three blocked surfaces.

## R4 — Auth parity, code side (plan 10.2)

- Wire an Android Google OAuth client ID through the existing env layering (`env.ts` / `app.config.js` extra), alongside the iOS one. The actual Google Cloud client creation needs the EAS keystore SHA-1 — owner task; use a dev placeholder and document the wiring in the PR.
- DECISION(owner) — Apple sign-in on Android: `expo-apple-authentication` is iOS-only. Option (a) hide the Apple button on Android (`Platform.OS` gate); option (b) Supabase web-OAuth Apple flow so iOS Apple-auth users can sign in on Android. Plan recommends (b), but this is a product/support call — stop and ask before implementing either. Whichever lands, AuthScreen must render correctly on Android with no dead buttons.

## R5 — Platform UI sweep + emulator smoke (plan 10.6)

- Safe areas / edge-to-edge: verify every onboarding screen, the gate, Settings, and one full lesson render without content under system bars; fix with the existing safe-area machinery (don't introduce a new inset library).
- StatusBar style per screen matches iOS intent; keyboard behavior on Auth inputs is usable (Android soft-input resize vs iOS pan differences).
- `fontScale` spot-check at the device maximum on the worst two screens (mirrors plan 8.10); fix only clipping/overlap bugs, don't redesign.
- Full Tier-1 manual flow list on an emulator, with one Android-specific caveat: without owner-side Superwall Android config (10.3), the gate cannot present a real paywall. Verify up to the gate decision point (gate runs, status transitions fire, escape hatch reachable via airplane mode) and note "paywall presentation pending 10.3" in the PR — do not fake entitlement to get past it.

## Constraints

- All the standing working-agreement rules, plus: dev Supabase only; the prod migration is NOT yours to run.
- No Play Console, Google Cloud, or Superwall dashboard actions — collect what the owner must do into a checklist in the PR description.
- Zero iOS behavior changes: the iOS build must be byte-for-byte equivalent in behavior (config-value plumbing refactors excepted). `npx tsc --noEmit` clean, no new lint warnings.
- No Android notification work here (channels, `POST_NOTIFICATIONS`) — that extends SPEC-11 later.

## Owner-only tasks unlocked by this spec (list verbatim in the PR)

First `eas build -p android` (generates + escrows the keystore) · Google Cloud Android OAuth client (needs keystore SHA-1) · Superwall Android app + Play Billing products + license testers (plan 10.3) · Play Console account, data safety form, listing, internal testing track (plan 10.7) · prod migration for `min_supported_android_build` · RELEASE_CHECKLIST Android section (plan 10.8, after first successful internal-track build).

## Acceptance criteria

- [ ] `scripts/bump-version.sh 1.2.0 12` updates iOS buildNumber AND android.versionCode; a non-integer versionCode is rejected; existing iOS-only invocation behavior unchanged.
- [ ] Emulator: dev DB `min_supported_android_build` set one above the current versionCode → ForceUpdateModal appears, opens Play URL path (dev: verify the intent fires), hardware back does NOT dismiss it; reset row → normal flow; iOS simulator behavior unchanged.
- [ ] Emulator: hardware back during gate states (checking / presenting / retry) never lands on a non-gated screen; back works normally on Settings and lesson screens.
- [ ] AuthScreen on Android: no dead buttons; Google wiring present (placeholder client id documented); Apple decision implemented as owner directed.
- [ ] Screens sweep screenshots (emulator, incl. max fontScale on the two worst screens) attached to the PR.
- [ ] Migration applied to dev; regenerated `src/types/supabase.ts` committed; existing iOS `app_config` column untouched.
- [ ] PR description: invariants touched (#1, #10-analog for config keys, #12, #14), owner-task checklist included, docs updated (VERSION_MANAGEMENT, DEV_PROD_ENVIRONMENTS, PAYWALL_MODEL back-button note).
