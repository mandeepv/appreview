import { supabase } from '../lib/supabase';
import { reportError } from '../config/sentry';
import { isWebEntitled, type WebCheckResult } from '../store/webEntitlement';

// How long the launch gate will wait for the entitlements read before giving
// up and falling through to Superwall. Every unentitled organic user pays this
// wait in front of the paywall when the network is bad, so it is short; a
// timeout is treated exactly like an error (never as entitled).
export const WEB_CHECK_TIMEOUT_MS = 4000;

const TIMEOUT = Symbol('timeout');

/**
 * Does this user have an active kinderwell.app (web) purchase?
 *
 * Reads the user's own `entitlements` row (RLS allows only their own; the app
 * never writes the table) and applies isWebEntitled. NEVER throws: on a query
 * error or a timeout it returns { kind: 'error' }, which the gate treats as
 * "not proven" and hands to Superwall — an error is never entitlement, and
 * never blocks the paywall path either.
 *
 * Money path, so failures go to Sentry (reportError). The timeout is NOT
 * reported: a slow network at launch is expected, and the gate's
 * web_entitlement_checked event already counts it.
 */
export async function checkWebEntitlement(
  userId: string,
  timeoutMs: number = WEB_CHECK_TIMEOUT_MS,
): Promise<WebCheckResult> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const query = supabase
      .from('entitlements')
      .select('status, current_period_end, product_id')
      .eq('user_id', userId)
      .eq('source', 'dodo')
      .maybeSingle();
    const timeout = new Promise<typeof TIMEOUT>((resolve) => {
      timer = setTimeout(() => resolve(TIMEOUT), timeoutMs);
    });

    const result = await Promise.race([query, timeout]);
    if (result === TIMEOUT) {
      if (__DEV__) console.warn(`[entitlementService] web check timed out after ${timeoutMs}ms`);
      return { kind: 'error', timedOut: true };
    }

    const { data, error } = result;
    // A PostgrestError is a plain object, not an Error — wrap it so Sentry
    // gets a message rather than "[object Object]".
    if (error) throw new Error(`entitlements read failed: ${error.message}`);

    if (data && isWebEntitled(data, new Date())) {
      // isWebEntitled guarantees a parseable current_period_end.
      return { kind: 'entitled', periodEnd: data.current_period_end as string, productId: data.product_id };
    }
    return { kind: 'not_entitled' };
  } catch (error) {
    if (__DEV__) console.error('[entitlementService] web check failed:', error);
    reportError(error instanceof Error ? error : new Error(String(error)), {
      context: 'web_entitlement_check',
    });
    return { kind: 'error', timedOut: false };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
