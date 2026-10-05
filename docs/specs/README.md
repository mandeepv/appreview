# specs/ — future work packages (parked)

Durable copies of planning artifacts that describe **future** work, copied into the repo because the owner's planning folder is not backed up — this repo is the only durable store (OWNER_TODO Task 6).

Taxonomy (see `../README.md`): these are **snapshots** of a plan at a point in time. They are NOT active process docs and NOT started work — each is parked until its trigger (see `../BACKLOG.md` → "Parked work"). Each file carries a one-line ORIGIN header noting it's an owner-supplied artifact.

## Contents

- `SPEC-11-notifications.md` — local reminders (Phase 1). Parked until owner go + a reminder-shape decision.
- `SPEC-12-android-readiness.md` — Android readiness (code-side). Parked on product demand.
- `NEW_APP_CHECKLIST.md` — the second-app playbook: turn this scaffolding into a new app. Parked until a second app is on the horizon.
- `SPEC-20-production-testing.md` — production-grade testing: seam tests for the gate/auth/money paths, edge-function and RLS tests, simulator E2E, and an automated release gate. Starts on owner go.

Related: `../ANALYTICS_DASHBOARDS.md` (PostHog dashboard spec, post-v1.2.0) is the same kind of parked artifact but lives at the `docs/` top level, not here.
