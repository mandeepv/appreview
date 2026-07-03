# Compound Engineering Review — MamaLearn / Kinderwell

**Date:** 2026-07-02
**Scope:** Whole-codebase deep review of the React Native / Expo app at repo root.
**Method:** Five parallel deep-read passes by specialist agents — architecture & health, security, pre-launch readiness, analytics & experiment plumbing, and release process & dev/prod separation. Findings merged, deduped, and ranked by real-world impact.
**Codebase snapshot:** Expo SDK 54, React Native 0.81, React 19, TypeScript strict, Supabase auth, Superwall paywall, PostHog analytics, Zustand state, React Navigation v7. 433 TS/TSX files under `src/`.

---

## TL;DR

**Verdict: NO-GO as-is. Roughly 1 day of focused work turns this into a GO for App Store submission.**

The bones are good — Zustand stores are clean, service layer exists, TypeScript is strict, env separation is designed correctly, and the docs (`DEV_PROD_ENVIRONMENTS.md`, `RELEASE_PROCESS.md`, `VERSION_MANAGEMENT.md`) are legitimately reference-grade. The blockers are business-logic gaps and unfinished configuration, not architectural rot.

**Three things will kill the launch if unfixed:**
1. `PrivacyInfo.xcprivacy` declares zero collected data types → binary rejection at upload.
2. Subscription enforcement lives entirely on the client → 7-tap demo mode unlocks premium, and `LearnScreen` has no gate at all.
3. ~~Production PostHog token is still the string `"REPLACE_WITH_PROD_POSTHOG_KEY"` → prod ships dark.~~ **RESOLVED 2026-07-03:** single-project setup with `environment` super-property tagging every event.

**Biggest single lever:** ~1 hour spent fixing the prod PostHog token + demo-user identify guard + sign-in identify + sign-out reset + version-number sync resolves the top items from three of the five audits at once.

---

## Verdicts by lens

| Lens | Verdict | One-line reason |
|---|---|---|
| Architecture & health | Mixed — bones good, surface messy | Clean stores + service layer, but pervasive `as any` on navigation, no error boundary, 364 lesson-screen files that should be data-driven |
| Security | Not production-ready | No leaked secrets and RLS looks fine, but subscription state is client-trusted with a trivial 7-tap bypass |
| Pre-launch readiness | Conditional GO with ~1 day of fixes | Privacy manifest, build number, PostHog token, subscription gate — all mechanical fixes |
| Analytics & experiments | Partially wired, unreliable for decisions | Core funnel captured, but demo pollutes prod, prod token is a placeholder, identify has gaps, variant not attached per-event |
| Release process | Solo-founder grade | Docs are excellent, env separation is designed correctly, but doc-vs-code drift + version drift + placeholder token |

---

## P0 — Ship-blockers (fix before EAS build)

| # | Finding | File:line | Fix |
|---|---|---|---|
| 1 | **Trivial paywall bypass via demo mode.** Seven taps on the title calls `setDemoUser()` which sets `isSubscribed: true` client-side. No build gate — ships in production. | `src/store/authStore.ts:36-53`, `src/screens/onboarding/AuthScreen.tsx:127-138` | Gate demo activation behind `SHOW_DEMO_BUTTON === 'true'` at build time AND require a server-side subscription check (see #2). For real reviewer flow, use a real Apple ID with a comped sub or a signed short-lived token. |
| 2 | **`isSubscribed` is client-trusted only.** LoadingScreen sets it from a Superwall event. `LearnScreen` has no subscription check anywhere — dismiss the paywall and all 13 lessons are free. | `src/screens/onboarding/LoadingScreen.tsx:30-34,80,88`, `src/screens/LearnScreen.tsx` | On app foreground/launch, fetch entitlement from Supabase (populated by a Superwall → Supabase webhook). Gate `LearnScreen` render on `isSubscribed \|\| isDemoUser`. |
| 3 | ~~**Prod PostHog token is the literal string `"REPLACE_WITH_PROD_POSTHOG_KEY"`.**~~ **RESOLVED 2026-07-03** — PostHog free tier only allows 1 project, so we use a single project with `environment` super-property tagging (dev vs prod). Filter dashboards by `environment=prod`. | `src/config/posthog.ts` | ✅ Done |
| 4 | **`PrivacyInfo.xcprivacy` declares zero collected data types.** App collects email, user ID, child age ranges, emotional-challenges data, lesson progress — none listed. Apple's binary validator rejects this before human review. | `ios/Kinderwell/PrivacyInfo.xcprivacy:43-44` | Add `NSPrivacyCollectedDataTypes` entries for Email, User ID, Product Interaction (analytics), Sensitive Info (children's data). Cross-check against your App Store Connect Privacy questionnaire. |
| 5 | **Build number drift & not incremented.** `app.json` says `"7"`, `Info.plist` says `8`. Whoever runs the next release trusts the wrong file. | `app.json:21`, `ios/Kinderwell/Info.plist:37` | Sync `app.json` to `"8"` immediately. Add a preflight check to `docs/RELEASE_PROCESS.md`. |
| 6 | **Demo user gets `posthog.identify()`'d as `demo-reviewer-user`.** All downstream paywall / lesson / settings events tag to this fake ID and pollute your funnels. Every App Store reviewer session becomes noise in your conversion math. | `src/store/authStore.ts:36-52`, `src/screens/onboarding/LoadingScreen.tsx:161` | Guard: `if (!isDemoUser) posthog.identify(...)`. Or add an `is_demo_user: true` super-property and filter in PostHog. |

