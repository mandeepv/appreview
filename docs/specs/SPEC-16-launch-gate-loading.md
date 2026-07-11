# SPEC-16 — Launch experience: kill the green flash, silence the gate, redesign the loading theater

Target version: v1.4.0 (first half; SPEC-17 is the second half — the two together are the 1.4.0
checkpoint) · Order: second spec in the train, after SPEC-15 · Size: ~2 days
Depends on: SPEC-15 merged to `develop` (this work stacks on top of it in the release train).

---

## 0. Goal

Three launch-path fixes:

- **(a)** A green full-bleed flash appears for a split second on cold launch before the styled
  splash. Kill it.
- **(b)** The "Designing your parenting journey" loading screen flashes briefly on almost every app
  open. It must appear **only once, during first-time onboarding**, as the "creating your lesson
  plan" moment right before the paywall — never on returning launches. (Owner-decided: KEEP the
  animation, scope it to onboarding.)
- **(c)** Redesign that loading/plan-creation screen so it looks professional rather than hacky.

## 1. Diagnosis — confirmed from code, not guessed

**(a) The green flash is the native-splash ↔ JS-splash mismatch.**
- `app.json` → `expo.splash`: `image: ./assets/splash.png` (2048×2048; cream `#FAF7F2` family
  background with the teal glyph), `resizeMode: "contain"`, `backgroundColor: "#4F8F8B"`
  (= `Colors.primary`, the sage teal/green). On a tall iPhone, `contain` letterboxes the square
  image: the OS shows a full-width square panel surrounded by solid `#4F8F8B` — the "green square to
  the edges" frame.
- `expo-splash-screen` is not a direct dependency and `App.tsx` never calls
  `preventAutoHideAsync()` / `hideAsync()`, so the native splash auto-hides at the first JS frame —
  an uncontrolled instant — and cuts to `src/screens/onboarding/SplashScreen.tsx`, which renders a
  *completely different* design (full-screen teal `LinearGradient` `[Colors.primary,
  Colors.primaryDark]`, 220px logo card, title fading in from opacity 0). The mismatch +
  uncontrolled handoff is the flash.

**(b) LoadingScreen does double duty, and its theater UI renders on every launch.**
- `src/screens/onboarding/LoadingScreen.tsx` is BOTH the subscription gate (runs on every launch of
  a signed-in user — Splash routes `user ? replace('Loading')`, and Auth sign-in routes there too)
  AND the post-onboarding "analyzing your family profile" theater.
- The mode switch is data, not UI: `progress` lazy-inits to `0` when an onboarding payload exists
  (post-onboarding → ~4.6s theater) and to `100` otherwise (cold launch → `runGate()` after a 200ms
  timer). But the render is the same in both modes: logo, "Designing your parenting journey",
  progress bar (instantly full), "Almost ready!". So every cold launch flashes the plan-creation
  screen for 200ms + gate-resolution time before `replace('Root')` — exactly the reported flash.
  Sign-ins by existing users get the same flash.

## 2. Ground rules (self-contained)

- Node 20 (`nvm use 20`). PR gate: `npx tsc --noEmit` clean · `npx eslint .` zero new warnings
  (baseline ~200) · `npm test` green · CI green · adversarial review clean before merge (this spec
  edits the gate file → money-path review depth).
- `main` is FROZEN (v1.2.0 RC). Branch `spec-16-launch-gate-loading` from `develop`; PR into
  `develop`.
- **INVARIANT #1 — load-bearing for this spec:** every path into `Root` goes through the Loading
  gate; `grep -rn "replace('Root')" src/` must hit only `LoadingScreen.tsx`. Therefore: do NOT split
  the gate into a new screen/file. The fix is two *visual modes* inside the same `LoadingScreen.tsx`;
  all gate logic (`runGate`, watchdog, retry, escape hatch, config-status deferral,
  `resolveGateOutcome` wiring) stays byte-equivalent in behavior.
- Analytics only via `safeCapture`; errors via `reportError`; no PII. Storage keys only via
  `storageKeys.ts`. Never touch `eas.json` values, `legal/`, dashboards, prod DB. Dev Supabase only.
- Narrative why-comments are house style — LoadingScreen is dense with them (SPEC-01/06/FIX-01/FIX-08
  history); update every comment your change makes stale, delete none whose code remains.
- Commits conventional, one concern each (suggested: `fix(splash): ...`, `fix(gate): ...`,
  `feat(loading): ...`).

## 3. Work items (in-code)

### R1 — Native ↔ JS splash unification (kills the green flash)

