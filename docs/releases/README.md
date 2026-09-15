# Release runbooks (per-release instances)

For **every** release, copy `docs/RELEASE_CHECKLIST.md` → `docs/releases/v<X.Y.Z>.md` and tick each box **as you do it**, adding a date + one line of evidence (command output, a row count, a screenshot filename). After shipping, the file **freezes forever** — it's a snapshot of what actually happened for that version. **Never edit a past release's runbook.**

`RELEASE_CHECKLIST.md` is the TEMPLATE (never ticked). These instances are the executed copies. Taxonomy (see `../README.md`): **instances = snapshots** (born with a date, frozen after shipping); this directory itself is a **living convention**.

**After copying the template, rewrite its relative links `./` → `../`** — the instance lives one directory deeper than the template, so `[..](./FOO.md)` must become `[..](../FOO.md)` (else the links 404).

## Instances

- `v1.2.0.md` — **SHIPPED 2026-07-19** (build 11), frozen. Scope: paywall fixes + lesson engine + progress sync. Marker tag `appstore-live-v1.2.0`. (This entry said "seeded (unticked) — owner fills as v1.2.0 ships" for two months after it shipped.)
- `v1.3.0.md` — **not yet seeded.** Copy `RELEASE_CHECKLIST.md` here before building 1.3.0 (build 12): the onboarding / Learn / You redesign.
