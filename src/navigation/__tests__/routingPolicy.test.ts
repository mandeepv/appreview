import {
  resolvePostAuthDestination,
  resolveGateOutcome,
  resolveResumeStack,
  ONBOARDING_FLOW,
  type OnboardingStatus,
  type AuthMode,
  type GateResult,
  resolveSignedInLaunch,
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

  // SPEC-FIX-08 R2: skip reason now matters. Holdout / NoAudienceMatch are
  // legitimate "entitled / excluded" skips → enter_root. PlacementNotFound is a
  // dashboard misconfig (broken/deleted placement) → 'retry' (fail SAFE to the
  // gate), NOT enter_root — otherwise a single dashboard slip grants every
  // unpaid user free access.
  describe('skip outcomes (SPEC-FIX-08 R2)', () => {
    for (const isSubscribed of [true, false]) {
      it(`skip Holdout → enter_root (isSubscribed=${isSubscribed})`, () => {
        expect(resolveGateOutcome({ kind: 'skip', reason: 'Holdout' }, isSubscribed)).toBe('enter_root');
      });
      it(`skip NoAudienceMatch → enter_root (isSubscribed=${isSubscribed})`, () => {
        expect(resolveGateOutcome({ kind: 'skip', reason: 'NoAudienceMatch' }, isSubscribed)).toBe('enter_root');
      });
      it(`skip PlacementNotFound → retry, NEVER enter_root (isSubscribed=${isSubscribed})`, () => {
        expect(resolveGateOutcome({ kind: 'skip', reason: 'PlacementNotFound' }, isSubscribed)).toBe('retry');
      });
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

// ---------------------------------------------------------------------------
// resolveResumeStack — the back-button-on-resume regression
// ---------------------------------------------------------------------------
//
// SplashScreen used to resume an interrupted signup with replace(lastScreen),
// leaving a one-entry stack: the resumed screen rendered a back button with
// nothing behind it, so tapping it logged "GO_BACK was not handled by any
// navigator" and did nothing. These lock in that a resume restores the whole
// path, so back works from wherever the user comes back.
describe('resolveResumeStack — restores the full path, not just the screen', () => {
  it('returns every screen up to and including the resumed one', () => {
    expect(resolveResumeStack('ChildrenCount')).toEqual([
      'Welcome',
      'UserType',
      'NameAge',
      'ChildrenCount',
    ]);
  });

  it('gives every non-root screen something to go back to', () => {
    // The actual regression: any resumable screen past Welcome must leave at
    // least one entry beneath it, or the back button is dead again.
    for (const screen of ONBOARDING_FLOW.slice(1)) {
      const stack = resolveResumeStack(screen);
      expect(stack).not.toBeNull();
      expect(stack!.length).toBeGreaterThan(1);
      expect(stack![stack!.length - 1]).toBe(screen);
    }
  });

  it('resumes Welcome as a lone root — it is the bottom of the flow', () => {
    expect(resolveResumeStack('Welcome')).toEqual(['Welcome']);
  });

  it('preserves flow order in the restored stack', () => {
    const stack = resolveResumeStack('EmotionalChallenges');
    expect(stack).toEqual([...ONBOARDING_FLOW]);
  });

  // lastScreen is an unvalidated AsyncStorage string: a key written by an older
  // build, or a screen since renamed or deleted, can be anything. Returning
  // null is what lets SplashScreen fall back to Welcome instead of throwing.
  it.each([
    ['a screen that no longer exists', 'ChildrenGender'],
    ['a screen outside the question flow', 'Auth'],
    ['a route that was never onboarding', 'Root'],
    ['junk', 'not-a-screen'],
    ['empty string', ''],
  ])('returns null for %s', (_label, value) => {
    expect(resolveResumeStack(value)).toBeNull();
  });

  it('returns null when nothing was persisted', () => {
    expect(resolveResumeStack(null)).toBeNull();
  });
});


// ---------------------------------------------------------------------------
// resolveSignedInLaunch — the signed-in-but-unfinished cohort
// ---------------------------------------------------------------------------
describe('resolveSignedInLaunch', () => {
  // THE BUG: a signed-in user who quit partway through the questions was
  // gated as though onboarded. Loading read the empty store as "already
  // saved", skipped the upsert, and let them subscribe with no profile row.
  it('resumes a signed-in user who quit partway through the questions', () => {
    const launch = resolveSignedInLaunch({
      lastScreen: 'ImprovementGoals',
      hasReachedAuth: false,
    });
    expect(launch.action).toBe('resume');
    expect(launch).toHaveProperty('stack');
    if (launch.action === 'resume') {
      // Lands on the screen they left, with the earlier answers behind it.
      expect(launch.stack[launch.stack.length - 1]).toBe('ImprovementGoals');
      expect(launch.stack[0]).toBe('Welcome');
    }
  });

  // hasReachedAuth is what separates "finished the questions" from "quit
  // partway" — a user who reached Auth has nothing left to answer.
  it('gates a user who finished the questions, even with a lastScreen on disk', () => {
    expect(
      resolveSignedInLaunch({ lastScreen: 'EmotionalChallenges', hasReachedAuth: true }),
    ).toEqual({ action: 'gate' });
  });

  it('gates a returning user with nothing persisted', () => {
    expect(
      resolveSignedInLaunch({ lastScreen: null, hasReachedAuth: false }),
    ).toEqual({ action: 'gate' });
  });

  // Same unvalidated-string boundary resolveResumeStack guards: an
  // unrecognisable key must gate (the old behaviour), never crash or resume
  // onto a screen that doesn't exist.
  it.each([
    ['a screen that no longer exists', 'ChildrenGender'],
    ['a route outside the question flow', 'Auth'],
    ['junk', 'not-a-screen'],
    ['empty string', ''],
  ])('gates on %s', (_label, value) => {
    expect(
      resolveSignedInLaunch({ lastScreen: value, hasReachedAuth: false }),
    ).toEqual({ action: 'gate' });
  });

  it('resumes from the very first question', () => {
    const launch = resolveSignedInLaunch({ lastScreen: 'Welcome', hasReachedAuth: false });
    expect(launch).toEqual({ action: 'resume', stack: ['Welcome'] });
  });
});
