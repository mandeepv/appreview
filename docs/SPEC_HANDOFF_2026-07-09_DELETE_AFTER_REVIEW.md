# Spec Implementation Handoff — 2026-07-09

> ⚠️ **TEMPORARY DOC — DELETE AFTER REVIEW.** This is a handoff artifact for
> the spec creator to audit the work done on 2026-07-09. It is not permanent
> project documentation. Once every spec below has been reviewed and signed
> off (and any open items closed), delete this file. Do not link permanent
> docs to it.

**Created:** 2026-07-09 · **Covers:** SPEC-01 … SPEC-08, SPEC-09 (Phase 1 only) · **Status:** awaiting review · **SPEC-09 is paused at CHECKPOINT A**

Audit trail for spec work handed to the implementer, written for the spec
creator to verify each requirement was done correctly. One section per spec.
Each requirement records: **Done**, **Verified** (what was actually checked
and how), **Could not verify** (and why), **Deviations** from the spec, and
**Out of scope**.

**How to read this:** the two things worth your attention as the spec author
are the **Deviations** subsections (where implementation did not follow the
spec literally, always with a reason) and the **Could not verify** items
(live checks that still need to run on an authenticated machine — the
sandbox this was built in has no `supabase login` session and no
device/simulator).

**Conventions**
- ✅ done and verified in-repo · ⚠️ done but needs a live/manual check ·
  ❗ deviation from spec (explained) · ⛔ out of scope
- Line numbers are approximate and drift as files change; treat them as
  pointers, not exact addresses.

**Environment limits that apply to everything below**
- No `supabase login` session / no network DB auth → `supabase db dump`,
  `db push`, `migration list`, `link` cannot actually run. Script *logic* was
  verified; live DB round-trips were not.
- No iOS simulator/device run → SPEC-01's runtime flows and screen recordings
  were not executed.
- `tsc`, `eslint`, `bash -n`, `npx expo config`, and all git/grep checks DID
  run and pass.

---

## SPEC-01 — Paywall fixes (ships as v1.1.1)

**Branch:** `fix/spec-01-paywall-fixes` (merged to `main`, `--no-ff`, deleted)
**Commits:** `a6ab02d` (impl) + `7c22ab1` (merge)
**Files touched:** `App.tsx`, `src/screens/onboarding/LoadingScreen.tsx`,
`src/screens/onboarding/AuthScreen.tsx`, `src/screens/SettingsScreen.tsx`,
`src/components/ForceUpdateModal.tsx`, **new** `src/services/purchaseService.ts`,
**new** `src/store/configStore.ts`

Read `docs/PAYWALL_MODEL.md` first, as instructed.

### R1 — Close the sign-in bypass ✅
- **Done:** `AuthScreen.tsx` `handlePostSignin` `has_onboarding` branch now
  `navigation.replace('Loading')` instead of `'Root'`. `clearState()`
  try/catch kept as-is. Comment block rewritten to state the invariant
  (*AuthScreen never routes to Root; all entries to Root go through the
  Loading gate*).
- **Verified:** `grep -rn "replace('Root')" src/` → hits **only** in
  `LoadingScreen.tsx` (acceptance criterion met). `tsc` clean.

### R2 — Treat `restored` as entitlement ✅
- **Done:** `LoadingScreen.tsx` `onDismiss` now handles
  `result.type === 'restored'` → `setIsSubscribed(true)`, fires
  `subscription_restored` (NOT `subscription_purchased`) with `{ paywall_name }`,
  navigates Root. `declined` keeps the existing re-present behavior.
- **Verified:** Confirmed the `PaywallResult` union really is
  `'purchased' | 'declined' | 'restored'` by reading
  `node_modules/expo-superwall/build/src/SuperwallExpoModule.types.d.ts`
  (~lines 147-166) — did not guess member names, per spec. `tsc` clean.

### R3 — Escape hatch on the retry state ✅ / ⚠️
- **Done:**
  - Extracted the restore logic from `SettingsScreen.tsx:28-109` into
    **new** `src/services/purchaseService.ts` (single exported
    `restorePurchases()` returning a normalized `RestoreOutcome`).
    `SettingsScreen` refactored to call it — **no third copy** of the
    StoreKit walk.
  - `LoadingScreen`: when `gateStatus === 'retry'` AND retry attempts ≥ 3,
    renders three actions below the status text using existing
    `Button`/`Typography` components, visually subordinate to the spinner:
    1. **Restore Purchases** → `purchaseService`; on success
       `setIsSubscribed(true)` + navigate Root; on failure inline error text
       (no Alert).
    2. **Sign out** → `authStore.signOut()` then navigate `Welcome`
       (mirrors SettingsScreen's sign-out navigation).
    3. **Contact support** → `Linking.openURL('mailto:…')` in try/catch.
  - `gate_escape_hatch_shown` fires exactly once per screen mount (guarded by
    a ref), on first render of the buttons.
- **Owner decision resolved:** support email = `kinderwellteam@gmail.com`
  (matches `SettingsScreen`'s existing `handleContactSupport`). Confirmed by
  owner before implementing.
- **Verified:** `tsc` clean; lint 0 errors; the restore service is the only
  StoreKit-walk implementation (SettingsScreen no longer imports
  `SuperwallExpoModule` for restore).
- **⚠️ Could not verify (needs device):** that the hatch actually appears
  after ~3 retries in airplane mode and that each of the three actions
  behaves end-to-end (restore inline errors, sign-out lands on Welcome,
  mailto opens).

### R4 — Watchdog for the frozen "presenting" state ✅ / ⚠️
- **Done:** Before every `runGate()` present attempt, resets
  `paywallPresentedRef.current = false` and arms a 5s timer; if `onPresent`
  hasn't fired when it expires, sets `gateStatus('retry')`. Timer cleared in
  `onPresent`, in `onError`, in the `registerPlacement` catch, and on unmount
  (`useEffect(() => clearPresentWatchdog, [])`).
- **Verified:** `tsc` clean; logic reviewed against the dismiss→re-present
  path (the `declined` re-present re-arms fresh).
- **⚠️ Could not verify (needs device):** the acceptance test of stubbing
  `runGate` to a no-op and confirming the UI moves to retry within 5s.

### R5 — Force-update wins over the paywall ✅
- **Done:** **New** `src/store/configStore.ts` — a small Zustand store with
  `status: 'loading' | 'ok' | 'force_update'` and a `checkConfig()` that
  races `fetchAppConfig()`/`isBelowMinimumBuild()` against a **3s timeout
  that fails open to `'ok'`** (matches `appConfig.ts`'s existing fail-open
  philosophy, whose comments were read). `App.tsx` calls `checkConfig()` on
  mount and drives `ForceUpdateModal` off `status === 'force_update'`.
  `LoadingScreen.runGate()` returns early while `'loading'`, never runs on
  `'force_update'`, and a config-resolution effect fires the deferred gate
  once `'ok'`.
- **Verified:** `tsc` clean; `App.tsx` no longer uses local `useState` for
  force-update (removed unused import).
- **⚠️ Could not verify (needs device):** the acceptance test with dev DB
  `min_supported_ios_build = 39` → update modal shows, paywall never
  presents; reset row → normal flow.

### R6 — ForceUpdateModal link safety ✅
- **Done:** `ForceUpdateModal.tsx` wraps `Linking.openURL` (previously
  ~lines 16-18) in try/catch; on failure renders an inline fallback line:
  *"Couldn't open the App Store — search for 'Kinderwell'."*
- **Verified:** `tsc` clean; visual/string reviewed.

### SPEC-01 — Deviations ❗
- **Two new files, not one.** The spec's Files line named one new file
  (`purchaseService.ts`). I also added `src/store/configStore.ts` because R5
  explicitly calls for "a small store/context with three states" — the store
  *is* the required R5 artifact, not extra scope. Flagging so the file count
  isn't a surprise.

### SPEC-01 — Constraints honored ✅
- No changes to `onSkip` or `onError` logic beyond structural R4 need: the
  only edit to `onError` is one `clearPresentWatchdog()` call (R4-structural).
  `onSkip` is byte-for-byte unchanged.
- No new dependencies (`package.json`/lock untouched).
- Superwall placement name `subscription_gate` untouched.

### SPEC-01 — Out of scope / not delivered ⛔ ⚠️
- **Screen recordings for the PR** (acceptance criterion) — not produced; no
  device/simulator in this environment. Owner to record during device
  verification.
- **All device-run acceptance flows** listed under R3/R4/R5 above and the
  general smoke tests (unsub sign-in → paywall not LearnScreen; subscribed →
  Root without paywall; sandbox-subscribed fresh install → Restore → Root in
  one pass with `subscription_restored` and no `paywall_dismissed`; normal
  online cold launches unchanged with no added delay). Logic implemented to
  satisfy them; execution pending.

---

## SPEC-02 — Ops scripts (backup, guarded prod push, version hardening)

**Branch:** `feature/spec-02-ops-scripts` (merged to `main`, `--no-ff`, deleted)
**Commits:** `11c4162` (impl) + `2f7985d` (merge)
**Files touched:** **new** `scripts/backup-prod.sh`, **new**
`scripts/db-push-prod.sh`, `scripts/bump-version.sh`, `app.config.js`,
`.gitignore`, `docs/DEV_PROD_ENVIRONMENTS.md`

Read `docs/DEV_PROD_ENVIRONMENTS.md` (migration section) first, as instructed.
Project refs used come from that doc's "Credentials reference" (prod
`zqwzdyjfxytvedghujsd`, dev `xbkkjqvbsnroenqlqkmi`) — not invented.

### ❗ Key deviation affecting R1 and R2 — link-state detection file
- **Spec said:** read `supabase/.temp/project-ref` (a plain-text file with
  just the ref), and the acceptance criteria say verify abort paths with
  `cat supabase/.temp/project-ref`.
- **Reality in this repo:** that file does not exist. Supabase CLI 2.106.0
  writes `supabase/.temp/linked-project.json` — a JSON blob
  (`{"ref":"xbkkjqvbsnroenqlqkmi",...}`). Confirmed by `ls` + `cat`.
- **What I did (owner-approved):** scripts read
  `supabase/.temp/linked-project.json` and extract `.ref` with `sed` (no `jq`
  dependency — coreutils only). The spec's *intent* (read the CLI's own
  offline link-state file, not `supabase status`) is preserved; only the
  filename/format differ. The earlier `supabase status` idea was correctly
  rejected — it requires the Docker daemon here and errored.
