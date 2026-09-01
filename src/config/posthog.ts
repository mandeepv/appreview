import PostHog from 'posthog-react-native'
import Constants from 'expo-constants'
import { env as environment } from '../lib/env'

const apiKey = Constants.expoConfig?.extra?.posthogProjectToken as string | undefined
const host = (Constants.expoConfig?.extra?.posthogHost as string) || 'https://us.i.posthog.com'
const isPostHogConfigured = apiKey && apiKey !== 'phc_your_project_token_here'

// `environment` is imported from ../lib/env — single source of truth for
// dev/prod detection (Fable review 🟡, previously duplicated in posthog.ts /
// sentry.ts / supabase.ts). Every PostHog event will be tagged with this so
// we can filter dev vs prod in the shared PostHog project.

if (!isPostHogConfigured) {
  console.warn(
    'PostHog project token not configured. Analytics will be disabled. ' +
      'Set POSTHOG_PROJECT_TOKEN in your .env file to enable analytics.'
  )
}

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  sendFeatureFlagEvent: true,
  featureFlagsRequestTimeoutMs: 10000,
  requestTimeout: 10000,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
  // Session replay. RN records in SCREENSHOT mode (it photographs the screen),
  // so masking is a PII decision, not just cosmetic — see docs/INVARIANTS.md
  // (no name/child data to PostHog) and OPS_STATE (dashboard toggle owner-run).
  //
  // NOTE: enabling here is necessary but NOT sufficient — replay ALSO has to be
  // turned on in PostHog project settings (owner-only dashboard action). Until
  // that toggle is flipped, this records nothing. So shipping this code is safe:
  // it can't leak anything until the owner explicitly enables it server-side.
  //
  // Masking posture (defense-in-depth): text inputs masked globally, plus the
  // specific name / child-age / snapshot views are wrapped in <PostHogMaskView>
  // (see those screens) so the personalization PII is never captured as pixels
  // even though most of the flow stays visible. maskAllImages stays FALSE so
  // illustrations/icons remain visible; maskAllSandboxedViews masks Superwall's
  // native paywall UI (nothing to learn there, and it's third-party surface).
  enableSessionReplay: true,
  sessionReplayConfig: {
    maskAllTextInputs: true,
    maskAllImages: false,
    maskAllSandboxedViews: true,
    captureLog: true,
    captureNetworkTelemetry: false,
  },
})

// Register `environment` as a super-property so it's attached to EVERY event.
// Filter by this in PostHog dashboards to see only prod (or only dev) users.
posthog.register({ environment, app_env: environment })

if (__DEV__) {
  posthog.debug()
}

export const isPostHogEnabled = isPostHogConfigured
export const posthogEnvironment = environment

/**
 * Reset PostHog identity AND re-register the environment super-property.
 *
 * Raw `posthog.reset()` wipes ALL registered super-properties including our
 * `environment` / `app_env` tags — so post-logout events fire without an
 * env tag and silently vanish from env-filtered dashboards (Fable review #8).
 *
 * Every place that used to call `posthog.reset()` for logout / delete /
 * demo-user teardown should now call this instead. Grep enforces:
 *   grep -rn "posthog.reset()" src/  → should only match this file.
 */
export const resetPostHog = () => {
  posthog.reset()
  posthog.register({ environment, app_env: environment })
}
