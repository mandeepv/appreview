# Kinderwell Paywall Model

**Adopted:** 2026-07-05
**Applies from:** v1.1.0

Kinderwell ships a **hard paywall**: after onboarding, the paywall is
mandatory and undismissable. Unsubscribed users cannot reach the
LearnScreen. The only ways past the paywall are (1) a successful
subscription purchase or (2) 7-tap demo mode for Apple reviewers.

This doc is the source of truth for the paywall model. Every code
comment and other doc that describes gating should refer back here.

---

## The flow

```
App launch
    ↓
Splash (always, ~2s)
    ↓
Is the user signed in?
    ├── NO  → Onboarding (Welcome → Get Started → onboarding screens → Auth)
    │         After sign-in on the auth screen → LoadingScreen (below)
    │
    └── YES → LoadingScreen (the gate)
              ↓
              Check isSubscribed (device-local, persisted) OR isDemoUser
              ├── TRUE  → Root (LearnScreen)
              │
              └── FALSE → Fire `subscription_gate` placement
                          ↓
                          Superwall's Gated check:
                          ├── User has active entitlement       → onSkip fires → Root
                          ├── User doesn't have active entitlement → paywall UI shows
                          │     ↓
                          │     ├── Purchase completes           → onDismiss(purchased) → Root
                          │     ├── User dismisses somehow      → onDismiss(other) → runGate() again
                          │     └── Superwall SDK error        → isSubscribed? Root : retry every 3s
```

The flow is the same on every launch. There is no "seen the paywall
before, don't show it again" state.

---

## Load-bearing invariants

1. **Signed-in users always route through LoadingScreen.** SplashScreen
   never routes signed-in users directly to Root. If a fresh signed-in
   user landed on Root without passing the gate, the model breaks.

2. **isSubscribed persists to AsyncStorage.** Zustand is in-memory only
   by default; without persistence, every cold launch would show the
   paywall to paying users while waiting for Superwall's async
   onSubscriptionStatusChange event to fire. That's a bad UX and would
   cause paying-user tickets. See `authStore.ts` `setIsSubscribed` and
   `initialize`.

3. **isSubscribed is USER-BOUND, not merely "cleared on sign-out"
   (SPEC-FIX-08).** The persisted flag is `{ userId, subscribed }`
   (`src/store/entitlementCache.ts`), honored on hydrate ONLY when a
   session exists for the SAME user id (`session.user.id === record.userId`).
   ANY launch with no session, or a session for a different user, treats
   the flag as false — structurally, on every launch, without depending
   on a sign-out event firing. The old model ("both signOut() and
   onAuthStateChange session-null must clear the flag") was an event race:
   if neither fired, a stale `true` leaked to a different-or-absent user
   (the never-paid-user bug — three verified instances: delete-account,
   session expiry, account switch). Sign-out paths still clear the flag as
   belt-and-suspenders, but the user-binding is what makes the safety
   structural. (Lapsed-user grace window = SPEC-FIX-09, future.)

4. **Superwall's `subscription_gate` placement is Gated with an
   unsubscribed-users audience.** Defense in depth: our code-side
   `isSubscribed` check + Superwall's own StoreKit-backed entitlement
   check both need to say "not entitled" for the paywall to actually
   show. If our cache is wrong, Superwall catches it. If Superwall is
   unreachable, our cache handles the fail-open for confirmed
   subscribers.

5. **The paywall template has no dismiss control.** No X, no swipe-to-
   dismiss, no "Not now" link. Presentation Style: Fullscreen (not
   Modal). If a dismiss slips through (older cached template, edge
   case), our `onDismiss` handler calls `runGate()` again after 300ms
   to re-present. The user cannot escape without purchasing or being
   demo-mode.

6. **Demo mode short-circuits every paywall check.** 7 taps on the
   "Save your progress" title in AuthScreen → `setDemoUser()` →
   `isDemoUser = true` and `isSubscribed = true` for this session.
   Apple reviewers must be able to complete their review without a
   purchase. See `docs/DEMO_MODE.md`.

---

## Fail-open policy (network outages)

Two failure modes look identical to the app: Superwall service outage,
and user is offline. Both cause `registerPlacement` to throw or the
`onError` callback to fire.

Policy:

- **Confirmed subscribers** (`isSubscribed === true` in device-local
  cache) → fail-open to Root. Do NOT kick a paying user offline just
  because we can't reach Superwall right now. Their `isSubscribed` was
  set to true by a prior authoritative Superwall event; we trust it
  until Superwall says otherwise.

- **Everyone else** → fail-closed. Sit on the LoadingScreen with the
  "Checking your subscription — please make sure you're online..."
  message. Auto-retry `registerPlacement` every 3 seconds. The user
  is stuck on this screen until Superwall responds. This is deliberate
  — we cannot verify subscription state, so we cannot grant access.

Trade-off: a user whose subscription lapsed AFTER Superwall's outage
began AND before we could receive the INACTIVE event would get one
session of continued access. Rare, and preferable to breaking every
paying user's experience during an incident.

---

## Placements in the Superwall dashboard

**As of v1.1.0:** two placements needed in the dashboard.

| Placement | Feature Gating | Used by | Retire when |
|---|---|---|---|
| `subscription_gate` | **Gated** | v1.1.0 code (`LoadingScreen`) | never (as long as we ship a paywall) |
| `show_paywall` | Non-Gated | v1.0.0 code (already shipped to real users) | v1.0.0 usage < ~1% for 30d |

**Not needed anymore — safe to delete:**

- `learn_access` — added during v1.1.0 development (commit `86d205f`)
  but never shipped to real users. The v1.0.0 App Store binary only
  calls `show_paywall`; verified via `git grep 'learn_access'
  appstore-live-v1.0.0` returning empty. v1.1.0's `useLessonGate` hook
  was simplified to a no-op as part of the hard-paywall model, so
  v1.1.0 code doesn't reference it either. Zero shipped clients depend
  on it. Delete from the Superwall dashboard whenever convenient.

**Why we didn't reuse `show_paywall`:** it's Non-Gated (paywall shows
to everyone). Changing its Feature Gating to Gated would break shipped
v1.0.0 clients that rely on the existing behavior. Creating a new
placement (`subscription_gate`) lets v1.1.0 have Gated behavior
without touching what v1.0.0 sees.

**When to retire `show_paywall`:** monitor App Store Connect →
Analytics → app version breakdown. Once v1.0.0 installations drop to
a negligible share (say <1% for 30 days), safe to delete.

**The kill switch CANNOT force v1.0.0 users off `show_paywall`.** A
tempting shortcut would be to bump `min_supported_ios_build` in
`app_config` to force v1.0.0 users to upgrade. That does NOT work: the
kill switch is implemented in `src/lib/appConfig.ts`, which **did not
exist in the v1.0.0 binary** (verify: `git show
appstore-live-v1.0.0:src/lib/appConfig.ts` returns nothing). A v1.0.0
client never fetches `app_config` and never shows the force-update
modal, so bumping the minimum is invisible to it. Implication:
`show_paywall` must stay configured in the Superwall dashboard until the
v1.0.0 cohort naturally drops off (App Store analytics) — you cannot
force them out early. This is load-bearing invariant #4 (defense in
depth): removing `show_paywall` while real v1.0.0 clients still call it
would break their paywall.

