// analytics.ts imports its posthog instance from ../config/posthog, so that's
// the boundary we stub — the module under test (analytics.ts) is NOT mocked.
// config/posthog.ts is where `new PostHog()` from posthog-react-native is
// constructed; stubbing it here keeps the real SDK out of the test and lets us
// read the exact identify()/capture() args.
//
// The mock's methods are created INSIDE the factory (jest hoists jest.mock
// above the imports; referencing outer consts as property *values* at factory
// time hits the TDZ). We retrieve them after import via the mocked module.
jest.mock('../../config/posthog', () => ({
  posthog: {
    identify: jest.fn(),
    capture: jest.fn(),
    register: jest.fn(),
    reset: jest.fn(),
    screen: jest.fn(),
  },
  resetPostHog: jest.fn(),
  isPostHogEnabled: false,
  posthogEnvironment: 'dev',
}));

import { identifyUserWithOnboarding, safeCapture } from '../analytics';
import { posthog } from '../../config/posthog';

const mockIdentify = posthog.identify as jest.Mock;
const mockCapture = posthog.capture as jest.Mock;

const fullOnboarding = {
  userType: 'parent',
  age: 34,
  childrenCount: 2,
  experienceLevel: 'some',
  improvementGoals: ['patience'],
  learningGoal: 'connection',
  partnerInvolvement: 'shared',
  notificationsEnabled: true,
  familiarParentingStyles: ['gentle'],
  emotionalChallenges: ['overwhelmed'],
};

describe('identifyUserWithOnboarding', () => {
  beforeEach(() => {
    mockIdentify.mockClear();
  });

  it('signup mode: attaches onboarding as $set but NEVER includes email', () => {
    identifyUserWithOnboarding('user-123', fullOnboarding, 'signup');

    expect(mockIdentify).toHaveBeenCalledTimes(1);
    const [userId, props] = mockIdentify.mock.calls[0];
    expect(userId).toBe('user-123');

    // The core privacy assertion: email must NOT appear anywhere in the $set
    // payload (Fable review 🟡 — no email to a US processor alongside
    // mental-health-adjacent answers).
    const set = props.$set;
    expect(set).toBeDefined();
    expect('email' in set).toBe(false);
    expect(JSON.stringify(props)).not.toContain('email');

    // Sanity: low-sensitivity durable facts DID make it into $set.
    expect(set.user_type).toBe('parent');
    expect(set.experience_level).toBe('some');

    // SPEC-06 R3: emotional_challenges (mental-health-adjacent) must NOT be a
    // person property. It lives on the onboarding step EVENT instead.
    expect('emotional_challenges' in set).toBe(false);
    expect(JSON.stringify(props)).not.toContain('emotional_challenges');
  });

  it('signin mode: links ID WITHOUT a $set payload (no property overwrite)', () => {
    identifyUserWithOnboarding('user-456', fullOnboarding, 'signin');

    expect(mockIdentify).toHaveBeenCalledTimes(1);
    const [userId, props] = mockIdentify.mock.calls[0];
    expect(userId).toBe('user-456');

    // signin must not send $set — the empty store would overwrite real person
    // properties with nulls (Fable review #8). Only $set_once allowed.
    expect(props.$set).toBeUndefined();
    expect(props.$set_once).toBeDefined();
    expect(JSON.stringify(props)).not.toContain('email');
  });

  it('signup vs signin produce different identify shapes', () => {
    identifyUserWithOnboarding('u', fullOnboarding, 'signup');
    const signupProps = mockIdentify.mock.calls[0][1];
    mockIdentify.mockClear();

    identifyUserWithOnboarding('u', fullOnboarding, 'signin');
    const signinProps = mockIdentify.mock.calls[0][1];

    expect(signupProps.$set).toBeDefined();
    expect(signinProps.$set).toBeUndefined();
  });
});

describe('safeCapture swallows a throwing posthog client', () => {
  it('does not rethrow when posthog.capture throws', () => {
    mockCapture.mockImplementationOnce(() => {
      throw new Error('posthog down');
    });
    // safeCapture must never propagate analytics failures into caller flows.
    expect(() => safeCapture('some_event', { a: 1 })).not.toThrow();
  });
});
