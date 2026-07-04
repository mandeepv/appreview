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
