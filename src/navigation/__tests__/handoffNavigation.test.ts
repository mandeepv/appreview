// SPEC-21 — bringing HandoffScreen up when a handoff link opens the app.
//
//  - A link takes over any screen except Splash and Handoff, which read the
//    pending key themselves.
//  - Over the paywall (the buyer stuck on a Hide My Email account is the one
//    most likely to tap their link): navigation resets FIRST, unmounting the
//    gate and its paywall callbacks, and only then is the paywall dismissed —
//    the other way round the gate would hear "declined" and re-present it.
//  - A sign-out HandoffScreen makes on purpose is not answered with a reset to
//    Welcome.
//
// The navigation container is a hand-made fake; Superwall is the global fake.

import { renderHook } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { openHandoffIfPending, resetToWelcomeOnSignOut, useHandoffLinks } from '../handoffNavigation';
import { useHandoffStore } from '../../store/handoffStore';
import { resetSuperwallFake, SuperwallExpoModule } from '../../test/superwall';
import { resetAnalyticsFakes, sentryModule } from '../../test/analytics';
import { FIXTURE_HANDOFF_KEY as KEY, handoffLink } from '../../test/factories';

type FakeContainer = Parameters<typeof openHandoffIfPending>[0] & {
  reset: jest.Mock;
};

function container(current: string | undefined, ready = true): FakeContainer {
  return {
    isReady: jest.fn(() => ready),
    getCurrentRoute: jest.fn(() => (current ? { key: current, name: current } : undefined)),
    reset: jest.fn(),
  } as unknown as FakeContainer;
}

const TO_HANDOFF = { index: 0, routes: [{ name: 'Handoff' }] };

beforeEach(() => {
  useHandoffStore.setState({ pendingKey: null, pendingSource: null });
  resetSuperwallFake();
  resetAnalyticsFakes();
});

afterEach(() => jest.restoreAllMocks());

describe('openHandoffIfPending', () => {
  beforeEach(() => useHandoffStore.getState().receive(KEY, 'link'));

  it.each(['Welcome', 'UserType', 'Auth', 'Root'])('on %s → HandoffScreen takes over', (route) => {
    const nav = container(route);
    openHandoffIfPending(nav);
    expect(nav.reset).toHaveBeenCalledWith(TO_HANDOFF);
    expect(SuperwallExpoModule.dismiss).not.toHaveBeenCalled();
  });

  it('on Loading → reset first, THEN the paywall is dismissed', () => {
    const nav = container('Loading');
    openHandoffIfPending(nav);
    expect(nav.reset).toHaveBeenCalledWith(TO_HANDOFF);
    expect(SuperwallExpoModule.dismiss).toHaveBeenCalledTimes(1);
    expect(nav.reset.mock.invocationCallOrder[0]).toBeLessThan(
      SuperwallExpoModule.dismiss.mock.invocationCallOrder[0],
    );
  });

  it('a dismiss that fails is reported, never thrown', async () => {
    SuperwallExpoModule.dismiss.mockRejectedValueOnce(new Error('no paywall'));
    openHandoffIfPending(container('Loading'));
    await Promise.resolve();
    await Promise.resolve();
    expect(sentryModule.reportError).toHaveBeenCalledWith(expect.any(Error), {
      context: 'handoff_dismiss_paywall',
    });
  });

  it.each(['Splash', 'Handoff'])('on %s → left alone; it reads the key itself', (route) => {
    const nav = container(route);
    openHandoffIfPending(nav);
    expect(nav.reset).not.toHaveBeenCalled();
  });

  it('navigation not ready (or not there) → nothing yet; onReady asks again', () => {
    const nav = container('Welcome', false);
    openHandoffIfPending(nav);
    openHandoffIfPending(null);
    expect(nav.reset).not.toHaveBeenCalled();
  });

  it('no key waiting → nothing', () => {
    useHandoffStore.setState({ pendingKey: null, pendingSource: null });
    const nav = container('Welcome');
    openHandoffIfPending(nav);
    expect(nav.reset).not.toHaveBeenCalled();
  });
});

describe('useHandoffLinks', () => {
  let urlListener: ((event: { url: string }) => void) | undefined;
  const remove = jest.fn();

  beforeEach(() => {
    remove.mockClear();
    jest.spyOn(Linking, 'getInitialURL').mockResolvedValue(null);
    jest.spyOn(Linking, 'addEventListener').mockImplementation(((
      _type: string,
      listener: (event: { url: string }) => void,
    ) => {
      urlListener = listener;
      return { remove };
    }) as unknown as typeof Linking.addEventListener);
  });

  it('a link tapped while the app runs → HandoffScreen, for as long as the app is mounted', async () => {
    const nav = container('Root');
    const { unmount } = await renderHook(() => useHandoffLinks({ current: nav }));
    urlListener!({ url: handoffLink() });
    expect(nav.reset).toHaveBeenCalledWith(TO_HANDOFF);
    await unmount();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});

describe('resetToWelcomeOnSignOut', () => {
  it('a sign-out while HandoffScreen switches accounts → no reset', () => {
    expect(resetToWelcomeOnSignOut(container('Handoff'))).toBe(false);
  });

  it('any other sign-out → Welcome, as before', () => {
    expect(resetToWelcomeOnSignOut(container('Root'))).toBe(true);
    expect(resetToWelcomeOnSignOut(null)).toBe(true);
  });
});
