# Demo Mode (7-tap) — Apple Review Compatibility

**Purpose:** Give App Store reviewers access to premium content without requiring a real purchase. **This is Apple-mandated behavior** — apps with paywalls must provide reviewers a way to see the paid features, otherwise they're rejected under Guideline 2.1 (Performance) and 3.1.1 (In-App Purchase).

**⚠️ Do not remove or modify this without extreme care.** Breaking demo mode = App Store rejection. This doc exists so future changes to auth or subscription enforcement don't accidentally kill it.

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

## Why 7 taps and hidden

Apple requires reviewer access to paid content but explicitly says the mechanism should NOT be discoverable to normal users. A visible "Demo Mode" button would be a UX crime and Apple would reject it. Hidden tap-count gestures are a well-known industry pattern; it's what reviewers expect.

Number 7 is arbitrary — could be 5 or 10. Do NOT change it without updating App Store Connect demo instructions.

## Where it's referenced

- **`src/store/authStore.ts:36-53`** — `setDemoUser()` function. Sets `isDemoUser: true` and `isSubscribed: true`. Also seeds the synthetic user.
- **`src/screens/onboarding/AuthScreen.tsx:117-149`** — 7-tap gesture handler on the title text.
- **`src/screens/onboarding/LoadingScreen.tsx`** — checks `isDemoUser` before triggering Superwall paywall (skips paywall for demo users).
- **`src/screens/onboarding/AuthScreen.tsx:14` (title press)** — `onPress={handleTitlePress}` attached to the "Save your progress" `<Text>`.

## What Apple Review Instructions should say

In App Store Connect → App Store tab → App Review Information → Notes, include (or verify already includes):

> **Reviewer access to premium content:**
> On the "Save your progress" screen shown at the end of onboarding, tap the title text 7 times consecutively (within a few seconds of each other). An "Activate Demo Mode" prompt will appear. Confirm to gain full access to all premium features without any purchase.

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
