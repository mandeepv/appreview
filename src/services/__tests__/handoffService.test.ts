// SPEC-21 — the two calls that turn a handoff key into a session.
//
//  - redeemHandoffKey never throws: every answer from redeem-handoff, a
//    network failure and a malformed reply all come back as a result the
//    screen can word.
//  - Only failures that are bugs reach Sentry: an expired, used or unknown
//    link is the parent's situation, not ours (SPEC-21 §4.5).
//  - The key goes to the function and nowhere else (INVARIANTS #29) — the
//    global PII guard fails any test here that leaks it to Sentry.
//
// functions.invoke and auth.verifyOtp are the global Supabase fake.

import { redeemHandoffKey, verifyHandoffToken } from '../handoffService';
import { resetSupabaseFake, supabase } from '../../test/supabase';
import { resetAnalyticsFakes, sentryModule } from '../../test/analytics';
import { FIXTURE_HANDOFF_KEY as KEY, makeSession, makeUser } from '../../test/factories';

/** What functions.invoke returns for a non-2xx: the body sits behind error.context. */
function httpFailure(status: number, body: unknown) {
  const error = Object.assign(new Error('Edge Function returned a non-2xx status code'), {
    name: 'FunctionsHttpError',
    context: new Response(JSON.stringify(body), { status }),
  });
  return { data: null, error };
}

beforeEach(() => {
  resetSupabaseFake();
  resetAnalyticsFakes();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('redeemHandoffKey', () => {
  it('posts the key to redeem-handoff and hands back the token and the buyer', async () => {
    supabase.functions.invoke.mockResolvedValue({
      data: { result: 'ok', token_hash: 'th_123', user_id: 'buyer-1' },
      error: null,
    });
    expect(await redeemHandoffKey(KEY)).toEqual({ result: 'ok', tokenHash: 'th_123', userId: 'buyer-1' });
    expect(supabase.functions.invoke).toHaveBeenCalledWith('redeem-handoff', { body: { key: KEY } });
    expect(sentryModule.reportError).not.toHaveBeenCalled();
  });

  it.each([
    ['expired', 410],
    ['used', 410],
    ['unknown', 404],
  ])('%s → that result, and no Sentry report (the parent’s situation, not a bug)', async (result, status) => {
    supabase.functions.invoke.mockResolvedValue(httpFailure(status, { result }));
    expect(await redeemHandoffKey(KEY)).toEqual({ result });
    expect(sentryModule.reportError).not.toHaveBeenCalled();
  });

  it.each([
    ['not_entitled', 403],
    ['rate_limited', 429],
    ['error', 500],
  ])('%s → that result, reported to Sentry with no key in it', async (result, status) => {
    supabase.functions.invoke.mockResolvedValue(httpFailure(status, { result }));
    expect(await redeemHandoffKey(KEY)).toEqual({ result });
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      context: 'handoff_redeem',
      result,
    });
  });

  it('offline (the SDK throws) → error, reported', async () => {
    supabase.functions.invoke.mockRejectedValue(new TypeError('Network request failed'));
    expect(await redeemHandoffKey(KEY)).toEqual({ result: 'error' });
    expect(sentryModule.reportError).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['ok with no token', { result: 'ok', user_id: 'buyer-1' }],
    ['ok with no user', { result: 'ok', token_hash: 'th_123' }],
    ['a result we never send', { result: 'maybe' }],
    ['no body at all', null],
  ])('%s → error, never a half sign-in', async (_what, data) => {
    supabase.functions.invoke.mockResolvedValue({ data, error: null });
    expect(await redeemHandoffKey(KEY)).toEqual({ result: 'error' });
  });

  it('a failure whose body cannot be read → error', async () => {
    supabase.functions.invoke.mockResolvedValue({ data: null, error: new Error('relay error') });
    expect(await redeemHandoffKey(KEY)).toEqual({ result: 'error' });
  });
});

describe('verifyHandoffToken', () => {
  it('exchanges the token_hash for a session (type magiclink)', async () => {
    const session = makeSession(makeUser('buyer-1'));
    supabase.auth.verifyOtp.mockResolvedValue({ data: { session }, error: null });
    expect(await verifyHandoffToken('th_123')).toBe(session);
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: 'th_123', type: 'magiclink' });
  });

  it('a refused token → rethrown, and reported (the key is already spent)', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({
      data: { session: null },
      error: Object.assign(new Error('Email link is invalid or has expired'), { code: 'otp_expired' }),
    });
    await expect(verifyHandoffToken('th_123')).rejects.toThrow('invalid or has expired');
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), { context: 'handoff_verify' });
  });

  it('no session in the answer → rethrown', async () => {
    supabase.auth.verifyOtp.mockResolvedValue({ data: { session: null }, error: null });
    await expect(verifyHandoffToken('th_123')).rejects.toThrow('no session');
  });
});
