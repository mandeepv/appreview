# Fable Review — Kinderwell / MamaLearn

**Date received:** 2026-07-04
**Reviewer:** external engineer friend ("Fable")
**Scope:** review of `setup/dev-environment` branch on the sanitized `appreview` public repo, plus the dev/prod-process question
**Method:** five parallel reviews (architecture, security, revenue/subscription, dev/prod isolation, release/observability), then consolidated

**Purpose of this doc:** capture the full review verbatim so nothing is lost, and so we can turn each item into concrete follow-up work. Not to be edited casually — this is a snapshot of feedback + status.

---

## Status summary as of 2026-07-04

| Priority | Total | ✅ Done | ⏸️ Partial / Deferred | ⏳ TODO |
|---|---|---|---|---|
| 🔴 P0 (1–6) | 6 | 6 | 0 | 0 |
| 🟠 P1 (7–13) | 7 | 5 | 2 (#11, #13 — user-accepted risk) | 0 |
| 🟡 P2 (14–20) | 7 | 0 | 1 (#17 PostHog free-tier workaround) | 6 |
| 🟢 P3 (21–23) | 3 | 0 | 0 | 3 |

**All P0 items done.** Every real merge-blocker addressed.

**P1 items:** 5 fully done, 2 partial:
- #11 — code guards done, DB password rotation deferred by user
- #13 — phased release done, backup restore drill deferred (Supabase Free tier has no automated backups; user accepted the risk in writing)

**P2 items:** deliberately untouched during this weekend's sprint. None blocks v1.1.0. #17 (Superwall/PostHog split) is partial — PostHog free-tier makes the split a workaround, not a true split. Superwall side of #17 is TODO.

**P3 items:** strategic backlog. Untouched by design.

**Quick-jump legend used below:**
- ✅ **DONE** — resolved by the referenced commit / date
- ✅ **PARTIAL DONE** — main concern addressed, some sub-item deferred
- ⏸️ **DEFERRED** — user consciously accepted a risk / trade-off
- ⏳ **TODO** — nothing done, still open

---

## Verdict in three sentences

> Your infrastructure instincts are genuinely good — separate dev Supabase project, EAS profiles, checklists, kill switch, strict TypeScript — but two load-bearing assumptions are false: the app's dev/prod isolation doesn't work because of the committed `ios/` folder, and premium content is not actually gated anywhere in the app. Neither of these is visible from docs or dashboards; both were confirmed by reading the code. The good news: everything found is fixable incrementally, and nothing requires a rewrite.

---

## 🔴 P0 — Revenue and merge blockers

### 1. Premium is effectively free — nothing enforces subscription status  ✅ DONE 2026-07-04

App-level Superwall listener in `App.tsx`, LearnScreen gate with fail-open pattern, cold-start status resolution, demo mode bypass preserved. See `BEST_PRACTICES.md` for details.

`isSubscribed` is written after purchase but read by zero screens or navigators. The only paywall trigger is onboarding's `LoadingScreen`, and every exit path — dismiss without paying, skip, error, force-quit-and-relaunch — lands in the full app (`LoadingScreen.tsx:63–97`, `SplashScreen.tsx:54–57`). Every failure fails open, there is no re-check on any later launch, and expired/refund/cancellation events are only listened to while `LoadingScreen` is mounted. A lapsed subscriber keeps access forever; a non-payer gets everything by tapping "X".

**Fix (in order):**
- App-level `useSuperwallEvents({ onSubscriptionStatusChange })` in `App.tsx` as the single source of truth
- Gate entry via `registerPlacement`'s feature callback instead of unconditional navigation
- Cold-start status check in Splash (treat `UNKNOWN` as allow, so you never lock out a paying user offline)
- Longer-term: mirror entitlements server-side via App Store Server Notifications

### 2. Hidden 7-tap demo bypass ships in production  ✅ DONE 2026-07-04 (partial acceptance)

Dead `SHOW_DEMO_BUTTON` env var removed (was never read anywhere). 7-tap gesture itself preserved — it's required for Apple Review under Guideline 2.1 (reviewers need to see paid content). Documented in `docs/DEMO_MODE.md` with invariants that must hold across future auth changes.

Seven taps on the auth screen title activates full premium demo mode (`AuthScreen.tsx:117–149`). It is gated by neither `__DEV__` nor `SHOW_DEMO_BUTTON` — that flag is dead code that nothing reads.

### 3. "Restore Purchases" doesn't restore purchases  ✅ DONE 2026-07-04

Now calls `SuperwallExpoModule.getSubscriptionStatus()` and shows one of three outcomes (restored / no_purchases / failed). Does NOT set `isSubscribed` — leaves that to the app-level listener from #1. Analytics renamed to `restore_purchases_tapped` + `restore_purchases_completed` with outcome property. Re-tap guard via `isRestoring` state.

It fires a success analytics event unconditionally and opens the App Store subscriptions page — it never calls the SDK restore (`SettingsScreen.tsx:24–41`). Once you fix #1, this button becomes the recovery path for real paying customers on a new device, and it does nothing. That's the "paying subscriber loses access" scenario, plus an App Store 3.1.1 exposure.

### 4. Dev builds currently overwrite your live app; the documented fix would poison prod builds  ✅ DONE 2026-07-04

Migrated to managed workflow: `ios/` and `android/` deleted from git and gitignored. All native config lives in `app.config.js`. Bundle ID env-driven now genuinely works — verified `PRODUCT_BUNDLE_IDENTIFIER` resolves to `com.kinderwell.app.dev` under dev env, `com.kinderwell.app` under prod env. `app.json` stripped to base (consolidated 2026-07-04 evening).

The committed `ios/` folder means EAS uses the checked-in Xcode project and ignores `app.config.js` native config. Bundle ID is hardcoded to `com.kinderwell.app`.

**Fix:** go managed/CNG → `.gitignore` and delete `ios/` after moving privacy manifest, entitlements, and the notifications plugin into the app config, so per-profile env vars genuinely control native identity.

Until then, treat `eas build --profile development/preview` and `prebuild --clean` as unsafe. Verify by inspecting `CFBundleIdentifier` in both build artifacts.

### 5. Hold the merge: three blockers in the diff itself  ✅ DONE 2026-07-04

- **A/B experiment placeholder-screens risk:** user committed to writing real content before shipping. PostHog flag stays as-is; no code gate needed.
- **Kill switch `id0000000000` → 404:** replaced with real App Store ID `6758403231` in `ForceUpdateModal.tsx`.
- **`Podfile.lock` stale:** resolved automatically by #4 (managed workflow means Podfile.lock is regenerated on every build, not committed).
- **`app_config` migration to prod before submit:** documented in `RELEASE_CHECKLIST.md` Phase 4 as a pre-flight step.

- **A/B experiment can serve placeholder screens to prod users, permanently.** 13 of 17 variant-B screens are literal "Placeholder — real content coming later" screens, assignment is cached forever per install with no prod-side unstick, and the dev-only-targeting safety net is broken (see #6). One PostHog flag flip + every fresh prod install gets placeholders. Gate variant-B resolution behind `__DEV__` or pull routing from this merge.
- **Kill switch would brick users:** the non-dismissible `ForceUpdateModal`'s only button opens `id0000000000` → 404. Put the real App Store ID in (and add a support fallback link) before this capability exists in any shipped binary. Also apply the `app_config` migration to prod before submitting v1.1.0 — the code fails open safely without it, but the kill switch is silently inert until then.
- **`ios/Podfile.lock` is stale:** the new native deps (`expo-application`, `expo-device`, etc.) were never `pod install`ed into the committed lockfile. Run `pod install` fresh, build once, commit the result.

### 6. ⚠ Verify in your real repo: environment detection may be comparing against placeholder strings  ✅ DONE 2026-07-04

Verified — real project refs (`xbkkjqvbsnroenqlqkmi` for dev, `zqwzdyjfxytvedghujsd` for prod) are in the code. Placeholder strings only ever existed in the `appreview` sanitized copy. Env detection works correctly.

`src/config/posthog.ts:112–17` and `src/lib/supabase.ts:14` compare the Supabase project ref to the literal strings `'PROD_PROJECT_REF'`/`'DEV_PROJECT_REF'`. If those literals are only sanitization in this copy and your private repo has real refs, you're fine. If the placeholders exist in your local code too, then every PostHog event is `environment: 'unknown'`, dev/prod analytics filtering is broken, and the A/B flag can't be targeted at dev.

Similarly verify the real prod EAS profile's PostHog token; the placeholder-detection sentinel checks for `'phc_your_project_token_here'`, which would not catch `'phc_POSTHOG_PLACEHOLDER'`.

---

## 🟠 P1 — Before/with the next release

### 7. Privacy policy is factually wrong about children's data  ✅ DONE 2026-07-04

Rewrote `legal/PRIVACY_POLICY.md` (repo mirror) and `kinderwell-legal` GitHub repo (canonical, deployed via GitHub Pages). Removed the false "children's data never transmitted to servers" claim. Added PostHog and Sentry as third-party services. Added explicit "What we do NOT collect" section. `RELEASE_CHECKLIST.md` Phase 9a documents the matching App Store Connect App Privacy questionnaire to be filled in at submit time.

It claims children's age/gender "is never transmitted to our servers" — the app upserts per-child gender and age ranges to Supabase and sends age ranges to PostHog, identifies users by email, and says analytics "may be added in the future" while PostHog is live.

In a parenting app this is App Store 5.1.x rejection risk and GDPR/CCPA exposure. Your `PrivacyInfo.xcprivacy` is more honest than the policy — align the policy with it (and mirror it in App Store Connect answers).

### 8. No crash reporting  ✅ DONE 2026-07-04

Sentry installed and wired. Single-project setup (kinderwell / react-native) with `environment` tag derived from Supabase URL — filter by env in dashboards. `initSentry()` runs before any other import in `App.tsx` so import-time crashes are captured. `Sentry.wrap(App)` sets up ErrorBoundary + session tracking. Native crashes captured automatically. `reportError()` helper wired alongside existing PostHog captureException calls in auth + paywall catch blocks. Source-map upload configured (SENTRY_AUTH_TOKEN as EAS secret, SENTRY_ORG + SENTRY_PROJECT env vars).

Nearly every catch block logs only. `undefined.__proto__` errors vanish. Add Sentry (separate DSNs per env via the existing `eas.json` blocks) plus one `reportError()` helper routed through existing catch blocks. Highest-leverage observability move.

### 9. Apple Sign-In loses the user's name forever + no nonce  ✅ DONE 2026-07-04

Fixed the column mismatch (upsert was writing to non-existent `full_name`/`email` — now writes to `name` which is what actually exists in `user_profiles`). Silent-failure hazard removed: if the write fails, we `reportError()` to Sentry instead of throwing (user is signed in successfully at that point). Added nonce hardening via `generateAppleNonce()` — SHA-256 to `signInAsync`, raw to `signInWithIdToken` per Supabase docs. Uses `expo-crypto` (already installed).

The post-sign-in upsert writes `full_name`/`email` columns that don't exist (table has `name`), the error is unchecked, and Apple only provides the name on first authorization — unrecoverable. Also add the nonce (SHA-256 to `signInAsync`, raw to `signInWithIdToken`) for replay hardening.

### 10. Migrations are a convention, not a system  ✅ DONE 2026-07-04

Adopted Supabase CLI migration tooling properly. Baselined both dev and prod via `supabase migration repair` — both DBs' `supabase_migrations` tables now know the initial migration is applied. `app_config` migration correctly stays pending on prod (applies during v1.1.0 release). Rewrote `20260101000000_initial_schema.sql` as idempotent SQL that runs cleanly on a fresh DB. Moved `supabase/prod_schema.sql` to `supabase/archive/` with a README. Replaced all `psql -f` recipes in docs with `supabase db push --linked` (+ `--dry-run` first for prod).

Raw `psql -f` with no record of what ran where; `prod_schema.sql` and the "initial migration" are byte-identical dumps that won't replay on a fresh project; the documented "re-sync dev from prod" would silently delete your dev-only kill-switch table.

Adopt the Supabase CLI (`supabase db push --linked`, baseline both projects), demote `prod_schema.sql` to an archived snapshot, add `supabase db diff` as a pre-release drift check.

### 11. Structural guards for "never touch prod"  ✅ PARTIAL DONE 2026-07-04

**Done:**
- `src/lib/supabase.ts` HARD THROWS if a `__DEV__` build tries to connect to prod Supabase. Escape hatch: `ALLOW_DEV_PROD_ACCESS=true` env var. Fixes the "console log gets ignored" failure mode.
- `app.config.js` defaults flipped from prod-shaped to dev-shaped. A fresh clone / missing `.env` now yields dev bundle + dev Supabase, not prod.

**⏸️ Deferred:** DB password rotation to have dev ≠ prod passwords. User explicitly opted to keep same password. Documented as accepted risk in `BEST_PRACTICES.md` item #8. Revisit if there's ever a leak event.

- Rotate the dev DB password to differ from prod (wrong-host mistakes then fail at auth ≈ 5 minutes)
- Make the dev-build-printing-at-prod console log a hard throw unless explicitly overridden
- Flip `app.config.js` defaults to dev-shaped (prod always gets its values explicitly from `eas.json` anyway)

### 12. Kill switch reads the wrong build number  ✅ DONE 2026-07-04

`src/lib/appConfig.ts` now uses `Application.nativeBuildVersion` (from `expo-application`) which reads from the actual shipped binary — not `Constants.expoConfig.ios.buildNumber` which reads from `app.json` and can drift.

`Constants.expoConfig.ios.buildNumber` (from `app.json`) instead of the shipped binary's. Use `expo-application`'s `nativeBuildVersion`. `app.json`/`pbxproj` have drifted before.

### 13. Release process bricks  ✅ PARTIAL DONE 2026-07-04

**Done:**
- Phased release + manual release documented in `RELEASE_CHECKLIST.md` Phase 9. Explicit App Store Connect toggles ("Manually release this version" + "Phased Release for Automatic Updates").
- Phase 10 restructured: don't release immediately, install approved build via TestFlight for final smoke test before hitting the Release button.
- Phase 11 restructured for the 7-day phased-rollout window with "Pause Phased Release" instructions if issues surface.

**⏸️ Deferred:** Backup restore drill. Verified against Supabase docs that Free tier has NO automated backups whatsoever. User opted for "Option C: accept the risk" rather than pay $25/mo for Pro or set up DIY dump automation. Documented explicitly in `BEST_PRACTICES.md` item #2 with "PROD HAS ZERO BACKUPS" status warning + three fix-later options.

Enable App Store Phased Release + manual release in the checklist; do the backup-restore drill before the first release that carries a prod migration (that's v1.1.0); monitor 24–48h before advancing rollout.

---

## 🟡 P2 — Soon

### 14. Lesson progress is device-local only and the Supabase sync service is dead code  ⏳ TODO

Not started. Real bug (paying users lose progress on reinstall). Effort: 4–6h — audit which of the ~8 progress utils is canonical, consolidate to one, wire local-first + background sync to Supabase (or delete the dead `lessonProgressService.ts` if we decide against server-side progress). Address after v1.1.0 is stable.

`lessonProgressService.ts` (228 lines, full CRUD) is imported nowhere; paying users lose all progress on reinstall/new device.

Also: 8 copy-pasted `#progress.ts` utils collapse to one parameterized util (keep the exact storage keys), then wire local-first + background sync or delete the service.

### 15. The wrong "Helping Process Emotions" screen is live  ⏳ TODO

Not started. Cleanup PR to consolidate `HelpingSomeoneProcessEmotionsLesson`, remove dead `ServiceReturnScreen`, remove dead `src/lib/superwall.ts` stub, wire or delete `PremiumUnlockedScreen`, remove unused deps (`react-native-dotenv`, `react-hook-form`, `zod`, `expo-notifications` if not actually used). Effort: 1–2h. Address after v1.1.0.

The prod-wired one lacks progress tracking while the improved version sits unreferenced. Decide, wire, delete the loser. Same cleanup PR: dead `ServiceReturnScreen`, dead `src/lib/superwall.ts` stub, unreachable `PremiumUnlockedScreen` (either wire it into the purchase-success path — nice UX you already built — or delete), and six unused native deps incl. `react-native-dotenv`, `react-hook-form`, `zod`, `expo-notifications`.

### 16. Superwall identity lifecycle  ⏳ TODO

Not started. Should identify with Superwall on every session-having launch (not just onboarding) and reset Superwall identity on sign-out / account deletion — otherwise shared devices inherit entitlements. Effort: 1h. Address alongside #14 (auth/session cleanup pass).

Identify on every launch with a session (not just during onboarding), and reset Superwall identity on sign-out/account deletion — otherwise shared devices inherit entitlements/experiments.

### 17. Split dev/prod for Superwall and PostHog  ⏳ TODO / PARTIAL

**PostHog:** currently one shared project with `environment` tag on every event (PostHog free tier limits us to 1 project). Filter dashboards by `environment=prod`. This is a workaround, not a real split. **Documented as accepted** given free-tier constraints. Revisit if/when we outgrow the free tier.

**Superwall:** still one shared key. Real risk — editing paywall config affects live users. TODO: create a second Superwall app for dev testing so paywall iteration is safe. Effort: 1–2h. Address before doing significant paywall UX work.

**IAP testing on dev bundle:** flagged as unresolved. The `com.kinderwell.app.dev` bundle has no App Store Connect record or products, so on-device IAP testing in the dev app can't work end-to-end via App Store Connect. Options: create ASC record for `.dev` with mirrored products, OR document that IAP testing happens via TestFlight preview builds only. TODO.

One shared key means your own testing pollutes conversion metrics and experiment assignment on a small user base, and editing a paywall to "test" edits the live prod config.

Superwall apps are free; PostHog free tier is >20GB so second org works.

Also decide the IAP-testing story: the dev bundle ID has no ASC record/products, so on-device purchase testing in the dev app can't work — either create an ASC app record for `.dev` with mirrored product IDs, or document that purchase testing via TestFlight preview builds only.

### 18. Too much "proof" logic (exp expo lint)  ⏳ TODO

Not started. Add Prettier + a minimal jest-expo setup with 3 unit tests for pure logic (kill-switch comparison, experiment resolution, progress util). Wire into CI (`ci.yml` already exists). Also enforce PR-only merges via branch protection (already done for main). Effort: 2–3h. Address after v1.1.0 when we know what actually breaks in production and want regression coverage.

Prettier + jest-expo with 3 tests for pure logic only (kill-switch comparison, experiment resolution, consolidated progress util) — all wired into CI. Also adopt Branch / PR CI + merge even solo; the pre-merge review above is exactly the class of thing that catches.

### 19. A/B scaffold fixes before ramping any flag  ✅ MOOT — SCAFFOLD REMOVED

Reviewer's three concerns (hot-swap during splash, first-launch cache preserving control forever, per-install reinstall re-randomization) are all moot as of 2026-07-04: we removed the entire `onboarding_variant` scaffold from the codebase before shipping v1.1.0. See `PRODUCT_ROADMAP.md` → "Onboarding polish + A/B test (future)" for context. If we rebuild an A/B system later, all three concerns are worth addressing at that time.

### 20. Doc consolidation  ⏳ TODO / PARTIAL

**Done:** Moved 6 historical docs (LAUNCH_CHECKLIST, QUICK_START, APP_STORE_COMPLIANCE_ISSUES, REVIEW_BLOCKERS, COMPOUND_ENGINEERING_REVIEW, and the pre-managed-workflow prod_schema.sql) to `docs/archive/` and `supabase/archive/` with README indexes.

**TODO:**
- `SETUP_GUIDE.md` still teaches abandoned `react-native-dotenv` setup + wrong Superwall package name. Needs a rewrite.
- `EDGE_FUNCTION_DEPLOYMENT.md` says to link CLI to prod by default (contradicts our "always leave linked to dev" rule). Fix.
- `bump-version.sh` also needs to update `package.json` (currently doesn't).
- `posthog-setup-report.md` at repo root exposes internal project IDs → delete or move to archive.
- Move all root scripts into `scripts/`.

Effort: 1h. Not urgent — the docs work today, just have some stale bits.

`SETUP_GUIDE.md` still teaches the abandoned `react-native-dotenv` setup and wrong Superwall package; `EDGE_FUNCTION_DEPLOYMENT.md` says to link the CLI to prod by default, contradicting your own rule; version-bump instructions differ across three docs (make `bump-version.sh` also update `package.json`, and make "run the script" the only documented path); two drifting copies of the best-practices gap list.

Delete `posthog-setup-report.md` (exposes internal project IDs) and move root scripts into `scripts/`.

---

## 🟢 P3 — Strategic backlog

### 21. The ~343 hand-written lesson screens (~39k LOC, ~90% boilerplate)  ⏳ TODO — strategic

Not started. Deliberately deferred. Strategic refactor: build one data-driven `LessonPlayer` renderer + content array, migrate the smallest lesson (6 files) as proof, then migrate lessons only when touching them. Also eliminates most of the 432 hardcoded hex colors and the 1,150-line lesson navigator. Effort: 2-3 days for initial setup + ongoing. Address as a Q4 initiative, not blocking v1.1.0.

Don't rewrite. Build the next lesson data-driven (content array + one `LessonPlayer` renderer — your screens reduce to ~6 layout archetypes), migrate the smallest lesson (6 files) as proof, then migrate only when touching a lesson anyway. This also eliminates most of the 432 hardcoded hex colors, unifies quiz/progress logic, shrinks the 1,150-line navigator, and makes content remotely updatable later.

### 22. Navigation  ⏳ TODO

Not started. Add a linking config so universal links don't dead-end, fold the 13-branch lesson-routing `if/else` into data, and restructure the inverted onboarding-wraps-app stack next time we touch auth. Effort: 1 day. Address alongside #21 or when doing significant auth/nav work.

- Add a linking config (universal links currently open the app and dead-end)
- Fold the 13-branch lesson-routing if/else into data
- Only restructure the inverted onboarding-wraps-app stack when you next touch auth

### 23. Misc  ⏳ TODO

Small individual items — knock them out in an afternoon:
- `lesson_progress.user_id` should be `NOT NULL` (migration).
- `delete-account` edge function should delete the auth user first (FK cascades make it atomic).
- StoreKit test config has blank product localizations and no intro offer (Xcode-only, not shipping-critical).
- `"start": "expo start --go"` in package.json can't load native modules — drop `--go`.
- Add an EAS submit profile so we don't have to type `eas submit --profile production --platform ios` each time.

Effort: 2h total. Address post-v1.1.0.

- `lesson_progress.user_id` should be `NOT NULL`
- `delete-account` should delete the auth user first (FK cascades make it atomic)
- StoreKit test config has blank product localizations and no intro offer
- `"start": "expo start --go"` can't load your native modules — drop `--go`
- Add an EAS submit profile

---

## ✅ What you're doing right (keep these)

- **RLS is correct on every table** — ownership checks, `WITH CHECK` on inserts, no write-policy holes. The strongest part of the codebase.
- **The delete-account edge function derives identity server-side from the JWT** — no way to delete someone else's account.
- **`SKIP_PAYWALL` is strictly parsed and pinned "false"** in every EAS profile — a store build cannot skip the paywall.
- **Kill-switch design** (fail-open on fetch error, RLS on-read/service-write, migration-before-submit sequencing) is right; only the two implementation details above are wrong.
- **Separate dev Supabase project done properly** (own auth providers, callbacks, redirect allowlists) — architecture, not a namespace hack.
- **Strict TypeScript that actually compiles**; real design-token system; `safeCapture` so analytics can never break money paths; `__DEV__`-gated dev menu; `.env` hygiene; honest self-audit in `BEST_PRACTICES.md`; the backward-compat migration doctrine in your docs is better than most team wikis.

---

## Suggested sequence

**This week (before merging the current PR):**
- Demo-gesture gate (#2)
- Real App Store ID in `ForceUpdateModal` (#5)
- Verify the two sanitization-dependent items (#6)
- Fix `Podfile.lock` (#5)
- ~~Gate variant B behind `__DEV__` (#5)~~ — moot, variant B scaffold removed entirely 2026-07-04
- → then merge

**Next release (v1.1.0):**
- Entitlement gating + app-level status listener + real restore (#1, #3)
- Apply `app_config` to prod
- Privacy policy rewrite (#7)
- Sentry (#8)
- Phased release + backup drill (#13)

**Following weeks:**
- Managed workflow migration (#4)
- Supabase CLI migrations (#10)
- Dev password rotation + prod-guard throw (#11)
- Apple Sign-In fixes (#9)
- Cleanup PR (#15)
- Lint/tests in CI (#18)

**Ongoing:**
- Split analytics/payments keys (#17)
- ~~A/B fixes before ramping (#19)~~ — moot, scaffold removed
- Docs consolidation (#20)
- Data-driven lessons as a slow burn (#21)

---

## Housekeeping

Delete this public review copy (or rewrite its history) when done — commit `6e26a33` in the `appreview` public copy exposes real prod Supabase URL/anon key and Superwall key publicly, even though the tip is sanitized.

---

## Open questions from the reviewer

**(a)** In your private repo, are the `'PROD_PROJECT_REF'` comparisons in `posthog.ts`/`supabase.ts` real project refs or still placeholders?

**(b)** ~~Has the `onboarding_variant` flag ever been created/enabled in PostHog?~~ Moot — scaffold removed from code before v1.1.0 shipped. Flag in PostHog dashboard is unused; safe to leave or delete.

Those two answers decide whether #6 and the variant-B risk are theoretical or live right now.

---

## Reviewer's follow-up on dev/prod best practices

**"In terms of dev/prod processes, are we following best practices?"**

Honest answer: you're following best practices on paper, but three of the load-bearing ones don't actually work in practice.

### Where you genuinely match best practice

- **Separate dev backend** — a real second Supabase project with its own auth providers, redirect allowlists, and callback URLs. This is the correct architecture (many solo devs fake it with a schema or table prefix), and prod's auth config was untouched while setting it up.
- **Environment config via build profiles** — prod values exist only in the production EAS profile; there's a `preview` profile (release-mode build against dev backend) which is a smart intermediate step most people skip.
- **Fail-safe defaults in the right direction** — missing Supabase creds crash instead of silently connecting somewhere; `SKIP_PAYWALL` can't be true in a store build; kill-switch fails open so an outage can't lock users out.
- **Processes encoded as checklists** — release checklist, backward-compat migration doctrine (expand → migrate → contract, safe/breaking taxonomy), version-bump script that refuses to run on drift, "re-link CLI to dev after prod work" rules. Your docs culture is above par even for small teams.

### Where the practice exists but is broken

1. **App-side isolation doesn't work.** The committed `ios/` folder means the bundle-ID switching in `app.config.js`/`eas.json` is ignored — a dev build today carries the prod bundle ID and would replace your live app on device. And the documented `prebuild --clean` step would do the reverse: bake dev identity into a store build and destroy your privacy manifest. So the core promise — "dev and prod coexist, dev can never touch prod" — currently holds only for the backend, not the app.
2. **Migrations aren't tracked.** Best practice is: migrations are the single source of truth, applied by a tool that records what ran where. You have raw `psql -f` from memory, a schema dump masquerading as an initial migration (which won't actually replay), a competing `prod_schema.sql`, and a documented dev-resync procedure that would silently delete dev-only tables. Parity currently depends on you personally remembering what you ran against which database — that's the exact failure mode migration tooling exists to prevent.
3. **The isolation isn't self-enforcing.** Dev and prod share the same DB password, and the "don't run against prod" guard is a console log a human must notice. Best practice is structural: different credentials so the wrong-host mistake fails to authenticate, and a hard throw when a dev build sees the prod project ref.

### What's missing entirely

- **No rollback brakes on releases:** no App Store phased rollout, no manual-release setting, and the backup-restore drill is still an open TODO while the checklist has you running `psql` against prod.
- **No production observability:** no crash reporting, and all runtime errors are swallowed in prod builds — so "did the observed reflection on prod?" is currently unanswerable until a user complains.
- **No isolation for third-party services:** one shared Superwall key (editing a paywall to "test" edits live production; your sandbox traffic pollutes real conversion metrics) and one PostHog project, with post-insight filtering as the only defense. Also unproven: IAP testing on the dev bundle can't actually work yet, since `com.kinderwell.app.dev` has no App Store Connect record or products.
- **No enforced review gate:** work lands on `main` as large direct commits. CI exists but only typechecks, and nothing forces changes through it before merge.

### Bottom line

Your dev/prod design is right — better than most solo setups — but on the "does everything I test on dev reflect properly on prod" question, the honest score today is: backend separation real, app separation broken, change-flow (migrations + releases) manual and untracked, and no feedback loop to detect when parity fails.

**The four fixes that move you to genuinely best-practice, in order of leverage:** managed workflow so bundle-ID isolation actually works, Supabase CLI-tracked migrations, Sentry, and phased releases + a verified backup drill. All four are in the P0/P1 items of the main report with concrete steps.