- **Guard fails CLOSED:** a missing or unreadable ref → the script refuses to
  run rather than guess which DB it's on.
- **Acceptance-criteria wording to update:** where the criteria say
  `cat supabase/.temp/project-ref`, read
  `cat supabase/.temp/linked-project.json` instead.

### R1 — `scripts/backup-prod.sh` ✅ / ⚠️
- **Done:** New script. Dumps schema and data to
  `backups/prod_<UTC timestamp>_{schema,data}.sql` via
  `supabase db dump --linked` (schema) and `--data-only` (data).
  `set -euo pipefail`. Prints the written paths. Non-empty check on both
  files afterward. **Fails loudly** (nonzero, clear message) if the CLI is
  not linked to the prod ref. Added `backups/` to `.gitignore`.
- **Verified in-repo:**
  - ✅ Refuses when linked to the wrong project: run while linked to dev →
    exit 1 with a clear "linked to '…', not the PROD ref" message.
  - ✅ Ref extraction correct against the real dev file, a simulated prod
    file, and the missing-file (fail-closed) case.
  - ✅ `bash -n` syntax clean. macOS-compatible (uses `date -u`, POSIX `sed`,
    no GNU-only flags).
  - ✅ `backups/` is gitignored (`git check-ignore` passes; `git status`
    clean).
- **⚠️ Could not verify (needs auth):** that pointing the guard at dev and
  running actually **produces two non-empty .sql files** — `supabase db dump
  --linked` errors with "Cannot find project ref" in this sandbox (no login
  session). To test the mechanics, on an authenticated machine temporarily
  set the guard's expected ref to dev (or link to dev and relax the guard),
  run, confirm two non-empty files, then revert. Per spec, first real prod
  run is owner-only.

### R2 — `scripts/db-push-prod.sh` ✅ / ⚠️
- **Done:** New script implementing the exact sequence, aborting at any
  failure:
  1. Typed confirmation — user must type exactly `push to PRODUCTION`.
  2. Run `backup-prod.sh` (no push without a same-day backup). Script links
     to prod first so the backup guard passes.
  3. Verify linked to prod ref (via the state file).
  4. `supabase migration list --linked` printed for eyeballing.
  5. `supabase db push --linked --dry-run`.
  6. Second typed confirmation — user must type exactly `apply`.
  7. Real `supabase db push --linked`.
  8. **Always re-link to the dev ref on exit**, including error/abort paths,
     via a `trap … EXIT`. The trap re-links unconditionally (idempotent) then
     **asserts** the state file now reads dev and warns LOUDLY if not — so
     even a failed re-link can't leave you silently pointed at prod. Dev ref
     read from the doc, not invented.
- **Verified in-repo:** ✅ `bash -n` clean; ✅ trap and ref-read logic
  reviewed; ✅ macOS-compatible.
- **⚠️ Could not verify (needs auth):** the dry-run path end-to-end against
  dev, and that aborting at each confirmation leaves the CLI re-linked to dev
  (`cat supabase/.temp/linked-project.json` shows the dev ref after each
  abort). Needs a `supabase login` session.

### R3 — Version tooling hardening ✅
- **Done:**
  - `bump-version.sh`: rejects any build number that is not a bare positive
    integer (`^[0-9]+$`) **with an explanatory message** — a "1.1.0"-style
    CFBundleVersion parses to `1` via `parseInt()` in `appConfig.ts`
    (`getCurrentBuildNumber`) and would silently defeat the kill-switch
    guard. (The prior code already had the regex but a terse message; the
    message now explains *why*.)
  - `app.config.js` (~line 84): replaced the `config.ios?.buildNumber ?? '9'`
    fallback with a **thrown `Error`** naming the missing field, following the
    style of the existing env-var throws in the same file (~lines 52-73). A
    missing `buildNumber` now fails the build loudly instead of pinning to 9.
- **Verified in-repo:**
  - ✅ `./scripts/bump-version.sh 1.2.0 abc` → rejected, exit 1, clear
    message.
  - ✅ `./scripts/bump-version.sh 1.2.0 1.2` → rejected, exit 1, clear
    message.
  - ✅ `1.2.0 10` → passes both validation regexes (would proceed to bump).
  - ✅ Removing `ios.buildNumber` from `app.json` → `npx expo config` throws
    the new error; restoring it → `npx expo config` clean again.
    (`app.json` restored to its original state; the test used a scratchpad
    backup and never left it modified.)

### R4 — Docs single-source-of-truth ✅
- **Done:** In `docs/DEV_PROD_ENVIRONMENTS.md`, the migration section's
  "Applying a migration → **To prod**" manual four-command list was replaced
  with a pointer to `./scripts/db-push-prod.sh` plus a short explanation
  (mirrors the existing release-workflow stub pattern at lines ~291-348 —
  "do not follow this doc, use X, here's why").
