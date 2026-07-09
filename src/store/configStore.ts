import { create } from 'zustand';
import { fetchAppConfig, isBelowMinimumBuild } from '../lib/appConfig';

/**
 * The three states of the kill-switch (app_config) check:
 *
 *   - 'loading'      → the config fetch is still in flight. LoadingScreen
 *                      MUST NOT run the paywall gate yet. Two full-screen
 *                      presentations racing each other (kill-switch modal
 *                      + paywall) is the exact bug this store fixes
 *                      (SPEC-01 R5).
 *   - 'ok'           → config resolved and this build is supported. Safe to
 *                      run the gate.
 *   - 'force_update' → this build is below min_supported_*_build. The
 *                      ForceUpdateModal takes over; the gate must NEVER run.
 *
 * Single source of truth for both App.tsx (which renders the
 * ForceUpdateModal) and LoadingScreen (which gates runGate on this state),
 * so the two can no longer present concurrently.
 */
export type ConfigStatus = 'loading' | 'ok' | 'force_update';

interface ConfigState {
  status: ConfigStatus;
  // Guards against a second concurrent check (e.g. React 18 double-invoke of
  // effects in dev, or a remount). The first checkConfig() to run wins; later
  // calls no-op while one is in flight or after it has resolved.
  hasStarted: boolean;
  // Epoch ms of the last completed config check, or null if none yet. Used by
  // the foreground re-check (SPEC-07 R3) to decide whether the kill-switch
  // state is stale enough to re-fetch.
  lastCheckedAt: number | null;
  checkConfig: () => Promise<void>;
  // SPEC-07 R3: on app foreground, re-run the check if the last one was more
  // than RECHECK_INTERVAL_MS ago. Unlike checkConfig (cold-launch only), this
  // CAN move an already-'ok' resident app to 'force_update' — that's the whole
  // point: a long-lived app that never cold-launches would otherwise never see
  // a forced update.
  maybeRecheckConfig: () => Promise<void>;
}

// Matches appConfig.ts's existing fail-open philosophy: a Supabase outage or
// a slow network must never lock legit users out. If the fetch hasn't
// resolved within this window we resolve to 'ok' and let the user in; the
// kill-switch is a best-effort forced-upgrade, not a hard security boundary.
const CONFIG_FETCH_TIMEOUT_MS = 3000;

// SPEC-07 R3: only re-check on foreground if the last check is older than this.
// 6 hours — frequent enough to catch a forced-upgrade rollout within a day for
// a resident app, infrequent enough to be negligible network cost.
const RECHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

// Shared fetch+resolve with the 3s fail-open timeout. Returns the resolved
// status; never throws.
//
// SPEC-FIX-01 R1 minor #4: cancel the timeout when the fetch wins the race.
// Previously the setTimeout callback always fired 3s later and logged "fetch
// timed out after 3s — failing open to ok" EVEN WHEN the real fetch had
// already resolved the race — a confusing dev log claiming a timeout that
// never affected the result. Now the timer is cleared the moment `check`
// settles, so the timeout log only appears when the timeout genuinely won.
async function resolveConfigStatus(): Promise<ConfigStatus> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<ConfigStatus>((resolve) => {
    timeoutId = setTimeout(() => {
      if (__DEV__) console.log('[configStore] fetch timed out after 3s — failing open to ok');
      resolve('ok');
    }, CONFIG_FETCH_TIMEOUT_MS);
  });

  const check = (async (): Promise<ConfigStatus> => {
    const config = await fetchAppConfig();
    return isBelowMinimumBuild(config) ? 'force_update' : 'ok';
  })();

  try {
    return await Promise.race([check, timeout]);
  } catch (err) {
    // fetchAppConfig already swallows its own errors and returns defaults,
    // so this is belt-and-suspenders. Fail open.
    if (__DEV__) console.warn('[configStore] check threw — failing open to ok', err);
    return 'ok';
  } finally {
    // Cancel the pending timeout regardless of who won, so its callback can't
    // fire a spurious "timed out" log after the fetch already resolved.
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  status: 'loading',
  hasStarted: false,
  lastCheckedAt: null,

  checkConfig: async () => {
    if (get().hasStarted) return;
    set({ hasStarted: true });

    const resolved = await resolveConfigStatus();
    set({ lastCheckedAt: Date.now() });

    // If the timeout won the race and resolved us to 'ok', the real fetch may
    // still finish later. We intentionally do NOT flip to force_update after
    // the fact: forcing an update on a user who has already been let into the
    // app mid-session would be a jarring surprise. The next cold launch will
    // re-check and enforce it. So only advance out of 'loading' once.
    if (get().status === 'loading') {
      if (__DEV__) console.log('[configStore] resolved:', resolved);
      set({ status: resolved });
    }
  },

  maybeRecheckConfig: async () => {
    // SPEC-FIX-01 R1 minor #4: in-flight guard. The AppState 'active' listener
    // can fire back-to-back (e.g. rapid background/foreground toggles), which
    // could launch overlapping rechecks racing to set status. Bail if one is
    // already running.
    if (recheckInFlight) {
      if (__DEV__) console.log('[configStore] foreground re-check skipped — one already in flight');
      return;
    }

    const { lastCheckedAt } = get();
    const age = lastCheckedAt === null ? Infinity : Date.now() - lastCheckedAt;
    if (age < RECHECK_INTERVAL_MS) {
      if (__DEV__) console.log(`[configStore] foreground re-check skipped — last check ${Math.round(age / 1000)}s ago (< 6h)`);
      return;
    }

    recheckInFlight = true;
    try {
      if (__DEV__) console.log('[configStore] foreground re-check — last check > 6h ago, re-fetching app_config');
      const resolved = await resolveConfigStatus();
      set({ lastCheckedAt: Date.now() });

      // On foreground we DO enforce a newly-required update on a resident app
      // (unlike the cold-launch guard above) — that's the point of R3. We never
      // downgrade force_update back to ok mid-session, though: once we've told a
      // user to update, keep the modal until they actually relaunch on a good
      // build.
      if (resolved === 'force_update' && get().status !== 'force_update') {
        if (__DEV__) console.log('[configStore] foreground re-check → force_update now required');
        set({ status: 'force_update' });
      }
    } finally {
      recheckInFlight = false;
    }
  },
}));

// Module-level in-flight guard for maybeRecheckConfig (transient; doesn't need
// to be store state / trigger renders).
let recheckInFlight = false;
