// Mock the supabase client at the module boundary (src/lib/supabase). We do
// NOT mock onboardingService (the module under test). The mock is a chainable
// query builder whose terminal `.single()` / `.upsert()` results are set per
// test via the handles below.

const mockSingleResult = { value: { data: null as unknown, error: null as unknown } };
const mockUpsertResult = { value: { data: null as unknown, error: null as unknown } };
const mockUpsertSpy = jest.fn();

jest.mock('../../lib/supabase', () => {
  const builder: Record<string, jest.Mock> = {
    select: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    single: jest.fn(() => Promise.resolve(mockSingleResult.value)),
    upsert: jest.fn((payload: unknown, opts: unknown) => {
      mockUpsertSpy(payload, opts);
      return Promise.resolve(mockUpsertResult.value);
    }),
  };
  return {
    supabase: {
      from: jest.fn(() => builder),
    },
  };
});

import { hasUserCompletedOnboarding, saveUserOnboardingData } from '../onboardingService';

describe('hasUserCompletedOnboarding', () => {
  beforeEach(() => {
    mockSingleResult.value = { data: null, error: null };
  });

  it('row present WITH user_type → has_onboarding', async () => {
    mockSingleResult.value = { data: { id: 'u1', user_type: 'parent' }, error: null };
    const result = await hasUserCompletedOnboarding('u1');
    expect(result).toEqual({ status: 'has_onboarding' });
  });

  it('row present WITHOUT user_type → no_onboarding', async () => {
    mockSingleResult.value = { data: { id: 'u1', user_type: null }, error: null };
    const result = await hasUserCompletedOnboarding('u1');
    expect(result).toEqual({ status: 'no_onboarding' });
  });

  it('no row (PGRST116) → no_onboarding', async () => {
    // getUserOnboardingData maps the "no rows" code to null → no_onboarding.
    mockSingleResult.value = { data: null, error: { code: 'PGRST116', message: 'no rows' } };
    const result = await hasUserCompletedOnboarding('u1');
    expect(result).toEqual({ status: 'no_onboarding' });
  });

  it('thrown/real fetch error → error status, NEVER no_onboarding', async () => {
    // A transient failure must be distinguishable from "no onboarding" — the
    // exact bug class (Fable review #2). A non-PGRST116 error propagates and
    // is caught as { status: 'error' }.
    mockSingleResult.value = { data: null, error: { code: '500', message: 'network down' } };
    const result = await hasUserCompletedOnboarding('u1');
    expect(result.status).toBe('error');
    expect(result.status).not.toBe('no_onboarding');
    if (result.status === 'error') {
      expect(result.error).toBeInstanceOf(Error);
    }
  });
});

describe('saveUserOnboardingData — name filter', () => {
  beforeEach(() => {
    mockUpsertSpy.mockClear();
    mockUpsertResult.value = { data: {}, error: null };
  });

  const baseOnboarding = { userType: 'mother' as const };

  const getUpsertedPayload = () => mockUpsertSpy.mock.calls[0][0] as Record<string, unknown>;

  it("excludes the literal 'Parent' fallback from the payload", async () => {
    await saveUserOnboardingData('u1', { ...baseOnboarding, name: 'Parent' });
    expect('name' in getUpsertedPayload()).toBe(false);
  });

  it("excludes an empty string name", async () => {
    await saveUserOnboardingData('u1', { ...baseOnboarding, name: '' });
    expect('name' in getUpsertedPayload()).toBe(false);
  });

  it('excludes a whitespace-only name', async () => {
    await saveUserOnboardingData('u1', { ...baseOnboarding, name: '   ' });
    expect('name' in getUpsertedPayload()).toBe(false);
  });

  it('includes a real, user-provided name', async () => {
    await saveUserOnboardingData('u1', { ...baseOnboarding, name: 'Alex' });
    const payload = getUpsertedPayload();
    expect(payload.name).toBe('Alex');
  });

  it('trims a real name before saving', async () => {
    await saveUserOnboardingData('u1', { ...baseOnboarding, name: '  Alex  ' });
    expect(getUpsertedPayload().name).toBe('Alex');
  });
});
