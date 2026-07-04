import Constants from 'expo-constants';

// Known Supabase project refs. If a new environment (staging, per-branch
// previews, etc.) gets added, register it here so the whole app knows about
// it from a single source of truth. Fable review 🟡 — before this file
// existed, this regex + these constants were duplicated across supabase.ts,
// posthog.ts, and sentry.ts and started to drift.
const PROD_PROJECT_REF = 'zqwzdyjfxytvedghujsd';
const DEV_PROJECT_REF = 'xbkkjqvbsnroenqlqkmi';

export type Env = 'dev' | 'prod' | 'unknown';

/**
 * The Supabase project ref (subdomain of *.supabase.co) the app is currently
 * pointed at. Read from Constants.expoConfig.extra.supabaseUrl, which is
 * baked at build time from eas.json's env vars.
 */
export const projectRef: string | undefined = (
  Constants.expoConfig?.extra?.supabaseUrl as string | undefined
)?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

/**
 * Environment derived from the Supabase project ref. Used to tag PostHog
 * events, Sentry crashes, and Supabase guard logic so we can filter dev vs
 * prod in shared dashboards. Any env we don't recognize collapses to
 * 'unknown' — that's a signal something's misconfigured, not a fallback we
 * want to silently normalize.
 */
export const env: Env =
  projectRef === PROD_PROJECT_REF ? 'prod'
  : projectRef === DEV_PROJECT_REF ? 'dev'
  : 'unknown';

/** True iff the app is talking to the production Supabase project. */
export const isProd = env === 'prod';
/** True iff the app is talking to the development Supabase project. */
export const isDev = env === 'dev';
