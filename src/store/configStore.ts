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
  checkConfig: () => Promise<void>;
}

// Matches appConfig.ts's existing fail-open philosophy: a Supabase outage or
// a slow network must never lock legit users out. If the fetch hasn't
// resolved within this window we resolve to 'ok' and let the user in; the
// kill-switch is a best-effort forced-upgrade, not a hard security boundary.
const CONFIG_FETCH_TIMEOUT_MS = 3000;

export const useConfigStore = create<ConfigState>((set, get) => ({
  status: 'loading',
  hasStarted: false,

  checkConfig: async () => {
    if (get().hasStarted) return;
    set({ hasStarted: true });

    // Race the real fetch against a 3s timeout. Whichever settles first wins.
    // The timeout resolves to 'ok' (fail-open) — same policy as
    // fetchAppConfig()/isBelowMinimumBuild(), which already default to
    // "not required" on any error (see appConfig.ts comments).
    const timeout = new Promise<ConfigStatus>((resolve) => {
      setTimeout(() => {
        if (__DEV__) console.log('[configStore] fetch timed out after 3s — failing open to ok');
        resolve('ok');
      }, CONFIG_FETCH_TIMEOUT_MS);
    });

    const check = (async (): Promise<ConfigStatus> => {
      const config = await fetchAppConfig();
      return isBelowMinimumBuild(config) ? 'force_update' : 'ok';
    })();

    let resolved: ConfigStatus;
    try {
      resolved = await Promise.race([check, timeout]);
    } catch (err) {
      // fetchAppConfig already swallows its own errors and returns defaults,
      // so this is belt-and-suspenders. Fail open.
      if (__DEV__) console.warn('[configStore] check threw — failing open to ok', err);
      resolved = 'ok';
    }

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
}));
