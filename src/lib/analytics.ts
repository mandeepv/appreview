import { posthog } from '../config/posthog';

// PostHog SDK types accept any JSON-serializable value. Using a broad type
// keeps the helpers ergonomic — the SDK also tolerates undefined at runtime.
type CaptureProps = Record<string, unknown>;

/**
 * Safe wrapper around posthog.capture that never throws.
 * Use this from ANY code path that touches money, auth, or the paywall —
 * we never want analytics to break a real user flow.
 */
export function safeCapture(event: string, props?: CaptureProps): void {
  try {
    // SDK types are strict about JsonType. Cast at the boundary; PostHog's
    // runtime happily accepts extra shapes and just JSON-serializes them.
    posthog.capture(event, props as Record<string, never>);
  } catch (err) {
    if (__DEV__) console.warn(`[analytics] safeCapture failed for ${event}:`, err);
  }
}

function captureWithProps(event: string, props: CaptureProps): void {
  posthog.capture(event, props as Record<string, never>);
}

export const trackOnboardingStepCompleted = (step: string, answer: unknown) => {
  safeCapture('onboarding_step_completed', { step, answer });
};

export const trackOnboardingStarted = (source: 'first_open' | 'resumed' | 'restarted', lastScreen?: string) => {
  captureWithProps('onboarding_started', { source, last_screen: lastScreen ?? null });
};

export const trackOnboardingRestarted = (previousLastScreen: string) => {
  captureWithProps('onboarding_restarted', { previous_last_screen: previousLastScreen });
};

export const trackWelcomeCtaTapped = (cta: 'get_started' | 'sign_in') => {
  captureWithProps('welcome_cta_tapped', { cta });
};

export const trackAuthAttempted = (method: 'google' | 'apple', context: 'new_user' | 'returning_user') => {
  captureWithProps('auth_attempted', { auth_method: method, context });
};

export const trackAuthAbandoned = (method: 'google' | 'apple', context: 'new_user' | 'returning_user', reason?: string) => {
  captureWithProps('auth_abandoned', { auth_method: method, context, reason: reason ?? null });
};

export const trackPaywallOptionSelected = (planId: string, source: string) => {
  captureWithProps('paywall_option_selected', { plan_id: planId, source });
};

/**
 * Identify the current PostHog session with a stable user ID.
 *
 * Two callers with very different needs:
 *
 * - signup mode: user just finished onboarding. Their Zustand onboarding
 *   store is populated. We attach that data as `$set` person properties
 *   so future dashboards can filter/group by e.g. experience_level.
 *
 * - signin mode: user tapped "already have an account" on Welcome. Their
 *   Zustand onboarding store is EMPTY (they never filled it — their real
 *   answers live in Supabase from a prior session). Sending `$set` here
 *   with the empty store would overwrite the real PostHog person properties
 *   with nulls (Fable review #8). So we skip `$set` entirely and only
 *   perform the ID link. Person properties from their prior signup remain
 *   authoritative.
 */
export const identifyUserWithOnboarding = (
  userId: string,
  onboarding: {
    userType: string | null;
    age: number | null;
    childrenCount: number | null;
    experienceLevel: string | null;
    improvementGoals: string[];
    learningGoal: string | null;
    partnerInvolvement: string | null;
    notificationsEnabled: boolean;
    familiarParentingStyles: string[];
    emotionalChallenges: string[];
  },
  mode: 'signup' | 'signin' = 'signup',
) => {
  if (mode === 'signin') {
    // Link session to user ID without touching person properties.
    // set_once still safe — 'first_sign_in_date' only writes if unset.
    posthog.identify(userId, {
      $set_once: {
        first_sign_in_date: new Date().toISOString(),
      },
    } as Record<string, unknown> as never);
    return;
  }

  // signup mode — safe to attach onboarding answers as person properties.
  //
  // email deliberately NOT included (Fable review 🟡). Reviewer's concern:
  // PostHog is a US-based processor; linking email to emotional-challenge
  // answers (anxious/overwhelmed/burned-out) puts identifiable
  // mental-health-adjacent data at a third party. Kinderwell's user ID
  // already links to the Supabase auth user, which carries the email — so
  // we lose nothing analytically by dropping email from PostHog's copy.
  posthog.identify(userId, {
    $set: {
      user_type: onboarding.userType,
      age: onboarding.age,
      children_count: onboarding.childrenCount,
      experience_level: onboarding.experienceLevel,
      improvement_goals: onboarding.improvementGoals,
      learning_goal: onboarding.learningGoal,
      partner_involvement: onboarding.partnerInvolvement,
      notifications_enabled: onboarding.notificationsEnabled,
      familiar_parenting_styles: onboarding.familiarParentingStyles,
      emotional_challenges: onboarding.emotionalChallenges,
    },
    $set_once: {
      first_sign_in_date: new Date().toISOString(),
    },
  } as Record<string, unknown> as never);
};