---

## P1 — Fix before launch or in launch week

### Correctness & robustness

| # | Finding | File:line | Fix |
|---|---|---|---|
| 7 | **Auth listener memory leak.** `authStore.initialize()` returns the `onAuthStateChange` subscription but `App.tsx` drops the return value and never cleans up. Every remount adds a listener. | `src/store/authStore.ts:92-113`, `App.tsx:20-23` | Move the listener out of the store into an effect owned by `App.tsx`; capture and unsubscribe in the effect cleanup. Stores don't have lifecycles. |
| 8 | **No error boundary anywhere.** Any throw in Superwall init, PostHog, or a lesson screen crashes the whole app with a blank screen. | `App.tsx` (missing) | Wrap `<AppContent />` in an ErrorBoundary that reports to PostHog and renders a "restart" screen. |
| 9 | **`SKIP_PAYWALL` ships to production.** `app.config.js` exports `skipPaywall` from env; `LoadingScreen:143-144` honors it. A stray `true` silently unlocks everyone. | `app.config.js:13`, `src/screens/onboarding/LoadingScreen.tsx:143-144` | Wrap the read in `__DEV__ && skipPaywall === 'true'`, or throw at boot if prod build has it set. |
| 10 | **Supabase config check throws at module import.** If prod EAS misses env injection, the app crashes before any error boundary can catch it. | `src/lib/supabase.ts:8-10` | Verify EAS prod build logs inject env vars. Ideally move the fatal-config check inside `App.tsx` so the error surfaces in a screen, not a native crash. |
| 11 | **Demo email shown in Settings.** `demo@kinderwell.app` is visible to App Store reviewers. | `src/store/authStore.ts:39`, `src/screens/SettingsScreen.tsx` | Mask: `user.email === 'demo@kinderwell.app' ? 'App Reviewer' : user.email`. |
| 12 | **`onboardingB` variant is mostly stubs.** 14/17 screens render `<VariantBPlaceholder>`. If experiment assignment lands a real user on variant B, onboarding is broken. | `src/screens/onboardingB/*B.tsx` | Either finish variant B, or force `experimentStore` to always return A in production until B is complete. |
| 13 | **Pervasive `navigation.navigate(... as any, ...)`** across 18+ screens defeats route type safety. Typo'd route names fail at runtime. | e.g. `src/screens/NamingOurEmotionsLessonScreen.tsx:53` and 17 others | Define a real `LessonStackParamList` union and use typed navigation props from React Navigation v7. |
| 14 | **Zero automated tests.** No `__tests__/`, no jest config. Auth → onboarding → paywall → purchase is entirely manual QA. | (nothing to cite) | Not a launch blocker, but before launch: a documented manual smoke-test script + a Detox happy-path is the pragmatic minimum. |

### Analytics reliability