### ⚠️ `onSkip` cannot tell "entitled" from "dashboard misconfig"

When Superwall's Gated check decides NOT to present the paywall, our
code sees a single `onSkip` callback and lets the user through to Root.
But `onSkip` fires for **several different reasons**, and the SDK's skip
reason (`SuperwallExpoModule` `PaywallSkippedReason`) can be any of:

- `Holdout` — user is in an experiment holdout group.
- `NoAudienceMatch` — user didn't match the placement's audience rules.
- `PlacementNotFound` — the `subscription_gate` placement doesn't exist
  in the dashboard (or was renamed / deleted).

`Holdout` and `NoAudienceMatch` are legitimate (the user is entitled or
intentionally experiment-excluded) → enter Root. **`PlacementNotFound` is
handled differently since SPEC-FIX-08 R2:** it almost always means the
`subscription_gate` placement is broken/deleted/renamed — NOT "entitled" — so
`resolveGateOutcome` now returns **`retry` (fail SAFE to the gate), never
`enter_root`**. LoadingScreen fires a distinct `paywall_placement_not_found`
event (+ Sentry) so a real dashboard break is immediately visible instead of
hiding inside the generic skip counter.

> ⚠️ **Load-bearing consequence: NEVER DELETE the `subscription_gate`
> placement.** Post-SPEC-FIX-08, a MISSING placement means "locked to the
> paywall" (retry), not "open." That's the safe direction for a revenue gate.
> But it means any FUTURE intentional paywall teardown (offering free content,
> sunsetting the paywall) MUST reconfigure the placement/audience — deleting
> the placement would lock users OUT, not let them in.

Historically (pre-SPEC-FIX-08) all three skip reasons returned `enter_root`,
so a fat-fingered dashboard edit (renaming the placement, breaking the audience
rule, flipping Gated → Non-Gated) would silently turn the paywall off for
everyone. `NoAudienceMatch` on a broken audience rule can still do this — the
`paywall_skipped_by_superwall` count remains the tripwire for that case.

**The only tripwire is the `paywall_skipped_by_superwall` event** (fired in
`LoadingScreen.onSkip` with the skip reason). Its count — and especially a
sudden spike, or a spike in `PlacementNotFound` / `NoAudienceMatch`
reasons — is how we detect a dashboard misconfig. There is no code-side
guard that can catch this, because the code can't distinguish the cases.

