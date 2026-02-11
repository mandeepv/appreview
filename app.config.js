module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      superwallApiKey: process.env.SUPERWALL_API_KEY,
      skipPaywall: process.env.SKIP_PAYWALL,
      showDemoButton: process.env.SHOW_DEMO_BUTTON,
    },
  };
};
