// SPEC-20 R3 — the Loading gate, the only way into Root (INVARIANTS #1).
//
// routingPolicy.test proves what each gate outcome MEANS. These prove the
// screen asks in the right order and acts on the answer: the short-circuits
// (demo, cached subscriber, dev skip, web purchase) before Superwall, the
// kill-switch interplay, every Superwall callback, the watchdog and retry
// timers, the escape hatch, "Use a different account", and the launch-time
// onboarding save. Characterisation tests against the screen as it is — the
// money path is not refactored to make it testable.
//
// Everything at the SDK boundary is the global fake (src/test/setup.ts). The
// Superwall fake calls the latest render's callbacks, as the real hooks do,
// so a test firing superwall.placement.onX sees exactly what the real SDK
// would call. All timers are fake: 1.2 s mount wait, ~10.6 s theatre, 300 ms
// re-present, 5 s watchdog, 3 s retry, 4 s web-check cap.

import React from 'react';
import { Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoadingScreen } from '../LoadingScreen';
import { useAuthStore } from '../../../store/authStore';
import { useConfigStore } from '../../../store/configStore';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { asNavigationProp, makeNavigation } from '../../../test/navigation';
import { SuperwallExpoModule, resetSuperwallFake, superwall } from '../../../test/superwall';
import { queryLog, resetSupabaseFake, setTableResult, supabase } from '../../../test/supabase';
import {
  capturedEvents,
  lastCapture,
  posthogModule,
  resetAnalyticsFakes,
  sentryModule,
} from '../../../test/analytics';
import { makeSession, makeUser, onboardingAnswers } from '../../../test/factories';
import { seedAuthStore, seedConfigStore, seedOnboardingStore } from '../../../test/stores';
import { advance } from '../../../test/timers';

// SKIP_PAYWALL is read from expo-constants' extra at gate time. The getter
// matters: the factory runs while LoadingScreen is being imported — before
// this file's `const` is initialised — so it must not read mockExtra until
// the gate actually asks.
const mockExtra: Record<string, unknown> = {};
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return { extra: mockExtra };
    },
  },
}));

type Props = React.ComponentProps<typeof LoadingScreen>;

const userA = makeUser('user-a');
const userB = makeUser('user-b');
const FUTURE = '2099-01-01T00:00:00Z';
const PAYWALL = { name: 'subscription_gate_paywall' };

const NETWORK_COPY = "Checking your subscription — please make sure you're online...";
const MISCONFIGURED_COPY = /trouble loading your subscription options/;
const ESCAPE_INTRO = 'Still having trouble? You can:';

const fire = (fn: () => unknown) => act(async () => {
  await fn();
});

async function renderGate() {
  const navigation = makeNavigation();
  await render(
    <LoadingScreen
      navigation={asNavigationProp<Props['navigation']>(navigation)}
      route={{ key: 'Loading', name: 'Loading' } as Props['route']}
    />,
  );
  return navigation;
}

const registerCount = () => superwall.registerPlacement.mock.calls.length;
const enteredRoot = (navigation: ReturnType<typeof makeNavigation>) =>
  navigation.replace.mock.calls.some((call) => call[0] === 'Root');

/** Cold launch → past the 1.2 s welcome → the gate has asked Superwall. */
async function launchToPaywall() {
  const navigation = await renderGate();
  await advance(1200);
  expect(registerCount()).toBe(1);
  return navigation;
}

/** Cold launch, Superwall unreachable on the first attempt → retry screen. */
async function launchToRetry() {
  superwall.registerPlacement.mockRejectedValueOnce(new Error('offline'));
  const navigation = await renderGate();
  await advance(1200);
  expect(screen.getByText(NETWORK_COPY)).toBeTruthy();
  return navigation;
}

function webRow(status: string, current_period_end: string | null = FUTURE) {
  return { data: { status, current_period_end, product_id: 'pdt_annual' }, error: null };
}

