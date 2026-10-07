// Test data (SPEC-20 R2). Plain values only — no store or SDK imports — so
// any test can use these without pulling in the app's import graph.
//
// The fixture email and name are deliberately distinctive: setup.ts's PII
// guard fails any test in which either reaches PostHog or Sentry
// (INVARIANTS #8). Use them for every user/onboarding fixture, so the guard
// has something real to catch.

import type { Session, User } from '@supabase/supabase-js';

export const FIXTURE_EMAIL = 'parent.fixture@example.com';
export const FIXTURE_NAME = 'Priyanka Fixturewala';

// A purchase-handoff key (SPEC-21): 43 base64url characters, the shape the
// website mints. It is a login credential, so the PII guard watches for it
// too (INVARIANTS #29) — use it for every handoff fixture.
export const FIXTURE_HANDOFF_KEY = 'FixtureHandoffKey_ThisIsALoginCredential-01';

/** A handoff link, in any of the forms the app accepts (src/lib/handoffLink.ts). */
export function handoffLink(
  key = FIXTURE_HANDOFF_KEY,
  form: 'universal' | 'main-domain' | 'scheme' = 'universal',
): string {
  if (form === 'universal') return `https://open.kinderwell.app/k/${key}`;
  if (form === 'main-domain') return `https://kinderwell.app/k/${key}`;
  return `kinderwell://k/${key}`;
}

export function makeUser(id = 'user-a', overrides: Partial<User> = {}): User {
  return {
    id,
    email: FIXTURE_EMAIL,
    app_metadata: {},
    user_metadata: { full_name: FIXTURE_NAME },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as User;
}

export function makeSession(user: User = makeUser()): Session {
  return {
    access_token: `access-${user.id}`,
    refresh_token: `refresh-${user.id}`,
    expires_in: 3600,
    expires_at: 1_900_000_000,
    token_type: 'bearer',
    user,
  } as Session;
}

/** A finished questionnaire, as the onboarding store holds it before Loading saves it. */
export function onboardingAnswers(overrides: Record<string, unknown> = {}) {
  return {
    userType: 'parent',
    name: FIXTURE_NAME,
    age: 34,
    childrenCount: 2,
    children: [{ age: 3 }, { age: 6 }],
    improvementGoals: ['patience'],
    notificationsEnabled: true,
    partnerInvolvement: 'shared',
    partnerInvited: false,
    learningGoal: 'connection',
    experienceLevel: 'some',
    familiarParentingStyles: ['gentle'],
    emotionalChallenges: ['overwhelmed'],
    authMethod: 'email',
    selectedPlan: null,
    ...overrides,
  };
}
