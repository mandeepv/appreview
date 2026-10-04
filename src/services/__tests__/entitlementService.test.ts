// The web entitlement read: it must NEVER throw, a query error or a timeout is
// `error` (never entitled), and failures reach Sentry. Supabase is mocked at
// the module boundary, as in onboardingService.test.ts.
//
// jest.mock calls are hoisted above this import by babel-jest, so the module
// under test still sees the mocks.

import { checkWebEntitlement } from '../entitlementService';

const mockResult: { value: Promise<{ data: unknown; error: unknown }> } = {
  value: Promise.resolve({ data: null, error: null }),
};
const mockEq = jest.fn();
const mockReportError = jest.fn();

jest.mock('../../lib/supabase', () => {
  const builder: Record<string, jest.Mock> = {
    select: jest.fn(() => builder),
    eq: jest.fn((col: string, val: unknown) => {
      mockEq(col, val);
      return builder;
    }),
    maybeSingle: jest.fn(() => mockResult.value),
  };
  return { supabase: { from: jest.fn(() => builder) } };
});

jest.mock('../../config/sentry', () => ({
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

const FUTURE = new Date(Date.now() + 30 * 86400_000).toISOString();
const PAST = new Date(Date.now() - 86400_000).toISOString();

beforeEach(() => {
  mockEq.mockClear();
  mockReportError.mockClear();
});

describe('checkWebEntitlement', () => {
  it('reads only the signed-in user\'s dodo row', async () => {
    mockResult.value = Promise.resolve({ data: null, error: null });
    await checkWebEntitlement('user-1');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(mockEq).toHaveBeenCalledWith('source', 'dodo');
  });

  it('an entitling row → entitled, with its period end and product', async () => {
    mockResult.value = Promise.resolve({
      data: { status: 'active', current_period_end: FUTURE, product_id: 'pdt_annual' },
      error: null,
    });
    await expect(checkWebEntitlement('user-1')).resolves.toEqual({
      kind: 'entitled',
      periodEnd: FUTURE,
      productId: 'pdt_annual',
    });
  });

  it('a lapsed row → not_entitled', async () => {
    mockResult.value = Promise.resolve({
      data: { status: 'active', current_period_end: PAST, product_id: 'pdt_annual' },
      error: null,
    });
    await expect(checkWebEntitlement('user-1')).resolves.toEqual({ kind: 'not_entitled' });
  });

  it('no row → not_entitled', async () => {
    mockResult.value = Promise.resolve({ data: null, error: null });
    await expect(checkWebEntitlement('user-1')).resolves.toEqual({ kind: 'not_entitled' });
  });

  it('a query error → error (not timed out), reported to Sentry', async () => {
    mockResult.value = Promise.resolve({ data: null, error: { message: 'permission denied' } });
    await expect(checkWebEntitlement('user-1')).resolves.toEqual({ kind: 'error', timedOut: false });
    expect(mockReportError).toHaveBeenCalledTimes(1);
  });

  it('a rejected query → error, never a throw', async () => {
    mockResult.value = Promise.reject(new Error('network down'));
    await expect(checkWebEntitlement('user-1')).resolves.toEqual({ kind: 'error', timedOut: false });
  });

  it('a slow query → error (timed out), not reported', async () => {
    mockResult.value = new Promise(() => {}); // never settles
    await expect(checkWebEntitlement('user-1', 20)).resolves.toEqual({ kind: 'error', timedOut: true });
    expect(mockReportError).not.toHaveBeenCalled();
  });
});
