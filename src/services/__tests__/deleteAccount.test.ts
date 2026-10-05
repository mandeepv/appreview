// SPEC-20 R6 — authService.deleteAccount, the client half of account
// deletion. Two promises are at stake:
//
//  - Money: if the server refuses because it couldn't cancel a renewing web
//    (Dodo) subscription, the account still exists and nothing local may be
//    touched — the user must stay signed in to try again (INVARIANTS #28).
//  - The dialog's promise: "permanently deletes … all your data (progress,
//    preferences, children)". Progress used to survive on the device — the
//    2026-09-15 "Delete account promised to delete progress and did not" bug —
//    and the next account to sign in would have inherited it via the merge.
//
// Supabase, Superwall, Sentry and AsyncStorage are the global fakes.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAccount, SubscriptionCancelError } from '../authService';
import { LESSON_PROGRESS_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import { resetSupabaseFake, supabase } from '../../test/supabase';
import { SuperwallExpoModule, resetSuperwallFake } from '../../test/superwall';
import { resetAnalyticsFakes, sentryModule, sentrySdk } from '../../test/analytics';
import { makeSession, makeUser } from '../../test/factories';

const multiRemove = AsyncStorage.multiRemove as jest.Mock;

// functions.invoke wraps a non-2xx response in an error whose `context` is
// the Response; deleteAccount reads `code` from its JSON body.
function functionError(status: number, body: Record<string, unknown>) {
  const response = { status, json: async () => body, clone: () => response };
  return Object.assign(new Error(`Edge Function returned ${status}`), { context: response });
}

function refreshSucceeds() {
  supabase.auth.refreshSession.mockResolvedValue({
    data: { session: makeSession(makeUser('user-a')) },
    error: null,
  });
}

beforeEach(() => {
  resetSupabaseFake();
  resetSuperwallFake();
  resetAnalyticsFakes();
  multiRemove.mockClear();
});

describe('deleteAccount — failures leave the account and the device untouched', () => {
  it('session refresh fails → the function is never called', async () => {
    supabase.auth.refreshSession.mockResolvedValue({ data: { session: null }, error: new Error('expired') });

    await expect(deleteAccount()).rejects.toThrow('Session refresh failed');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      context: 'delete_account_refresh',
    });
  });

  it('server could not cancel the web subscription → SubscriptionCancelError, nothing cleared, still signed in', async () => {
    refreshSucceeds();
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: functionError(409, { code: 'subscription_cancel_failed', step: 'cancel_web_subscription' }),
    });

    await expect(deleteAccount()).rejects.toBeInstanceOf(SubscriptionCancelError);
    expect(multiRemove).not.toHaveBeenCalled();
    expect(SuperwallExpoModule.reset).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(SubscriptionCancelError), {
      context: 'delete_account_cancel_web_subscription',
    });
  });

  it('any other server error → rethrown as is, nothing cleared', async () => {
    refreshSucceeds();
    const failure = functionError(400, { error: 'user_profiles delete failed', step: 'delete_user_profile' });
    supabase.functions.invoke.mockResolvedValue({ data: null, error: failure });

    await expect(deleteAccount()).rejects.toBe(failure);
    expect(multiRemove).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    expect(sentryModule.reportError).toHaveBeenCalledWith(failure, { context: 'delete_account_invoke' });
  });
});

describe('deleteAccount — success clears every trace, in a safe order', () => {
  it('clears progress and the subscription flag, then onboarding, Superwall, the session, and Sentry last', async () => {
    refreshSucceeds();
    supabase.functions.invoke.mockResolvedValue({ data: { message: 'ok' }, error: null });

    const order: string[] = [];
    const removedKeySets: string[][] = [];
    multiRemove.mockImplementation(async (keys: string[]) => {
      removedKeySets.push(keys);
      order.push(`multiRemove#${removedKeySets.length}`);
    });
    SuperwallExpoModule.reset.mockImplementation(async () => {
      order.push('superwall.reset');
    });
    supabase.auth.signOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });
    sentrySdk.setUser.mockImplementation((user: unknown) => {
      order.push(`sentry.setUser(${user})`);
    });

    await deleteAccount();

    // Local caches go BEFORE the session, so a failure there leaves the user
    // signed in (recoverable); Sentry is detached last, as the safety net.
    expect(order).toEqual([
      'multiRemove#1', // progress + subscription flag
      'multiRemove#2', // onboarding store's clearState
      'superwall.reset',
      'signOut',
      'sentry.setUser(null)',
    ]);
    expect(removedKeySets[0]).toEqual(
      expect.arrayContaining([
        ...LESSON_PROGRESS_KEYS,
        STORAGE_KEYS.LESSONS_COMPLETED,
        STORAGE_KEYS.ACTIVE_DAYS,
        STORAGE_KEYS.FLOW_BACKFILL_DONE,
        STORAGE_KEYS.IS_SUBSCRIBED,
      ]),
    );
  });

  it('a failure clearing local progress is reported but the sign-out still happens', async () => {
    refreshSucceeds();
    supabase.functions.invoke.mockResolvedValue({ data: { message: 'ok' }, error: null });
    multiRemove.mockRejectedValueOnce(new Error('disk full'));

    await expect(deleteAccount()).resolves.toBeUndefined();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      context: 'delete_account_clear_lesson_progress',
    });
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