beforeEach(async () => {
  jest.useFakeTimers();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  await AsyncStorage.clear();
  resetSupabaseFake();
  resetSuperwallFake();
  resetAnalyticsFakes();
  for (const key of Object.keys(mockExtra)) delete mockExtra[key];
  // A signed-in, unentitled user's cold launch, config already resolved.
  seedAuthStore({ user: userA, session: makeSession(userA) });
  seedConfigStore();
  seedOnboardingStore();
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('order and short-circuits', () => {
  it('1. demo user → Root after the welcome, Superwall never asked', async () => {
    seedAuthStore({ user: userA, isDemoUser: true, isSubscribed: true });
    const navigation = await renderGate();
    await advance(1199);
    expect(enteredRoot(navigation)).toBe(false);
    await advance(1);
    expect(enteredRoot(navigation)).toBe(true);
    expect(superwall.identify).not.toHaveBeenCalled();
    expect(registerCount()).toBe(0);
  });

  it('2. cached Apple subscriber → Root, no paywall, no web check', async () => {
    seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'superwall' });
    const navigation = await renderGate();
    await advance(1200);
    expect(enteredRoot(navigation)).toBe(true);
    expect(registerCount()).toBe(0);
    expect(queryLog.some((q) => q.table === 'entitlements')).toBe(false);
  });

  describe('3. cached web subscriber → Root, then a background re-check', () => {
    beforeEach(() => seedAuthStore({ user: userA, isSubscribed: true, subscriptionSource: 'web' }));

    it('refunded (not_entitled) → the flag clears, so the NEXT launch gates', async () => {
      setTableResult('entitlements', webRow('revoked'));
      const navigation = await renderGate();
      await advance(1200);
      expect(enteredRoot(navigation)).toBe(true);
      expect(registerCount()).toBe(0);
      expect(useAuthStore.getState().isSubscribed).toBe(false);
    });

    it('offline (error) → the flag is kept', async () => {
      setTableResult('entitlements', { data: null, error: { message: 'network' } });
      await renderGate();
      await advance(1200);
      expect(useAuthStore.getState().isSubscribed).toBe(true);
      expect(useAuthStore.getState().subscriptionSource).toBe('web');
    });

    it('a different user signed in before the answer → the answer is ignored', async () => {
      let answer!: (value: unknown) => void;
      setTableResult('entitlements', () => new Promise((resolve) => (answer = resolve)) as never);
      await renderGate();
      await advance(1200);
      // B signs in (Apple subscriber) while A's re-check is still in flight.
      useAuthStore.setState({ user: userB, isSubscribed: true, subscriptionSource: 'superwall' });
      await fire(() => answer(webRow('revoked')));
      expect(useAuthStore.getState().isSubscribed).toBe(true);
    });
  });

  it('4. SKIP_PAYWALL=true is ignored when __DEV__ is false (store builds)', async () => {
    mockExtra.skipPaywall = 'true';
    const runtime = globalThis as unknown as { __DEV__: boolean };
    const dev = runtime.__DEV__;
    runtime.__DEV__ = false;
    try {
      const navigation = await launchToPaywall();
      expect(enteredRoot(navigation)).toBe(false);
    } finally {
      runtime.__DEV__ = dev;
    }
  });

  it('4b. …and honoured in a development build (the dev convenience still works)', async () => {
    mockExtra.skipPaywall = 'true';
    const navigation = await renderGate();
    await advance(1200);
    expect(enteredRoot(navigation)).toBe(true);
    expect(registerCount()).toBe(0);
  });

  it('5. web purchase → Root as a web subscriber, Superwall never asked', async () => {
    setTableResult('entitlements', webRow('active'));
    const navigation = await renderGate();
    await advance(1200);
    expect(enteredRoot(navigation)).toBe(true);
    expect(registerCount()).toBe(0);
    expect(useAuthStore.getState().subscriptionSource).toBe('web');
    expect(lastCapture('web_entitlement_checked')).toEqual({ result: 'entitled' });
  });

  // INVARIANTS #23: only a proven entitlement enters Root; anything else
  // falls through to the paywall — never to Root, and never to a dead end.
  it.each([
    ['not_entitled', webRow('expired'), 0],
    ['error', { data: null, error: { message: 'boom' } }, 0],
  ])('6. web check %s → the paywall', async (result, row, extraWait) => {
    setTableResult('entitlements', row);
    const navigation = await renderGate();
    await advance(1200 + extraWait);
    expect(registerCount()).toBe(1);
    expect(enteredRoot(navigation)).toBe(false);
    expect(lastCapture('web_entitlement_checked')).toEqual({ result });
  });

  it('6b. web check times out at 4 s → the paywall, not before', async () => {
    setTableResult('entitlements', () => new Promise(() => {}) as never);
    const navigation = await renderGate();
    await advance(1200 + 3999);
    expect(registerCount()).toBe(0);
    await advance(1);
    expect(registerCount()).toBe(1);
    expect(enteredRoot(navigation)).toBe(false);
    expect(lastCapture('web_entitlement_checked')).toEqual({ result: 'timeout' });
  });

  it('7. unentitled → identify(user) BEFORE registerPlacement(subscription_gate)', async () => {
    const order: string[] = [];
    superwall.identify.mockImplementation(async (id: string) => {
      order.push(`identify:${id}`);
    });
    superwall.registerPlacement.mockImplementation(async (args: { placement: string }) => {
      order.push(`register:${args.placement}`);
    });
    await renderGate();
    await advance(1200);
    expect(order).toEqual(['identify:user-a', 'register:subscription_gate']);
  });
});