1. `npx expo install expo-splash-screen` (SDK-54-matched version).
2. In `App.tsx`, call `SplashScreen.preventAutoHideAsync()` at module scope (right after Sentry
   init, before the component tree), and hide it from the JS splash screen once its first frame is
   committed (`onLayout` on the root view of `SplashScreen.tsx` → `SplashScreen.hideAsync()`), so the
   handoff instant is controlled. Wrap both in try/catch — splash-screen API failures must never
   crash launch.
3. Make the two splashes visually identical at the handoff frame:
   - `app.json` splash `backgroundColor` → `#FAF7F2` (`Colors.background`, matching splash.png's own
     background) so the native frame is a seamless cream field with the centered glyph — no green
     anywhere.
   - Redesign `SplashScreen.tsx`'s initial frame to exactly match: cream `Colors.background`, the
     same glyph at the same optical size/position (drop the full-screen teal gradient; the entrance
     animation then plays *from* that identical frame — e.g. wordmark/subtitle fade in beneath a
     stationary glyph). No fade-from-zero of the whole screen: the glyph must be visible at opacity 1
     on frame one or the handoff will blink.
   - If matching the native `contain` glyph size exactly proves fiddly, the acceptable alternative is
     a dedicated smaller splash image asset sized so native and JS render identically. Either way the
     acceptance bar is: no visible discontinuity native→JS on device.
4. Respect the fixed dwell sensibly: replace the hardcoded `setTimeout(..., 2000)` in
   `SplashScreen.tsx` with "route as soon as auth hydration (`isLoading === false`) AND a minimum
   dwell of ~800ms have both passed" — launch gets faster without a jarring sub-frame splash.
5. Regenerate nothing by hand: `ios/` / `android/` are not committed; prebuild picks the config up on
   the EAS build.

### R2 — Two visual modes in LoadingScreen (silences the every-launch flash)

Inside `LoadingScreen.tsx`, derive `mode` once at mount from the existing predicate (post-SPEC-15 it
is `userType !== null || variantBAnswers non-empty` — reuse the same `hasOnboardingPayload`
expression, single source):

- **`mode === 'onboarding'`** (first-time flow, runs once): render the redesigned plan-creation
  theater (R3). Behavior as today: ~4–5s progress theater → `runGate()` → paywall. This is the only
  place the "creating your lesson plan" animation ever appears.
- **`mode === 'gate'`** (every returning launch + post-sign-in): render a **quiet continuation of the
  splash** — same cream background, same centered glyph, no title, no progress bar, no "Analyzing..."
  copy. For the first ~400ms render the glyph alone (a subscriber's gate resolves within that on the
  happy path, so a normal launch reads as "splash → app", nothing between); after 400ms fade in a
  subtle spinner + "Checking your subscription…" only if still waiting. The retry state and escape
  hatch (Restore / Sign out / Contact support + inline errors) keep their exact behavior and copy,
  restyled to the quiet layout.
- The `getMessage()` progress-copy function, breathing animation, and theater-only styles move under
  the onboarding mode; gate-mode must not mount the progress bar at all.
- **Do not touch:** the gate schedulers (mount timer / config-deferral / retry interval),
  `gateInFlightRef`, watchdog, `applyGateOutcome`, the onboarding-save effect, or any
  `replace('Root')` call site. Visual-only refactor of the render tree; the grep invariant and all
  existing gate tests stay green.

### R3 — Redesign the plan-creation theater (onboarding mode)

Professional, on-brand (theme tokens from `src/constants/theme.ts` — cream background, sage-teal
accents, existing type scale), keeping the beloved beats: personalized-feeling stage messages (reuse
the four existing lines), a smooth determinate progress indicator, the breathing glyph. Raise the
craft: eased (non-linear) progress rather than a fixed 1.25%/50ms tick, staged message transitions
(fade/slide, not hard swaps), consistent spacing rhythm. Use `react-native-reanimated` (already a
dependency) or core `Animated` — no new animation libraries. Respect Reduce Motion
(`AccessibilityInfo.isReduceMotionEnabled`): swap animations for simple opacity steps.

### R4 — Analytics (safeCapture)

- `plan_theater_shown` once when onboarding mode mounts (measures that the theater runs exactly once
  per user — a returning-launch regression shows up as repeat events per user).
- `gate_wait_exceeded` if gate mode is still unresolved at the 400ms reveal (gives a real number for
  "how often do users see any loading UI at all").
- Existing gate/paywall events unchanged.

### R5 — Tests

- Mode derivation: pure helper (extract `deriveLoadingMode(hasOnboardingPayload)` or test via store
  fixtures) — onboarding payload → theater; empty store → gate.
- Gate behavior regression: existing routingPolicy/LoadingScreen-adjacent suites untouched and green.
- Splash routing: dwell logic (auth-hydration + min-dwell) unit-testable if extracted; otherwise
  cover the destination logic already in place.
