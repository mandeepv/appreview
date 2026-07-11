// SPEC-16 R1: splash dwell/routing gate, extracted pure so it's unit-testable
// without rendering (R5).
//
// The old SplashScreen routed on a hardcoded `setTimeout(..., 2000)` — a flat
// 2s every launch regardless of whether auth had hydrated. We replace that with
// "route as soon as BOTH conditions hold": (1) auth hydration finished
// (`isLoading === false`, so we know whether there's a signed-in user before we
// pick a destination) AND (2) a minimum brand-moment dwell has elapsed (so a
// fast hydration doesn't flash the splash for a single frame). This makes a
// warm launch faster than 2s while keeping the splash from blinking.

// Minimum time the splash stays up as a deliberate brand moment, even if auth
// hydrates instantly. Down from the old fixed 2000ms (SPEC-16 §8 decision 3).
export const SPLASH_MIN_DWELL_MS = 800;

/**
 * Should the splash route yet? True only once auth has hydrated AND the minimum
 * dwell has elapsed. Pure — the screen wires real timers/state to it.
 */
export const shouldRouteFromSplash = (authHydrated: boolean, minDwellElapsed: boolean): boolean =>
  authHydrated && minDwellElapsed;
