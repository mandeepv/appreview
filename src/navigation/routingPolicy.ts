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
      // Superwall skipped presenting the paywall itself. SPEC-FIX-08 R2: the
      // skip reason matters — not every skip means "entitled."
      //   - Holdout / NoAudienceMatch → legitimate Superwall semantics (the
      //     user is entitled, or intentionally excluded by an experiment) →
      //     enter_root. These are the normal "already a subscriber" skips.
      //   - PlacementNotFound → the `subscription_gate` placement is
      //     broken/deleted/renamed in the dashboard. This is NOT "entitled" —
      //     it's a misconfiguration, and treating it as enter_root would grant
      //     EVERY unpaid user free access on a single dashboard slip. Fail SAFE
      //     to the gate: return 'retry' (not a dead-end — the escape hatch still
      //     appears after N attempts, so a user is never trapped even if the
      //     placement is genuinely gone). LoadingScreen fires a DISTINCT
      //     `paywall_placement_not_found` event so a real break is alertable.
      //   Load-bearing consequence (INVARIANTS #2 / PAYWALL_MODEL): a MISSING
      //   placement now means "locked to paywall." A future intentional paywall
      //   teardown MUST reconfigure the placement/audience — never DELETE it.
      if (result.reason === 'PlacementNotFound') {
        return 'retry';
      }
      return 'enter_root';

    case 'error':
      // Fail-open ONLY for confirmed subscribers; everyone else retries.
      return isSubscribed ? 'enter_root' : 'retry';
  }
}

// ---------------------------------------------------------------------------
// resolveResumeStack — rebuilding history when onboarding resumes
// ---------------------------------------------------------------------------

/**
 * The onboarding question flow in order, as the screens actually navigate it.
 * Welcome is the root; Auth is deliberately NOT here (it is the terminus and
 * has its own resume branch in SplashScreen).
 *
 * This is the single source of truth for the order. If you reorder screens or
 * insert one, change it HERE — `resolveResumeStack` and its tests read from
 * this array, so the back stack follows automatically.
 */
export const ONBOARDING_FLOW = [
  'Welcome',
  'UserType',
  'NameAge',
  'ChildrenCount',
  'ImprovementGoals',
  'Educational',
  'PartnerInvolvement',
  'ExperienceLevel',
  'EmotionalChallenges',
] as const;

export type OnboardingFlowScreen = (typeof ONBOARDING_FLOW)[number];

/**
 * Given the deepest screen a user reached, return the full stack to restore.
 *
 * THE BUG THIS FIXES (present since at least v1.2.0): SplashScreen resumed an
 * interrupted signup with `navigation.replace(lastScreen)`. `replace` swaps
 * the current entry rather than pushing, so the stack held exactly ONE screen
 * — the resumed one. Every screen renders a back affordance unconditionally,
 * so the user saw a back button with nothing behind it; tapping it produced
 * "The action 'GO_BACK' was not handled by any navigator" and did nothing.
 *
 * Returning the whole path lets SplashScreen use `navigation.reset`, so the
 * user lands on the same screen as before but can now walk back through the
 * answers they already gave — which is the point of resuming at all.
 *
 * `lastScreen` is an unvalidated string from AsyncStorage (a stale or renamed
 * key can be anything), so an unrecognised value returns null and the caller
 * falls back to Welcome — same defensive posture as the try/catch it replaces.
 */
export function resolveResumeStack(lastScreen: string | null): OnboardingFlowScreen[] | null {
  if (!lastScreen) return null;

  const index = ONBOARDING_FLOW.indexOf(lastScreen as OnboardingFlowScreen);
  if (index < 0) return null;

  // Everything up to and including the resumed screen. index 0 (Welcome) is
  // already the root, so this correctly yields just ['Welcome'].
  return ONBOARDING_FLOW.slice(0, index + 1) as unknown as OnboardingFlowScreen[];
}

// ---------------------------------------------------------------------------
// resolveSignedInLaunch — what does a signed-in user's cold launch mean?
// ---------------------------------------------------------------------------

export interface SignedInLaunchInput {
  /** Deepest onboarding screen persisted to disk, or null if none. */
  lastScreen: string | null;
  /** Whether the user ever reached Auth (i.e. finished the question flow). */
  hasReachedAuth: boolean;
}

/**
 * Where a signed-in user goes on launch.
 *
 *   - 'gate'   → straight to Loading. Either they finished onboarding, or
 *     there is no local evidence they ever started it.
 *   - 'resume' → they have a half-finished onboarding on disk. Rebuild the
 *     question stack and put them back in it.
 *
 * THE BUG THIS CLOSES: SplashScreen sent every signed-in user straight to
 * Loading without loading the persisted onboarding state. Loading reads a null
 * `userType` as "we've saved before, skip the upsert", so a user who signed in
 * and then quit PARTWAY through the questions (an iOS background kill is
 * enough) was silently reclassified as onboarded. They hit the hard paywall,
 * could subscribe, and landed in Root with no profile row ever written —
 * their half-given answers sitting unread in AsyncStorage forever. Because
 * Supabase OAuth mints an account on first sign-in, even a brand-new user who
 * mistapped "I already have an account" fell into this cohort.
 *
 * `hasReachedAuth` is what separates "finished the questions" from "quit
 * partway": it is set when the user actually arrives at Auth, so a user with a
 * lastScreen but no auth-reached flag has unfinished business. Resuming is
 * safe for an already-onboarded user too — the Supabase profile is the source
 * of truth and Loading skips the upsert when the store is empty.
 */
export function resolveSignedInLaunch(
  input: SignedInLaunchInput,
): { action: 'gate' } | { action: 'resume'; stack: OnboardingFlowScreen[] } {
  const { lastScreen, hasReachedAuth } = input;

  // Finished the question flow → the profile save already ran (or will be
  // retried by the launch-time re-save). Nothing to resume.
  if (hasReachedAuth) return { action: 'gate' };

  const stack = resolveResumeStack(lastScreen);
  // No recognisable progress on disk → nothing to resume; gate as before.
  if (!stack) return { action: 'gate' };

  return { action: 'resume', stack };
}
