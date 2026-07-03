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
  if (Platform.OS === 'ios') {
    // nativeBuildVersion is a string on iOS (CFBundleVersion).
    return parseInt(raw, 10) || 0;
  }
  // On Android it's still a string that wraps versionCode.
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
 * True if the current build is below the platform's minimum supported build.
 * Never returns true for build 0 (default state — no minimum enforced).
 */
export function isBelowMinimumBuild(config: AppConfigValues): boolean {
  const currentBuild = getCurrentBuildNumber();
  const minimum = Platform.OS === 'ios' ? config.minSupportedIosBuild : config.minSupportedAndroidBuild;
  if (minimum <= 0) return false;
  return currentBuild < minimum;
}
