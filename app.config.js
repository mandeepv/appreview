module.exports = ({ config }) => {
  // Bundle ID and display name are env-aware so dev + prod can coexist on the
  // same device without conflict. Defaults to prod values so `expo start`
  // without any env override still points at prod-shaped config.
  const iosBundleId = process.env.IOS_BUNDLE_ID || config.ios?.bundleIdentifier || 'com.kinderwell.app';
  const androidPackage = process.env.ANDROID_PACKAGE || config.android?.package || 'com.kinderwell.app';
  const appName = process.env.APP_DISPLAY_NAME || config.name || 'Kinderwell';

  // Supabase host used for universal / app links (must match the project the
  // dev/prod build talks to). Falls back to prod if the env var isn't set.
  const supabaseHost = (process.env.SUPABASE_URL || 'https://zqwzdyjfxytvedghujsd.supabase.co').replace('https://', '');

  return {
    ...config,
    name: appName,
    ios: {
      ...config.ios,
      bundleIdentifier: iosBundleId,
      infoPlist: {
        ...config.ios?.infoPlist,
        CFBundleURLTypes: [
          { CFBundleURLSchemes: [iosBundleId] },
        ],
      },
      associatedDomains: [`applinks:${supabaseHost}`],
    },
    android: {
      ...config.android,
      package: androidPackage,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [{ scheme: 'https', host: supabaseHost }],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    plugins: [
      ...(config.plugins ?? []),
      'expo-localization',
    ],
    extra: {
      ...config.extra,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      superwallApiKey: process.env.SUPERWALL_API_KEY,
      skipPaywall: process.env.SKIP_PAYWALL,
      showDemoButton: process.env.SHOW_DEMO_BUTTON,
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    },
  };
};
