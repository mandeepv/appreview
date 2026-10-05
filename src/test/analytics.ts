// Fakes for the analytics and error-reporting boundary (SPEC-20 R2).
//
// The app reaches PostHog through src/config/posthog and Sentry through
// src/config/sentry (plus a direct @sentry/react-native import in
// authService and App.tsx). setup.ts mocks all three with these objects, so
// every call is a jest.fn whose payload a test can read — and that the global
// PII guard in setup.ts scans after every test (INVARIANTS #8).
//
// The objects are shared for the whole test file. Call
// resetAnalyticsFakes() in a beforeEach when a test asserts on call counts.

export const posthog = {
  capture: jest.fn(),
  identify: jest.fn(),
  register: jest.fn(),
  reset: jest.fn(),
  screen: jest.fn(),
  flush: jest.fn(),
};

export const posthogModule = {
  posthog,
  resetPostHog: jest.fn(),
  isPostHogEnabled: false,
  posthogEnvironment: 'dev',
};

export const sentryModule = {
  initSentry: jest.fn(),
  reportError: jest.fn(),
  setSentryUser: jest.fn(),
  addGateBreadcrumb: jest.fn(),
  isSentryEnabled: false,
  sentryEnvironment: 'dev',
};

export const sentrySdk = {
  init: jest.fn(),
  setUser: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  wrap: <T>(component: T): T => component,
};

/** Every event name passed to safeCapture, in order. */
export function capturedEvents(): string[] {
  return posthog.capture.mock.calls.map((call) => call[0] as string);
}

/** The properties of the most recent capture of `event`, or undefined. */
export function lastCapture(event: string): Record<string, unknown> | undefined {
  const calls = posthog.capture.mock.calls.filter((call) => call[0] === event);
  return calls.length ? (calls[calls.length - 1][1] as Record<string, unknown>) : undefined;
}

export function resetAnalyticsFakes(): void {
  for (const group of [posthog, posthogModule, sentryModule, sentrySdk]) {
    for (const value of Object.values(group)) {
      if (jest.isMockFunction(value)) value.mockClear();
    }
  }
}