describe('kill-switch interplay (SPEC-01 R5, SPEC-FIX-01 R1)', () => {
  it('8. config still loading → no paywall; once ok → exactly one registerPlacement', async () => {
    seedConfigStore({ status: 'loading' });
    await renderGate();
    await advance(1200);
    expect(registerCount()).toBe(0);

    await fire(() => useConfigStore.setState({ status: 'ok' }));
    expect(registerCount()).toBe(1);
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await advance(10_000);
    expect(registerCount()).toBe(1);
  });

  // The two-scheduler trap: mount timer AND config effect both firing.
  it('9. config ok at mount → one registerPlacement, not two', async () => {
    await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await advance(10_000);
    expect(registerCount()).toBe(1);
  });

  it('10. force update required → the gate never runs', async () => {
    seedConfigStore({ status: 'force_update' });
    const navigation = await renderGate();
    await advance(60_000);
    expect(registerCount()).toBe(0);
    expect(enteredRoot(navigation)).toBe(false);
  });
});

describe('Superwall callbacks', () => {
  it.each([
    ['purchased', 'subscription_purchased'],
    ['restored', 'subscription_restored'],
  ])('11. dismiss %s → subscribed, %s, Root', async (type, event) => {
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await fire(() => superwall.placement.onDismiss!(PAYWALL, { type }));
    expect(useAuthStore.getState().isSubscribed).toBe(true);
    expect(capturedEvents()).toContain(event);
    expect(enteredRoot(navigation)).toBe(true);
  });

  it('11b. a restore is never counted as a purchase', async () => {
    await launchToPaywall();
    await fire(() => superwall.placement.onDismiss!(PAYWALL, { type: 'restored' }));
    expect(capturedEvents()).not.toContain('subscription_purchased');
  });

  it('12. dismiss declined → no Root; the paywall comes back after 300 ms', async () => {
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await fire(() => superwall.placement.onDismiss!(PAYWALL, { type: 'declined' }));
    expect(enteredRoot(navigation)).toBe(false);
    expect(capturedEvents()).toContain('paywall_dismissed');
    await advance(299);
    expect(registerCount()).toBe(1);
    await advance(1);
    expect(registerCount()).toBe(2);
  });

  it.each(['Holdout', 'NoAudienceMatch'])('13. skip %s → Root', async (reason) => {
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onSkip!({ type: reason }));
    expect(enteredRoot(navigation)).toBe(true);
    expect(lastCapture('paywall_skipped_by_superwall')).toEqual({ skip_reason: reason });
  });

  // INVARIANTS #2: a missing placement is a dashboard break, not "entitled".
  it('13b. skip PlacementNotFound → NOT Root; loud signal; our-fault copy, not "check your connection"', async () => {
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onSkip!({ type: 'PlacementNotFound' }));
    expect(enteredRoot(navigation)).toBe(false);
    expect(capturedEvents()).toContain('paywall_placement_not_found');
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      screen: 'LoadingScreen',
      context: 'paywall_placement_not_found',
    });
    expect(screen.getByText(MISCONFIGURED_COPY)).toBeTruthy();
    expect(screen.queryByText(NETWORK_COPY)).toBeNull();
  });

  it('14. Superwall error, unentitled → the retry screen, never Root', async () => {
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onError!('network unreachable'));
    expect(enteredRoot(navigation)).toBe(false);
    expect(screen.getByText(NETWORK_COPY)).toBeTruthy();
  });

  // Fail open for confirmed subscribers (Fable #9) — and the callback must
  // see the subscription status as it is NOW, not as it was at mount.
  it('14b. Superwall error after the user became a subscriber → Root (fail open)', async () => {
    const navigation = await launchToPaywall();
    await fire(() => useAuthStore.setState({ isSubscribed: true, subscriptionSource: 'superwall' }));
    await fire(() => superwall.placement.onError!('network unreachable'));
    expect(enteredRoot(navigation)).toBe(true);
  });

  it('15. registerPlacement rejects → the retry screen', async () => {
    const navigation = await launchToRetry();
    expect(enteredRoot(navigation)).toBe(false);
  });
});

