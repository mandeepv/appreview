import {
  resolvePostAuthDestination,
  resolveGateOutcome,
  type OnboardingStatus,
  type AuthMode,
  type GateResult,
} from '../routingPolicy';

// Full truth tables for the two routing-kernel functions. These are the
// regression tests for the app's two documented routing bugs (v1.0.0 paywall
// bypass, v1.1.0 sign-in bypass). Concrete-value assertions, no snapshots.

describe('resolvePostAuthDestination — every onboardingStatus × mode', () => {
  const modes: AuthMode[] = ['signin', 'signup'];
  const statuses: OnboardingStatus[] = ['has_onboarding', 'no_onboarding', 'error'];

  // Exhaustive expected table: [status][mode] -> expected destination.
  const expected: Record<OnboardingStatus, Record<AuthMode, unknown>> = {
    has_onboarding: {
      // *** v1.1.0 sign-in-bypass regression test ***
      // A returning user with a completed profile MUST route to Loading (the
      // gate), NEVER to Root. Before SPEC-01 R1, AuthScreen sent these users
      // straight to Root, so a returning-but-unsubscribed account reached the
      // LearnScreen without passing the paywall. If either of these two
      // assertions ever flips back to { route: 'Root' } / anything but
      // 'Loading', the bypass has regressed.
      signin: { route: 'Loading' },
      signup: { route: 'Loading' },
    },
    no_onboarding: {
      // Signin-mode with no profile → start onboarding.
      signin: { route: 'UserType' },
      // Signup-mode → Loading (persists the fresh answers + gates).
      signup: { route: 'Loading' },
    },
    error: {
      // Never guess on error — recover (sign out + retry), regardless of mode.
      signin: { recoverFromError: true },
      signup: { recoverFromError: true },
    },
  };

  for (const status of statuses) {
    for (const mode of modes) {
      it(`${status} + ${mode} → ${JSON.stringify(expected[status][mode])}`, () => {
        expect(resolvePostAuthDestination({ onboardingStatus: status, mode })).toEqual(
          expected[status][mode],
        );
      });
    }
  }

  it('has_onboarding never routes to Root (the exact bypass class)', () => {
    for (const mode of modes) {
      const dest = resolvePostAuthDestination({ onboardingStatus: 'has_onboarding', mode });
      expect(dest).not.toEqual({ route: 'Root' });
      expect(dest).toEqual({ route: 'Loading' });
    }
  });
});

describe('resolveGateOutcome — every gate outcome × isSubscribed', () => {
  const dismissTypes: (GateResult & { kind: 'dismiss' })[] = [
    { kind: 'dismiss', type: 'purchased' },
    { kind: 'dismiss', type: 'restored' },
    { kind: 'dismiss', type: 'declined' },
  ];
  const skipReasons: (GateResult & { kind: 'skip' })[] = [
    { kind: 'skip', reason: 'Holdout' },
    { kind: 'skip', reason: 'NoAudienceMatch' },
    { kind: 'skip', reason: 'PlacementNotFound' },
  ];
  const errorResult: GateResult = { kind: 'error' };

  describe('dismiss outcomes', () => {
    for (const isSubscribed of [true, false]) {
      it(`purchased → enter_root (isSubscribed=${isSubscribed})`, () => {
        expect(resolveGateOutcome({ kind: 'dismiss', type: 'purchased' }, isSubscribed)).toBe('enter_root');
      });
      it(`restored → enter_root (isSubscribed=${isSubscribed})`, () => {
        // SPEC-01 R2: 'restored' is an entitlement, must NOT re-present.
        expect(resolveGateOutcome({ kind: 'dismiss', type: 'restored' }, isSubscribed)).toBe('enter_root');
      });
      it(`declined → re_present (isSubscribed=${isSubscribed})`, () => {
        expect(resolveGateOutcome({ kind: 'dismiss', type: 'declined' }, isSubscribed)).toBe('re_present');
      });
    }
  });

  describe('skip outcomes → always enter_root', () => {
    for (const skip of skipReasons) {
      for (const isSubscribed of [true, false]) {
        it(`skip ${skip.reason} → enter_root (isSubscribed=${isSubscribed})`, () => {
          expect(resolveGateOutcome(skip, isSubscribed)).toBe('enter_root');
        });
      }
    }
  });

  describe('error outcome → fail open only for confirmed subscribers', () => {
    it('error + isSubscribed=true → enter_root (fail open)', () => {
      expect(resolveGateOutcome(errorResult, true)).toBe('enter_root');
    });
    it('error + isSubscribed=false → retry', () => {
      expect(resolveGateOutcome(errorResult, false)).toBe('retry');
    });
  });

  it('exhaustive: no outcome/isSubscribed combination throws or returns undefined', () => {
    const allResults: GateResult[] = [...dismissTypes, ...skipReasons, errorResult];
    for (const result of allResults) {
      for (const isSubscribed of [true, false]) {
        const outcome = resolveGateOutcome(result, isSubscribed);
        expect(['enter_root', 're_present', 'retry']).toContain(outcome);
      }
    }
  });
});
