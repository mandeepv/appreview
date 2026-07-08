// The routing "policy kernel": the pure decision functions behind the app's
// two highest-stakes navigation choices — where a just-signed-in user goes,
// and what a Superwall gate outcome means. Every documented historical
// routing bug (the v1.0.0 paywall bypass, the v1.1.0 sign-in bypass) lived in
// this logic while it was inline in screen callbacks and therefore untestable.
//
// SPEC-04 R1 extracts them here WITHOUT behavior change so they can be unit
// tested exhaustively. Screens now do `compute -> act`: they call these to get
// a decision, then perform the side effects (navigation.replace, clearState,
// alerts, signOut). No routing conditionals remain in the screens.
//
// These functions are pure: no imports, no navigation, no I/O. Given the same
// input they always return the same decision.

import type { OnboardingCheckResult } from '../services/onboardingService';

// ---------------------------------------------------------------------------
// resolvePostAuthDestination — where does a just-signed-in user go?
// ---------------------------------------------------------------------------

/** The auth flow the user entered from. See AuthScreen. */
export type AuthMode = 'signin' | 'signup';

/** The onboarding-check outcome, narrowed to its status discriminant. */
export type OnboardingStatus = OnboardingCheckResult['status']; // 'has_onboarding' | 'no_onboarding' | 'error'

export interface PostAuthInput {
  onboardingStatus: OnboardingStatus;
  mode: AuthMode;
}

/**
 * The destination for a just-signed-in user, plus whether the screen must run
 * the "couldn't verify your account" recovery (sign out + alert) on error.
 *
 *   - route 'Loading'  → the subscription gate. INVARIANT: every path to Root
 *     goes through Loading (SPEC-01 R1). AuthScreen must never route to Root.
 *   - route 'UserType' → start onboarding fresh.
 *   - recoverFromError → the check failed; do NOT guess. The screen signs the
 *     user out and shows a retry alert (SPEC-01 / Fable review #2). No route
 *     is provided in this case.
 */
export type PostAuthDestination =
  | { route: 'Loading' }
  | { route: 'UserType' }
  | { recoverFromError: true };

export function resolvePostAuthDestination(input: PostAuthInput): PostAuthDestination {
  const { onboardingStatus, mode } = input;

  // Error MUST be handled distinctly — never collapsed into 'no_onboarding'.
  // A transient network blip during the check must not re-run onboarding over
  // the user's real data (the bug class Fable review #2 closed).
  if (onboardingStatus === 'error') {
    return { recoverFromError: true };
  }

  // Returning user with a completed profile → the gate (NOT Root). This is the
  // v1.1.0 sign-in-bypass fix: AuthScreen used to send these users straight to
  // Root, skipping the paywall. All entries to Root go through Loading.
  if (onboardingStatus === 'has_onboarding') {
    return { route: 'Loading' };
  }

  // no_onboarding: brand-new answers live in the store for signup users →
  // Loading persists them + gates. A signin-mode user with no profile clicked
  // "already have an account" by mistake (or signed up on another device) →
  // run onboarding.
  return mode === 'signup' ? { route: 'Loading' } : { route: 'UserType' };
}

// ---------------------------------------------------------------------------
// resolveGateOutcome — what does a Superwall gate result mean?
// ---------------------------------------------------------------------------

// The shapes below mirror the expo-superwall callback payloads that
// LoadingScreen already receives — kept as narrow structural types so this
// module has no dependency on the SDK. `type` values match
// SuperwallExpoModule.types.d.ts (PaywallResult / PaywallSkippedReason).

/** A paywall dismiss result (from usePlacement onDismiss). */
export type GateDismissResult = { kind: 'dismiss'; type: 'purchased' | 'restored' | 'declined' };

/** A paywall skip result (from usePlacement onSkip). Superwall bypassed the UI. */
export type GateSkipResult = { kind: 'skip'; reason: 'Holdout' | 'NoAudienceMatch' | 'PlacementNotFound' };

/** A paywall/SDK error (from usePlacement onError, or a thrown registerPlacement). */
export type GateErrorResult = { kind: 'error' };

export type GateResult = GateDismissResult | GateSkipResult | GateErrorResult;

/**
 * What the LoadingScreen should do next given a gate result and the cached
 * entitlement flag.
 *
 *   - 'enter_root'  → the user is entitled (bought, restored, skipped by
 *     Superwall because already entitled, or a confirmed subscriber failing
 *     open on error). Go to Root.
 *   - 're_present'  → the user dismissed without entitlement. Hard-paywall
 *     model: re-present rather than let them past.
 *   - 'retry'       → we couldn't verify (Superwall error) and the user is not
 *     a confirmed subscriber. Sit and retry.
 */
export type GateOutcome = 'enter_root' | 're_present' | 'retry';

export function resolveGateOutcome(result: GateResult, isSubscribed: boolean): GateOutcome {
  switch (result.kind) {
    case 'dismiss':
      // Purchased or restored are both entitlements → Root. Declined is a
      // dismiss without entitlement → re-present (hard gate).
      if (result.type === 'purchased' || result.type === 'restored') {
        return 'enter_root';
      }
      return 're_present';

    case 'skip':
      // Superwall skipped presenting the paywall itself — e.g. the user is
      // already entitled and its own check caught it before showing UI. Every
      // skip reason means "don't show the paywall," so let them through.
      return 'enter_root';

    case 'error':
      // Fail-open ONLY for confirmed subscribers; everyone else retries.
      return isSubscribed ? 'enter_root' : 'retry';
  }
}