- **Extra cleanup within R4's intent:** found and stubbed a **second** manual
  prod-push list in the same doc (the "Applying to prod on next release"
  `app_config` block, ~line 488) — it was the same `link → dry-run → push →
  re-link` procedure. Now it also points at the script, so the doc contains
  **exactly one** description of the prod-push procedure (the script), which
  is the acceptance criterion.
- **Verified in-repo:** ✅ `grep` shows `db-push-prod.sh` is the only DB
  prod-push procedure; the one remaining `link --project-ref <prod>` is an
  **Edge Function deploy** (different procedure), correctly left alone.

### R5 — DEV_PROD_ENVIRONMENTS.md prod-push description ✅
(Covered by R4 — the doc now contains exactly one prod-push procedure.)

### SPEC-02 — Constraints honored ✅
- Shell scripts are `bash`, `set -euo pipefail`, macOS-compatible (no
  GNU-only flags), no dependencies beyond supabase CLI + coreutils (ref
  parsing uses `sed`, not `jq`).
- **Never executed either script against prod during development.** No script
  was run against prod at all; the only live runs were the dev-linked refusal
  test and syntax checks.

### SPEC-02 — Out of scope / not delivered ⛔ ⚠️
- Live dev-pointed runs of both scripts (the acceptance tests that require a
  real `supabase db dump`/`db push` round-trip) — pending an authenticated
  machine. See ⚠️ items under R1 and R2.

---

## SPEC-03 — delete-account edge function hardening

**Branch:** `feature/spec-03-edge-function-hardening` (in progress at time of
writing; will be merged to `main`, `--no-ff`, then deleted)
**Files touched:** **new** `supabase/config.toml`,
`supabase/functions/delete-account/index.ts`,
`supabase/EDGE_FUNCTION_DEPLOYMENT.md`

Read `supabase/EDGE_FUNCTION_DEPLOYMENT.md` first, as instructed.

### R1 — Codify the gateway flag ✅
- **Done:** New `supabase/config.toml` with `project_id = "kinderwell"` and a
  `[functions.delete-account]` section setting `verify_jwt = true`. Kept
  intentionally minimal per the spec ("add only what's required") — did NOT
  mirror the full `supabase init` local-dev-stack config, because this
  project doesn't run the local stack and every extra section is drift risk.
  `project_id` is the only required top-level key; `[functions.*]` blocks are
  additive.
- **Verified in-repo:** ✅ Parses as valid TOML (`python3 -m tomllib`),
  `functions.delete-account.verify_jwt == true`. Confirmed against a
  `supabase init` reference config that `project_id` is the sole required
  top-level key and that a minimal config isn't rejected for parsing (the CLI
  only complained about project *link* state, not config syntax).

### R2 — In-function verification (defense in depth) ✅ / ❗
- **Done:**
  - Added `import * as jose from 'https://esm.sh/jose@5.9.6'` (esm.sh, matching
    the file's existing esm.sh import style for supabase-js).
  - Before using `sub`, the function now verifies the JWT **signature and
    expiry** via `jose.jwtVerify(token, secretKey, { algorithms: ['HS256'] })`,
    where `secretKey = TextEncoder().encode(SUPABASE_JWT_SECRET)`. `sub` is
    read only from the verified payload. Algorithms pinned to HS256
    (alg-confusion defense).
  - Rewrote the ~120-122 comment block: removed the wrong "deleteUser would
    fail on an unknown sub" reasoning and replaced it with the real trust
    model (gateway `verify_jwt` = layer 1, in-function signature check =
    layer 2; an attacker uses a *known* victim `sub`, so an unverified `sub`
    is an account-deletion vector).
  - Added the migration-path comment: if the project moves to asymmetric JWT
    signing keys, switch to
    `jose.createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))`.
- **❗ DEVIATION — response code on verification failure (400 → 401):** The
  spec text says "existing 401 behavior," but the function's existing
  catch-all actually returned **400** (`{ error, step }`), not 401. The
  acceptance criteria are unambiguous that verification failures should be
  **401** (tampered → 401, expired → 401). I implemented **401 with an empty
  body** for all verification failures (bad signature, expired, malformed,
  missing `sub`), as a dedicated early return — separate from the 400
  step-error path, whose `{ error, step }` shape is deliberately left
  unchanged. So the "existing" behavior the spec refers to was 400; I changed
  verification failures specifically to 401 to satisfy the acceptance
  criteria. Flagging in case the author intended to keep 400.
- **❗ Minor — missing-secret returns 500:** When `SUPABASE_JWT_SECRET` is
  unset the function **fails closed** with a **500** (empty body) and never
  reaches the delete steps. The acceptance criterion allows "500/401" for
  this case; I chose 500 because a missing secret is a server
  misconfiguration, not a client auth failure.
- **Verified in-repo:** ✅ Response-shape audit via grep — 200 success and
  400 step-errors unchanged; new 401 (verification fail) and 500 (missing
  secret) both emit `null` bodies. ✅ jose API/version (`jwtVerify` returning
  `{ payload }`, HS256, `Uint8Array` key) is correct for jose@5.
- **⚠️ Could not verify (no `deno` in environment):** could not run
  `deno check` to type-check the function or actually resolve the remote
  `jose` import. The import URL and API usage were verified by inspection
  against jose@5's known signature, not by execution.

### R3 — Deployment doc ✅
- **Done:** `EDGE_FUNCTION_DEPLOYMENT.md` now opens with:
  (a) a prominent "🚨 NEVER deploy delete-account with `--no-verify-jwt`"
  warning (with the ❌/✅ command contrast and why); and
  (b) a "One-time secret setup" section with
  `supabase secrets set SUPABASE_JWT_SECRET=<...>` (value from Dashboard →
  Settings → API → JWT secret), explicitly marked **dev = intern may set**,
  **prod = owner-only**, and noting the fail-closed behavior if it's missing.
- **Verified in-repo:** ✅ Both R3 items present; the `--no-verify-jwt` flag
  name matches `supabase functions deploy --help`.

### SPEC-03 — Constraints honored ✅
- Deploy/test intended for the DEV project only; no deploy was run at all
  (no auth in this environment). Prod deploy remains owner-only.
- Did NOT restructure the deletion sequence — `lesson_progress → user_profiles
  → auth user` order is untouched (the deliberate belt-and-suspenders over FK
  cascades).

### SPEC-03 — Out of scope / not delivered ⛔ ⚠️
- **All live acceptance tests** (need dev deploy + `SUPABASE_JWT_SECRET` set on
  the dev project — no auth/deno here):
  - Valid dev-user token → deletion succeeds end-to-end from the dev app build.
  - Tampered token (flip one payload char, re-encode) via curl → 401,
    empty/generic body.
  - Expired token → 401.
  - Missing `SUPABASE_JWT_SECRET` → fails closed (implemented as 500), never
    deletes.
- **PR curl commands** (acceptance criterion: PR description must include the
  curl commands used for the negative tests). Draft commands to run and paste
  into the PR (fill in `<DEV_FUNCTION_URL>` and a real dev token):

  ```bash
  # 1. Tampered token → expect 401, empty body.
  #    Take a valid dev access token, flip one char in the payload segment.
  curl -i -X POST "<DEV_FUNCTION_URL>/delete-account" \
    -H "Authorization: Bearer <TAMPERED_JWT>" \
    -H "Content-Type: application/json"

  # 2. Expired token → expect 401.
  curl -i -X POST "<DEV_FUNCTION_URL>/delete-account" \
    -H "Authorization: Bearer <EXPIRED_JWT>" \
    -H "Content-Type: application/json"

  # 3. Missing secret → temporarily unset on the DEV project, expect 500,
  #    never deletes. (Owner/dev on the dev project only.)
  #    supabase secrets unset SUPABASE_JWT_SECRET   # dev only, then re-set after
  curl -i -X POST "<DEV_FUNCTION_URL>/delete-account" \
    -H "Authorization: Bearer <VALID_JWT>" \
    -H "Content-Type: application/json"
  ```
  Note: with the gateway `verify_jwt = true`, cases 1 and 2 may be rejected by
  the gateway (401) BEFORE reaching the function — which is the intended layer-1
  behavior. To exercise the in-function layer-2 check specifically, deploy once
  with `--no-verify-jwt` **on dev only** and repeat; the function must still
  return 401. Re-deploy without the flag afterward.

---

## SPEC-04 — Jest harness + policy-kernel tests

**Branch:** `feature/spec-04-jest-policy-kernel` (in progress at time of
writing; two commits — R1 refactor, then R2 harness + R3 tests — then merged
to `main`, `--no-ff`, deleted).
**Files touched:** `package.json` (jest deps + `test` script), **new**
`jest.config.js`, **new** `src/navigation/routingPolicy.ts`, **new**
`src/navigation/lessonRoutes.ts`, `src/lib/env.ts`,
`src/screens/onboarding/AuthScreen.tsx`,
`src/screens/onboarding/LoadingScreen.tsx`, `src/screens/LearnScreen.tsx`,
**new** six `__tests__/*.test.ts` files.

Depends on SPEC-01 (tests the fixed routing). Done as two commits per spec.

### R1 — Extract routing decisions into pure functions ✅ / ⚠️
- **Done (behavior-preserving, separate commit `1004839`):**
  - New `src/navigation/routingPolicy.ts` with two pure functions:
    - `resolvePostAuthDestination({ onboardingStatus, mode })` → `{route:'Loading'}`
      | `{route:'UserType'}` | `{recoverFromError:true}`.
    - `resolveGateOutcome(result, isSubscribed)` → `'enter_root'` | `'re_present'`
      | `'retry'`.
  - `AuthScreen.handlePostSignin` refactored to compute→act: it calls the pure
    function and performs side effects (clearState, alert, signOut) keyed on
    the decision. No routing conditionals remain.
  - `LoadingScreen` gate callbacks (onDismiss/onSkip/onError + the
    registerPlacement catch) delegate to `resolveGateOutcome` via a single
    `applyGateOutcome` helper; analytics/state side effects stay in the screen.
  - `LESSON_NAV` extracted out of `LearnScreen` (a component) into new
    `src/navigation/lessonRoutes.ts` so the route-coverage test can import it
    without importing React. Added `ROOT_STACK_ROUTE_NAMES` (runtime list) with
    a compile-time guard that it matches `RootStackParamList` exactly.
  - `env.ts`: added pure `resolveEnv(ref)`; the `env` const now calls it.
- **Verified in-repo:** ✅ `tsc` clean; ✅ `replace('Root')` still lives only
  in `LoadingScreen` (SPEC-01 R1 invariant preserved); ✅ no routing
  conditionals left in the screens (they only compute + act).
- **⚠️ Owner to verify on device (per spec):** the SPEC-01 manual flows still
  pass after this refactor. The refactor is a pure extraction and the
  `routingPolicy.test.ts` truth table IS the automated regression test, but
  the on-device manual flow run is the spec's gate and needs a simulator.

### R2 — Jest harness ✅
- **Done:** Added dev deps `jest`, `jest-expo@~54.0.0` (matches Expo SDK 54),
  `@types/jest`; added `"test": "jest"` script; new `jest.config.js` using the
  `jest-expo` preset, `testMatch` limited to `**/__tests__/**/*.test.ts`, and a
  `transformIgnorePatterns` allowlist for the RN/Expo ESM the sources pull in.
  No testing-library, no snapshots, no component rendering.
- **Mock-boundary note (minor deviation from the literal wording):** the spec
  says mock `posthog-react-native` at module level. `analytics.ts` imports its
  posthog instance from `../config/posthog` (which is where the SDK is
  constructed), and mocking the raw `posthog-react-native` default export
  didn't take under the jest-expo transform (the constructed instance lacked
  `register`). I mocked `../config/posthog` instead — the same boundary one
  level up, still NOT mocking the module under test. `src/lib/supabase` is
  mocked exactly as specified for the onboardingService test.
