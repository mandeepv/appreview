/* eslint-disable import/first -- jest.mock() must be hoisted above imports;
   the mocks below intentionally precede the module-under-test imports. */
// SPEC-15 R6 — experiments accessor tests.
//
// Mock boundary: we stub the two collaborators experiments.ts imports —
// `src/config/posthog` (getFeatureFlag / register) and
// `@react-native-async-storage/async-storage` (the sticky store). analytics.ts
// is real but harmless here (its posthog is the same mocked instance). The
// module under test (experiments.ts) is NOT mocked.

// In-memory AsyncStorage — a plain Map so each test controls the persisted
// assignment precisely and we can assert what got written.
const mockAsyncStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn((k: string) => Promise.resolve(mockAsyncStore.has(k) ? mockAsyncStore.get(k)! : null)),
    setItem: jest.fn((k: string, v: string) => {
      mockAsyncStore.set(k, v);
      return Promise.resolve();
    }),
    removeItem: jest.fn((k: string) => {
      mockAsyncStore.delete(k);
      return Promise.resolve();
    }),
  },
}));

// The flag value is set per test via mockFlag.value. experiments.ts now fetches
// FRESH via reloadFeatureFlagsAsync() (returns the flag map) and reads our key
// from it, with getFeatureFlag as the backing fallback — so the mock models
// reloadFeatureFlagsAsync as the primary source. `throws`/`hangs` simulate a
// failed / never-resolving network fetch.
const FLAG_KEY = 'onboarding-flow';
// Prefixed `mock*` so jest allows referencing it inside the hoisted factory.
const mockFlag: { value: unknown; throws: boolean; hangs: boolean } = {
  value: undefined,
  throws: false,
  hangs: false,
};
jest.mock('../../config/posthog', () => ({
  posthog: {
    reloadFeatureFlagsAsync: jest.fn(() => {
      if (mockFlag.throws) return Promise.reject(new Error('flag boom'));
      if (mockFlag.hangs) return new Promise(() => {}); // never resolves
      // Undefined value = flag absent from the response (SDK returns the map
      // without our key, or undefined). Model "present with value" vs "absent".
      if (mockFlag.value === undefined) return Promise.resolve(undefined);
      return Promise.resolve({ 'onboarding-flow': mockFlag.value });
    }),
    getFeatureFlag: jest.fn(() => {
      if (mockFlag.throws) throw new Error('flag boom');
      if (mockFlag.hangs) return new Promise(() => {}); // never resolves
      return mockFlag.value;
    }),
    capture: jest.fn(),
    register: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    screen: jest.fn(),
  },
  resetPostHog: jest.fn(),
  isPostHogEnabled: false,
  posthogEnvironment: 'dev',
}));

import {
  resolveOnboardingVariant,
  peekOnboardingVariant,
  warmOnboardingFlag,
  hydrateOnboardingVariant,
  clearOnboardingVariant,
} from '../experiments';
import { posthog } from '../../config/posthog';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const KEY = STORAGE_KEYS.ONBOARDING_VARIANT;
const mockCapture = posthog.capture as jest.Mock;
const mockRegister = posthog.register as jest.Mock;

beforeEach(() => {
  mockAsyncStore.clear();
  mockFlag.value = undefined;
  mockFlag.throws = false;
  mockFlag.hangs = false;
  jest.clearAllMocks();
});

describe('resolveOnboardingVariant — flag mapping', () => {
  it("flag 'variant_b' → variant_b (and persists it)", async () => {
    mockFlag.value = 'variant_b';
    await expect(resolveOnboardingVariant()).resolves.toBe('variant_b');
    expect(mockAsyncStore.get(KEY)).toBe('variant_b');
  });

  it("flag 'control' → control", async () => {
    mockFlag.value = 'control';
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
    expect(mockAsyncStore.get(KEY)).toBe('control');
  });

  it('flag undefined → control', async () => {
    mockFlag.value = undefined;
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
  });

  it('flag false → control', async () => {
    mockFlag.value = false;
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
  });

  it('flag unknown/garbage string → control', async () => {
    mockFlag.value = 'variant_z_typo';
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
  });

  it('reloadFeatureFlagsAsync throws → control (never propagates)', async () => {
    mockFlag.throws = true;
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
  });

  it('reads the FRESH server value, not the stale sync cache (regression: bootstrap bug)', async () => {
    // The bug: on a cold/fresh start getFeatureFlag() returns an empty cached
    // (bootstrap) value BEFORE the server fetch lands, so a 100% variant_b
    // rollout still resolved to control. Model that: the sync getFeatureFlag is
    // empty, but the fresh reloadFeatureFlagsAsync delivers variant_b. We must
    // resolve variant_b — proving we read the fresh fetch, not the stale cache.
    (posthog.getFeatureFlag as jest.Mock).mockReturnValueOnce(undefined);
    (posthog.reloadFeatureFlagsAsync as jest.Mock).mockResolvedValueOnce({
      [FLAG_KEY]: 'variant_b',
    });
    await expect(resolveOnboardingVariant()).resolves.toBe('variant_b');
    expect(mockAsyncStore.get(KEY)).toBe('variant_b');
  });

  it('getFeatureFlag hangs → control via timeout (does not block forever)', async () => {
    jest.useFakeTimers();
    mockFlag.hangs = true;
    const p = resolveOnboardingVariant();
    // Advance past the 2s internal timeout.
    await jest.advanceTimersByTimeAsync(2100);
    await expect(p).resolves.toBe('control');
    jest.useRealTimers();
  });
});

