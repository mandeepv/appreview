# SPEC-FIX-08 — Never-paid-user access: bind the entitlement cache to the user (+ onSkip backstop)

> ORIGIN: transcribed from owner-provided spec images 2026-07-11. Gates the v1.2.0 build.

**Context:** an exhaustive 5-lens adversarial review (2026-07-11) confirmed the
owner-found delete-account stale-flag bug is ONE instance of a class: the
persisted `isSubscribed` flag (`STORAGE_KEYS.IS_SUBSCRIBED`) is **device-global,
not user-bound** (hydrate reads a bare `'true'` with no owner — `authStore.ts:147`).
The existing `onAuthStateChange` session-null listener (`authStore.ts:216`)
already clears it on most paths, so today's defense is real but **fragile — it
depends on an event firing and winning a race against the gate read**. Three
verified instances let a NEVER-PAID user reach content. This spec makes the
defense **structural**. **SPEC-FIX-07 is RETIRED — this replaces it.**

**Scope boundary:** this spec fixes only the *never-paid-user* class
(user-binding) + the dashboard-slip backstop — both low regression risk. The
*lapsed-subscriber* grace-window work (which touches the deliberately-instant
"don't paywall payers" cold-launch skip, a revenue optimization not an
unpaid-access bug) is deliberately SPLIT OUT into **SPEC-FIX-09**, done AFTER
v1.2.0. Do NOT change the confirmed-subscriber instant-skip behavior here beyond
the user-binding check.

## R1 — Bind the cached flag to the user; clear it whenever there's no matching session

- Store the flag **keyed to the user id**. Change the persisted value from bare
  `'true'`/`'false'` to a small record `{ userId, subscribed }` (written via the
  existing `setIsSubscribed` + a small helper; keep all reads/writes inside
  authStore). On hydrate/init (`authStore.ts:146-151`) and the `getSession()`
  branches:
  - session present AND its `user.id === stored userId` → honor the cached `subscribed`.
  - no session, OR session `user.id !== stored userId` → clear the flag, `isSubscribed:false`.
- This single rule kills all three instances structurally, without relying on any event firing:
  - **Delete-account** (old FIX-07): next init has no session (or a different user) → flag cleared.
  - **Session expiry** (`authStore.ts:187` else-branch): null session at init → cleared, regardless of whether `onAuthStateChange` fires.
  - **Account switch / sign-out throw** (`authStore.ts:95`): user B's id ≠ cached owner → flag ignored even if A's sign-out never ran or threw.
- **LEGACY-FORMAT MIGRATION** (must-handle, or you paywall-flash every current subscriber once): existing installs have a bare `'true'` on disk with NO userId. Treat a legacy bare value as "unowned" → do NOT honor it as a terminal grant; let Superwall re-confirm on that first post-update launch (the confirmed-subscriber path re-sets it in the new format within seconds). One-time single paywall-check for current subscribers on first launch after the update — acceptable and expected; call it out in the PR.
- Keep hydration's existing malformed/absent → `false` safety (verified good).

## R2 — onSkip backstop: PlacementNotFound fails safe to the gate

- **Risk:** `onSkip` (`LoadingScreen.tsx:243` → `resolveGateOutcome` `routingPolicy.ts:116`)
  returns `enter_root` for ALL three skip reasons. `PlacementNotFound` almost
  always means the `subscription_gate` dashboard placement is broken/deleted/renamed
  — not "entitled" — so one dashboard slip silently grants every unpaid user free access.
- **Fix:** in `resolveGateOutcome`, skip reason `PlacementNotFound` → return
  `retry` (never `enter_root`). `Holdout` and `NoAudienceMatch` still → `enter_root`
  (legitimate Superwall semantics). Retry (not dead-end) so the escape hatch still
  appears after 3 attempts — a user is never trapped even if the placement is genuinely gone.
- **Loud telemetry:** on `PlacementNotFound`, fire a DISTINCT
  `safeCapture('paywall_placement_not_found', …)` — separate from the generic
  `paywall_skipped_by_superwall` counter — so a real dashboard break is immediately
  visible. Add it to the Appendix-C release-health dashboard as alert-worthy.
