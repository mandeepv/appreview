import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { reportError } from '../config/sentry';

// SPEC-21 purchase handoff — the two calls that turn a key into a session.
//
//  1. redeemHandoffKey: POST the key to the redeem-handoff edge function. It
//     claims the key (single use), checks the buyer still has access, and
//     answers with a magic-link token_hash and the buyer's user id. Nothing
//     is signed in yet, so a dead link leaves whoever is signed in alone.
//  2. verifyHandoffToken: exchange the token_hash for a normal session.
//
// HandoffScreen runs them with the account switch in between (sign out
// another user first: INVARIANTS #3), then routes to Loading — never Root
// (INVARIANTS #1). The key goes to the function and nowhere else: not into
// errors, Sentry context or logs (INVARIANTS #29).

/** The redeem-handoff function's answers (supabase/functions/redeem-handoff). */
export type HandoffResult =
  | 'ok'
  | 'expired'
  | 'used'
  | 'unknown'
  | 'not_entitled'
  | 'rate_limited'
  | 'error';

export type HandoffRedeem =
  | { result: 'ok'; tokenHash: string; userId: string }
  | { result: Exclude<HandoffResult, 'ok'> };

const FAILURES = new Set<HandoffResult>(['expired', 'used', 'unknown', 'not_entitled', 'rate_limited', 'error']);

// A link that has run out or was never real is the parent's situation, not a
// bug — those three stay out of Sentry. Everything else is on the money/auth
// path and is reported (SPEC-21 §4.5).
const EXPECTED = new Set<HandoffResult>(['expired', 'used', 'unknown']);

// functions.invoke puts a non-2xx response's body behind error.context (the
// raw Response). Read it without trusting its shape; any failure is "no body".
async function readErrorBody(error: unknown): Promise<unknown> {
  try {
    const response = (error as { context?: unknown })?.context;
    if (!response || typeof (response as Response).json !== 'function') return null;
    return await (response as Response).clone().json();
  } catch {
    return null;
  }
}

function toRedeem(body: unknown): HandoffRedeem {
  const b = (body ?? {}) as { result?: unknown; token_hash?: unknown; user_id?: unknown };
  if (b.result === 'ok') {
    if (typeof b.token_hash === 'string' && b.token_hash && typeof b.user_id === 'string' && b.user_id) {
      return { result: 'ok', tokenHash: b.token_hash, userId: b.user_id };
    }
    return { result: 'error' };
  }
  if (typeof b.result === 'string' && FAILURES.has(b.result as HandoffResult)) {
    return { result: b.result as Exclude<HandoffResult, 'ok'> };
  }
  return { result: 'error' };
}

/**
 * Redeem a handoff key. NEVER throws: a network failure, an unexpected
 * response or the function's own failure all come back as `error`, which the
 * screen turns into "sign in with your email" like any other failure.
 */
export async function redeemHandoffKey(key: string): Promise<HandoffRedeem> {
  let outcome: HandoffRedeem;
  let cause: unknown = null;
  try {
    const { data, error } = await supabase.functions.invoke('redeem-handoff', { body: { key } });
    outcome = toRedeem(error ? await readErrorBody(error) : data);
    cause = error;
  } catch (error) {
    outcome = { result: 'error' };
    cause = error;
  }
  if (!EXPECTED.has(outcome.result) && outcome.result !== 'ok') {
    if (__DEV__) console.warn(`[handoffService] redeem failed: ${outcome.result}`);
    // The result names what happened; the cause is the SDK's generic error
    // (never the request body, so never the key).
    reportError(cause instanceof Error ? cause : new Error(`handoff redeem: ${outcome.result}`), {
      context: 'handoff_redeem',
      result: outcome.result,
    });
  }
  return outcome;
}

/**
 * Exchange the function's token_hash for a session. Rethrows (the token is
 * single use and expires within the hour), after reporting: by this point the
 * key has been spent, so a failure here is a real auth bug.
 */
export async function verifyHandoffToken(tokenHash: string): Promise<Session> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' });
    if (error) throw error;
    if (!data.session) throw new Error('verifyOtp returned no session');
    return data.session;
  } catch (error) {
    if (__DEV__) console.error('[handoffService] could not verify the handoff token');
    reportError(error instanceof Error ? error : new Error(String(error)), { context: 'handoff_verify' });
    throw error;
  }
}