- **Verified:** ✅ harness runs; suite green (below).

### R3 — Six test files ✅
- **Done — all six files with the required cases:**
  - `src/lib/__tests__/appConfig.test.ts` — `isBelowMinimumBuild`: below/above/
    equal minimum; minimum > 40 (CAP) ignored; minimum ≤ 0 ignored; non-numeric
    current build; build "1.1.0" (parseInt→1) does not force-update against
    minimum 1; parse-failure/null → refuses. (8 tests)
  - `src/services/__tests__/onboardingService.test.ts` —
    `hasUserCompletedOnboarding`: row+user_type → has_onboarding; row w/o
    user_type → no_onboarding; PGRST116 → no_onboarding; real fetch error →
    error (never no_onboarding). `saveUserOnboardingData` name filter: 'Parent',
    '', '   ' excluded; real name included; trimmed. (10 tests)
  - `src/lib/__tests__/analytics.test.ts` — `identifyUserWithOnboarding`: email
    NEVER in `$set` (asserted on mock call args); signup vs signin shapes
    differ; `safeCapture` swallows a throwing client without rethrowing. (4)
  - `src/lib/__tests__/env.test.ts` — `resolveEnv`: dev→dev, prod→prod,
    unknown→'unknown', undefined→'unknown' (no throw), ''→unknown. (5)
  - `src/navigation/__tests__/lessonRoutes.test.ts` — every lesson nav target
    resolves to a registered RootStack route (import both tables, containment);
    all 13 lessons mapped. (4)
  - `src/navigation/__tests__/routingPolicy.test.ts` — FULL truth table for both
    functions: every onboardingStatus × mode; every gate outcome (purchased,
    restored, declined, each skip reason, error) × isSubscribed true/false. The
    `has_onboarding → Loading` case is commented as the v1.1.0-bypass
    regression test. (22)
- **Verified in-repo:**
  - ✅ `npm test` green: **6 suites, 52 tests, ~0.8s** (well under the 30s
    budget).
  - ✅ `tsc` clean (tests type-check too).
  - ✅ Constraints: no snapshots, no testing-library, no React-component
    imports (verified by grepping every `import` in the test files — only pure
    functions + the mocked config module).
  - ✅ **Mutation checks (all four — each temporarily applied, confirmed a test
    fails, then reverted):**
    - (a) delete the `'Parent'` filter → 3 onboardingService tests fail. ✓
    - (b) add email to the `$set` payload → the analytics privacy test fails. ✓
    - (c) change `has_onboarding` destination to `'Root'` → 3 routingPolicy
      tests fail (incl. the explicit "never routes to Root" bypass test). ✓
    - (d) remove the `restored` branch → 2 routingPolicy `restored` tests fail. ✓
    All four reverted; final suite green.

### SPEC-04 — Constraints honored ✅
- Assert concrete values; no snapshots.
- No test imports a React component or requires a simulator.
- Did not chase coverage numbers — scope is exactly the six files.

