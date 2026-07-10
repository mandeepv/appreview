# REVIEW_PROTOCOL

How the 2026-07-07 six-lens release review was run, so it can be repeated with any capable AI model (or human reviewers) for future releases. The value was in the structure, not the specific model.

## Setup

Check out the release branch; generate `git diff main...release-branch` excluding docs/lockfiles; make both branches available (`git show main:<path>` for the prod side).

## Run six independent reviews in parallel, each with a narrow charter:

1. **Upgrade path** — existing-user impact only: storage keys, persisted state, session survival, deleted routes, DB compatibility. Rule: no finding without verifying the *old* branch's behavior too.
2. **Money paths** — paywall/entitlement/kill-switch: enumerate failure modes (offline, outage, restore, dashboard misconfig, fail-open vs fail-closed), read the SDK's actual type definitions in node_modules, not its docs.
3. **Auth & security** — auth flows end-to-end, edge functions (does anything trust unverified input?), secrets scan incl. git history, RLS policies vs prod schema snapshot, PII in analytics.
4. **Build & release** — version/bundle/entitlement continuity vs the shipped app, env wiring, and a distinct deliverable: *server-side prerequisites* — everything that must be true outside the binary, with evidence of whether it's done. Evidence for those prerequisites is recorded in `OPS_STATE.md` (the living register) + the per-release runbook (`releases/v<X.Y.Z>.md`) — check there rather than asking the owner.
5. **Architecture & code quality** — layering, duplication, typing rigor, dead code, dependency health, the three scalability axes (content/team/load). Calibrated to team size.
6. **Process audit** — read every doc in docs/ and judge: followable? drifted from code? single source of truth? Compare against disciplined-small-startup norms.

## Rules that made it work

Every finding needs `file:line` + severity + confidence; claims from the repo's own docs must be independently verified; findings are adversarially challenged (the sign-in bypass was confirmed by hand before being reported); "checked and CLEAN" areas are listed explicitly so silence ≠ unknown; findings that require a *decision* (product tradeoffs) are separated from findings that require a *fix*.

## Cadence

Full six-lens review before any release that touches money, auth, or data. Lenses 1–4 only for small releases. After each release, retro the checklist and prune (invariant 18).
