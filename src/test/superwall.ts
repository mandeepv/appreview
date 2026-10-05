// A controllable fake of expo-superwall (SPEC-20 R2).
//
// Mirrors the real SDK where tests depend on it (checked against
// node_modules/expo-superwall/build/src, v1.1.6):
//
// - usePlacement / useSuperwallEvents always call the callbacks from the
//   LATEST render — the real hooks keep them in a ref (`callbacksRef.current =
//   callbacks` every render). So `superwall.placement` and `superwall.events`
//   are overwritten on each render, and a test firing them sees exactly the
//   closures the real SDK would call, stale-closure bugs included.
// - The real registerPlacement promise resolves only when access is granted
//   (purchase, non-gated dismiss, skip) and NEVER on a paywall error; while
//   a gated paywall is up it just stays pending. The fake resolves at once
//   by default; use hangRegisterPlacement() to model a presented paywall.

import type { ReactNode } from 'react';

type Callback = (...args: any[]) => unknown;

export const superwall = {
  /** The usePlacement callbacks from the latest render. */
  placement: {} as Partial<Record<'onPresent' | 'onDismiss' | 'onSkip' | 'onError', Callback>>,
  /** Handlers passed to useSuperwallEvents, merged across hook calls (latest render wins). */
  events: {} as Record<string, Callback>,
  registerPlacement: jest.fn((_args: { placement: string; params?: unknown }) => Promise.resolve()),
  identify: jest.fn((_userId: string) => Promise.resolve()),
  dismiss: jest.fn(() => Promise.resolve()),
};

export const SuperwallExpoModule = {
  reset: jest.fn(() => Promise.resolve()),
  restorePurchases: jest.fn(() => Promise.resolve({ result: 'restored' as string, errorMessage: null as string | null })),
  getSubscriptionStatus: jest.fn(() => Promise.resolve({ status: 'INACTIVE' as string })),
  identify: jest.fn(() => Promise.resolve()),
};

export const superwallModule = {
  usePlacement: (callbacks: typeof superwall.placement = {}) => {
    superwall.placement = callbacks;
    return { registerPlacement: superwall.registerPlacement, state: { status: 'idle' } };
  },
  useUser: () => ({
    identify: superwall.identify,
    user: null,
    subscriptionStatus: { status: 'UNKNOWN' },
  }),
  useSuperwall: (selector?: (state: { dismiss: Callback }) => unknown) => {
    const state = { dismiss: superwall.dismiss };
    return selector ? selector(state) : state;
  },
  useSuperwallEvents: (handlers: Record<string, Callback> = {}) => {
    Object.assign(superwall.events, handlers);
  },
  SuperwallProvider: ({ children }: { children: ReactNode }) => children,
  SuperwallExpoModule,
};

/** Make registerPlacement stay pending, as it does while a gated paywall is up. */
export function hangRegisterPlacement(): void {
  superwall.registerPlacement.mockImplementation(() => new Promise<void>(() => {}));
}

export function resetSuperwallFake(): void {
  superwall.placement = {};
  superwall.events = {};
  for (const fn of [superwall.registerPlacement, superwall.identify, superwall.dismiss]) fn.mockReset();
  superwall.registerPlacement.mockImplementation(() => Promise.resolve());
  superwall.identify.mockImplementation(() => Promise.resolve());
  superwall.dismiss.mockImplementation(() => Promise.resolve());
  for (const fn of Object.values(SuperwallExpoModule)) fn.mockReset();
  SuperwallExpoModule.reset.mockImplementation(() => Promise.resolve());
  SuperwallExpoModule.restorePurchases.mockImplementation(() =>
    Promise.resolve({ result: 'restored', errorMessage: null }),
  );
  SuperwallExpoModule.getSubscriptionStatus.mockImplementation(() =>
    Promise.resolve({ status: 'INACTIVE' }),
  );
  SuperwallExpoModule.identify.mockImplementation(() => Promise.resolve());
}
