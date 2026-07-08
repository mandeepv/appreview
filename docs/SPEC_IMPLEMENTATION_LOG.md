# Spec Implementation Log

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

**Spec-text corrections to feed back to the author:**
- SPEC-02 references `supabase/.temp/project-ref`; the actual file is
  `supabase/.temp/linked-project.json` (JSON, `.ref` key). Update the
  requirement text and the acceptance criterion's `cat` command accordingly.

**Not yet pushed:** `main` is ahead of `origin/main` by 4 commits (both specs
+ their merges). Nothing has been pushed to any remote; awaiting owner's go.
