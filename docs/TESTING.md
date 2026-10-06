# TESTING

How this app is tested, how to run each layer, and the rules new tests follow. Evergreen: update it when a layer, a rule or a gotcha changes. The plan and its history live in `specs/SPEC-20-production-testing.md`; this is the working reference.

## Run it

| Layer | What | Command | Where it runs in CI |
|---|---|---|---|
| Static | types, lint, invariant lint rules | `npx tsc --noEmit` · `npx eslint .` | CI |
| Unit + screen | decision functions, stores, services, screens (Jest + React Native Testing Library) | `npm test` (with floors: `npm test -- --coverage`) | CI → Jest tests |
| Edge functions | `delete-account` and any future function's `*_test.ts` | `deno test supabase/functions` | CI (edge functions) |
| Database | RLS, grants, SQL functions (pgTAP) | `scripts/db-test-local/run.sh` (no Docker) or `supabase test db` (Docker) | CI (database) |
| Migration parity | this repo has every web-repo migration, unchanged | `scripts/check-migration-parity.sh` | — (run before any prod db push) |
| End to end | the real build on the simulator | not built yet — SPEC-20 R10, blocked on owner setup | — |

Notes:
- **Jest** runs the whole suite in about 4 seconds. Lint must stay at the warning baseline (110 on 2026-10-06); new code adds no warnings.
- **Deno** needs no permissions: handlers run against fakes.
- **The local database runner** builds pgTAP from source and starts a throwaway Homebrew Postgres 17 on a private socket. It never touches dev or prod. Add `VERBOSE=1` to see every line. CI's `supabase test db` against the real stack is the authority.

## Where things live

- **`src/**/__tests__/*.test.ts(x)`:** next to the code they test.
- **`src/test/`:** the shared harness.
  - `setup.ts` installs fakes at the SDK boundary for every file: AsyncStorage, safe area, PostHog, Sentry, the Supabase client, Superwall. It also runs the PII guard (below).
  - **Fakes:** `supabase.ts` (programmable per table, `queryLog`, `fireAuthChange`), `superwall.ts`, `analytics.ts` (`capturedEvents`, `lastCapture`), `navigation.ts`.
  - **Helpers:** `render.tsx`'s `renderScreen()` (provides the fake navigation and route as props and as context), `timers.ts`'s `advance()`, `factories.ts`, `stores.ts`.
- **`supabase/functions/<name>/handler.ts` + `handler_test.ts`:** logic separated from wiring (`index.ts`). The handler takes its outside world as `deps`.
- **`supabase/tests/database/*.sql`:** pgTAP. `access_test.sql` and `functions_test.sql` are shared with the web repo; keep them identical there.
- **`scripts/db-test-local/`:** the no-Docker runner and its Supabase stand-in.

## Rules

