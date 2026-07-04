import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

// Derive environment from Supabase URL (same pattern as PostHog — single
// Sentry project, filter by `environment` tag in the Sentry dashboard).
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string | undefined;
const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const environment: 'dev' | 'prod' | 'unknown' =
  projectRef === 'zqwzdyjfxytvedghujsd' ? 'prod'
    : projectRef === 'xbkkjqvbsnroenqlqkmi' ? 'dev'
      : 'unknown';

const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;
const isSentryConfigured = Boolean(dsn && dsn.startsWith('https://'));

const release = `kinderwell@${Constants.expoConfig?.version ?? 'unknown'}`;
// dist separates identical release names across builds — without it, dev
// build 9 and prod build 9 of 1.1.0 merge in Sentry's UI and stack traces
// resolve to the wrong sourcemap. Fable review #14. Read from app.json's
// ios.buildNumber (managed workflow; single source of truth for both
// platforms since Android's versionCode also lives there).
const iosBuild = Constants.expoConfig?.ios?.buildNumber;
const androidBuild = Constants.expoConfig?.android?.versionCode;
const dist = iosBuild ?? (androidBuild != null ? String(androidBuild) : undefined);

/**
 * Initialize Sentry. Safe to call once at app startup. If DSN is missing or
 * malformed, Sentry stays disabled — the app still runs, just without crash
 * reporting (matches how PostHog degrades gracefully).
 *
 * Env-derived tags:
 *   environment: 'dev' | 'prod' | 'unknown'  (from Supabase URL)
 *   release: 'kinderwell@<version>'          (from app.json)
 *   dist: '<build number>'                   (from app.json)
 *
 * Filter Sentry dashboards by `environment` to see only prod errors. Sentry
 * automatically pairs release + dist to resolve the right sourcemap.
 */
export function initSentry(): void {
  if (!isSentryConfigured) {
    if (__DEV__) console.warn('[Sentry] DSN not configured, error reporting disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    dist,
    // In dev, keep sending events to Sentry so we can test wiring. In prod,
    // this is always true anyway. If we ever want to silence dev, flip here.
    enabled: true,
    // Debug logs from Sentry SDK itself — only in dev.
    debug: __DEV__,
    // Sample rate. 1.0 = capture every error. Fine for our volume.
    sampleRate: 1.0,
    // Performance monitoring off for now (would count against tracing quota).
    tracesSampleRate: 0,
    // Attach stack traces to messages (helps when we call captureMessage).
    attachStacktrace: true,
    // Strip common PII (IP addresses) — we don't need it and it's cleaner
    // for GDPR / privacy manifest alignment.
    sendDefaultPii: false,
  });

  if (__DEV__) console.log(`[Sentry] initialized (env=${environment}, release=${release})`);
}

/**
 * Safe wrapper around Sentry.captureException that never throws. Same pattern
 * as safeCapture in analytics.ts — error-reporting must not crash the app.
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  try {
    if (!isSentryConfigured) return;
    const err = error instanceof Error ? error : new Error(String(error));
    Sentry.captureException(err, { extra: context });
  } catch (err) {
    if (__DEV__) console.warn('[Sentry] reportError failed:', err);
  }
}

export const isSentryEnabled = isSentryConfigured;
export const sentryEnvironment = environment;
