// SPEC-20 R4 — the auth store, at the seam where the user-bound entitlement
// cache meets a real session. entitlementCache.test covers the decision
// (resolveCachedEntitlement) in isolation; these cover the store that feeds it
// the session user, persists the flag, and clears it — the wiring SPEC-FIX-08's
// three never-paid-user leaks went through.
//
// Supabase, Superwall, PostHog, Sentry and AsyncStorage are the global fakes
// from src/test/setup.ts. progressStore is mocked below: it's a collaborator,
// and these tests only care THAT a sign-in triggers the progress merge.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook } from '@testing-library/react-native';
import { useAuthStore, useSubscriptionStatusSync } from '../authStore';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { mergeRemoteIntoLocal } from '../../lessons/progressStore';
import { fireAuthChange, resetSupabaseFake, supabase } from '../../test/supabase';
import { SuperwallExpoModule, resetSuperwallFake, superwall } from '../../test/superwall';
import { posthog, resetAnalyticsFakes, sentryModule } from '../../test/analytics';
import { makeSession, makeUser } from '../../test/factories';
import { seedAuthStore } from '../../test/stores';

jest.mock('../../lessons/progressStore', () => ({
  mergeRemoteIntoLocal: jest.fn(() => Promise.resolve()),
}));

const KEY = STORAGE_KEYS.IS_SUBSCRIBED;
const userA = makeUser('user-a');
const userB = makeUser('user-b');

const owned = (userId: string, subscribed: boolean, source?: 'web' | 'superwall') =>
  JSON.stringify({ userId, subscribed, ...(source ? { source } : {}) });

// setIsSubscribed persists fire-and-forget, and initialize removes a stale
// record without awaiting it — let those settle before reading storage.
const flush = () => new Promise((resolve) => setImmediate(resolve));

function launchWithSession(user: ReturnType<typeof makeUser> | null) {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: user ? makeSession(user) : null },
    error: null,
  });
}

async function launch(user: ReturnType<typeof makeUser> | null) {
  launchWithSession(user);
  await useAuthStore.getState().initialize();
  await flush();
}

beforeEach(async () => {
  await AsyncStorage.clear();
  resetSupabaseFake();
  resetSuperwallFake();
  resetAnalyticsFakes();
  (mergeRemoteIntoLocal as jest.Mock).mockClear();
  // A cold launch: nothing in memory yet.
  seedAuthStore({ isLoading: true });
});

describe('initialize — the cached flag is honoured only for its owner (SPEC-FIX-08)', () => {
  it('owned record + the same user signed in → subscribed, source kept', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true, 'web'));
    await launch(userA);
    const state = useAuthStore.getState();
    expect(state.isSubscribed).toBe(true);
    expect(state.subscriptionSource).toBe('web');
    expect(state.user?.id).toBe('user-a');
    expect(state.isLoading).toBe(false);
  });

  it('a pre-2026-10 record (no source) → subscribed, as superwall', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    await launch(userA);
    expect(useAuthStore.getState().subscriptionSource).toBe('superwall');
  });

  // Instance 3: account switch. A's flag must never unlock B.
  it('record owned by a different user → not subscribed, record removed', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    await launch(userB);
    expect(useAuthStore.getState().isSubscribed).toBe(false);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  // Instances 1 and 2: deleted account, expired session.
  it('no session → not subscribed, record removed', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    await launch(null);
    expect(useAuthStore.getState().isSubscribed).toBe(false);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });

  it('a legacy bare "true" (no owner) → not subscribed', async () => {
    await AsyncStorage.setItem(KEY, 'true');
    await launch(userA);
    expect(useAuthStore.getState().isSubscribed).toBe(false);
  });

  it('getSession fails → finishes loading, not subscribed, never throws', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: new Error('network down'),
    });
    await expect(useAuthStore.getState().initialize()).resolves.toBeUndefined();
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isSubscribed).toBe(false);
  });

  // INVARIANTS #8: identify by Supabase user id only. A second argument to
  // identify() is a $set — re-attaching person properties on every launch was
  // the Fable re-review leak.
  it('identifies PostHog and Sentry by user id, and nothing else', async () => {
    await launch(userA);
    expect(posthog.identify).toHaveBeenCalledTimes(1);
    expect(posthog.identify.mock.calls[0]).toEqual(['user-a']);
    expect(sentryModule.setSentryUser).toHaveBeenCalledWith('user-a');
  });
});

describe('the auth-change listener', () => {
  it('session ends → flag removed and state reset', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    await launch(userA);
    expect(useAuthStore.getState().isSubscribed).toBe(true);

    await fireAuthChange('SIGNED_OUT', null);
    await flush();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isSubscribed).toBe(false);
    expect(state.subscriptionSource).toBeNull();
    expect(state.isDemoUser).toBe(false);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(sentryModule.setSentryUser).toHaveBeenLastCalledWith(null);
  });

  it('SIGNED_IN → the progress merge runs once', async () => {
    await launch(null);
    await fireAuthChange('SIGNED_IN', makeSession(userA));
    expect(mergeRemoteIntoLocal).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user?.id).toBe('user-a');
  });

  it.each(['TOKEN_REFRESHED', 'INITIAL_SESSION'])('%s → no progress merge (fires routinely)', async (event) => {
    await launch(userA);
    await fireAuthChange(event, makeSession(userA));
    expect(mergeRemoteIntoLocal).not.toHaveBeenCalled();
  });
});