1. **Mock at the SDK boundary, never the module under test.** A collaborator that has its own tests may be stubbed to set a scene (say so in the file's header).
2. **Concrete assertions, no snapshots.**
3. **Fake timers for timer paths, advanced with `advance()`**, which steps 50 ms at a time with a render between steps. One long `act()` holds re-renders until it ends, so effect-started intervals never run mid-advance.
4. **A regression test names the incident it locks in**, in a why-comment.
5. **Prove it bites.** Break the code the test guards, watch it fail, restore. A test that has never failed hasn't been shown to work.
6. **Every bug fix ships with a regression test** at the lowest layer that reproduces it.
7. **A flaky test is fixed or quarantined within a day**, with a BACKLOG entry. It is never retried quietly.
8. **New screen file →** add a row to `src/screens/__tests__/everyScreenRenders.test.tsx` (the completeness check fails otherwise).
9. **New URL in the app →** add it, with a reason, to `src/config/__tests__/allowedUrls.test.ts`. App Store 3.1.3: never a link to the web funnel.
10. **New table →** RLS on (database test D1 fails otherwise), plus a policy test in `supabase/tests/database/`.

**The PII guard (INVARIANTS #8).** After every Jest test, `setup.ts` scans every payload sent to PostHog and Sentry. The test fails on an email address or the fixture name. Use `factories.ts`' `FIXTURE_EMAIL` / `FIXTURE_NAME` in fixtures so the guard has something real to catch.

## Coverage floors

`jest.config.js` sets them, and CI enforces them with `--coverage`. Each floor is the coverage measured when it was set, rounded down to the nearest 5. It's a ratchet: raise floors as coverage rises, and a PR that lowers one explains why.

- **Tier A (money, auth, data):** 16 files with per-file floors. Branch percentages look low because every `if (__DEV__)` is a branch whose false side never runs under Jest. Each file's comment gives its branch coverage with those excluded, and that number is held at 80% or more.
- **Tier B:** the global floor, which applies to every file not listed by path.
- **Tier C (presentational components, content):** no floor of its own; every screen mounts in `everyScreenRenders`.

## Gotchas found the hard way

- **A `jest.mock` factory that reads a test-file variable must read it lazily** (through a getter). The factory runs while the module under test is imported, before the test file's `const`s exist. A test once passed for exactly that wrong reason.
- **React Native's Jest setup already makes `Linking.openURL` (and similar) mocks.** `jest.spyOn` returns that same function, so its calls carry across tests. Clear it in `beforeEach`.
- **FlatList with `initialScrollIndex > 0` draws no rows in the test renderer.** It waits for the device to report the content size. Set scenes so the list opens at the top, and leave scroll-to-position to E2E.
- **An UPDATE `WITH CHECK` test must not use `WHERE`.** When an UPDATE reads columns, Postgres also checks the new row against the SELECT policy, which hides a missing `WITH CHECK`.
- **`expo-superwall`'s package `exports` has only an `import` condition.** `jest.config.js` maps the bare name to its `main` file.
- **Apple's `git` and `make` refuse to run until the Xcode license is accepted.** Use `/opt/homebrew/bin/git`.

## Invariants → checks (living copy of SPEC-20 Appendix A)

| # | Invariant | Checked by | Still manual / not yet built |
|---|---|---|---|
| 1 | Only Loading enters Root | ESLint rule; `devMenuGuard.test`; `AuthScreen.test`; `SplashScreen.test` | E2E flow 1 (R10) |
| 2 | onSkip reasons | `routingPolicy.test`; `LoadingScreen.test` #13 | dashboard audience (RELEASE_CHECKLIST 7.5); alert (R12, owner) |
| 3 | Cache bound to the user | `entitlementCache.test`; `authStore.test` | E2E flow 5 |
| 4 | `show_paywall` kept for v1.0.0 | — | dashboard (7.5) |
| 5 | SKIP_PAYWALL never in prod | `appConfigJs.test`; `LoadingScreen.test` #4 | — |
| 6 | Onboarding error ≠ no_onboarding | `onboardingService.test`; `routingPolicy.test`; `AuthScreen.test` | — |
| 7 | No `'Parent'` placeholder writes | `onboardingService.test`; `profileSummary.test`; `LoadingScreen.test` #23 | — |
| 8 | No PII to PostHog/Sentry | `analytics.test`; the global PII guard; `authStore.test`; `AuthScreen.test` | Sentry `sendDefaultPii` in the dashboard |
| 9 | `verify_jwt` on; service key server-only | `edgeFunctionGuards.test`; `handler_test.ts` (in-code verify) | the flag on each actual deploy |
| 10 | Storage keys only via `storageKeys.ts` | ESLint rule; `upgradeFromV120.test` | — |
| 11 | Sequential lock, earliest gap | `units.test`; `LearnScreen.test` | scroll-to-card on long rails: E2E |
| 12 | Every section on the path | `units.test` | — |
| 13 | Per-lesson gate is a no-op | `useLessonGate.test` | — |
| 14 | One source of truth for progress | `lessonCompletion.test`; `pathProgress.test`; `LessonScreen.test` | — |
| 15 | Prod builds fail on missing env | `appConfigJs.test` | — |
| 16 | `buildNumber` bare integer | `appConfigJs.test`; kill-switch headroom in `appConfig.test` | — |
| 17 | `__DEV__` never on the prod DB | `supabaseGuard.test` | — |
| 18 | Kill switch fails open, capped | `appConfig.test`; `appConfigFetch.test`; `configStore.test`; `LoadingScreen.test` #8–10 | E2E flow 8 |
| 19–22 | Process | — | RELEASE_CHECKLIST |
| 23 | Web check error ≠ entitled | `routingPolicy.test`; `entitlementService.test`; `LoadingScreen.test` #6, #26 | — |
| 24 | Client never writes `entitlements` | ESLint rule; database `access_test` D2/D3 | — |
| 25 | Superwall clears only `superwall` flags | `entitlementCache.test`; `authStore.test` (listener hook) | — |
| 26 | App Store 3.1.3 | `allowedUrls.test`; `SettingsScreen.test`; `AuthScreen.test` (Apple offered) | copy review |
| 27 | Labels quoted by the website | `WelcomeScreen.test`; `AuthScreen.test` | — |
| 28 | Cancel Dodo before delete | `handler_test.ts`; `deleteAccount.test`; `SettingsScreen.test` | — |
| — | Web purchase ↔ app agreement | `webEntitlement.test`; `webEntitlementContract.test` (cross-checks the web repo when present) | full purchase chain: E2E flow 11 |
