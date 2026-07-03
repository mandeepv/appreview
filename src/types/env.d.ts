// Type augmentation for expo-constants so `Constants.expoConfig.extra` is typed
// with our project-specific keys. Keep in sync with `app.config.js`.
import 'expo-constants';

declare module 'expo-constants' {
  interface ExpoConfig {
    extra?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      superwallApiKey?: string;
      skipPaywall?: string;
      posthogProjectToken?: string;
      posthogHost?: string;
      eas?: {
        projectId?: string;
      };
    };
    ios?: {
      bundleIdentifier?: string;
      buildNumber?: string;
      [key: string]: unknown;
    };
    android?: {
      package?: string;
      versionCode?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }
}