- Snapshot/render test: gate mode renders no ProgressBar and no theater copy.

## 4. Out-of-repo actions

Steps that cannot be done from this codebase — external systems only. Each gets a pending entry in
`docs/OPS_STATE.md` in this PR (even "no change required" is worth one line, so external state stays
tracked), ticked with a date when performed.

1. **PostHog:** no flags, no dashboard changes required for this spec to function. Optional at
   release: add `plan_theater_shown` / `gate_wait_exceeded` to the launch-health dashboard so the
   "theater exactly once per user" regression signal is actually watched.
2. **Supabase (dev + prod):** nothing — no migrations, no edge-function changes, no type
   regeneration.
3. **Sentry:** nothing required. After release, confirm no new error class from the
   `expo-splash-screen` calls (they're try/caught; a spike would mean the guard is being hit).
4. **Superwall:** nothing. The gate logic is untouched; do not modify the `subscription_gate`
   placement or audience.
5. **App Store Connect:** nothing spec-specific; the splash change ships inside the normal v1.4.0
   build (native splash regenerates via prebuild on EAS — no manual asset upload anywhere).

## 5. Device-test checklist — create `docs/releases/v1.4.0.md`

Create the frozen runbook instance in this PR (SPEC-14 convention: release-specific block + copied
standard checklist from `docs/RELEASE_CHECKLIST.md`; ticked with evidence at release time). SPEC-17
appends its items to the same file. This spec's block:

- [ ] Cold launch on a real device (not simulator): no green frame at any point; native splash → JS
      splash is imperceptible (record 240fps slo-mo as evidence).
- [ ] Cold launch as a confirmed subscriber: splash → app with no plan-creation screen, no progress
      bar, no visible intermediate screen on a normal-latency network.
- [ ] Fresh signup: the redesigned "creating your lesson plan" theater plays exactly once, full
      length, then the paywall presents (single `paywall_presented` in PostHog).
- [ ] Sign-out → sign-in as an existing user: quiet gate, no theater.
- [ ] Airplane-mode launch, unsubscribed: quiet gate reveals spinner after ~400ms → retry state →
      escape hatch appears after ~3 attempts; Restore/Sign out/Contact support all work.
- [ ] Reduce Motion enabled: theater and splash animate as simple fades, no scaling/motion.
- [ ] Standard paywall regression (sandbox Apple ID): purchase → Root; `grep -rn "replace('Root')"
      src/` spot-check noted in PR.

## 6. Version boundary

None here — the v1.4.0 bump + `rc/1.4.0` tag happen once, after the second half (SPEC-17) merges;
see SPEC-17 §6. Copy this spec into `docs/specs/SPEC-16-launch-gate-loading.md` in the PR.

## 7. Acceptance criteria

- [ ] `expo-splash-screen` installed; `preventAutoHideAsync` / `hideAsync` wired; `app.json` splash
      `backgroundColor = #FAF7F2`; JS splash first frame matches the native splash.
- [ ] Hardcoded 2s splash delay replaced by auth-hydration + ~800ms minimum dwell.
- [ ] `LoadingScreen.tsx` has exactly two visual modes; gate mode shows nothing but the
      splash-continuation glyph for the first ~400ms; theater renders only when an onboarding payload
      exists.
- [ ] Zero behavior change to gate logic: `grep -rn "replace('Root')" src/` hits only LoadingScreen;
      all existing gate/routing tests pass unmodified; retry + escape hatch intact.
- [ ] Theater redesigned with theme tokens, eased progress, staged messages, Reduce-Motion support;
      no new animation dependencies.
- [ ] New events `plan_theater_shown` / `gate_wait_exceeded` via `safeCapture`; stale comments
      updated.
- [ ] §4 entries added to `docs/OPS_STATE.md`; `docs/releases/v1.4.0.md` created with §5's block; spec
      copied to `docs/specs/`; `tsc`/lint(no new)/jest/CI green; adversarial review clean.

## 8. Decision points

1. **Final splash look** — this spec unifies on cream-background + glyph (matching the shipped native
   asset). If the teal-gradient brand moment should survive instead, the alternative is inverting the
   direction: regenerate `splash.png`/background as teal and match the JS side to *that*. Default =
   cream; confirm before the release build.
2. **Gate-mode reveal delay** — 400ms is the proposed no-UI grace before the spinner. Tune on device
   if it feels off (shorter shows more flicker for fast gates; longer feels dead on slow networks).
3. **Splash minimum dwell** — 800ms proposed (down from a fixed 2000ms). Confirm the brand moment is
   still long enough.
