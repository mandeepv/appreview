# CLAUDE.md — Kinderwell

The entry point for every AI coding session. Kept under ~100 lines; it's loaded as context every session — link to detail, don't inline it.

Kinderwell is a React Native / Expo (managed workflow) iOS app: parenting-education lessons behind a hard subscription paywall. Supabase (auth + Postgres + edge functions), Superwall (paywall/IAP), PostHog (analytics), Sentry (errors). Solo-maintained; AI-assisted development is the norm here.

## Read before changing anything

- `docs/INVARIANTS.md` — the rules correctness silently depends on. Check every diff against it. The big ones:
  - Every path into `Root` goes through the Loading gate. `grep -rn "replace('Root')" src/` must hit only LoadingScreen.
  - `onSkip` grants access — the Superwall dashboard audience config is load-bearing and invisible to code review.
  - An `error` result from the onboarding check is never treated as `no_onboarding`.
  - No email, child names, or free-text PII to PostHog/Sentry, ever. Identify by Supabase user ID only.
  - AsyncStorage keys only via `src/constants/storageKeys.ts`; never rename a shipped key without a migration.
- `docs/PAYWALL_MODEL.md` — before touching anything in the launch/auth/gate path.
- `docs/DEV_PROD_ENVIRONMENTS.md` — before touching env config, migrations, or the Supabase CLI.
- `docs/OPS_STATE.md` — the living register of external state (DB/dashboard/secrets/ASC). Check it before asking the owner "is X done?"; `unverified` means genuinely unknown, not "no".

## Docs: what's truth and what's history

- **Live docs:** `docs/README.md` is the index; the evergreen core it lists (RELEASE_CHECKLIST, DEV_PROD_ENVIRONMENTS, VERSION_MANAGEMENT, PAYWALL_MODEL, INVARIANTS, REVIEW_PROTOCOL, DEMO_MODE, APPLE_JWT_ROTATION) is maintained and current. `docs/BACKLOG.md` is the living work tracker.
- `docs/archive/` and any `FABLE_*` / dated files are frozen snapshots — history, NOT current process. Do not follow them; do not "fix" code to match them. If a snapshot contradicts current code, the code wins.

## Environment safety (hard rules)

- Two Supabase projects: dev and prod. All development and testing against dev only. Never `supabase link` to the prod ref; prod pushes go through `scripts/db-push-prod.sh` and are owner-run.
- Purchases are tested with sandbox App Store accounts only.
- Never edit `eas.json` values, `legal/`, or anything requiring the Superwall/PostHog/Sentry dashboards — owner-only.
- Never commit `.env*`, keys, or `backups/`.

## Commands

- Typecheck: `npx tsc --noEmit` · Lint: `npx eslint .` (baseline ~200 warnings — add zero new ones) · Tests: `npm test`
- Version bump: `scripts/bump-version.sh <version> <build>` (buildNumber must be a bare integer)
- Node 20 (see `.nvmrc`); lint crashes on Node 16.

## Conventions

- Comments: narrative why-comments are house style — they document trust models and past bugs. Match them; never delete one unless the code it explains is gone; update comments your change makes stale.
- Commits: conventional (`fix(scope): ...`), causal, one concern per commit.
- Analytics: events only via `safeCapture` / the typed registry (`src/lib/events.ts` once it exists) — never raw `posthog.capture` in screens. Errors go to Sentry (`reportError`), not PostHog.
- Errors: house pattern is try/catch + `__DEV__` log + rethrow (mutations) or safe default (reads) + `reportError` on money/auth paths.
- DB: all access through `src/services/`, typed via `src/types/supabase.ts` (`npm run gen:supabase-types` after schema changes). Screens never import the Supabase client.
- Lessons (post lesson-engine): content lives in `src/lessons/content/*.ts` validated by zod schemas — content edits are data edits; don't create new screen files for lessons.

## Current state pointers

- Live docs index: `docs/README.md` (the evergreen core + living trackers). Open work queue: `docs/BACKLOG.md`.
- The master hardening plan + intern specs live OUTSIDE this repo (owner's planning workspace) — they are not committed here.
- Live App Store version and release history: git tags (`v*-build-*`, `appstore-live-*`).
