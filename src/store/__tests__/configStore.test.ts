// SPEC-20 R6 — the kill-switch store. LoadingScreen won't run the paywall
// gate until this leaves 'loading', and never runs it on 'force_update', so
// the timing rules here decide whether a launch can hang or two full-screen
// takeovers can collide (SPEC-01 R5). INVARIANTS #18: the check always fails
// OPEN — a slow, broken or missing config never blocks a user.
//
// appConfig (the fetch and the build comparison) is mocked: it has its own
// tests, and here we need to control WHEN the fetch settles.

import { useConfigStore } from '../configStore';
import { fetchAppConfig, isBelowMinimumBuild } from '../../lib/appConfig';
import { seedConfigStore } from '../../test/stores';

jest.mock('../../lib/appConfig', () => ({
  fetchAppConfig: jest.fn(),
  isBelowMinimumBuild: jest.fn(),
}));

const fetchConfig = fetchAppConfig as jest.Mock;
const belowMinimum = isBelowMinimumBuild as jest.Mock;

const HOUR = 60 * 60 * 1000;
const OK = { force: false };
const FORCE = { force: true };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

const status = () => useConfigStore.getState().status;

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-10-05T12:00:00Z'));
  fetchConfig.mockReset();
  belowMinimum.mockReset();
  belowMinimum.mockImplementation((config: { force: boolean }) => config.force);
  // A cold launch: nothing checked yet.
  seedConfigStore({ status: 'loading', hasStarted: false, lastCheckedAt: null });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('checkConfig — the cold-launch check', () => {
  it('a supported build → ok', async () => {
    fetchConfig.mockResolvedValue(OK);
    await useConfigStore.getState().checkConfig();
    expect(status()).toBe('ok');
    expect(useConfigStore.getState().lastCheckedAt).toBe(Date.now());
  });

  it('a build below the minimum → force_update', async () => {
    fetchConfig.mockResolvedValue(FORCE);
    await useConfigStore.getState().checkConfig();
    expect(status()).toBe('force_update');
  });

  it('a fetch that never answers → ok after 3 s (fail open), and not before', async () => {
    fetchConfig.mockReturnValue(new Promise(() => {}));
    const check = useConfigStore.getState().checkConfig();

    await jest.advanceTimersByTimeAsync(2999);
    expect(status()).toBe('loading');

    await jest.advanceTimersByTimeAsync(1);
    await check;
    expect(status()).toBe('ok');
  });

  it('a fetch that throws → ok (fail open)', async () => {
    fetchConfig.mockRejectedValue(new Error('network down'));
    await useConfigStore.getState().checkConfig();
    expect(status()).toBe('ok');
  });

  // A user let in on the timeout is mid-session by the time a slow answer
  // lands; forcing an update on them then would be a jarring surprise. The
  // next cold launch enforces it.
  it('an answer that arrives after the timeout never flips the launch to force_update', async () => {
    const late = deferred<typeof FORCE>();
    fetchConfig.mockReturnValue(late.promise);
    const check = useConfigStore.getState().checkConfig();
    await jest.advanceTimersByTimeAsync(3000);
    await check;
    expect(status()).toBe('ok');

    late.resolve(FORCE);
    await jest.advanceTimersByTimeAsync(0);
    expect(status()).toBe('ok');
  });

  it('runs once, however many times it is called', async () => {
    fetchConfig.mockResolvedValue(OK);
    await Promise.all([useConfigStore.getState().checkConfig(), useConfigStore.getState().checkConfig()]);
    await useConfigStore.getState().checkConfig();
    expect(fetchConfig).toHaveBeenCalledTimes(1);
  });
});

describe('maybeRecheckConfig — the foreground re-check (SPEC-07 R3)', () => {
  it('within 6 hours of the last check → no fetch', async () => {
    seedConfigStore({ status: 'ok', lastCheckedAt: Date.now() - 5 * HOUR });
    await useConfigStore.getState().maybeRecheckConfig();
    expect(fetchConfig).not.toHaveBeenCalled();
  });

  it('after 6 hours → re-fetches, and a newly required update takes over', async () => {
    seedConfigStore({ status: 'ok', lastCheckedAt: Date.now() - 7 * HOUR });
    fetchConfig.mockResolvedValue(FORCE);
    await useConfigStore.getState().maybeRecheckConfig();
    expect(status()).toBe('force_update');
  });

  it('never checked → re-fetches', async () => {
    seedConfigStore({ status: 'ok', lastCheckedAt: null });
    fetchConfig.mockResolvedValue(OK);
    await useConfigStore.getState().maybeRecheckConfig();
    expect(fetchConfig).toHaveBeenCalledTimes(1);
    expect(status()).toBe('ok');
  });

  // Once told to update, the modal stays until they relaunch on a good build.
  it('never downgrades force_update back to ok mid-session', async () => {
    seedConfigStore({ status: 'force_update', lastCheckedAt: Date.now() - 7 * HOUR });
    fetchConfig.mockResolvedValue(OK);
    await useConfigStore.getState().maybeRecheckConfig();
    expect(status()).toBe('force_update');
  });

  it('back-to-back foreground events → one fetch, not overlapping ones', async () => {
    seedConfigStore({ status: 'ok', lastCheckedAt: Date.now() - 7 * HOUR });
    const slow = deferred<typeof OK>();
    fetchConfig.mockReturnValue(slow.promise);

    const first = useConfigStore.getState().maybeRecheckConfig();
    const second = useConfigStore.getState().maybeRecheckConfig();
    slow.resolve(OK);
    await Promise.all([first, second]);

    expect(fetchConfig).toHaveBeenCalledTimes(1);
  });
});
