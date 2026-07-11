# SPEC-FIX-10 — Pre-rebuild fixes (v1.2.0 pre-prod review, 2026-07-11)

> ORIGIN: transcribed from owner-provided spec images 2026-07-11.

**Context:** the six-lens pre-prod review found the code ship-worthy but the
built binary STALE — EAS build `624d434d` (1.2.0/build 10) came from `fb3e01c`,
which predates SPEC-FIX-08 (the never-paid-user fix that gates this release).
Nothing is submitted to ASC yet, so build 10 is reusable. A rebuild from current
`main` is therefore mandatory — and since we're rebuilding anyway, this ONE PR
lands the eight cheap fixes the review surfaced at zero extra release cost. It
also gives the `pull_request → main` CI trigger its first real exercise before
the release build.

Real branch + PR (not direct-to-main). Order of ops after merge: `gh workflow
run CI --ref main` → confirm 4 gating jobs green → rebuild from `main` (new build
number if EAS requires) → discard `624d434d` → resume `docs/releases/v1.2.0.md`
at the `eas submit` step. Tag the dual git tags on the REBUILT commit, never
`fb3e01c`.

## Fixes (all in one PR)

- **F1 (HIGHEST VALUE) — Security:** close the `.env.dev.bak` leak vector.
  `.gitignore` listed `.env`, `.env.local`, `.env.*.local`, `.env.prod` — but
  NOT `.env.dev.bak`, the exact filename `src/lib/supabase.ts`'s dev→prod guard
  tells you to create as a copy of `.env.prod` (holds the prod DB password). One
  `git add -A` would commit it. Replaced the individual `.env*` lines with a
  catch-all `.env*` + allowlist `!.env.example`. Verified `git check-ignore`
  returns the path for `.env.dev.bak`/`.env.prod`/`.env` and NOT `.env.example`.
- **F2 — Docs:** RELEASE_CHECKLIST submission-blocker #3 said every paywall must
  HAVE a dismiss control — the OPPOSITE of the hard-paywall model. Rewrote to the
  hard-paywall reality (NO dismiss control). Fixed the copy in `v1.2.0.md`.
- **F3 — Docs:** finished the SPEC-FIX-08 migration in PAYWALL_MODEL.md —
  invariant 3 + the authStore section still described the retired event-based
  clearing. Updated both to user-binding (`{ userId, subscribed }`, honored only
  on `session.user.id === record.userId`; lapsed-user grace window = SPEC-FIX-09).
- **F4 — Code (comment-only):** reconciled the stale `setIsSubscribed` comment
  (`authStore.ts:118-121`) that still described clearing the key on no-user; the
  startup-race follow-up (`db507d6`) changed the behavior to "do nothing."
- **F5 — Code:** `trackAuthAbandoned` now routes through `safeCapture` (not the
  raw `captureWithProps`). It runs inside AuthScreen's catch block; a raw
  `posthog.capture` throw there would swallow the real auth error and strand the
  user on a spinner. Grep: no raw `posthog.capture(` outside `src/lib/`.
- **F6 — Docs:** kill-switch test value `9999` → `39` in DEV_PROD_ENVIRONMENTS.md.
  The code caps at `MIN_SUPPORTED_BUILD_CAP = 40` and silently ignores anything
  above it, so `9999` "verifies" a no-op. Added one line on why the cap exists.
- **F7 — Code:** simplified the degenerate `clearStale` boolean in
  `entitlementCache.ts` (`record != null || (somethingOnDisk && sessionUserId
  === undefined) || somethingOnDisk` reduces to `somethingOnDisk`). Behavior
  identical (verified); honor logic untouched; entitlementCache tests green
  unchanged.
- **F8 — Docs:** refreshed the stale OPS_STATE `subscription_gate` row
  (was "pre-v1.1.0") to the 2026-07-11 re-verification (owner re-checked the
  Superwall dashboard this session: Gated, audience = unsubscribed, no limit).

## Decision recorded (owner, 2026-07-11): accept the offline-first-launch window

A paying v1.1.0 user whose FIRST v1.2.0 launch is offline has the legacy-unowned
flag cleared (SPEC-FIX-08 migration) and sits at the retry/escape-hatch screen
until connectivity returns. One launch wide, payers-only, inherent cost of the
security fix. Accepted. Added an OPS_STATE Accepted-risks row (revisit trigger:
support tickets about it) + a one-line note in the runbook's upgrade-test section.

## Constraints

No behavior changes except F5 (analytics transport) and F7 (equivalent
simplification). No gate-graph changes; `replace('Root')` stays LoadingScreen-only.
Money-path honor logic untouched.

## Acceptance criteria

- [x] `.gitignore`: `git check-ignore` confirms `.env.dev.bak`/`.env.prod`/`.env` ignored, `.env.example` not (F1).
- [x] RELEASE_CHECKLIST + v1.2.0 runbook no longer instruct a dismiss control (F2); PAYWALL_MODEL fully reflects user-binding (F3).
- [x] No raw `posthog.capture(` outside `src/lib/`; analytics can't throw into an auth catch (F5).
- [x] Kill-switch doc says 39 (F6); `clearStale` simplified, entitlementCache tests unchanged & green (F7).
- [x] OPS_STATE `subscription_gate` row dated after owner re-check (F8) + offline-first-launch accepted-risk row added.
- [ ] tsc clean · full suite green (116/116) · eslint ≤ 107 baseline · `replace('Root')` grep LoadingScreen-only.
- [ ] Opened as a branch + PR (exercises the pull_request CI trigger); PR notes the stale-binary blocker and the mandatory rebuild-from-main.

## Fast-follow queue (post-release — do NOT gate the release on these)

- Throttle the `PlacementNotFound` Sentry/PostHog emit (an incident is ~1200 events, would exhaust the 100/hr Sentry quota and mask other errors) — do this soon after ship, not blocking.
