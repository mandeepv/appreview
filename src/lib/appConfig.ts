import { Platform } from 'react-native';
import Constants from 'expo-constants';
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
 * Reads the current build number for the running app.
 * On iOS this comes from Info.plist CFBundleVersion (as a string, we parse it).
 * On Android from versionCode (already a number).
 */
export function getCurrentBuildNumber(): number {
  if (Platform.OS === 'ios') {
    const raw = Constants.expoConfig?.ios?.buildNumber ?? '0';
    return parseInt(raw, 10) || 0;
  }
  return Constants.expoConfig?.android?.versionCode ?? 0;
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