| # | Finding | File:line | Fix |
|---|---|---|---|
| 15 | **`identify()` only runs on cold-start with an existing session.** `onAuthStateChange` handles `SIGNED_IN` but never calls identify. Fresh sign-ins in the same session stay anonymous — retention math is wrong. | `src/store/authStore.ts:78-108` | Add `posthog.identify(session.user.id, { $set: { email: session.user.email } })` inside the `SIGNED_IN` branch of the listener. |
| 16 | **No `posthog.reset()` in `authStore.signOut()`.** `SettingsScreen` calls it before sign-out, but any other sign-out path (token expiry, auth error) stitches the new anonymous distinct_id to the previous user. | `src/store/authStore.ts:55-62` | Move `posthog.reset()` into the store's `signOut()` so it's guaranteed on every path. |
| 17 | **Variant registered as global super-property but never attached per-event.** Funnels can't cleanly split A vs B; you're relying on cohort attribution which breaks any time super-props reset. | `src/lib/experiments.ts:45,51,75` | Attach `onboarding_variant` as a property on every capture, or set it on identify so it flows through — and confirm SDK behavior. |
| 18 | **Zero lesson-completion events.** You fire `lesson_started` and `lesson_section_started` — but no `lesson_completed`, `section_completed`, or "app backgrounded mid-lesson". You cannot compute completion rate, the most important engagement KPI for a learning app. | `src/screens/LearnScreen.tsx:131-135`, `src/screens/SprinklersLessonScreen.tsx:139-144` | Fire `lesson_completed` on section exit or explicit end-of-lesson CTA. Fire `section_completed` in the last-screen navigator. Use `useFocusEffect` cleanup for time-on-lesson. |
| 19 | **No subscription lifecycle events.** You have `subscription_purchased`, abandoned, failed, restored — but no `trial_started`, `trial_converted`, `subscription_renewed`, `subscription_cancelled`, `subscription_expired`. LTV / churn are impossible to compute. | LoadingScreen Superwall handlers, `SettingsScreen` | Wire Superwall's trial and cancellation callbacks, or (better) drive from a Supabase table populated by a Superwall webhook. |
| 20 | **No `paywall_shown` event.** You track dismisses and purchases but not the denominator — paywall conversion rate can't be computed cleanly. | LoadingScreen Superwall integration | Fire `paywall_shown` in Superwall's `onPresent` callback. |
| 21 | **Property-naming inconsistency: `lesson_id` vs `lesson_name` vs `lesson_title`.** Same entity, three keys. Will hurt any dashboard grouping by lesson. | `src/screens/LearnScreen.tsx`, `SprinklersLessonScreen.tsx` | Pick one — `lesson_id` (stable slug) + `lesson_title` (human) — and use consistently. |
| 22 | **`disableGeoip` is not explicitly set.** This is a parenting app; child data may indirectly land in events. Best-practice for COPPA-adjacent apps to disable IP-based geo. | `src/config/posthog.ts:15-29` | Add `disableGeoip: true` to the PostHog init options. |

### Release process

| # | Finding | File:line | Fix |
|---|---|---|---|
| 23 | **Docs reference `npm run start:dev` / `start:prod`** but `package.json` scripts are only `start`, `android`, `ios`, `web`. Following the doc verbatim errors out. | `docs/DEV_PROD_ENVIRONMENTS.md:422`, `package.json:5-10` | Either add the scripts (they can swap `.env` before `expo start`) or remove references from the doc. |
| 24 | **Superwall API key committed to git across all profiles.** Publishable key, so not a leak — but you can't rotate without a code push, and it's the same key across dev/preview/prod. | `eas.json:15,31,46` | Move to EAS Secrets (`eas secret:create`) referenced by name from eas.json. Rotate once post-launch. |
| 25 | **`.env.prod` in working tree.** Correctly in `.gitignore` (line 37), but confirm it was never committed historically. Contains the prod Supabase URL + anon key (publishable, so low risk but not zero). | `.env.prod`, `.gitignore:37` | Verify with `git log --all --follow -- .env.prod`. If it has appeared in a commit, rotate the Supabase anon key as a precaution. Add a warning comment in `.gitignore`. |

---

## P2 — Post-launch cleanup

### Dead code & duplication

