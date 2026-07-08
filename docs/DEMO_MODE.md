# Demo Mode (7-tap) — Apple Review Access

**Purpose:** Give App Store reviewers access to premium content without requiring a real purchase. Apple requires reviewers be able to test paid features (Guideline 2.1) — but they do NOT mandate any specific mechanism. The 7-tap gesture is our chosen implementation, not Apple's requirement.

**Correction (Fable review #13, 2026-07-04):** an earlier version of this doc claimed 7-tap was "Apple-mandated." That was wrong. Apple asks for demo credentials in App Review Information; they do NOT ask for a hidden unlock gesture. In fact, hidden functionality that ships to end users is a textbook Guideline 2.3.1 concealment risk. We keep the 7-tap for v1.1.0 because prior submissions have accepted it and it's the least disruptive path for reviewers, but the primary Apple-review testing path documented in App Review Information should be **sandbox purchase**, not the 7-tap. The 7-tap is a fallback.

Why we keep it for now despite the 2.3.1 risk:
- Kinderwell only supports Sign in with Apple and Continue with Google — no email/password login field where a reviewer could enter credentials. So "provide a demo account" isn't a clean fit.
- Prior submissions have shipped with 7-tap and been approved.
- Removing it in v1.1.0 while also making 14+ other changes concentrates risk. Better to remove/replace it in a dedicated later release once we have PostHog data on demo-mode usage.

**⚠️ Do not remove without a plan.** This doc + AuthScreen's setDemoUser flow are the mechanism the reviewer's testing has assumed for prior submissions. Removing without updating App Review Information first WILL cause rejection under 2.1 (unable to test paid features).

---

## What it is

On the `AuthScreen` (last screen of onboarding — the "Save your progress" screen), the user taps the **title text "Save your progress"** 7 times in a row (within ~3 seconds between taps).

After the 7th tap:
1. Alert shows: "Demo Mode Activated — You now have full access to all premium features for review purposes."
2. On dismiss, `setDemoUser()` fires (see `src/store/authStore.ts:36`)
3. Auth state gets:
   - A synthetic user with id `demo-reviewer-user`, email `demo@kinderwell.app`
   - `session: null` (no real Supabase session — never touches DB)
   - `isSubscribed: true`
   - `isDemoUser: true`
4. Navigation goes to `Loading` screen, which skips the paywall (see `LoadingScreen` flow that checks `isDemoUser`)
5. User lands in the full app with all paid content unlocked

## Why 7 taps

The number is arbitrary. Could be 5 or 10. The concealment (hidden vs visible button) was our design choice — Apple does NOT require the mechanism be hidden. Some subscription apps use visible dev-only buttons in `__DEV__` builds and none in prod; some skip demo mode entirely and rely on Apple reviewers doing sandbox purchases (which is what Apple actually documents).

**Do NOT change the number 7 without updating App Store Connect App Review Information notes.** The whole point of the gesture is that the reviewer knows exactly what to do; changing the count breaks their instructions.

## The Guideline 2.3.1 concern

Apple's Guideline 2.3.1 forbids apps from including "hidden or dormant features" that a normal user could discover and use. The 7-tap gesture is arguably an example — a normal user browsing the app who accidentally taps the title 7 times gets free premium. Fable review #13 flagged this as a rejection risk we've been carrying since day 1.

Mitigations:
1. **PostHog monitoring** (v1.1.0): the app fires a dedicated `demo_mode_activated` event on every 7-tap activation (`AuthScreen.tsx:218` — `posthog.capture('demo_mode_activated')`). The event has no properties; count it directly in PostHog to measure activation volume. **Filter by `$app_version = 1.1.0` and `environment = prod` to exclude dev/beta noise.**

   Note: `authMethod: 'demo'` is a related but different signal — it's a *user property* / auth-store field that tags the session type after activation, and it shows up attached to downstream events like `user_signed_in`. It is NOT what you filter on to count activations. If you're looking at the wrong signal you'll under-report by an order of magnitude. Earlier drafts of this doc referenced `authMethod: 'demo'` here; that was wrong and was corrected 2026-07-05 by the Fable re-review.

   **Threshold: ~20 activations/week in prod.** Expected volume is ~1-5/week (Apple reviewers only). If it spikes above ~20/week, the gesture has been discovered by end users and should be removed in the next release before Apple notices in review. Recurring check now lives in `RELEASE_CHECKLIST.md` → "Between releases — recurring hygiene" so the monitoring actually happens.
2. **Primary review path** should point at sandbox purchase, not 7-tap. See `docs/RELEASE_CHECKLIST.md` Phase 9 → App Review Information notes.
3. **7-tap as fallback** for reviewers who can't or don't want to sandbox-purchase. Still available, still works, but no longer the recommended path.

**Long-term (v1.1.1 or later):** remove the 7-tap entirely once we've verified via PostHog that sandbox-purchase testing works for Apple reviewers, OR the moment `demo_mode_activated` volume crosses the threshold above, OR Apple raises 2.3.1 in a submission — whichever comes first. Reassess this decision monthly using the recurring check.

## Where it's referenced

- **`src/store/authStore.ts:36-53`** — `setDemoUser()` function. Sets `isDemoUser: true` and `isSubscribed: true`. Also seeds the synthetic user.
- **`src/screens/onboarding/AuthScreen.tsx:117-149`** — 7-tap gesture handler on the title text.
- **`src/screens/onboarding/LoadingScreen.tsx`** — checks `isDemoUser` before triggering Superwall paywall (skips paywall for demo users).
- **`src/screens/onboarding/AuthScreen.tsx:14` (title press)** — `onPress={handleTitlePress}` attached to the "Save your progress" `<Text>`.

## What Apple Review Instructions should say

In App Store Connect → App Store tab → App Review Information → Notes, include (or verify already includes) BOTH options, with sandbox purchase as the primary path:

> **Reviewer access to premium content:**
>
> **Primary (recommended):** Sign in with Apple, complete onboarding, and at the paywall tap either subscription option. As this is a sandbox review environment, no real payment will be charged. You will gain full access to all premium features.
>
> **Fallback (if you cannot complete the sandbox purchase):** On the "Save your progress" screen shown at the end of onboarding, tap the title text 7 times consecutively (within a few seconds of each other). An "Activate Demo Mode" prompt will appear. Confirm to gain full access to all premium features without any purchase.
>
> Both paths land you at the LearnScreen with all 13 lesson modules unlocked.

Why both: Apple's Guideline 2.1 requires reviewers can test paid features. Sandbox purchase is Apple's documented testing path for auto-renewing subscription apps. The 7-tap is a Kinderwell-specific fallback for reviewers who prefer not to do the sandbox purchase.

---

## Invariants — things that must remain true

When making ANY changes to auth, subscription checking, or navigation, verify all of the following still hold:

### 1. `isDemoUser: true` MUST bypass every subscription check

Anywhere the app checks "is this user a paying subscriber," the check must also allow `isDemoUser` through.

Current gate points to keep an eye on:
- `src/screens/onboarding/LoadingScreen.tsx` — must skip paywall trigger when `isDemoUser` is true
- **Any new gate we add** (LearnScreen, individual lesson screens, Settings screen paid-only sections) — MUST accept `isDemoUser` as an equivalent to `isSubscribed`

**Verbal rule:** every conditional that reads `isSubscribed` should also read `isDemoUser`. Both should unlock content.

The safe pattern:
```ts
const isSubscribed = useAuthStore(s => s.isSubscribed);
const isDemoUser = useAuthStore(s => s.isDemoUser);
const canAccessPaidContent = isSubscribed || isDemoUser;
```

Or a store selector:
```ts
// in authStore.ts
canAccessPaidContent: () => get().isSubscribed || get().isDemoUser,
```

### 2. Superwall listener must NOT overwrite `isDemoUser`

When we add app-level Superwall status listeners (e.g., `onSubscriptionStatusChange`), the callback must NOT set `isSubscribed: false` for demo users.

Superwall will report `INACTIVE` for the demo user because there's no real purchase attached. If we naively `setIsSubscribed(false)` on INACTIVE, we'd unlock the app for a demo user then relock it 100ms later when Superwall reports.

The safe pattern in the Superwall listener:
```ts
onSubscriptionStatusChange: (status) => {
  // Never override demo users — they've been granted access explicitly
  if (useAuthStore.getState().isDemoUser) return;

  if (status.status === 'ACTIVE') setIsSubscribed(true);
  else if (status.status === 'INACTIVE') setIsSubscribed(false);
}
```

### 3. Cold-start subscription check MUST short-circuit for demo users

The `App.tsx` or `Splash` cold-start "check subscription status" logic must return early / skip the Superwall roundtrip if `isDemoUser` is already true.

### 4. Sign-out MUST clear demo mode

`signOut()` currently sets `isDemoUser: false` (see `authStore.ts:58`). If we ever refactor sign-out, make sure this stays.

### 5. Session restoration on relaunch MUST NOT wipe demo mode

If a demo user closes and reopens the app, they should still be in demo mode. However — the demo user has `session: null`, so `initialize()` in `authStore.ts` will find no Supabase session and skip the restore path. That's fine as long as we don't add "if no session, force logout" logic.

**Alternative view:** the demo user's persistence across sessions isn't strictly required for Apple review. Reviewer typically activates demo once and completes the review in one session. Losing demo on relaunch is acceptable IF the reviewer can re-activate easily. Current behavior: demo mode DOES get lost on relaunch (since it's memory-only). This is fine.

### 6. Delete Account MUST NOT touch demo users

Demo user has synthetic id `demo-reviewer-user`. If they hit "Delete Account" (unlikely but possible), the Edge Function would attempt to delete a non-existent auth user. Should be a graceful no-op / not surface an error to the user.

Check `src/screens/SettingsScreen.tsx` and `supabase/functions/delete-account/index.ts` if we ever refactor account deletion.

---

## Testing demo mode

Whenever changes touch auth or subscription enforcement, manually verify:

1. Go through onboarding to reach AuthScreen (or nav directly via DevMenu)
2. Tap the title "Save your progress" 7 times fast (< 3 sec between)
3. Verify alert appears
4. Tap "Continue"
5. Verify you land in the app (LoadingScreen → Root)
6. Verify all lessons are accessible
7. Verify no paywall appears
8. Restart the app → confirm you're logged out (this is expected for demo)
9. Repeat activation to confirm it still works

If ANY step fails, demo mode is broken. Do not merge. Do not ship.

---

## Related risks

- **Do not** log `isDemoUser` state to PostHog with the demo user's synthetic ID. That would pollute analytics with fake usage. Current code identifies demo users to PostHog — worth reviewing whether to gate that.
- **Do not** show demo-mode UI clues in the paywall or elsewhere. Reviewer's demo mode should look identical to a paying user's experience.
- **`SHOW_DEMO_BUTTON` env var was removed in v1.1.0.** It was declared in `.env` / `eas.json` but never read by any code. Deletion introduces zero behavior change. Flagged by Fable Review (P0 #2).

---

## History

- **v1.0.0 build 8** shipped with the current 7-tap implementation. Apple approved.
- **v1.1.0 (upcoming)** preserves it, verified as an invariant during the subscription-enforcement rewrite (Fable Review P0 #1).
