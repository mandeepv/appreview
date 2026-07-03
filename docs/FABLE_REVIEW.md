# Fable Review — Kinderwell / MamaLearn

**Date received:** 2026-07-04
**Reviewer:** external engineer friend ("Fable")
**Scope:** review of `setup/dev-environment` branch on the sanitized `appreview` public repo, plus the dev/prod-process question
**Method:** five parallel reviews (architecture, security, revenue/subscription, dev/prod isolation, release/observability), then consolidated

**Purpose of this doc:** capture the full review verbatim so nothing is lost, and so we can turn each item into concrete follow-up work. Not to be edited casually — this is a snapshot of feedback.

---

## Verdict in three sentences

> Your infrastructure instincts are genuinely good — separate dev Supabase project, EAS profiles, checklists, kill switch, strict TypeScript — but two load-bearing assumptions are false: the app's dev/prod isolation doesn't work because of the committed `ios/` folder, and premium content is not actually gated anywhere in the app. Neither of these is visible from docs or dashboards; both were confirmed by reading the code. The good news: everything found is fixable incrementally, and nothing requires a rewrite.

---

## 🔴 P0 — Revenue and merge blockers

### 1. Premium is effectively free — nothing enforces subscription status

`isSubscribed` is written after purchase but read by zero screens or navigators. The only paywall trigger is onboarding's `LoadingScreen`, and every exit path — dismiss without paying, skip, error, force-quit-and-relaunch — lands in the full app (`LoadingScreen.tsx:63–97`, `SplashScreen.tsx:54–57`). Every failure fails open, there is no re-check on any later launch, and expired/refund/cancellation events are only listened to while `LoadingScreen` is mounted. A lapsed subscriber keeps access forever; a non-payer gets everything by tapping "X".

**Fix (in order):**
- App-level `useSuperwallEvents({ onSubscriptionStatusChange })` in `App.tsx` as the single source of truth
- Gate entry via `registerPlacement`'s feature callback instead of unconditional navigation
- Cold-start status check in Splash (treat `UNKNOWN` as allow, so you never lock out a paying user offline)
- Longer-term: mirror entitlements server-side via App Store Server Notifications

### 2. Hidden 7-tap demo bypass ships in production

Seven taps on the auth screen title activates full premium demo mode (`AuthScreen.tsx:117–149`). It is gated by neither `__DEV__` nor `SHOW_DEMO_BUTTON` — that flag is dead code that nothing reads.

### 3. "Restore Purchases" doesn't restore purchases

It fires a success analytics event unconditionally and opens the App Store subscriptions page — it never calls the SDK restore (`SettingsScreen.tsx:24–41`). Once you fix #1, this button becomes the recovery path for real paying customers on a new device, and it does nothing. That's the "paying subscriber loses access" scenario, plus an App Store 3.1.1 exposure.

### 4. Dev builds currently overwrite your live app; the documented fix would poison prod builds

The committed `ios/` folder means EAS uses the checked-in Xcode project and ignores `app.config.js` native config. Bundle ID is hardcoded to `com.kinderwell.app`.

**Fix:** go managed/CNG → `.gitignore` and delete `ios/` after moving privacy manifest, entitlements, and the notifications plugin into the app config, so per-profile env vars genuinely control native identity.

Until then, treat `eas build --profile development/preview` and `prebuild --clean` as unsafe. Verify by inspecting `CFBundleIdentifier` in both build artifacts.

### 5. Hold the merge: three blockers in the diff itself