- **Six per-lesson `*Progress.ts` files are ~99% identical** (`dissociationProgress`, `emotionalSandbagsProgress`, `serveReturnProgress`, `helpingProcessEmotionsProgress`, `namingEmotionsProgress`, `recordingDeepBondMomentsProgress`). Collapse to one `createLessonProgress(key: string)` factory.
- **Duplicate lesson screens.** `HelpingProcessEmotionsLessonScreen` vs `HelpingSomeoneProcessEmotionsLessonScreen`, `ServeReturnLessonScreen` vs `ServeAndReturnLessonScreen`, `NamingOurEmotionsLessonScreen` vs `LabelingEmotionsLessonScreen`. Only 9 lesson screens are reachable — the rest are orphaned or registered-but-unreachable. Confirm which is live via the navigator and delete the other.
- **Legacy files at repo root:** `extract_lessons.py`, `lessons_content.md`, `convert_svg.js`, `generate_apple_jwt.js`, `CODING_COMPLETE.md`, `LESSON_EXTRACTION_SUMMARY.md`, `Todo.txt` (0 bytes). Move to `scripts/` or delete.
- **~364 individual `SprinklersSec*Screen*.tsx` and `ServeReturnSec*Screen*.tsx` files** with a 1,150-line import block in `LessonNavigator`. Migrate to a data-driven `lessonData.ts` + one `<LessonScreen>` component. Biggest impact/effort lever in the codebase, but do it after launch.

### Repo hygiene

- **`react-native-dotenv` declared in `package.json` but never imported.** App reads env via `Constants.expoConfig?.extra`. Remove the dependency.
- **`supabase/.temp/*` files tracked in git.** CLI caches, don't belong. Add `supabase/.temp/` to `.gitignore` (already partially done at `.gitignore:40` — confirm) and `git rm --cached` them.
- **Single un-tracked migration** `supabase/migrations/20260101000000_initial_schema.sql`. Confirm prod Supabase project is actually on this schema, then commit the migration file.

### Release process maturity

- **Single bundle ID `com.kinderwell.app` across dev/preview/prod.** TestFlight installs overwrite the App Store install; you can't have both side-by-side. Fine for a solo founder now; painful once you have alpha testers. Add `.dev` and `.preview` suffix bundle IDs, gate via `app.config.js` reading `EAS_BUILD_PROFILE`.
- **No documented rollback plan.** `RELEASE_PROCESS.md` covers submission but not "prod is broken at 2am, what do I do?" — no EAS Update rollback, no policy on native rebuild vs OTA. Add a Rollback section.
- **No post-release verification step.** No smoke test, no "did analytics start flowing" check. Add to release process: after prod build releases to TestFlight, open on device → complete onboarding → confirm event lands in PostHog → then submit for review.

### Analytics polish

- **`captureTouches: true` + zero `testID` props in the codebase** = autocapture generates element-hierarchy noise with no useful selectors. Either add `testID` to key buttons/cards or turn off touch autocapture. (`App.tsx:60-67`)
- **`posthog.screen()` fires just the route name, no context** — no variant, subscription state, or step index attached. Enriching this once is high-leverage.

---

## Current event inventory

**Fired (deduped):**

```
Onboarding: onboarding_started, onboarding_restarted, onboarding_step_completed,
            welcome_cta_tapped, onboarding_completed
Auth:       auth_attempted, auth_abandoned, user_signed_in
Paywall:    paywall_option_selected, subscription_purchased,
            paywall_purchase_abandoned, paywall_purchase_failed, paywall_dismissed
Lessons:    lesson_started, lesson_section_started
Settings:   purchases_restored, subscription_managed, user_logged_out, account_deleted
```

**Missing by funnel:**

| Stage | Missing events |
|---|---|
| Paywall exposure | `paywall_shown` |
| Lesson engagement | `lesson_completed`, `section_completed`, `app_backgrounded_mid_lesson`, `video_played/completed` (if video) |
| Subscription lifecycle | `trial_started`, `trial_converted`, `subscription_renewed`, `subscription_cancelled`, `subscription_expired` |
| Experiment attribution | `$feature_flag_called` if not auto-fired by SDK |

---

## What's actually good ✅

Not everything is a finding. Things this codebase gets right:

