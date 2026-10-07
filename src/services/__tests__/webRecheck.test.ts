// The cached web flag's re-check (web2app review 2026-10-07, AP-5): it only
// ever clears the flag, waits longer than the launch gate (it is off the
// launch path), and runs again when the app returns to the foreground, at
// most hourly — so a refund reaches an app that is never killed.
import {
  FOREGROUND_RECHECK_INTERVAL_MS,
  maybeRecheckWebOnForeground,
  recheckWebEntitlement,
  resetWebRecheckForTests,
  WEB_RECHECK_TIMEOUT_MS,
} from '../webRecheck';
import * as entitlementService from '../entitlementService';
import { useAuthStore } from '../../store/authStore';
import { seedAuthStore } from '../../test/stores';
import { resetSupabaseFake, setTableResult } from '../../test/supabase';
import { resetAnalyticsFakes, sentryModule } from '../../test/analytics';
import { makeUser } from '../../test/factories';

const userA = makeUser('user-a');
const userB = makeUser('user-b');
const row = (status: string, days = 30) => ({
  data: { status, current_period_end: new Date(Date.now() + days * 86_400_000).toISOString(), product_id: 'pdt_annual' },
  error: null,
});

beforeEach(() => {
  resetSupabaseFake();
  resetAnalyticsFakes();
  resetWebRecheckForTests();
  seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
});

describe('recheckWebEntitlement', () => {
  it('a refund (not_entitled) clears the flag', async () => {
    setTableResult('entitlements', row('revoked'));
    expect(await recheckWebEntitlement('user-a')).toBe('cleared');
    expect(useAuthStore.getState().isSubscribed).toBe(false);
  });

  it('still entitled, or no answer (offline, timeout) → the flag is kept', async () => {
    setTableResult('entitlements', row('active'));
    expect(await recheckWebEntitlement('user-a')).toBe('kept');
    setTableResult('entitlements', { data: null, error: { message: 'network' } });
    expect(await recheckWebEntitlement('user-a')).toBe('kept');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
  });

  it('waits the long timeout, not the launch gate’s 4 seconds', async () => {
    const spy = jest.spyOn(entitlementService, 'checkWebEntitlement');
    setTableResult('entitlements', row('active'));
    await recheckWebEntitlement('user-a');
    expect(spy).toHaveBeenCalledWith('user-a', WEB_RECHECK_TIMEOUT_MS, { report: true });
    expect(WEB_RECHECK_TIMEOUT_MS).toBeGreaterThan(entitlementService.WEB_CHECK_TIMEOUT_MS);
    spy.mockRestore();
  });

  it('someone else signed in meanwhile → the answer is moot, their flag untouched', async () => {
    setTableResult('entitlements', row('revoked'));
    const pending = recheckWebEntitlement('user-a');
    useAuthStore.setState({ user: userB, isSubscribed: true, subscriptionSource: 'superwall' });
    expect(await pending).toBe('moot');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
  });
});

describe('maybeRecheckWebOnForeground', () => {
  it('re-checks a signed-in web subscriber, then not again within the hour', async () => {
    setTableResult('entitlements', row('revoked'));
    const t0 = 1_000_000_000_000;
    expect(await maybeRecheckWebOnForeground(t0)).toBe('cleared');
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
    expect(maybeRecheckWebOnForeground(t0 + FOREGROUND_RECHECK_INTERVAL_MS - 1)).toBeNull();
    expect(await maybeRecheckWebOnForeground(t0 + FOREGROUND_RECHECK_INTERVAL_MS)).toBe('cleared');
  });

  it('leaves Apple subscribers, unsubscribed users and signed-out launches alone', () => {
    for (const state of [
      { user: userA, isSubscribed: true, subscriptionSource: 'superwall' as const },
      { user: userA, isSubscribed: false, subscriptionSource: null },
      { user: null, isSubscribed: false, subscriptionSource: null },
    ]) {
      seedAuthStore(state);
      expect(maybeRecheckWebOnForeground()).toBeNull();
    }
  });

  it('does not report an offline phone to Sentry every hour', async () => {
    setTableResult('entitlements', { data: null, error: { message: 'network' } });
    expect(await maybeRecheckWebOnForeground()).toBe('kept');
    expect(sentryModule.reportError).not.toHaveBeenCalled();
  });
});
