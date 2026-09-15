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

/**
 * SESSION REPLAY — wired, masked, and OFF until three owner actions are done.
 *
 * WHAT IT IS. PostHog's React Native replay is SCREENSHOT-based ("The React
 * Native and Flutter SDKs always record in screenshot mode. Currently, this is
 * not configurable." — PostHog docs). Frames are played back as video, so this
 * is a screen recording of the app in a parent's hands, not an event stream.
 *
 * WHY THE FLAG BELOW IS FALSE. Three things must happen first, and all three
 * are owner-only:
 *
 *   1. CONSENT. App Review guideline 2.5.14: "Apps must request explicit user
 *      consent and provide a clear visual and/or audible indication when
 *      recording, logging, or otherwise making a record of user activity. This
 *      includes ... screen recordings". 5.1.1(ii) repeats it for usage data
 *      "even if such data is considered to be anonymous."
 *   2. PRIVACY POLICY. 5.1.1(i)/5.1.2 require disclosing the recording and
 *      naming PostHog as a recipient. `legal/` is owner-only (CLAUDE.md).
 *   3. APP PRIVACY LABEL. Name is currently declared AppFunctionality /
 *      Personalization, not Analytics (see app.config.js privacyManifests).
 *
 * Enabling this without them risks rejection of a LIVE app, so the switch is
 * deliberately a code change someone has to make on purpose — not a dashboard
 * toggle that could be flipped without the rest.
 *
 * NOTE: the PostHog dashboard toggle is a SECOND, independent switch. Both must
 * be on for anything to record; either one off means no capture.
 *
 * MASKING. PostHog's defaults are restrictive and we keep them: every text
 * input and every image is masked. Concretely, the parent's typed NAME is
 * masked (it is a TextInput), as are any images. Their tapped ANSWERS remain
 * visible — those are buttons, not inputs — which is the point of watching a
 * replay at all. Tightening further is done per-component at the call site,
 * not by loosening these.
 */
const ENABLE_SESSION_REPLAY = false

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  enableSessionReplay: ENABLE_SESSION_REPLAY,
  sessionReplayConfig: {
    // Masks the name field on NameAgeScreen, and any future free-text input.
    maskAllTextInputs: true,
    maskAllImages: true,
    // Console logs and network metadata are the two channels most likely to
    // carry an email or a token into a replay by accident. Off until someone
    // has a specific reason and has checked what they contain.
    captureLog: false,
    captureNetworkTelemetry: false,
  },
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
