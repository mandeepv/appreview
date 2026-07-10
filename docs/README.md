# Kinderwell docs

The live process docs live here. **Everything in this folder (outside `archive/`) is evergreen — maintained to track the code.** Point-in-time snapshots live in `archive/` and are frozen history, not current process.

> **Docs taxonomy (three species — every doc is exactly one):**
> - **Evergreen** — must track the code; standing maintenance debt. Lives in `docs/`.
> - **Living** — trackers, updated constantly (`BACKLOG.md`, `PRODUCT_ROADMAP.md`). Lives in `docs/`.
> - **Snapshot** — valuable history, frozen, NEVER edited again. Lives in `docs/archive/` with a `SNAPSHOT` banner.
>
> **Admission rule:** a new doc enters the evergreen core **only if you commit to updating it whenever the code changes.** Otherwise it's born as a snapshot with a date in its name and goes straight to `archive/`. (Three historical drift incidents all came from snapshots that kept "live" status after their content stopped being maintained.)

## The evergreen core

| File | What it's for |
|---|---|
| `README.md` | This index |
| `INVARIANTS.md` | The rules correctness silently depends on — check every diff against it |
| `REVIEW_PROTOCOL.md` | How to run the six-lens release review (repeatable with any capable reviewer) |
| `RELEASE_CHECKLIST.md` | The ordered checklist for every release (incl. the git tag scheme) |
| `DEV_PROD_ENVIRONMENTS.md` | Dev/prod switching, migrations, kill switch, backward-compat rules |
| `VERSION_MANAGEMENT.md` | Version + build-number rules + `scripts/bump-version.sh` |
| `PAYWALL_MODEL.md` | 🚨 Hard-paywall gating model + `isSubscribed` persistence + Superwall placement — read before touching `LoadingScreen` / `SplashScreen` / `authStore` / `useLessonGate` |
| `DEMO_MODE.md` | 🚨 7-tap Apple-reviewer bypass invariants — read before touching auth/subscription code |
| `APPLE_JWT_ROTATION.md` | 6-month Apple JWT rotation procedure |
| `STOREKIT_SETUP_GUIDE.md` | StoreKit Xcode setup + sandbox Apple ID |

## Living docs (trackers)

| File | What it's for |
|---|---|
| `BACKLOG.md` | The single work queue — open hardening items. Read + update when picking next work. |
| `PRODUCT_ROADMAP.md` | Feature / experiment queue with prioritization |

## Per-release (delete or archive when its version ships)

| File | What it's for |
|---|---|
| `IPHONE_TEST_PLAN_V1.1.0.md` | Manual smoke-test plan for v1.1.0 on iPhone XR. **After 1.1.1 ships**, extract its reusable regression sections into an evergreen `TEST_PLAN_TEMPLATE.md`, then archive this file. |

## Historical context (rarely needed)

- **`archive/`** — frozen snapshots: old launch/compliance history, the 2026-07 Fable reviews + status tracker, the prod bug hunt, the folded `RELEASE_PROCESS`/`BEST_PRACTICES`/`SETUP_GUIDE`, the SPEC handoff, etc. See `archive/README.md` for what's in there and why. **`archive/` is history, not truth — if a snapshot contradicts current code, the code wins.**
- **`spec-09/`** — SPEC-09 (data-driven lesson engine) working artifacts: the block survey and content errata. Snapshots of that migration.

## What lives at the repo root (not here)

- `CLAUDE.md` — the AI-session entry point (evergreen; orients every session on the core + invariants + env safety)
- `README.md` — project readme
- `scripts/` — ops scripts (`bump-version.sh`, `backup-prod.sh`, `db-push-prod.sh`, etc.)

## Adding / pruning docs

- Evergreen process doc you'll maintain → add here **and** add it to the core table above.
- A "what we shipped/found this week" snapshot → `archive/` with a `SNAPSHOT` banner + an `archive/README.md` entry (don't leave it "live").
- **Post-release retro (standing 15-min step, per invariant 18):** archive what's dated, strip per-release blocks from `RELEASE_CHECKLIST.md`, and spot-check the evergreen core against the code. Pruning is part of shipping, not a someday task.
