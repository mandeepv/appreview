# Kinderwell docs

Everything process-related lives in this folder. If you're looking for how to do a thing, start here.

## When you need to...

### Ship a new release
- **`RELEASE_CHECKLIST.md`** — the ordered checklist to follow every release
- **`DEV_PROD_ENVIRONMENTS.md`** — env switching, migrations, kill switch, backing details
- **`RELEASE_PROCESS.md`** — git tagging after App Store approval
- **`VERSION_MANAGEMENT.md`** — how to bump versions and build numbers (has the `scripts/bump-version.sh` reference)
- **`APPLE_JWT_ROTATION.md`** — 6-month JWT rotation procedure

### Set up dev / test something safely
- **`DEV_PROD_ENVIRONMENTS.md`** — switching between dev and prod, applying schema changes safely, backward compatibility rules, kill switch
- **`STOREKIT_SETUP_GUIDE.md`** — StoreKit testing in Xcode + sandbox Apple ID

### Set up a new machine or environment
- **`SETUP_GUIDE.md`** — full Supabase + Superwall setup
- **`STOREKIT_SETUP_GUIDE.md`** — StoreKit test setup

### Get your bearings on the codebase / plan work
- **`Branding.md`** — colors, tone, principles
- **`BEST_PRACTICES.md`** — where Kinderwell is following (and not following) best practices, prioritized
- **`PRODUCT_ROADMAP.md`** — feature/experiment queue with prioritization

### 🚨 Critical — read before touching auth or subscription code
- **`DEMO_MODE.md`** — how the 7-tap Apple reviewer bypass works, invariants that MUST hold or App Store rejects your build

### Ship prep (v1.1.0)
- **`FABLE_RE_REVIEW_2026-07-05.md`** — third-round external re-review with the pre-beta punch list. Read this before building the first TestFlight IPA.
- **`FABLE_LATEST_REVIEW_STATUS.md`** — live tracker for what's done/open across all Fable rounds.

### Historical context (rarely needed)
- **`archive/`** — old launch checklists, compliance history, initial reviews. See `archive/README.md` for what's in there and why it was archived.

## Doc directory

| File | What it's for | Actively used? |
|---|---|---|
| `BEST_PRACTICES.md` | Gap analysis + prioritized what-to-fix list | ✅ Always |
| `RELEASE_CHECKLIST.md` | The ordered checklist for every release | ✅ Every release |
| `DEV_PROD_ENVIRONMENTS.md` | Dev/prod switching, release workflow, migrations, kill switch | ✅ Every release |
| `RELEASE_PROCESS.md` | Git tagging after App Store approval | ✅ Every release |
| `VERSION_MANAGEMENT.md` | Version + build number rules + bump script | ✅ Every release |
| `APPLE_JWT_ROTATION.md` | 6-month Apple JWT rotation | ✅ Every 6 months |
| `PRODUCT_ROADMAP.md` | Feature and experiment queue | ✅ Ongoing |
| `DEMO_MODE.md` | 7-tap Apple reviewer bypass invariants | ✅ Read before touching auth or subscription code |
| `SETUP_GUIDE.md` | Supabase + Superwall setup | 🔧 New machine only |
| `STOREKIT_SETUP_GUIDE.md` | StoreKit Xcode setup + sandbox Apple ID | 🔧 New machine only |
| `Branding.md` | Design principles | 📖 Reference |
| `DEV_SETUP_LOG_2026-07-01.md` | Point-in-time setup receipt (will be archived after Saturday tests) | 🕰️ Temporary |
| `FABLE_REVIEW.md` | First external code review (2026-06) — findings with status markers | 📚 Historical / reference |
| `FABLE_LATEST_REVIEW.md` | Second external code review (2026-07-04) — findings and our responses | 📚 Historical / reference |
| `FABLE_LATEST_REVIEW_STATUS.md` | Live tracker of Fable Latest Review item status | ✅ While addressing review items |
| `FABLE_RE_REVIEW_2026-07-05.md` | Third external re-review (post-fixes) — beta & release readiness with stage-gated verdict, punch list, and 2 not-fully-landed fixes (PostHog email leak, CORS placeholder) | ✅ Active — driving the pre-beta punch list |
| `IPHONE_TEST_PLAN_V1.1.0.md` | Manual smoke test plan for v1.1.0 on iPhone XR | ✅ Before every release (adversarial tests should fold into RELEASE_CHECKLIST — see Fable review 🟡 doc/process item) |
| `PROD_BUG_HUNT.md` | 2026-07-04 systematic prod v1.0.0 bug hunt notes | 📚 Historical / reference for what shipped broken in v1.0.0 |
| `BACKLOG.md` | Single deferred-work backlog (replaces three prior V1.*.md files, per Fable review 🟡 "one backlog") | ⏭️ Deferred work — read + update when picking next work |

## What lives at the repo root (not here)

- `README.md` — project readme
- `lessons_content.md` — app content, not process docs
- `CODING_COMPLETE.md`, `LESSON_EXTRACTION_SUMMARY.md` — historical snapshots
- `posthog-setup-report.md` — PostHog wizard's setup summary

## Adding new docs

- Process/workflow doc → put here
- Point-in-time status snapshot ("what we shipped this week") → keep at root
- App content or config → keep at root
- Historical snapshot no longer actively used → `archive/` folder + update `archive/README.md`
- Update this index when you add or move a doc