### SPEC-04 — Out of scope / not delivered ⛔ ⚠️
- **On-device SPEC-01 manual-flow re-verification** after the R1 refactor
  (acceptance criterion: "R1 refactor commit passes the SPEC-01 manual flow
  checks — record which you ran in the PR"). Needs a simulator; owner to run
  and record in the PR. The automated truth-table test covers the same
  decisions.
- **PR bookkeeping** the spec asks for (record which manual flows were run) —
  belongs in the PR description at push time.

---

## SPEC-05 — CI pipeline updates

**Branch:** `feature/spec-05-ci-pipeline` (merged to `main`, `--no-ff`, deleted).
**Files touched:** `.github/workflows/ci.yml` only (as the spec scopes it).

Depends on SPEC-04 (the new `test` job needs the tests, which are merged).

> ### ⚠️ POST-MERGE AMENDMENT (owner-directed) — CI is now MANUAL-only
> SPEC-05 shipped with `push: ['**']` + `pull_request`, i.e. CI on every branch
> push and PR. **After merge, the owner changed CI to run on
> `workflow_dispatch` only** (commit `f7e827b`, 2026-07-09). Reason: this is a
> **private repo with metered GitHub Actions minutes**, automatic per-push /
> per-merge runs were redundant with the local tsc/lint/test we run before
> every merge, and (unrelated) a SPEC-08 run got stuck in the runner queue and
> was cancelled — which surfaced the cost concern. The 5 jobs are unchanged;
> only the trigger changed. CI is now run **manually as a release gate** — see
> `docs/RELEASE_CHECKLIST.md` Phase 2. **This means requirements (1) and (5)
> below no longer describe the live state.** Flag to the spec author as an
> agreed amendment. To restore automatic gating, add `push: { branches: [main] }`
> back to `on:`.

### Requirements ✅
- **(1) Triggers:** `push` now fires on all branches (`branches: ['**']`);
  `pull_request` kept scoped to `main`. ✅
- **(2) New `test` job:** same Node setup as the existing jobs (Node 20,
  `actions/setup-node@v4` with `cache: 'npm'`, `npm ci`), runs
  `npm test -- --ci`. ✅
- **(3) New `audit` job:** `npm audit --audit-level=high` with
  `continue-on-error: true` (advisory) and a comment saying to tighten it
  once SPEC-07 removes dead deps. ✅
- **(4) Existing jobs untouched:** `typecheck`, `lint`, `version-drift` are
  byte-for-byte unchanged (verified: the only removed line in the diff is the
  `push` trigger's `branches: [main]`). The lint job's warning-baseline
  comment is preserved. ✅
- **(5) No branch protection enabled** by the implementer. See the owner
  action below. ✅

### Verified in-repo
- ✅ `ci.yml` is valid YAML; jobs = `typecheck, lint, version-drift, test,
  audit`; `push.branches = ['**']`, `pull_request.branches = ['main']`.
- ✅ `npm test -- --ci` (what the `test` job runs) → 6 suites, 52 tests green.
- ✅ `npm audit --audit-level=high` exits nonzero locally (there are high/
  critical advisories in the current dependency baseline) — which is exactly
  why the `audit` job is `continue-on-error: true`: it shows advisory/yellow
  without blocking. Matches the "audit job visibly advisory (yellow allowed)"
  criterion.

### Could not verify (needs GitHub Actions to actually run) ⚠️
- The acceptance criteria "a push to the spec branch triggers all five jobs
  (this PR is its own test)", "all jobs green; audit visibly advisory", and
  "total pipeline time under ~5 minutes (npm cache)" can only be confirmed by
  the real Actions run once this branch/PR is pushed. The commands themselves
  are verified locally; the runner behavior is not.

### Owner action (spec requirement 5, owner-only) 🔒
- **SUPERSEDED by the manual-CI amendment above.** The original plan was to
  mark typecheck/lint/version-drift/test as required status checks under branch
  protection. Since CI no longer runs on push/PR (manual-only now), required
  checks don't apply — there's nothing for them to gate. If you later re-enable
  `push: { branches: [main] }`, revisit this and set those four as required
  checks (audit stays advisory). For now the release gate is running CI
  manually in Phase 2 of `docs/RELEASE_CHECKLIST.md`.

---

## SPEC-06 — Analytics & error-tracking hygiene

**Branch:** `feature/spec-06-analytics-hygiene` (merged to `main`, `--no-ff`,
deleted).
**Files touched:** `src/config/sentry.ts`, `src/store/authStore.ts`,
`src/lib/analytics.ts`, `src/screens/onboarding/LoadingScreen.tsx`,
`src/screens/onboarding/AuthScreen.tsx`, and the SPEC-04
`src/lib/__tests__/analytics.test.ts`. (`authService.ts` already had the
delete-path `Sentry.setUser(null)` — left as-is; sign-out made consistent.)

Depends on SPEC-01 (merged). Principle: Sentry = system of record for
FAILURES, PostHog = BEHAVIOR, identify by pseudonymous Supabase user ID only,
no email / child names / free-text PII ever (invariant #8).

### R1 — One system of record for errors ✅
- **Done:** Removed the `posthog.captureException` calls at
  `LoadingScreen` (paywall onError) and `AuthScreen` (provider sign-in catch).
  Both sites keep their `reportError` (Sentry) call. AuthScreen's behavioral
  signal still goes to PostHog via the existing `trackAuthAbandoned`.
- **Verified:** ✅ `grep -rn "posthog.captureException" src/` → zero hits.

### R2 — Pseudonymous Sentry user ✅
- **Done:** Added `setSentryUser(id | null)` to `sentry.ts` (sets
  `Sentry.setUser({ id })` — ID only, no email/username). Wired:
  - Sign-in: called alongside `posthog.identify(session.user.id)` in
    `authStore.initialize`.
  - Sign-out / auth-state-null: `setSentryUser(null)` in both the
    `onAuthStateChange` null branch AND the explicit `signOut()` method (the
    latter synchronous so a subsequent error can't be attributed to the
    just-signed-out user before the listener fires). Consistent with the
    existing `Sentry.setUser(null)` on the delete path.
- **Verified:** ✅ tsc clean; the helper is ID-only by construction.

### R3 — Person-property minimization ✅
- **Done:** Removed `emotional_challenges` from the `$set` person properties
  in `identifyUserWithOnboarding`. Verified it is **already** captured on the
  onboarding step EVENT (`EmotionalChallengesScreen` →
  `trackOnboardingStepCompleted('EmotionalChallenges', { challenges })`), so
  nothing was lost — no need to add it to an event. Rewrote the comment to
  state the rule: person props = durable, low-sensitivity facts only;
  sensitive answers live on events.
- **Verified:** ✅ the `$set` block now has only the 9 low-sensitivity fields
  (no `emotional_challenges`, no `email`); SPEC-04 analytics test updated with
  an explicit "emotional_challenges absent from $set" assertion (see R-tests).

### R4 — Gate breadcrumbs ✅
- **Done:** Added `addGateBreadcrumb(message)` to `sentry.ts`
  (`Sentry.addBreadcrumb({ category: 'gate', level: 'info', message })`, no
  user data). Fired on:
  - every `gateStatus` transition — a `useEffect` on `gateStatus` with a
    `prevGateStatusRef` emits `"gate: <from> → <to>"`.
  - the R4-SPEC-01 present-watchdog firing.
  - the escape-hatch rendering.
- **Verified:** ✅ tsc clean; messages contain flow state only, no PII.

### R5 — Two new funnel events ✅
- **Done:**
  - `paywall_presented { paywall_name }` via `safeCapture` in
    `LoadingScreen.onPresent` (was previously only a `__DEV__` log).
  - `auth_succeeded { auth_method, context }` — new `trackAuthSucceeded`
    helper in `analytics.ts` (uses `safeCapture`), fired in AuthScreen at the
    point a provider sign-in returns a valid session, mirroring
    `trackAuthAttempted`/`trackAuthAbandoned`'s method+context so
    attempted → succeeded | abandoned is a clean funnel.
- **Verified:** ✅ both use `safeCapture` (house pattern); tsc/lint clean.

### SPEC-06 — Constraints honored ✅
- All new PostHog events go through `safeCapture` (never raw
  `posthog.capture`). No existing events renamed. Sentry `init` options
  untouched (the R2/R4 helpers are additive functions, not init changes).

### SPEC-06 — Tests & grep proofs (acceptance criteria) ✅ / ⚠️
- ✅ **Grep proof (for the PR):**
  - `grep -rn "posthog.captureException" src/` → **zero**.
  - No `emotional_challenges` in the `$set` payload (only in an explanatory
    comment).
  - No `email` in any analytics payload (only in comments).
- ✅ **SPEC-04 analytics test updated** with the `emotional_challenges` absent
  assertion; full suite green (6 suites, 52 tests).
- ⚠️ **Dev-build run-throughs (owner, need a device + Sentry DevMenu):**
  - Sign in → PostHog shows `auth_succeeded` then `paywall_presented`; a Sentry
    test error (DevMenu) shows the user id attached and gate breadcrumbs in the
    event timeline.
  - Sign out → a subsequent DevMenu test error has NO user attached.

### SPEC-06 — Out of scope / not delivered ⛔
- The dev-build/device run-throughs above (PostHog event inspection + Sentry
  DevMenu error with user + breadcrumbs) — need a running app + Sentry; owner
  to run. The wiring is verified in-repo (tsc, lint, tests, grep).

---

## SPEC-07 — Codebase hygiene sweep

**Branch:** `feature/spec-07-codebase-hygiene` (merged to `main`, `--no-ff`,
deleted).
**Files touched:** `package.json` (+ lock), `App.tsx`,
`src/store/configStore.ts`, `src/store/authStore.ts`, root-file moves/deletes,
several docs (`APPLE_JWT_ROTATION.md`, `DEV_PROD_ENVIRONMENTS.md`,
`DEV_SETUP_LOG_2026-07-01.md`, `LESSON_EXTRACTION_SUMMARY.md`,
`docs/archive/README.md`, `docs/PAYWALL_MODEL.md`).

Every removal required a zero-importer proof. **Two of the six R1 candidates
were flagged and NOT removed — see below.**

### R1 — Remove dead dependencies ✅ / ❗ (2 flagged, owner-confirmed) / ⚠️
- **Removed (zero-importer proven — grep across `src/`, `App.tsx`,
  `app.config.js`, `babel.config.js`, `app.json` all empty):**
  `react-hook-form`, `expo-file-system`, `expo-device`, `react-native-dotenv`.
- **Kept `zod`** (adopted by SPEC-09).
- **❗ FLAGGED, NOT removed (grep non-empty → R1 says stop and flag;
  owner confirmed keep-untouched):**
  - **`expo-asset`** — zero code importers BUT registered as an **active config
    plugin in `app.json` (line 30)**. This is exactly the "some expo packages
    act via config plugins" case R1 warns about; removing the package would
    break the native build. Left the package AND the `app.json` plugin entry
    completely untouched.
  - **`expo-notifications`** — zero code importers, but `app.config.js` carries
    two comments documenting that it's **intentionally kept installed but
    unregistered** for the planned notifications feature (BACKLOG #13). Grep
    non-empty (comments); left untouched.
- **Zero-importer proof (for the PR), for each removed pkg:**
  `grep -rn "<pkg>" src/ App.tsx app.config.js babel.config.js app.json` → empty.
- **⚠️ Could not verify (spec requires a full dev build on simulator — no
  device here):** the spec notes a clean `tsc` alone isn't sufficient because
  config-plugin packages can break the build silently. The four removed
  packages have **no** config-plugin involvement (verified: none appear in
  app.json/app.config.js/babel.config.js), so risk is low — but the owner
  should run `npx expo run:ios` (or a dev-client build) to confirm the app
  still boots before relying on this.

### R2 — Root clutter ✅
- **Moved to `scripts/`** (via `git mv`, history preserved): `convert_svg.js`,
  `extract_lessons.py`, `generate_apple_jwt.js`. Fixed the operational doc
  references (`node generate_apple_jwt.js` → `node scripts/generate_apple_jwt.js`
  in `APPLE_JWT_ROTATION.md`, `DEV_PROD_ENVIRONMENTS.md`, `DEV_SETUP_LOG`;
  the "Update `generate_apple_jwt.js`" instruction; and the absolute paths in
  `LESSON_EXTRACTION_SUMMARY.md`).
- **Deleted:** `Todo.txt` (0 bytes), `CODING_COMPLETE.md`,
  `posthog-setup-report.md`.
- **Archived (NOT deleted):** `lessons_content.md` → `docs/archive/` with a new
  entry in `docs/archive/README.md` (per its per-file format), noting it's
  likely SPEC-09 source material.
- **Verified:** ✅ no ACTIVE doc reference points at an old root location.
  Remaining mentions of the moved filenames live only in historical/archive
  review docs (`archive/COMPOUND_ENGINEERING_REVIEW.md`, `FABLE_*`) that
  *describe the pre-move state* — rewriting those would falsify the record, so
  they're intentionally left.

### R3 — Kill-switch foreground re-check ✅ / ⚠️
- **Done:** `App.tsx` adds an `AppState` listener; on transition to `active`
  it calls `maybeRecheckConfig()`. `configStore` now tracks `lastCheckedAt`
  and re-fetches only if the last check was > 6h ago (constant
  `RECHECK_INTERVAL_MS`). Unlike the cold-launch `checkConfig`, the foreground
  path CAN move an already-`ok` resident app to `force_update` (the point of
  R3), but never downgrades `force_update` → `ok` mid-session. `__DEV__` logs
  demonstrate both the skip (< 6h) and the re-fetch (> 6h) paths.
- **Verified:** ✅ tsc/lint clean.
- **⚠️ Owner to verify on device:** foreground the app after the 6h window and
  confirm exactly one config re-fetch fires (screenshot the `__DEV__` log).

### R4 — Superwall identity on sign-out ✅ / ⚠️
- **Done:** `authStore.signOut()` now calls `await SuperwallExpoModule.reset()`
  in try/catch with `reportError` on failure — mirroring the delete-account
  path (`authService.ts:~309`). Without it, Superwall kept the previous user's
  identity, so on a shared device the next sign-in inherited the prior user's
  entitlement state.
- **Verified:** ✅ tsc/lint clean; mirrors the existing delete-path pattern.
- **⚠️ Owner to verify on device (this touches sign-out — spec says re-run the
  SPEC-01 sign-out/sign-in flow):** sign out → sign in with a DIFFERENT account
  on the same device → confirm the second user gets its own Superwall identity
  (check Superwall debug logs in a dev build).

### R5 — PAYWALL_MODEL.md note ✅
- **Done:** Added a subsection "⚠️ `onSkip` cannot tell 'entitled' from
  'dashboard misconfig'" to `docs/PAYWALL_MODEL.md` — explains the three skip
  reasons (Holdout / NoAudienceMatch / PlacementNotFound), that misconfig looks
  identical to "entitled" (user reaches Root without paying), and that the
  `paywall_skipped_by_superwall` event count is the ONLY tripwire, so any
  dashboard edit to the placement must watch it.

### SPEC-07 — Out of scope / not delivered ⛔ ⚠️
- Dev-build-on-simulator boot check (R1) and the device run-throughs (R3
  foreground re-fetch log, R4 shared-device Superwall identity) — need a
  running app; owner to run. Everything else verified in-repo.

---

## SPEC-08 — Navigation typing

**Branch:** `feature/spec-08-navigation-typing` (merged to `main`, `--no-ff`,
deleted).
**Files touched:** **new** `src/navigation/types.ts`, the 4 navigator files,
and ~15 screen files. 22 files total (21 modified + 1 new).

Must merge BEFORE SPEC-09 (makes the lesson refactor type-checked). TYPES
ONLY — route names and param objects are byte-identical to before.

### ❗ Agreed spec amendment — transitional re-export shims (owner-approved)
- The spec said define ParamLists in `types.ts` with no re-export. Strictly
  that means rewriting ~370 import sites (RootStackParamList ~13,
  OnboardingStackParamList ~17, LessonStackParamList 342 — mostly the
  hand-built lesson screens SPEC-09 is about to delete). Per owner direction,
  we relaxed "no re-export" to "no re-export **as the permanent state**":
  - **Definitions live only in `types.ts`** (the single composition home —
    `types.ts` imports nothing from navigator/screen files).
  - Each navigator keeps a **one-line `export type { X } from './types'` shim**,
    commented DEPRECATED, to keep existing importers compiling. `export type`
    is compile-time-erased, so no runtime cycles.
  - Any file we edited (and all new code) imports from `types.ts` directly.
  - The shims get swept in SPEC-09's dead-code pass (plan 5.5).

### R1/R2 — types.ts + typed navigators ✅
- **Done:** New `src/navigation/types.ts` is the single home for
  `OnboardingStackParamList`, `RootStackParamList`, `LessonStackParamList`, and
  a NEW `MainTabParamList`. Nested navigators composed with
  `NavigatorScreenParams` (Onboarding's `Root` → RootStackParamList; Root's
  `LessonFlow` → LessonStackParamList and `MainTabs` → MainTabParamList). A
  `declare global { namespace ReactNavigation { interface RootParamList extends
  OnboardingStackParamList {} } }` block types `useNavigation()` without
  per-call generics. Route names/param shapes copied byte-identical. Every
  navigator typed: the 3 stacks already were; `MainTabNavigator` now uses
  `createBottomTabNavigator<MainTabParamList>()`.

### R3 — Remove navigation `as any` ✅ / ❗ (2 flags)
- **Enumerated first (grep), then classified** — the ~20 `as any` hits:
  - **Navigation (must-fix) — all removed:** 6× `navigate('LessonFlow' as any,
    { screen: … } as any)`, 5× `navigate('SprinklersLesson' as any)`, 1×
    `navigate('EmotionalSandbagsLesson' as any)`, 1× `navigate(target.name as
    any)` (LearnScreen), 1× `replace(lastScreen as any)` (SplashScreen), 1×
    `{ screen: startScreen as any }` (NamingOurEmotions).
  - **Ionicons `name={… as any}` — LEAVE (5):** SprinklersSec3Screen2,
    SandbagsSec1Screen2, SandbagsSec2Screen9/5/3. Icon-name typing, unrelated
    to navigation, per req 3.
  - **Non-navigation `: any` — LEFT (pre-existing, out of scope):**
    `catch (error: any)` ×2, `handleScroll (event: any)` ×2, the PostHog
    `as Record<string,unknown> as never` ×2 in analytics.
- **How the nav casts were removed:**
  - Lesson-launcher screens: narrowed `startScreen` from `string`/`any` to
    `keyof LessonStackParamList` (zero runtime change), and route the nested
    navigate through a new `lessonFlowParams(screen)` helper in `types.ts`.
    **Why the helper:** `NavigatorScreenParams` is a distributed union
    requiring `screen` to be a single literal, so `{ screen: <union var> }`
    won't type-check when the route is chosen from data — `lessonFlowParams`
    is the one bridge, and it returns **exactly `{ screen }`** at runtime
    (byte-identical).
  - Lesson sub-screens that navigate to a parent (Root) route: typed with
    `CompositeScreenProps<NativeStackScreenProps<Lesson…>,
    NativeStackScreenProps<Root…>>` — the correct RN pattern for a nested
    screen reaching a parent route.
  - `LearnScreen.navigate(target.name)`: cast dropped (`target.name` is already
    `keyof RootStackParamList`).
- **❗ TWO FLAGS (runtime discrepancies intentionally NOT "fixed", per req 4):**
  1. **`SprinklersSec5Screen6` → `navigate('Learn')`** — `Learn` is a MainTab
     route nested under Root's `MainTabs`, so the type-correct call is
     `navigate('MainTabs', { screen: 'Learn' })`. But this screen has ALWAYS
     called `navigate('Learn')`, relying on RN's runtime nested-route-name
     resolution. Changing the call would change runtime args (forbidden), so we
     kept `navigate('Learn')` with a localized `as never` and a flag comment.
  2. **`SplashScreen` → `replace(lastScreen …)`** — `lastScreen` is a persisted
     AsyncStorage string (`getLastScreen(): Promise<string | null>`), NOT
     type-guaranteed to be a real route. Narrowed to
     `as keyof OnboardingStackParamList` (not `any`) and KEPT the existing
     try/catch that falls back to `'Welcome'`. Honest runtime-string → route
     boundary.

### R5 — Screen props (was `navigation: any`) ✅
- **Done:** `LabelingEmotionsLessonScreen` (`startScreen: any` → `keyof
  LessonStackParamList`, callsites via `lessonFlowParams`) and
  `PremiumUnlockedScreen` (`navigation: any` → `NativeStackScreenProps<
  OnboardingStackParamList, 'PremiumUnlocked'>`).

### SPEC-08 — Verified in-repo ✅
- ✅ `npx tsc --noEmit` clean (0 errors).
- ✅ `grep -rn "as any" src/` — remaining hits are ONLY the classified
  non-navigation ones (5 Ionicons, the 1 documented `'Learn' as never` flag,
  and pre-existing catch/scroll/PostHog casts); listed above for the PR.
- ✅ No runtime diffs: every navigate/replace route-name string is
  byte-identical; `{ screen: X }` → `lessonFlowParams(X)` returns exactly
  `{ screen }` (reviewed the diff line-by-line).
- ✅ `npm test` green (52 tests) — the policy-kernel/route-coverage tests that
  import these ParamLists still pass through the shims.

### SPEC-08 — Out of scope / not delivered ⚠️
- **Simulator spot-check (acceptance criterion):** launch → gate → open 2
  lessons from LearnScreen → complete a section → all navigate correctly.
  Needs a device; owner to run. All navigation is type-checked and runtime
  route names are unchanged, so behavior should be identical.

---

## SPEC-09 — Lesson engine (data-driven lessons) — PHASE 1 ONLY

**Branch:** `feature/spec-09-lesson-engine-phase1` — **NOT merged.** SPEC-09 is
phased with hard owner checkpoints; this branch stops at **CHECKPOINT A** and
awaits sign-off before any lesson content is converted.

**Depends on SPEC-08** (merged — the generic route is typed via SPEC-08's
ParamLists). This is a multi-day migration (~343 hand-built screens → data);
Phase 1 is ~schema + templates only.

### Phase 1 — done (schema + templates) ✅
- **Empirical block survey** (`docs/spec-09/PHASE1_BLOCK_SURVEY.md`): surveyed
  Sprinklers (52 screens) + Emotional Sandbags (47) = 99 files, via a
  representative read + a programmatic scan. Produced the pattern → count →
  block-type table. Vocabulary: `heading`, `paragraph` (with inline emphasis),
  `eyebrow`, `callout` (quote/summary/preview variants), `cardList`, `pill`,
  `quiz` (maps to the existing `QuizQuestion` component); two screen kinds
  (`content`, `sectionComplete`). No images / no text-input in these lessons.
- **zod schema** (`src/lessons/schema.ts`): `Lesson → sections → screens →
  blocks`, TS via `z.infer`. Lesson carries its exact current `storageKey` so
  progress stays byte-compatible. `parseLesson()` for the Phase-4 content-
  validation CI test.
- **Block templates** (`src/lessons/components/BlockRenderer.tsx`): one renderer
  per block type, styles lifted from the real survey screens — reproduces the
  existing look, no redesign.
- **Generic route + controller** (`src/lessons/LessonController.tsx`): drives a
  data lesson (Next/Back/section-complete), writes the SAME AsyncStorage
  key/format. NOT yet wired into the navigator (that's Phase 2/3).
- **Verified:** ✅ tsc clean · 52 tests green · lint 0 errors · **only new files
  under `src/lessons/` + `docs/spec-09/`** — nothing existing modified, nothing
  deleted, no gate/paywall code touched.

### CHECKPOINT A — CLOSED (owner delegated the calls)
Owner reviewed and said "use your discretion." The 4 open questions were
resolved (recorded at the bottom of `docs/spec-09/PHASE1_BLOCK_SURVEY.md`):
keep eyebrow + label separate; unify callout with a `variant`; keep `pill` as
its own block; carry one-off colours as data (required for byte-identical
look). Schema already implemented all four — no change.

### Phase 2 — IN PROGRESS (Sprinklers pilot)
- **Extraction source checked:** `docs/archive/lessons_content.md` has
  Sprinklers prose but it's a flattened markdown dump (loses block structure,
  colours, quiz flags, section boundaries). NOT usable for a faithful port —
  transcribing from the actual `.tsx` screens instead (they also carry the
  exact styling for byte-identical rendering).
- **Engine extended** for the bespoke variants the pilot revealed (footer,
  heroEmoji, interactiveQuiz, callout insight/highlight, cardList
  chips/emoji/styles) — schema + renderer + controller, tsc clean.
- **Sprinklers content transcription** (52 screens → `content/sprinklers.ts`)
  is being produced by a subagent against the schema; will be reviewed for
  byte-fidelity + `parseLesson` validity before Checkpoint B. Typos logged to
  `docs/spec-09/CONTENT_ERRATA.md` (not fixed).
- **Not yet:** side-by-side simulator fidelity check (owner, device), wiring
  the generic route into the navigator, and deleting the old Sprinklers
  screens (all Phase 3/4, behind Checkpoint B).

### 🛑 CHECKPOINT B — next blocking gate (not yet reached)
Owner approves pilot fidelity (side-by-side on simulator) before mass
conversion of the remaining 12 lessons.

### Not started (behind the checkpoints)
- Phase 2 (Sprinklers pilot, side-by-side, → Checkpoint B), Phase 3 (12 lessons,
  one commit each, `createProgressStore` factory, `LessonNavigator` shrink),
  Phase 4 (delete replaced screens/navigator regs/progress utils + the SPEC-08
  deprecated re-export shims; `DECISION(owner)` on `lessonProgressService.ts`
  keep-vs-delete and on removing `useLessonGate`; content-validation Jest test).

---

## Open items for the owner (consolidated)

**Needs a device/simulator (SPEC-01):**
- Run the acceptance flows for R3 (escape hatch after ~3 retries + its three
  actions), R4 (5s watchdog → retry), R5 (dev `min_supported_ios_build = 39`
  → update modal, paywall suppressed; reset → normal).
- General smoke: unsub sign-in → paywall (not LearnScreen); subscribed → Root
  without paywall; sandbox-subscribed fresh install → Restore → Root in one
  pass (`subscription_restored`, no `paywall_dismissed`); normal cold launches
  unchanged, no added delay.
- Capture the screen recordings the spec asks be attached to the PR.

**Needs `supabase login` / auth (SPEC-02):**
- `backup-prod.sh` pointed at dev → two non-empty `.sql` files.
- `db-push-prod.sh` dry-run end-to-end against dev; confirm each abort path
  leaves the CLI re-linked to dev (`cat supabase/.temp/linked-project.json`).

**Needs dev deploy + `deno` (SPEC-03):**
- Set `SUPABASE_JWT_SECRET` on the DEV project (`supabase secrets set …`,
  value from Dashboard → Settings → API → JWT secret).
- Deploy `delete-account` to dev and run the four acceptance tests (valid →
  succeeds; tampered → 401; expired → 401; missing secret → 500, no delete).
- Paste the curl commands used into the PR description (draft commands are in
  the SPEC-03 section above).
- Optionally `deno check supabase/functions/delete-account/index.ts` on a
  machine with Deno to confirm the `jose` import resolves and types.

**Needs a device/simulator (SPEC-04):**
- Re-run the SPEC-01 manual flows after the R1 routing refactor (behavior
  should be identical) and record which flows you ran in the PR — the spec's
  acceptance gate for the refactor. The automated `npm test` suite already
  covers the same routing decisions and passes.

**CI (SPEC-05, now manual — see the amendment in the SPEC-05 section):**
- ✅ CI was confirmed green on SPEC-05/06/07 pushes (~1 min each). It is now
  **manual-only** (`workflow_dispatch`) — no action needed per-merge.
- **At release time:** trigger CI on `main` (Actions tab → CI → Run workflow,
  or `gh workflow run CI --ref main`) and confirm the 4 gating jobs are green.
  This is written into `docs/RELEASE_CHECKLIST.md` Phase 2.
- Branch-protection "required checks" no longer apply (nothing runs on push).
  Only revisit if you re-enable `push:` triggers.
- **Note:** the SPEC-08 CI run was cancelled by a GitHub runner-queue timeout
  (not a code failure; billing showed 151/2000 min used). SPEC-08 was verified
  locally (tsc clean, 52 tests green); re-run CI manually at the next release
  to get a fresh green on it.

**Needs a device + Sentry DevMenu (SPEC-06):**
- Sign-in run-through: PostHog shows `auth_succeeded` then `paywall_presented`;
  a Sentry DevMenu test error shows the user id attached + gate breadcrumbs in
  the timeline.
- Sign-out run-through: a subsequent DevMenu test error has NO user attached.

**Needs a simulator (SPEC-08):**
- Spot-check: launch → gate → open 2 lessons from LearnScreen → complete a
  section → all navigate correctly. Route names are unchanged so behavior
  should be identical; this just confirms the byte-identical claim on device.

**Needs a dev build / device (SPEC-07):**
- Run `npx expo run:ios` (or a dev-client build) after the dep removals to
  confirm the app still boots — the 4 removed deps have no config-plugin
  involvement, but the spec requires a real boot as proof.
- Foreground the app after 6h and confirm exactly one config re-fetch fires
  (screenshot the `__DEV__` log).
- Sign out → sign in with a DIFFERENT account on the same device → confirm the
  second user gets its own Superwall identity (Superwall debug logs).
- **Two deps were flagged and kept, not removed:** `expo-asset` (active
  `app.json` config plugin) and `expo-notifications` (documented intentional
  retention for BACKLOG #13). Confirm you're happy leaving both.

**Spec-text corrections to feed back to the author:**
- **SPEC-02:** references `supabase/.temp/project-ref`; the actual file is
  `supabase/.temp/linked-project.json` (JSON, `.ref` key). Update the
  requirement text and the acceptance criterion's `cat` command accordingly.
- **SPEC-03:** R2 says "existing 401 behavior," but the function's existing
  failure path returned **400**, not 401. Verification failures were
  implemented as **401** (per the acceptance criteria); confirm this was the
  intent. Missing-secret was implemented as **500** (fail closed) — allowed by
  the "500/401" wording.

**Push status:** SPEC-01→07 pushed to `origin/main` (CI green each push).
SPEC-08 merges on top; push after merge.