describe('timers and retry', () => {
  it('16. the paywall never appears → retry at the 5 s watchdog, not before', async () => {
    await launchToPaywall();
    await advance(4900);
    expect(screen.queryByText(NETWORK_COPY)).toBeNull();
    await advance(200);
    expect(screen.getByText(NETWORK_COPY)).toBeTruthy();
    expect(sentryModule.addGateBreadcrumb).toHaveBeenCalledWith(
      'gate: present watchdog fired (onPresent never arrived, 5s)',
    );
  });

  it('16b. the paywall appears → the watchdog stands down', async () => {
    await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await advance(10_000);
    expect(screen.queryByText(NETWORK_COPY)).toBeNull();
  });

  it('17. retries every 3 s; the escape hatch appears from the third attempt, reported once', async () => {
    superwall.registerPlacement.mockRejectedValue(new Error('offline'));
    await renderGate();
    await advance(1200);
    expect(registerCount()).toBe(1);

    await advance(3000);
    expect(registerCount()).toBe(2);
    await advance(3000);
    expect(registerCount()).toBe(3);
    expect(screen.queryByText(ESCAPE_INTRO)).toBeNull();

    await advance(3000);
    expect(registerCount()).toBe(4);
    expect(screen.getByText(ESCAPE_INTRO)).toBeTruthy();

    await advance(9000);
    expect(capturedEvents().filter((e) => e === 'gate_escape_hatch_shown')).toHaveLength(1);
  });

  // SPEC-FIX-01 R1 minor #3: the interval must run the CURRENT runGate.
  it('18. becoming a subscriber while on the retry screen → the next attempt enters Root', async () => {
    const navigation = await launchToRetry();
    await fire(() => useAuthStore.setState({ isSubscribed: true, subscriptionSource: 'superwall' }));
    await advance(3000);
    expect(enteredRoot(navigation)).toBe(true);
  });

  it('19. a retry tick while an attempt is still in flight is a no-op', async () => {
    await launchToRetry();
    superwall.identify.mockImplementation(() => new Promise(() => {})); // Superwall auth hangs
    await advance(3000); // tick 1 — starts an attempt that never finishes
    const callsAfterFirstTick = superwall.identify.mock.calls.length;
    await advance(3000); // tick 2 — attempt still in flight
    expect(superwall.identify.mock.calls.length).toBe(callsAfterFirstTick);
  });

  it('26. web buyer, everything offline at first → retry; the web answer on a later attempt → Root', async () => {
    let attempt = 0;
    setTableResult('entitlements', () =>
      ++attempt === 1 ? { data: null, error: { message: 'offline' } } : webRow('active'),
    );
    superwall.registerPlacement.mockRejectedValueOnce(new Error('offline'));
    const navigation = await renderGate();
    await advance(1200);
    expect(enteredRoot(navigation)).toBe(false);
    await advance(3000);
    expect(enteredRoot(navigation)).toBe(true);
    expect(useAuthStore.getState().subscriptionSource).toBe('web');
  });
});

