# Archived docs

Docs that were once actively used but are now historical. **Nothing has been deleted — everything here is still readable.** Kept out of the main `docs/` index to reduce noise.

## What's here and why it was archived

### `LAUNCH_CHECKLIST.md`
- **Original purpose:** Pre-v1.0.0 launch checklist (January 2026)
- **Why archived:** Info now covered by `RELEASE_CHECKLIST.md` (the ongoing per-release checklist). This one was a one-time snapshot of "what shipped in v1.0.0."
- **Still useful for:** URLs and one-off setup notes (support email, GitHub Pages legal doc URLs, App Store review submission templates from initial launch).

### `QUICK_START.md`
- **Original purpose:** Fast-track "get API keys" summary from initial setup
- **Why archived:** `SETUP_GUIDE.md` covers the same ground more completely.
- **Still useful for:** Occasional quick reference if `SETUP_GUIDE.md` feels too dense.

### `APP_STORE_COMPLIANCE_ISSUES.md`
- **Original purpose:** Rejection history + compliance decisions for App Store review (Feb 2026, builds 6-8)
- **Why archived:** All findings addressed by v1.0.0 approval. Historical record.
- **Still useful for:** If Apple ever cites the same guidelines again, check here for how we responded last time. Also has App Overview table (Framework, iOS min, tables, subscriptions, dangerous packages).

### `REVIEW_BLOCKERS.md`
- **Original purpose:** Exhaustive Apple guideline pre-submission review (Feb 2026)
- **Why archived:** Some findings were incorrect (e.g., NSLocationWhenInUseUsageDescription flagged but app doesn't use location APIs). Others were addressed in v1.0.0 approval.
- **Still useful for:** Reference for the SEVERITY of various guidelines. If preparing for a big feature rewrite that might trigger new review scrutiny, worth re-reading.

### `COMPOUND_ENGINEERING_REVIEW.md`
- **Original purpose:** Whole-codebase deep review dated 2026-07-02 by parallel specialist agents
- **Why archived:** Codebase has changed substantially since (bundle split, kill switch, version bump, PrivacyInfo fix, PostHog env property, etc). Findings are partially stale.
- **Still useful for:** Reading the methodology, understanding the initial "NO-GO as-is" verdict, seeing what the app looked like BEFORE the 07-03 fixes.
- **Should be re-run:** After next major architectural work.

### `DEV_SETUP_LOG_2026-07-01.md`
- **Original purpose:** Point-in-time receipt of the 2026-07-01 dev-environment setup (Supabase projects, EAS profiles, keys, first prebuild).
- **Why archived:** A dated snapshot of a one-time setup — the ongoing dev/prod reference lives in `DEV_PROD_ENVIRONMENTS.md`. Archived 2026-07-09 (the smoke-test milestone it was waiting on has passed).
- **Still useful for:** Reconstructing what the initial environment looked like and the exact one-time setup steps, if you ever re-bootstrap.

### `lessons_content.md`
- **Original purpose:** Raw extracted lesson source text (the output of `scripts/extract_lessons.py`), used to author the in-app lesson content.
- **Why archived:** Moved out of the repo root during the SPEC-07 hygiene sweep. Not imported or referenced by app code — it's source material, not a runtime asset.
- **Still useful for:** Likely source material for SPEC-09 (lesson content work). Do NOT delete — kept here as the canonical extracted text.

### `FABLE_REVIEW.md`, `FABLE_LATEST_REVIEW.md`, `FABLE_RE_REVIEW_2026-07-05.md`
- **Original purpose:** The 2026-07 Fable release-review passes (findings + severities) for the v1.1.0 hardening cycle.
- **Why archived:** Point-in-time review snapshots. The review *methodology* is now the evergreen `REVIEW_PROTOCOL.md`; the *findings* were addressed in code (see the status tracker below).
- **Still useful for:** "What did the 2026-07 review find, and how did we respond?" Historical audit trail with commit references.

### `FABLE_LATEST_REVIEW_STATUS.md`
- **Original purpose:** Live item tracker for the Fable review — every finding, its status, and the commit that closed it.
- **Why archived:** Its state was migrated — every open item now lives in `BACKLOG.md` (items #9c–9k, #18, #21), which is the work queue. This tracker is the historical audit of what the review found.
- **Still useful for:** Cross-referencing a Fable finding to the exact commit that fixed it.

### `PROD_BUG_HUNT.md`
- **Original purpose:** A point-in-time production bug-hunt sweep.
- **Why archived:** Dated snapshot; findings were triaged into code fixes / `BACKLOG.md`.
- **Still useful for:** Reconstructing what was hunted and found in that pass.

### `RELEASE_PROCESS.md`
- **Original purpose:** The git-tagging convention (build tags + production-marker tags).
- **Why archived:** Two docs about one activity drift apart (invariant 18). Folded into `RELEASE_CHECKLIST.md` ("Tag the release") — the single source for release mechanics.
- **Still useful for:** The full tag-troubleshooting detail (wrong-commit recovery, viewing tags) if the checklist's summary isn't enough.

### `BEST_PRACTICES.md`
- **Original purpose:** A "where we are today" gap analysis / practices tracker.
- **Why archived:** A point-in-time snapshot that mixed done-items with a live gap list — the two drift. Open items live in `BACKLOG.md`; the rest is history.
- **Still useful for:** The historical "gap analysis" framing and the record of what was done when.

### `SETUP_GUIDE.md`
- **Original purpose:** Full local dev-environment setup walkthrough (API keys, initial config).
- **Why archived:** A one-time setup snapshot; the ongoing dev/prod reference is `DEV_PROD_ENVIRONMENTS.md`.
- **Still useful for:** Re-bootstrapping a fresh machine — the step-by-step get-keys detail.

### `Branding.md`
- **Original purpose:** Early branding / visual-identity notes.
- **Why archived:** Reference material, not a maintained process doc.
- **Still useful for:** The original colour/typography/brand intent.

### `SPEC_HANDOFF_2026-07-09_DELETE_AFTER_REVIEW.md`
- **Original purpose:** Temporary handoff writeup of SPEC-01…SPEC-10 + SPEC-FIX-01 + the full SPEC-09 per-phase log, for a reviewer.
- **Why archived:** A dated handoff snapshot (SPEC-09 is now complete; the writeup is history). Kept rather than deleted per its own "review" purpose.
- **Still useful for:** The blow-by-blow record of what each SPEC changed and why during the 2026-07 hardening cycle.

## Adding to archive

When archiving:
1. `git mv` the file into `docs/archive/`
2. Add a new entry above with:
   - Original purpose
   - Why it was archived
   - What info is still useful to know is in there
3. Update `docs/README.md` to remove the doc from the active index
