import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { supabase } from './supabase';

interface AppConfigValues {
  minSupportedIosBuild: number;
  minSupportedAndroidBuild: number;
}

// Sensible defaults so app never crashes on config fetch failure.
const DEFAULT_CONFIG: AppConfigValues = {
  minSupportedIosBuild: 0,
  minSupportedAndroidBuild: 0,
};

/**
 * Reads the current build number of the actual RUNNING binary — NOT what
 * app.json says. On iOS this is CFBundleVersion baked into the shipped .ipa
 * at build time. On Android this is versionCode from the shipped .apk / .aab.
 *
 * Why not Constants.expoConfig.ios.buildNumber: that reads from app.json,
 * which can silently drift from what actually shipped (we've hit this drift
 * before — see docs/VERSION_MANAGEMENT.md). The kill switch has to compare
 * against what the user actually has on their phone, not what the spec says.
 */
export function getCurrentBuildNumber(): number {
  const raw = Application.nativeBuildVersion;
  if (!raw) return 0;
  // SPEC-FIX-01 R4.1: only a BARE positive integer is a valid build number.
  // parseInt('1.1.0', 10) returns 1 — so a dotted CFBundleVersion like "1.1.0"
  // would silently become build 1 and could be force-updated the moment
  // min_supported_ios_build rises above 1. That's the opposite of the intended
  // "a malformed build never force-updates" property. Reject anything that
  // isn't purely digits and return 0 (the refuse / fail-open value — build 0
  // never triggers a force update; see isBelowMinimumBuild). bump-version.sh
  // enforces the same `^[0-9]+$` rule at write time; this makes the guarantee
  // hold in code, not just in the script.
  if (!/^[0-9]+$/.test(raw)) {
    if (__DEV__) console.warn(`[appConfig] nativeBuildVersion "${raw}" is not a bare integer — treating as 0 (no force-update).`);
    return 0;
  }
  // Same parse on both platforms (iOS CFBundleVersion string, Android
  // versionCode string).
  return parseInt(raw, 10) || 0;
}

export async function fetchAppConfig(): Promise<AppConfigValues> {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['min_supported_ios_build', 'min_supported_android_build']);

    if (error) {
      if (__DEV__) console.warn('[appConfig] fetch failed, using defaults', error);
      return DEFAULT_CONFIG;
    }

    const config = { ...DEFAULT_CONFIG };
    for (const row of data ?? []) {
      const numeric = typeof row.value === 'number' ? row.value : Number(row.value);
      if (row.key === 'min_supported_ios_build' && !Number.isNaN(numeric)) {
        config.minSupportedIosBuild = numeric;
      } else if (row.key === 'min_supported_android_build' && !Number.isNaN(numeric)) {
        config.minSupportedAndroidBuild = numeric;
      }
    }
    return config;
  } catch (err) {
    if (__DEV__) console.warn('[appConfig] fetch threw, using defaults', err);
    return DEFAULT_CONFIG;
  }
}

/**
 * Absolute ceiling on min_supported_*_build values from the DB. Fable
 * review 🟡 sanity-cap concern: the ForceUpdateModal is undismissable,
 * so if someone typos a minimum in the app_config table (like 999999)
 * every device would be bricked with no client-side recovery — the fix
 * would have to come from a manual DB row update, and users who can't
 * open the app can't tell us it's broken. Also, getCurrentBuildNumber()
 * returns 0 on parse failure, meaning any positive minimum would brick
 * even correctly-installed apps.
 *
 * The cap is set well above the newest shipped build so legitimate
 * force-update scenarios still work — you can bump the minimum to
 * anything up to CAP without hitting the guard. But an absurd value
 * (999, 999999, etc.) will be ignored and the app will behave as if
 * no minimum was set.
 *
 * When we ship a build higher than CAP, bump this constant in the same
 * commit that ships that build. That's rare — CAP > current shipped
 * build by ~30 leaves ample runway.
 */
const MIN_SUPPORTED_BUILD_CAP = 40;

/**
 * True if the current build is below the platform's minimum supported build.
 * Never returns true for build 0 (default state — no minimum enforced).
 *
 * Guards against two failure modes (Fable review 🟡):
 * - Absurd DB value (minimum > MIN_SUPPORTED_BUILD_CAP) → ignore, do not
 *   force-update. Prevents a bad config row from bricking the entire
 *   fleet, since the ForceUpdateModal is undismissable and prod has no
 *   way to hotfix a bricked device.
 * - getCurrentBuildNumber() returned 0 (parse failure) → do not
 *   force-update. Otherwise a parse bug would kill everyone the moment
 *   any positive minimum is set.
 */
export function isBelowMinimumBuild(config: AppConfigValues): boolean {
  const currentBuild = getCurrentBuildNumber();
  const minimum = Platform.OS === 'ios' ? config.minSupportedIosBuild : config.minSupportedAndroidBuild;
  if (minimum <= 0) return false;
  if (minimum > MIN_SUPPORTED_BUILD_CAP) {
    if (__DEV__) console.warn(`[appConfig] minimum_build ${minimum} exceeds sanity cap ${MIN_SUPPORTED_BUILD_CAP} — ignoring to prevent fleet brick.`);
    return false;
  }
  if (currentBuild <= 0) {
    if (__DEV__) console.warn('[appConfig] getCurrentBuildNumber returned 0 (parse failure) — refusing to force update.');
    return false;
  }
  return currentBuild < minimum;
}
