# Kinderwell docs

Everything process-related lives in this folder. If you're looking for how to do a thing, start here.

## When you need to...

### Ship a new release
- **`DEV_PROD_ENVIRONMENTS.md`** — full end-to-end release workflow (Phase 1 → Phase 10)
- **`RELEASE_PROCESS.md`** — git tagging after App Store approval
- **`VERSION_MANAGEMENT.md`** — how to bump versions and build numbers

### Set up dev / test something safely
- **`DEV_PROD_ENVIRONMENTS.md`** — switching between dev and prod, applying schema changes safely, backward compatibility rules
- **`STOREKIT_SETUP_GUIDE.md`** — StoreKit testing in Xcode

### Set up a new machine or environment
- **`QUICK_START.md`** — fastest path to API keys
- **`SETUP_GUIDE.md`** — full Supabase + Superwall setup
- **`STOREKIT_SETUP_GUIDE.md`** — StoreKit test setup

### Ship for App Store review
- **`LAUNCH_CHECKLIST.md`** — pre-launch checklist
- **`APP_STORE_COMPLIANCE_ISSUES.md`** — current + past compliance issues by build
- **`REVIEW_BLOCKERS.md`** — Apple guideline review notes

### Get your bearings on the codebase
- **`Branding.md`** — colors, tone, principles
- **`BEST_PRACTICES.md`** — where Kinderwell is following (and not following) best practices, prioritized

## Doc directory

| File | What it's for | Actively used? |
|---|---|---|
| `BEST_PRACTICES.md` | Gap analysis + prioritized what-to-fix list | ✅ Always |
| `DEV_PROD_ENVIRONMENTS.md` | Dev/prod switching, release workflow, migrations | ✅ Every release |
| `RELEASE_PROCESS.md` | Git tagging after App Store approval | ✅ Every release |
| `VERSION_MANAGEMENT.md` | Version + build number rules | ✅ Every release |
| `LAUNCH_CHECKLIST.md` | Pre-launch checklist | ✅ Every release |
| `APP_STORE_COMPLIANCE_ISSUES.md` | Compliance history by build | ✅ Ongoing |
| `REVIEW_BLOCKERS.md` | Apple guideline notes | ✅ Ongoing |
| `SETUP_GUIDE.md` | Supabase + Superwall setup | 🔧 New machine only |
| `QUICK_START.md` | API keys quick reference | 🔧 New machine only |
| `STOREKIT_SETUP_GUIDE.md` | StoreKit Xcode setup | 🔧 New machine only |
| `Branding.md` | Design principles | 📖 Reference |

## What lives at the repo root (not here)

- `README.md` — project readme
- `lessons_content.md` — app content, not process docs
- `CODING_COMPLETE.md`, `LESSON_EXTRACTION_SUMMARY.md` — historical snapshots

## Adding new docs

- Process/workflow doc → put here
- Point-in-time status snapshot ("what we shipped this week") → keep at root
- App content or config → keep at root
- Update this index when you add a doc
