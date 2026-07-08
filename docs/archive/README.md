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

### `DEV_SETUP_LOG_2026-07-01.md` *(not yet archived)*
- Kept active while Saturday's iPhone smoke test is still pending. Move to archive after Saturday's test passes and the setup is verified end-to-end.

### `lessons_content.md`
- **Original purpose:** Raw extracted lesson source text (the output of `scripts/extract_lessons.py`), used to author the in-app lesson content.
- **Why archived:** Moved out of the repo root during the SPEC-07 hygiene sweep. Not imported or referenced by app code — it's source material, not a runtime asset.
- **Still useful for:** Likely source material for SPEC-09 (lesson content work). Do NOT delete — kept here as the canonical extracted text.

## Adding to archive

When archiving:
1. `git mv` the file into `docs/archive/`
2. Add a new entry above with:
   - Original purpose
   - Why it was archived
   - What info is still useful to know is in there
3. Update `docs/README.md` to remove the doc from the active index