- **A/B experiment can serve placeholder screens to prod users, permanently.** 13 of 17 variant-B screens are literal "Placeholder — real content coming later" screens, assignment is cached forever per install with no prod-side unstick, and the dev-only-targeting safety net is broken (see #6). One PostHog flag flip + every fresh prod install gets placeholders. Gate variant-B resolution behind `__DEV__` or pull routing from this merge.
- **Kill switch would brick users:** the non-dismissible `ForceUpdateModal`'s only button opens `id0000000000` → 404. Put the real App Store ID in (and add a support fallback link) before this capability exists in any shipped binary. Also apply the `app_config` migration to prod before submitting v1.1.0 — the code fails open safely without it, but the kill switch is silently inert until then.
- **`ios/Podfile.lock` is stale:** the new native deps (`expo-application`, `expo-device`, etc.) were never `pod install`ed into the committed lockfile. Run `pod install` fresh, build once, commit the result.

### 6. ⚠ Verify in your real repo: environment detection may be comparing against placeholder strings

`src/config/posthog.ts:112–17` and `src/lib/supabase.ts:14` compare the Supabase project ref to the literal strings `'PROD_PROJECT_REF'`/`'DEV_PROJECT_REF'`. If those literals are only sanitization in this copy and your private repo has real refs, you're fine. If the placeholders exist in your local code too, then every PostHog event is `environment: 'unknown'`, dev/prod analytics filtering is broken, and the A/B flag can't be targeted at dev.

Similarly verify the real prod EAS profile's PostHog token; the placeholder-detection sentinel checks for `'phc_your_project_token_here'`, which would not catch `'phc_POSTHOG_PLACEHOLDER'`.

---

## 🟠 P1 — Before/with the next release

### 7. Privacy policy is factually wrong about children's data

It claims children's age/gender "is never transmitted to our servers" — the app upserts per-child gender and age ranges to Supabase and sends age ranges to PostHog, identifies users by email, and says analytics "may be added in the future" while PostHog is live.

In a parenting app this is App Store 5.1.x rejection risk and GDPR/CCPA exposure. Your `PrivacyInfo.xcprivacy` is more honest than the policy — align the policy with it (and mirror it in App Store Connect answers).

### 8. No crash reporting

Nearly every catch block logs only. `undefined.__proto__` errors vanish. Add Sentry (separate DSNs per env via the existing `eas.json` blocks) plus one `reportError()` helper routed through existing catch blocks. Highest-leverage observability move.

### 9. Apple Sign-In loses the user's name forever + no nonce

The post-sign-in upsert writes `full_name`/`email` columns that don't exist (table has `name`), the error is unchecked, and Apple only provides the name on first authorization — unrecoverable. Also add the nonce (SHA-256 to `signInAsync`, raw to `signInWithIdToken`) for replay hardening.

### 10. Migrations are a convention, not a system

Raw `psql -f` with no record of what ran where; `prod_schema.sql` and the "initial migration" are byte-identical dumps that won't replay on a fresh project; the documented "re-sync dev from prod" would silently delete your dev-only kill-switch table.

Adopt the Supabase CLI (`supabase db push --linked`, baseline both projects), demote `prod_schema.sql` to an archived snapshot, add `supabase db diff` as a pre-release drift check.

### 11. Structural guards for "never touch prod"

- Rotate the dev DB password to differ from prod (wrong-host mistakes then fail at auth ≈ 5 minutes)
- Make the dev-build-printing-at-prod console log a hard throw unless explicitly overridden
- Flip `app.config.js` defaults to dev-shaped (prod always gets its values explicitly from `eas.json` anyway)

### 12. Kill switch reads the wrong build number

`Constants.expoConfig.ios.buildNumber` (from `app.json`) instead of the shipped binary's. Use `expo-application`'s `nativeBuildVersion`. `app.json`/`pbxproj` have drifted before.

### 13. Release process bricks

Enable App Store Phased Release + manual release in the checklist; do the backup-restore drill before the first release that carries a prod migration (that's v1.1.0); monitor 24–48h before advancing rollout.

---

## 🟡 P2 — Soon

### 14. Lesson progress is device-local only and the Supabase sync service is dead code

`lessonProgressService.ts` (228 lines, full CRUD) is imported nowhere; paying users lose all progress on reinstall/new device.

Also: 8 copy-pasted `#progress.ts` utils collapse to one parameterized util (keep the exact storage keys), then wire local-first + background sync or delete the service.

### 15. The wrong "Helping Process Emotions" screen is live

The prod-wired one lacks progress tracking while the improved version sits unreferenced. Decide, wire, delete the loser. Same cleanup PR: dead `ServiceReturnScreen`, dead `src/lib/superwall.ts` stub, unreachable `PremiumUnlockedScreen` (either wire it into the purchase-success path — nice UX you already built — or delete), and six unused native deps incl. `react-native-dotenv`, `react-hook-form`, `zod`, `expo-notifications`.

### 16. Superwall identity lifecycle

Identify on every launch with a session (not just during onboarding), and reset Superwall identity on sign-out/account deletion — otherwise shared devices inherit entitlements/experiments.

### 17. Split dev/prod for Superwall and PostHog

One shared key means your own testing pollutes conversion metrics and experiment assignment on a small user base, and editing a paywall to "test" edits the live prod config.

Superwall apps are free; PostHog free tier is >20GB so second org works.

Also decide the IAP-testing story: the dev bundle ID has no ASC record/products, so on-device purchase testing in the dev app can't work — either create an ASC app record for `.dev` with mirrored product IDs, or document that purchase testing via TestFlight preview builds only.

### 18. Too much "proof" logic (exp expo lint)

Prettier + jest-expo with 3 tests for pure logic only (kill-switch comparison, experiment resolution, consolidated progress util) — all wired into CI. Also adopt Branch / PR CI + merge even solo; the pre-merge review above is exactly the class of thing that catches.

### 19. A/B scaffold fixes before ramping any flag

- First-launch users can see the screen hot-swap variants 1–3s in — await resolution alongside the existing 2s splash animation
- First-launch users are permanently cached into control before the experiment exists
- Assignment is per-install so reinstalls re-randomize

### 20. Doc consolidation

`SETUP_GUIDE.md` still teaches the abandoned `react-native-dotenv` setup and wrong Superwall package; `EDGE_FUNCTION_DEPLOYMENT.md` says to link the CLI to prod by default, contradicting your own rule; version-bump instructions differ across three docs (make `bump-version.sh` also update `package.json`, and make "run the script" the only documented path); two drifting copies of the best-practices gap list.

Delete `posthog-setup-report.md` (exposes internal project IDs) and move root scripts into `scripts/`.

---

## 🟢 P3 — Strategic backlog

### 21. The ~343 hand-written lesson screens (~39k LOC, ~90% boilerplate)

Don't rewrite. Build the next lesson data-driven (content array + one `LessonPlayer` renderer — your screens reduce to ~6 layout archetypes), migrate the smallest lesson (6 files) as proof, then migrate only when touching a lesson anyway. This also eliminates most of the 432 hardcoded hex colors, unifies quiz/progress logic, shrinks the 1,150-line navigator, and makes content remotely updatable later.

### 22. Navigation

- Add a linking config (universal links currently open the app and dead-end)
- Fold the 13-branch lesson-routing if/else into data
- Only restructure the inverted onboarding-wraps-app stack when you next touch auth

### 23. Misc

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
- Gate variant B behind `__DEV__` (#5)
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
- A/B fixes before ramping (#19)
- Docs consolidation (#20)
- Data-driven lessons as a slow burn (#21)

---

## Housekeeping

Delete this public review copy (or rewrite its history) when done — commit `6e26a33` in the `appreview` public copy exposes real prod Supabase URL/anon key and Superwall key publicly, even though the tip is sanitized.

---

## Open questions from the reviewer

**(a)** In your private repo, are the `'PROD_PROJECT_REF'` comparisons in `posthog.ts`/`supabase.ts` real project refs or still placeholders?

**(b)** Has the `onboarding_variant` flag ever been created/enabled in PostHog?

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