- **TypeScript strict is on.**
- **Zustand stores are small and single-purpose** (`authStore`, `onboardingStore`, `experimentStore`).
- **Service layer exists** — screens don't call Supabase directly everywhere.
- **Env vars flow through `Constants.expoConfig.extra`** — the correct Expo pattern.
- **Component library is real** — `Button`, `FormInput`, `Typography`, `OnboardingContainer`, `LessonContainer` — no per-screen re-styling.
- **`console.log` is `__DEV__`-gated** in most places.
- **eas.json profiles genuinely separate environments** — dev+preview → dev Supabase, production → prod Supabase. This is hard to get right and it's right.
- **`supabase.ts:14` env-detection log** is correctly gated behind `__DEV__`.
- **`DevMenuScreen` is `__DEV__`-gated** in the navigator; won't ship in production.
- **`supabase/migrations/` baseline exists** and matches `prod_schema.sql`.
- **Superwall single-key model is correct** — sandbox handles isolation per Superwall's docs.
- **Docs are reference-grade** — `DEV_PROD_ENVIRONMENTS.md`, `RELEASE_PROCESS.md`, `VERSION_MANAGEMENT.md`, `LAUNCH_CHECKLIST.md`. Better than most funded startups.
- **No leaked secrets** — grep for `service_role`, `sk_`, JWT secrets returns nothing. Supabase anon keys are publishable.
- **No PII in analytics** — `identifyUserWithOnboarding()` sends only `age`, `children_count`, `emotional_challenges`, `familiar_parenting_styles`. No child names, no free-text.
- **Apple Sign-In nonce is handled by Supabase SDK** — no custom crypto to get wrong.

---

## Minimum critical path to launch (~4–6 hours)

The single sequence that unblocks App Store submission:

1. **Fix `PrivacyInfo.xcprivacy`** — add `NSPrivacyCollectedDataTypes` entries. (P0 #4)
2. **Sync build number** — `app.json:21` → `"8"` to match `Info.plist`. (P0 #5)
3. **Create prod PostHog project** — drop the real token into `eas.json:48`. (P0 #3)
4. **Gate demo mode** — build-time flag + guard `posthog.identify()` for demo user. (P0 #1, #6)
5. **Server-side subscription check** — Supabase table + Superwall webhook; gate `LearnScreen` render. (P0 #2)
6. **Auth listener cleanup** — move `onAuthStateChange` into an effect in `App.tsx` with cleanup. (P1 #7)
7. **`SKIP_PAYWALL` prod guard** — throw at boot if set in prod. (P1 #9)
8. **Manual QA smoke test** — onboarding → paywall → purchase → all 13 lessons → sign-out → sign-in.
9. **EAS build → TestFlight → smoke test in TestFlight → submit for review.**

Estimated: half a day. All fixes are mechanical; none require architectural change.

---

## Overall verdicts recap

- **Code quality:** roughly C+ / B-. Solo-founder-shipping-fast, not team-ready. Acceptable to ship, painful to onboard the next engineer to. The lesson-screen sprawl (~364 files) and pervasive `as any` on navigation are the debts you'll curse in 6 months.

- **Security:** no leaked secrets, RLS story appears intact, auth flow standard. The one real hole is client-trusted subscription state — which is also your revenue model. Fix that, and the security posture is normal.

- **Pre-launch:** ~1 day of focused work. All small, all mechanical.

- **Analytics:** partially wired, will produce unreliable data as-is. Fix the four P0/P1 identity bugs (demo, prod token, sign-in identify, sign-out reset) and it becomes trustworthy.

- **Release process:** solo-founder grade. Docs are the best artifact in the repo. The execution has drifted — placeholder token, version mismatch, script naming — but the design is sound.

---

## Appendix — Review method

This document is the synthesis of five parallel deep-read passes:

- **Architecture & health audit** — code shape, duplication, dead code, dependency risk, refactor candidates.
- **Security sweep** — secrets, Supabase RLS, auth flow, subscription enforcement, PII, deep links, input validation.
- **Pre-launch readiness** — App Store compliance state, error handling, config, build hygiene, correctness bugs.
- **Analytics & experiment plumbing** — PostHog init, event taxonomy, identify pattern, experiment stickiness, subscription events, PII in events.
- **Release process & dev/prod separation** — docs-vs-code alignment, EAS profiles, Supabase environment separation, version management, rollback plan.

Each pass read the codebase independently. Findings were merged, cross-referenced (e.g. the PostHog placeholder appears in three audits), and deduped into the single P0/P1/P2 table above.
