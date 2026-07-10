# Release runbooks (per-release instances)

For **every** release, copy `docs/RELEASE_CHECKLIST.md` → `docs/releases/v<X.Y.Z>.md` and tick each box **as you do it**, adding a date + one line of evidence (command output, a row count, a screenshot filename). After shipping, the file **freezes forever** — it's a snapshot of what actually happened for that version. **Never edit a past release's runbook.**

`RELEASE_CHECKLIST.md` is the TEMPLATE (never ticked). These instances are the executed copies. Taxonomy (see `../README.md`): **instances = snapshots** (born with a date, frozen after shipping); this directory itself is a **living convention**.

## Instances

- `v1.2.0.md` — seeded (unticked), scope: paywall fixes + lesson engine + progress sync. Owner fills as v1.2.0 ships.