describe('escape hatch', () => {
  async function launchToEscapeHatch() {
    superwall.registerPlacement.mockRejectedValue(new Error('offline'));
    const navigation = await renderGate();
    await advance(1200 + 9000);
    expect(screen.getByText(ESCAPE_INTRO)).toBeTruthy();
    return navigation;
  }

  it('20. Restore finds a subscription → Root, reported as an escape-hatch restore', async () => {
    SuperwallExpoModule.getSubscriptionStatus.mockResolvedValue({ status: 'ACTIVE' });
    const navigation = await launchToEscapeHatch();
    await fireEvent.press(screen.getByText('Restore Purchases'));
    expect(enteredRoot(navigation)).toBe(true);
    expect(useAuthStore.getState().isSubscribed).toBe(true);
    expect(lastCapture('subscription_restored')).toEqual({ source: 'escape_hatch' });
  });

  it.each([
    ['nothing to restore', { result: 'restored' }, 'INACTIVE', /No previous purchase was found/],
    ['still resolving', { result: 'restored' }, 'UNKNOWN', /still checking with the App Store/],
    ['restore failed', { result: 'failed', errorMessage: 'x' }, 'INACTIVE', /Something went wrong/],
  ])('20b. Restore, %s → an inline message, no Root', async (_label, restore, status, message) => {
    SuperwallExpoModule.restorePurchases.mockResolvedValue({ errorMessage: null, ...restore });
    SuperwallExpoModule.getSubscriptionStatus.mockResolvedValue({ status });
    const navigation = await launchToEscapeHatch();
    await fireEvent.press(screen.getByText('Restore Purchases'));
    expect(screen.getByText(message)).toBeTruthy();
    expect(enteredRoot(navigation)).toBe(false);
  });

  // 2026-09-15: this path once skipped the PostHog reset, so the next person
  // on the device was tracked as whoever signed out here.
  it('21. Sign out → PostHog identity reset BEFORE the session ends, then Welcome', async () => {
    const order: string[] = [];
    posthogModule.resetPostHog.mockImplementation(() => order.push('resetPostHog'));
    supabase.auth.signOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });
    const navigation = await launchToEscapeHatch();
    await fireEvent.press(screen.getByText('Sign out'));
    expect(order).toEqual(['resetPostHog', 'signOut']);
    expect(navigation.reset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'Welcome' }] });
  });

  it('21b. Contact support → a mailto; if no mail app, the address is shown instead', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no mail client'));
    await launchToEscapeHatch();
    await fireEvent.press(screen.getByText('Contact support'));
    expect(openURL).toHaveBeenCalledWith(expect.stringMatching(/^mailto:support@example\.com\?subject=/));
    expect(screen.getByText(/Please email us at support@example\.com/)).toBeTruthy();
  });
});