**Rule: after ANY edit to the `subscription_gate` placement in the
Superwall dashboard, watch the `paywall_skipped_by_superwall` event
count** (and its `skip_reason` breakdown) in PostHog. A jump means the
gate is leaking. See `docs/RELEASE_CHECKLIST.md` Phase 7.5 (Superwall
dashboard verification).

---

## What each code component does

### `LoadingScreen.tsx`
The gate. Runs on every path to Root. Two responsibilities:

1. Save onboarding data to Supabase (guarded — only runs if
   `onboardingStore.userType !== null`, i.e., there's a pending
   payload from just-completed onboarding).
2. Present the `subscription_gate` paywall, or short-circuit for
   entitled users.

### `SplashScreen.tsx`
Routes based on auth state:
- Signed in → `Loading` (the gate)
- Not signed in but has reached auth screen before → `Auth`
- Mid-onboarding → resume at last screen
- Brand new → `Welcome`

### `App.tsx` (`useSuperwallEvents.onSubscriptionStatusChange`)
The authoritative source of `isSubscribed`. Superwall's event handler.
When Superwall reports:
- `ACTIVE` → `setIsSubscribed(true)` → persists to AsyncStorage
- `INACTIVE` → `setIsSubscribed(false)` → persists to AsyncStorage
- `UNKNOWN` → leave as-is (Superwall will send a definitive update
  once it resolves)

### `authStore.ts`
- `isSubscribed` field with `setIsSubscribed`, which persists a
  USER-BOUND record `{ userId, subscribed }` to AsyncStorage
  (SPEC-FIX-08). If there's no current user it does NOTHING (doesn't
  write an unowned value, doesn't clear the existing owned record —
  the startup-race fix; hydrate is the guard).
- `initialize` hydrates from AsyncStorage on cold launch but honors the
  cached flag ONLY when a session exists for the SAME user id
  (`resolveCachedEntitlement` in `src/store/entitlementCache.ts`).
  No session / different user / legacy-unowned / malformed → false +
  clear stale. This is what makes "a stale `true` can never grant a
  different-or-absent user free access" structural. Critical for
  skipping the paywall for paying users during Superwall's async
  warm-up, without leaking a prior user's entitlement.
- `signOut` and `onAuthStateChange` (session→null) still clear the
  persisted flag as belt-and-suspenders, but the user-binding above is
  the actual guarantee — not these events firing.

### `useLessonGate.ts`
Now a no-op. Kept as an API-compatible pass-through so the ~16 lesson
callsites don't need touching, and so we have a seam if we ever want
to reintroduce per-lesson gating in the future.

---

## What is NOT gated

Under this model, EVERYTHING between Splash and Root is the gate. Once
past the gate:
- All lessons are accessible (no per-tap check)
- Settings is accessible
- Onboarding restart (if implemented) is accessible

Nothing inside Root is paywalled independently. If we ever add
freemium features (say, one free chapter, or a monthly free lesson),
those would need their own gate — but as of v1.1.0, there is no free
tier past the entry paywall.

---

## Apple review considerations

**Apple Guideline 3.1.2 concern:** hard paywalls with no dismiss are
sometimes rejected under "the app is nothing but a paywall." Many
subscription apps ship this pattern successfully (Calm, Headspace,
most fitness apps).

Our defense:
1. **Substantial onboarding** — 12+ screens of meaningful parenting
   context collection. The app is clearly more than a paywall shell.
2. **Restore Purchases visible** on the paywall (required by 3.1.1,
   we ensure this in Phase 7.5 of the release checklist).
3. **7-tap demo mode** — the reviewer must be able to complete their
   review. See `docs/DEMO_MODE.md`.
4. **Dual-path App Review notes** — App Review Information → Notes
   explicitly instructs the reviewer to use sandbox purchase (primary
   path) OR the 7-tap gesture (fallback). Written into the submission
   form.

**Rejection risk:** real but manageable. If rejected, the hotfix is to
add a "Continue with limited access" link that reveals a stripped-down
LearnScreen with 1-2 free lessons. That's a bigger UX change than
we want to make preemptively — better to ship the clean pattern and
have the fallback ready.

---

## Related docs

- `docs/DEMO_MODE.md` — 7-tap Apple reviewer bypass
- `docs/RELEASE_CHECKLIST.md` Phase 7.5 — Superwall dashboard
  verification for every release
- `docs/IPHONE_TEST_PLAN_V1.1.0.md` Section 3 — smoke test for the
  paywall model
- `docs/BACKLOG.md` #20 — Paywall UX polish (post-launch A/B testing,
  headline iteration, etc.)
- `docs/archive/FABLE_RE_REVIEW_2026-07-05.md` — the review that flagged the
  original two-placement confusion. This model was designed after
  the review to eliminate the confusion entirely.
