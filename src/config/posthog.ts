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
/**
 * ON IN DEV, OFF IN PROD — testing state as of 2026-09-15.
 *
 * Deliberately NOT a plain `true`. The PostHog project is SHARED between dev
 * and prod, so an unconditional flag plus the dashboard toggle would start
 * recording live App Store users — before the consent flow, the privacy-policy
 * update and the App Privacy label change above exist. Those users have agreed
 * to none of it.
 *
 * Binding it to `environment` means the prod binary cannot record no matter
 * what the dashboard says. Flip THIS line (to a plain true) only once the three
 * owner items are done; until then dev is the only thing that captures.
 *
 * `environment` comes from the Supabase project ref baked in at build time, so
 * this is decided by which backend the build points at, not by __DEV__.
 */
const ENABLE_SESSION_REPLAY = environment === 'dev'

export const posthog = new PostHog(apiKey || 'placeholder_key', {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  enableSessionReplay: ENABLE_SESSION_REPLAY,
  sessionReplayConfig: {
    // Masks the name field on NameAgeScreen, and any future free-text input.
    maskAllTextInputs: true,
    maskAllImages: true,
    // On, because a replay without them is just a silent film: the console
    // trail and request timings are what turn "they tapped here and left"
    // into a reason. The masking above is the PII control, not these.
    //
    // The one thing to watch: these are the channels that could carry a token
    // or an email into a replay if something ever logs one. Nothing does today
    // (errors go to Sentry via reportError, and analytics events are typed),
    // so the rule to keep is the existing one — never console.log a token or
    // an email — rather than blinding the replay.
    captureLog: true,
    captureNetworkTelemetry: true,
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
