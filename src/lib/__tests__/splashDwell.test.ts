// SPEC-16 R5 — splash dwell/routing gate.

import { shouldRouteFromSplash, SPLASH_MIN_DWELL_MS } from '../splashDwell';

describe('shouldRouteFromSplash', () => {
  it('does not route until auth has hydrated', () => {
    expect(shouldRouteFromSplash(false, true)).toBe(false);
  });

  it('does not route until the minimum dwell has elapsed', () => {
    expect(shouldRouteFromSplash(true, false)).toBe(false);
  });

  it('does not route when neither condition holds', () => {
    expect(shouldRouteFromSplash(false, false)).toBe(false);
  });

  it('routes only once BOTH auth-hydrated and dwell-elapsed are true', () => {
    expect(shouldRouteFromSplash(true, true)).toBe(true);
  });
});

describe('SPLASH_MIN_DWELL_MS', () => {
  it('is shorter than the old fixed 2000ms delay (faster warm launch)', () => {
    expect(SPLASH_MIN_DWELL_MS).toBeLessThan(2000);
    expect(SPLASH_MIN_DWELL_MS).toBeGreaterThan(0);
  });
});
