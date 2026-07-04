# Fable Latest Review — Item Tracker

Companion to `FABLE_LATEST_REVIEW.md`. Every finding, its status, and the
commit that addressed it (or the reason it's deferred). Updated live as we
work through the review.

**Legend:**
- ✅ done and verified
- ⚠️ done partially — see notes
- ⏭️ deferred to future release / handled outside code (dashboard, docs)
- ⬜ still open

---

## 🔴 Fix before merge (7 items)

| # | Finding | Status | Commit / notes |
|---|---|---|---|
| 1 | Restore Purchases still doesn't restore | ✅ | `b22ce35` — calls `restorePurchases()` + 3-outcome pattern |
| 2 | Silent onboarding-check re-onboards users | ✅ | `70cb6d2` — discriminated union `has/no/error` |
| 3 | Returning users redo onboarding lose answers + flag leak | ⚠️ | `fa27f90` — flag leak fixed. Fresh-answer discard intentional per user (documented in review doc) |
| 4 | Gated dead lesson screens; lesson 10 may be unreachable | ⚠️ | `dc29583` — dead files deleted. Lesson 10 placeholder status is a product decision, logged to `BACKLOG.md` item #11 |
| 5 | Apple name clobbered by 'Parent' | ✅ | `e43120c` — two-layer defense (LoadingScreen + service) |
| 6 | SKIP_PAYWALL works in store builds | ✅ | `c677289` — `__DEV__` runtime guard + build-time throw |
| 7 | `bump-version.sh` broken + version docs wrong | ✅ | `c3b7e64` — rewrote script + docs + CI check + synced versions |
| 8 | Analytics fire before outcomes / pollute funnels (5 sub-bugs) | ✅ | `bbd39b6` — all 5 fixed (onboarding_completed, identify signin, account_deleted, posthog reset, lesson_started) |

---

## 🟠 Fix before App Store submission (6 items)

| # | Finding | Status | Commit / notes |
|---|---|---|---|
| 9 | Configure Superwall `learn_access` placement | ✅ | User verified dashboard + `129ce6d` — code fail-open fallback for confirmed subscribers |
| 10 | Verify paywall template (dismiss control, 3.1.2 risk) | ⚠️ | `222e989` — bookkeeping in RELEASE_CHECKLIST.md Phase 7.5. **User to add close button in Superwall dashboard before submitting.** |
| 11 | Apply `app_config` migration to prod + idempotence | ⚠️ | `21f3364` — migration made idempotent, Phase 4 strengthened. **Actual `db push` deferred to release-time.** |
| 12 | Run UPGRADE test, not fresh-install | ✅ | `1a29143` — Phase 8 rewritten as 8.1/8.2/8.3 with mandatory upgrade test |
| 13 | 7-tap demo mode decision (2.3.1 risk) | ✅ | `400d993` — kept for v1.1.0 with corrected docs, PostHog monitoring added, dual-path Apple Review notes |
| 14 | First production EAS build checks | ✅ | `99f2737` — SENTRY_AUTH_TOKEN verified, `dist` added, `expo-notifications` plugin removed, Settings version dynamic |

---

## 🟡 Fix soon after — Environment / infrastructure

| Finding | Status | Commit / notes |
|---|---|---|
| Guard the reverse misconfiguration | ✅ | `12f079b` — runtime bundle-ID↔project-ref check + build-time env validation |
| Script prod DB pushes (`db-push-dev.sh` / `db-push-prod.sh`) | ⬜ | Open — reviewer's hardening rec, defer to v1.1.1 |
| Pre-migration prod dump (`backup-prod.sh`) | ⬜ | Open — blocked on Supabase Pro tier decision |
| Fix or delete dead `ALLOW_DEV_PROD_ACCESS` escape hatch | ✅ | `892530c` — removed; bypass now requires visible code change |
| Env detection regex duplicated in 3 files | ✅ | `badfa56` — centralized in `src/lib/env.ts` |
| Third-party blast radius (Superwall/PostHog/Sentry shared, URL scheme collision) | ⬜ | Open — tag-filtered analytics is enough for now, real separation is v1.2 |

---

## 🟡 Fix soon after — Security

| Finding | Status | Commit / notes |
|---|---|---|
| PKCE (`flowType: 'pkce'` in `createClient`) | ✅ | `6dae99b` — mandatory before Android release, adopted now |
| Encrypt the session (SecureStore for refresh token) | ⬜ | Open — needs SecureStore migration, session invalidation risk. Defer to a dedicated release. |
| Rotate the prod DB password | ⬜ | Open — user deferred earlier, blocked on Supabase dashboard action |
| PostHog: drop email from `$set` | ✅ | `afa5faf` — email removed from person props |
| PostHog: add person-delete on account deletion | ⬜ | Open — needs personal API token setup + Edge Function work, real work |
| Low: delete-account CORS `*` | ✅ | `5510406` — tightened to 'null'; deployed on next Edge Function push |
| Low: kill-switch sanity cap | ✅ | `84c7875` — CAP=40, refuse to force-update if minimum exceeds cap or currentBuild is 0 |
| Low: Apple JWT `.p8` in `~/Downloads` (interim: env var) | ✅ | `f7f81bb` — reads `APPLE_P8_PATH` env var; long-term secret-manager move still open |

---

## 🟡 Fix soon after — Quality / testing

| Finding | Status | Commit / notes |
|---|---|---|
| Generate Supabase DB types (highest ROI single change per reviewer) | ⬜ | Open — turns "wrote to nonexistent column" bugs into compile errors |
| Add ESLint + lint CI job | ⬜ | Open — ~30 min |
| First Jest unit tests (`isBelowMinimumBuild`, `hasUserCompletedOnboarding` error, `LESSON_NAV` coverage) | ⬜ | Open — real ROI but needs infrastructure setup |
| v1.2 data-driven lesson refactor | ⬜ | Open — big refactor, v1.2 as reviewer noted |
| Dedupe `handleGoogleSignIn`/`handleAppleSignIn`, type navigator params, centralize AsyncStorage keys, note lesson progress survives delete | ⚠️ | Sign-in handler dedupe done (this commit — extracted `runProviderSignIn`, ~45 duplicated lines removed). Navigator param typing, AsyncStorage-keys constant, delete-account doc note still open. |

---

## 🟡 Fix soon after — Docs / process

| Finding | Status | Commit / notes |
|---|---|---|
| Fold adversarial tests into RELEASE_CHECKLIST.md permanently | ⚠️ | Partial — Phase 7.5 + 8.3 added. Rest of the tests still only live in `IPHONE_TEST_PLAN_V1.1.0.md`. |
| One backlog — consolidate deferred-work files | ✅ | Consolidated V1.1.1_ONBOARDING_POLISH.md + V1.1.1_PLUS.md + V1.2_LATER.md into single BACKLOG.md; updated 6 files that referenced the old paths |
| Kill duplicated procedures — SETUP_GUIDE stale patterns, EDGE_FUNCTION_DEPLOYMENT drift, docs/README missing entries | ✅ | `fcc071c` — rewrote SETUP_GUIDE Part 5, truncated EDGE_FUNCTION_DEPLOYMENT to pointer, added 9 missing entries to docs/README |
| DEV_PROD_ENVIRONMENTS.md release-workflow drift vs RELEASE_CHECKLIST / BEST_PRACTICES | ⬜ | Open — deep section-by-section audit still needed |
| Finish branch protection (require status checks) | ⬜ | Open — GitHub UI action, needs user click |
| Apple JWT rotation doc hardcoded machine path | ✅ | `f7f81bb` (bundled with generate_apple_jwt.js env var change) |

---

## What was verified as sound (no action)

Left unchanged, per reviewer's audit:

- Account deletion 5.1.1(v) compliance
- RLS on all three tables
- Apple 4.8 compliance (sign-in button, nonce, Private Relay hint)
- Upgrade path storage-safety (Supabase client config identical, AsyncStorage keys unchanged, no Zustand persist to migrate)
- Kill switch fail-open
- Privacy manifest + policy alignment
- Build config safety
- Gender-fix completeness

---

## Summary counts

| Bucket | Total | Done | Partial | Deferred | Open |
|---|---|---|---|---|---|
| 🔴 Blockers | 8 | 6 | 2 | 0 | 0 |
| 🟠 Pre-submission | 6 | 4 | 2 | 0 | 0 |
| 🟡 Environment/infra | 6 | 3 | 0 | 0 | 3 |
| 🟡 Security | 8 | 5 | 0 | 0 | 3 |
| 🟡 Quality/testing | 5 | 0 | 1 | 0 | 4 |
| 🟡 Docs/process | 6 | 3 | 1 | 0 | 2 |
| **Total** | **39** | **21** | **6** | **0** | **12** |

**Done or partial**: 27 of 39 (69%). All 🔴 and 🟠 blockers addressed in code. 12 open items are all 🟡 hardening.

Note (2026-07-05): 🟡 Docs/process count grew from 4 to 6 because two
items I'd previously conflated got split — the "kill duplicated
procedures" bundle is really three separate stale docs (which is why
one commit closed three at once), and the DEV_PROD_ENVIRONMENTS drift
audit is a distinct still-open item.

Note: The 🟡 Security bucket expanded from 5 to 8 because the reviewer's
"Low hygiene" batch was itemized as three separate line items (CORS,
kill-switch cap, .p8 path), all now done. Similarly PostHog was split
into two items (drop email + person-delete on account deletion) since
only the first is done.
