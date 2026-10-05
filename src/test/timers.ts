// Fake-time helper for screen tests (SPEC-20 R2).
//
// Advance fake time in 50 ms steps, letting React render between steps. One
// long act() holds every re-render until it ends, so an interval started by
// an effect (LoadingScreen's retry loop) or a timer scheduled from a state
// update (its theatre's hand-off to the gate) would not exist until the very
// end — not how the app behaves, where React renders as each timer fires.
// Callers must have called jest.useFakeTimers().

import { act } from '@testing-library/react-native';

export async function advance(ms: number, step = 50): Promise<void> {
  let remaining = ms;
  do {
    const chunk = Math.min(step, remaining);
    await act(() => jest.advanceTimersByTimeAsync(chunk));
    remaining -= chunk;
  } while (remaining > 0);
}