describe('setIsSubscribed', () => {
  // SPEC-FIX-08 startup race: Superwall can report before `user` is set. A
  // write then would be unowned, and a clear would wipe a valid record.
  it('no user yet → nothing written and the existing record kept', async () => {
    await AsyncStorage.setItem(KEY, owned('user-a', true));
    seedAuthStore({ user: null });

    useAuthStore.getState().setIsSubscribed(false);
    await flush();
    expect(await AsyncStorage.getItem(KEY)).toBe(owned('user-a', true));

    useAuthStore.getState().setIsSubscribed(true);
    await flush();
    expect(await AsyncStorage.getItem(KEY)).toBe(owned('user-a', true));
  });

  it('with a user → an owned record carrying its source', async () => {
    seedAuthStore({ user: userA });
    useAuthStore.getState().setIsSubscribed(true, 'web');
    await flush();
    expect(JSON.parse((await AsyncStorage.getItem(KEY)) as string)).toEqual({
      userId: 'user-a',
      subscribed: true,
      source: 'web',
    });
    expect(useAuthStore.getState().subscriptionSource).toBe('web');
  });

  it('false → not subscribed, and no source', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
    useAuthStore.getState().setIsSubscribed(false);
    await flush();
    expect(useAuthStore.getState().subscriptionSource).toBeNull();
    expect(JSON.parse((await AsyncStorage.getItem(KEY)) as string).subscribed).toBe(false);
  });
});

describe('signOut', () => {
  it('removes the flag, resets Superwall, and clears state', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    await AsyncStorage.setItem(KEY, owned('user-a', true));

    await useAuthStore.getState().signOut();

    expect(await AsyncStorage.getItem(KEY)).toBeNull();
    expect(SuperwallExpoModule.reset).toHaveBeenCalledTimes(1);
    expect(sentryModule.setSentryUser).toHaveBeenCalledWith(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isSubscribed).toBe(false);
  });

  it('a Superwall reset failure is reported but does not block sign-out', async () => {
    seedAuthStore({ user: userA });
    SuperwallExpoModule.reset.mockRejectedValue(new Error('native reset failed'));

    await expect(useAuthStore.getState().signOut()).resolves.toBeUndefined();

    expect(useAuthStore.getState().user).toBeNull();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      context: 'sign_out_superwall_reset',
    });
  });

  it('a Supabase sign-out failure rethrows and leaves the session as it was', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    supabase.auth.signOut.mockResolvedValue({ error: new Error('offline') });

    await expect(useAuthStore.getState().signOut()).rejects.toThrow('offline');
    expect(useAuthStore.getState().user?.id).toBe('user-a');
  });
});

// SPEC-FIX-08 instance 3, end to end at store level: the old defense was
// "clear on sign-out", which fails exactly when sign-out throws. User-binding
// makes it structural — B's launch refuses A's record whatever happened before.
describe('account switch after a failed sign-out', () => {
  it("user B's next launch never inherits user A's subscription", async () => {
    seedAuthStore({ user: userA });
    useAuthStore.getState().setIsSubscribed(true);
    await flush();
    supabase.auth.signOut.mockResolvedValue({ error: new Error('offline') });
    await expect(useAuthStore.getState().signOut()).rejects.toThrow();
    expect(await AsyncStorage.getItem(KEY)).toBe(owned('user-a', true, 'superwall'));

    // Next cold launch, now signed in as B.
    seedAuthStore({ isLoading: true });
    await launch(userB);

    expect(useAuthStore.getState().isSubscribed).toBe(false);
    expect(await AsyncStorage.getItem(KEY)).toBeNull();
  });
});

describe('useSubscriptionStatusSync — the App-level Superwall listener', () => {
  async function mountListener() {
    await renderHook(() => useSubscriptionStatusSync());
    const handler = superwall.events.onSubscriptionStatusChange;
    expect(handler).toBeDefined();
    return (status: string) => handler({ status });
  }

  it('ACTIVE → subscribed, as superwall', async () => {
    seedAuthStore({ user: userA });
    const report = await mountListener();
    report('ACTIVE');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
    expect(useAuthStore.getState().subscriptionSource).toBe('superwall');
  });

  // INVARIANTS #25: every web buyer is INACTIVE to Superwall. Clearing on
  // INACTIVE regardless of source wiped their unlock on every launch.
  it('INACTIVE with a web flag → kept', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' });
    const report = await mountListener();
    report('INACTIVE');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
    expect(useAuthStore.getState().subscriptionSource).toBe('web');
  });

  it('INACTIVE with a superwall flag → cleared', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    const report = await mountListener();
    report('INACTIVE');
    expect(useAuthStore.getState().isSubscribed).toBe(false);
  });

  it('UNKNOWN → kept', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    const report = await mountListener();
    report('UNKNOWN');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
  });

  it('demo user → ignored either way', async () => {
    seedAuthStore({ user: userA, isDemoUser: true, isSubscribed: true });
    const report = await mountListener();
    report('INACTIVE');
    expect(useAuthStore.getState().isSubscribed).toBe(true);
  });
});