describe('"Use a different account" (switch_account)', () => {
  it('22. dismisses, resets identity, signs out, and lands on Auth in sign-in mode — without re-presenting', async () => {
    const order: string[] = [];
    superwall.dismiss.mockImplementation(async () => {
      order.push('dismiss');
    });
    posthogModule.resetPostHog.mockImplementation(() => order.push('resetPostHog'));
    supabase.auth.signOut.mockImplementation(async () => {
      order.push('signOut');
      return { error: null };
    });
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));

    await fire(() => superwall.events.onCustomPaywallAction('switch_account'));
    // The programmatic dismiss reports `declined`; the gate must stand down.
    await fire(() => superwall.placement.onDismiss!(PAYWALL, { type: 'declined' }));
    await advance(1000);

    expect(order).toEqual(['dismiss', 'resetPostHog', 'signOut']);
    expect(navigation.reset).toHaveBeenCalledWith({
      index: 1,
      routes: [{ name: 'Welcome' }, { name: 'Auth', params: { mode: 'signin' } }],
    });
    expect(registerCount()).toBe(1);
    expect(enteredRoot(navigation)).toBe(false);
  });

  it('22b. sign-out fails → still the unentitled account, so the gate goes back up', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: new Error('offline') });
    // As in the SDK: dismissing the presented paywall reports `declined`.
    superwall.dismiss.mockImplementation(async () => {
      superwall.placement.onDismiss!(PAYWALL, { type: 'declined' });
    });
    const navigation = await launchToPaywall();
    await fire(() => superwall.placement.onPresent!(PAYWALL));
    await fire(() => superwall.events.onCustomPaywallAction('switch_account'));
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      screen: 'LoadingScreen',
      context: 'gate_switch_account_sign_out',
    });
    await advance(300);
    expect(registerCount()).toBe(2);
    expect(enteredRoot(navigation)).toBe(false);
  });
});

describe('onboarding save (the launch-time re-save)', () => {
  const profileUpserts = () =>
    queryLog.filter((q) => q.table === 'user_profiles' && q.op === 'upsert');

  it.each([
    ['the "Parent" placeholder', 'Parent'],
    ['a blank name', '   '],
  ])('23. saved once, with no name for %s (INVARIANTS #7); store cleared', async (_label, name) => {
    seedOnboardingStore(onboardingAnswers({ name }) as never);
    await renderGate();
    await advance(0);
    expect(profileUpserts()).toHaveLength(1);
    const payload = profileUpserts()[0].args[0] as Record<string, unknown>;
    expect(payload.user_type).toBe('parent');
    expect('name' in payload).toBe(false);
    expect(useOnboardingStore.getState().userType).toBeNull();
  });

  it('23b. a typed name is saved', async () => {
    seedOnboardingStore(onboardingAnswers({ name: '  Asha  ' }) as never);
    await renderGate();
    await advance(0);
    expect((profileUpserts()[0].args[0] as Record<string, unknown>).name).toBe('Asha');
  });

  // The answers must survive a failed save so the next launch re-sends them,
  // and a failed save must never trap a paying user at the gate.
  it('24. save fails → reported, answers kept on the device, and the gate still runs after the theatre', async () => {
    setTableResult('user_profiles', { data: null, error: { message: 'timeout' } });
    seedOnboardingStore(onboardingAnswers() as never);
    await renderGate();
    await advance(0);
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      screen: 'LoadingScreen',
      context: 'onboarding_save',
    });
    expect(useOnboardingStore.getState().userType).toBe('parent');

    await advance(1200);
    expect(registerCount()).toBe(0); // the theatre is still running
    await advance(10_000);
    expect(registerCount()).toBe(1);
  });

  it('25. demo user with answers → nothing sent to Supabase; store cleared', async () => {
    seedAuthStore({ user: userA, isDemoUser: true, isSubscribed: true });
    seedOnboardingStore(onboardingAnswers() as never);
    await renderGate();
    await advance(0);
    expect(profileUpserts()).toHaveLength(0);
    expect(useOnboardingStore.getState().userType).toBeNull();
  });
});
