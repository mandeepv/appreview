// Type definitions for expo-constants extra configuration
declare module 'expo-constants' {
  export interface AppConfig {
    extra?: {
      supabaseUrl?: string;
      supabaseAnonKey?: string;
      superwallApiKey?: string;
      skipPaywall?: string;
      showDemoButton?: string;
      eas?: {
        projectId?: string;
      };
    };
  }
}