describe('resolveOnboardingVariant — stickiness', () => {
  it('persisted value wins over a changed flag', async () => {
    mockAsyncStore.set(KEY, 'variant_b');
    mockFlag.value = 'control'; // server flipped, but persisted should win
    await expect(resolveOnboardingVariant()).resolves.toBe('variant_b');
    // The server flag must not even be fetched when a value is persisted.
    expect(posthog.reloadFeatureFlagsAsync).not.toHaveBeenCalled();
    expect(posthog.getFeatureFlag).not.toHaveBeenCalled();
  });

  it('a persisted control also wins over a variant_b flag', async () => {
    mockAsyncStore.set(KEY, 'control');
    mockFlag.value = 'variant_b';
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
    expect(posthog.reloadFeatureFlagsAsync).not.toHaveBeenCalled();
    expect(posthog.getFeatureFlag).not.toHaveBeenCalled();
  });
});

describe('resolveOnboardingVariant — assignment event fires once', () => {
  it('fires onboarding_variant_assigned exactly once, then not again', async () => {
    mockFlag.value = 'variant_b';
    await resolveOnboardingVariant();
    const assignEvents = mockCapture.mock.calls.filter(
      (c) => c[0] === 'onboarding_variant_assigned',
    );
    expect(assignEvents).toHaveLength(1);
    expect(assignEvents[0][1]).toEqual({ variant: 'variant_b', source: 'flag' });

    // Second resolve reads the persisted value — no new assignment event.
    mockCapture.mockClear();
    await resolveOnboardingVariant();
    expect(
      mockCapture.mock.calls.filter((c) => c[0] === 'onboarding_variant_assigned'),
    ).toHaveLength(0);
  });

  it("source is 'fallback' when the flag did not resolve", async () => {
    mockFlag.value = undefined;
    await resolveOnboardingVariant();
    const assign = mockCapture.mock.calls.find((c) => c[0] === 'onboarding_variant_assigned');
    expect(assign?.[1]).toEqual({ variant: 'control', source: 'fallback' });
  });

  it('registers the variant super-property on fresh assignment', async () => {
    mockFlag.value = 'variant_b';
    await resolveOnboardingVariant();
    expect(mockRegister).toHaveBeenCalledWith({ onboarding_variant: 'variant_b' });
  });
});

describe('clear + fresh resolve', () => {
  it('clears the storage key only, then re-resolves fresh from the flag', async () => {
    mockFlag.value = 'variant_b';
    await resolveOnboardingVariant();
    expect(mockAsyncStore.get(KEY)).toBe('variant_b');

    await clearOnboardingVariant();
    expect(mockAsyncStore.has(KEY)).toBe(false);

    // A fresh resolve now consults the flag again (server flipped to control).
    mockFlag.value = 'control';
    await expect(resolveOnboardingVariant()).resolves.toBe('control');
    expect(mockAsyncStore.get(KEY)).toBe('control');
  });
});

describe('hydrateOnboardingVariant', () => {
  it('re-registers the super-property when an assignment is persisted', async () => {
    mockAsyncStore.set(KEY, 'variant_b');
    await hydrateOnboardingVariant();
    expect(mockRegister).toHaveBeenCalledWith({ onboarding_variant: 'variant_b' });
  });

  it('does nothing when no assignment is persisted', async () => {
    await hydrateOnboardingVariant();
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

// SPEC-FIX-11 R4 — assignment hygiene: peek and warm never create an assignment.
describe('peekOnboardingVariant — read-only, never assigns', () => {
  it('returns the persisted variant without persisting/firing/registering', async () => {
    mockAsyncStore.set(KEY, 'variant_b');
    await expect(peekOnboardingVariant()).resolves.toBe('variant_b');
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('returns null when no assignment exists — and writes nothing', async () => {
    await expect(peekOnboardingVariant()).resolves.toBeNull();
    expect(mockAsyncStore.has(KEY)).toBe(false);
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('never consults the flag (a hung flag does not matter)', async () => {
    mockFlag.hangs = true;
    await expect(peekOnboardingVariant()).resolves.toBeNull();
    // getFeatureFlag must not have been called at all.
    expect((posthog.getFeatureFlag as jest.Mock)).not.toHaveBeenCalled();
  });
});

describe('warmOnboardingFlag — warms cache, never assigns', () => {
  it('fetches fresh flags but never persists / fires / registers', async () => {
    mockFlag.value = 'variant_b';
    warmOnboardingFlag();
    // Let the fire-and-forget promise settle.
    await new Promise((r) => setImmediate(r));
    // Warming now kicks a real server fetch (reloadFeatureFlagsAsync) rather
    // than reading the sync cache, so the later resolve rarely hits the timeout.
    expect((posthog.reloadFeatureFlagsAsync as jest.Mock)).toHaveBeenCalled();
    expect(mockAsyncStore.has(KEY)).toBe(false); // no assignment persisted
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('a throwing flag never propagates out of warm', async () => {
    mockFlag.throws = true;
    expect(() => warmOnboardingFlag()).not.toThrow();
    await new Promise((r) => setImmediate(r));
    expect(mockAsyncStore.has(KEY)).toBe(false);
  });
});

describe('assignment happens ONLY on resolve (Get Started), not on peek/warm', () => {
  it('resolve is the sole persist+event point', async () => {
    mockFlag.value = 'variant_b';
    // Peek + warm first — neither should assign.
    await peekOnboardingVariant();
    warmOnboardingFlag();
    await new Promise((r) => setImmediate(r));
    expect(mockAsyncStore.has(KEY)).toBe(false);
    expect(mockCapture).not.toHaveBeenCalled();

    // Now resolve (the Get Started path) — THIS assigns.
    await resolveOnboardingVariant();
    expect(mockAsyncStore.get(KEY)).toBe('variant_b');
    expect(mockCapture).toHaveBeenCalledWith('onboarding_variant_assigned', expect.any(Object));
  });
});