- **Load-bearing constraint** (document in INVARIANTS #2 + PAYWALL_MODEL): a MISSING
  placement now means "locked to paywall." Any FUTURE intentional paywall teardown
  (free content, sunsetting the paywall) MUST reconfigure the placement/audience —
  never delete the placement. Deleting it locks users out, not open.
- Flip the `routingPolicy.test.ts` assertion `skip PlacementNotFound → enter_root`
  to `→ retry`; keep `Holdout`/`NoAudienceMatch` → `enter_root`.

## R3 — Regression tests (the class, at the kernel/store boundary)

Table-test, mock at module boundary, no rendering:
- delete → no session on next init → flag cleared (asserts cleared/false, mockRemoveItem or new-format absence).
- session expiry: `getSession()` → null with a stale owned `true` on disk → flag cleared at init.
- account switch: cached owner=A, session user=B → `isSubscribed` false for B.
- sign-out where `supabaseSignOut()` throws → flag invalidated at next hydrate by owner-mismatch.
- legacy bare `'true'` (no userId) → not honored as terminal grant.
- R2: `PlacementNotFound` → retry; `Holdout`/`NoAudienceMatch` → enter_root.

## R4 — Fix the invariant (INVARIANTS.md #3)

Replace "sign-out and session-null must clear it" with: *"The cached entitlement
flag is bound to a user id and is valid only while a session for that same user
exists; ANY launch with no session, or a session for a different user, treats the
flag as false. No account event may leave a `true` flag readable by a different or
absent user."* (The lapsed-user "terminal authority / grace window" clause is added
by SPEC-FIX-09.)

## Demo gesture — NO CHANGE (owner decision 2026-07-11)

7-tap demo gesture stays shipping in prod, ungated, as the Apple-review bypass —
owner accepts the risk (non-persistent, telemetry-monitored). Do NOT gate/remove it.
Stays in OPS_STATE Accepted-risks.

## Verification note for the intern (avoid chasing a ghost)

The owner's on-device repro (subscribe→delete→fresh unpaid signup→content) may be
PARTLY a sandbox artifact: a sandbox Apple ID stays subscribed at the StoreKit
level, so Superwall can legitimately re-report ACTIVE for the new app-account and
re-set the flag — which flag-clearing alone won't suppress. Before/after the fix,
CONFIRM the mechanism: is the grant coming from (a) the stale disk flag [this spec
fixes it] or (b) live Superwall ACTIVE from a still-entitled sandbox Apple ID
[expected; not a disk-flag bug — note it, don't force a "fix"]. State which in the PR.

## Constraints

- No gate-graph changes; `replace('Root')` stays LoadingScreen-only. Storage via
  `storageKeys.ts` only (#10). Do NOT alter the confirmed-subscriber instant-skip
  timing (that's FIX-09's territory) — only add the user-ownership check. Don't
  regress SPEC-FIX-01 double-fire/watchdog.

## Acceptance criteria

- [ ] The three instances proven fixed by R3 tests (delete, expiry, switch) + throw case + legacy-format case.
- [ ] R2: `PlacementNotFound` → retry with the distinct event; `Holdout`/`NoAudienceMatch` still enter_root; flipped test green.
- [ ] Confirmed subscriber still enters without a paywall flash on a normal launch (only the one-time legacy-migration check is allowed).
- [ ] tsc clean · full suite green · lint ≤ baseline · `replace('Root')` grep LoadingScreen-only.
- [ ] INVARIANTS #3 rewritten (R4) + PAYWALL_MODEL "never delete the placement" note (R2).
- [ ] Owner re-runs on device (mechanism confirmed per the verification note): subscribe→delete→fresh unpaid signup→relaunch = PAYWALL; second account on same device after a paid one = PAYWALL.
- [ ] PR states this supersedes FIX-07, lists invariants touched (#2, #3, #10), and calls out the one-time legacy paywall-check.
