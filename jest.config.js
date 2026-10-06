// Jest config.
//
// Scope history: SPEC-04 started this suite as pure decision-function tests
// only (no component rendering). That is why the kernels were well tested and
// the screens, stores and services that call them were not — and the seams
// are where this app's bugs have actually been. SPEC-20 widens it: stores,
// services and screens are tested too, screens via React Native Testing
// Library. Still no snapshots — concrete assertions only.
//
// The jest-expo preset provides the RN/Expo transform and native-module
// mocks. src/test/setup.ts adds fakes at the SDK boundary (AsyncStorage,
// PostHog, Sentry, the Supabase client, Superwall) for every file, plus a
// PII guard that scans analytics after every test. A test that needs a
// different shape jest.mocks the module itself; we never mock the module
// under test.

module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/test/'],
  // Coverage is measured over all app code, not just files a test happens to
  // import — an untested new file counts against the floor.
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**', '!src/test/**', '!src/types/**'],
  // Floors, by risk tier (SPEC-20 R11), enforced by `npm test -- --coverage`
  // in CI. Each is the coverage measured when it was set, rounded down to the
  // nearest 5: a ratchet. Raise a floor when coverage rises; a PR that LOWERS
  // one says why in its description.
  //
  // Tier A (money, auth, data) has per-file floors. Branch figures look low
  // because every `if (__DEV__) console.log(...)` is a branch whose false side
  // can never run under Jest; the trailing comments give each file's branch
  // coverage with those excluded, which SPEC-20 holds at 80% or more.
  // Tier B is the global floor: Jest applies it to every file NOT listed by
  // path. Tier C (presentational components, content) needs no floor of its
  // own; everyScreenRenders.test mounts every screen.
  coverageThreshold: {
    global: { statements: 55, branches: 35, functions: 40, lines: 55 },
    './src/navigation/routingPolicy.ts':             { statements: 100, branches: 100, functions: 100, lines: 100 }, // 100% excl. __DEV__
    './src/store/entitlementCache.ts':               { statements: 100, branches: 100, functions: 100, lines: 100 }, // 100%
    './src/store/webEntitlement.ts':                 { statements: 100, branches: 100, functions: 100, lines: 100 }, // 100%
    './src/services/entitlementService.ts':          { statements: 100, branches: 75, functions: 100, lines: 100 }, // 86.7%
    './src/store/authStore.ts':                      { statements: 85, branches: 60, functions: 75, lines: 90 }, // 82.1%
    './src/store/configStore.ts':                    { statements: 100, branches: 70, functions: 100, lines: 100 }, // 92.0%
    './src/lib/appConfig.ts':                        { statements: 100, branches: 75, functions: 100, lines: 100 }, // 90.9%
    './src/services/purchaseService.ts':             { statements: 100, branches: 80, functions: 100, lines: 100 }, // 100%
    './src/services/authService.ts':                 { statements: 90, branches: 65, functions: 100, lines: 90 }, // 82.6%
    './src/services/onboardingService.ts':           { statements: 100, branches: 75, functions: 100, lines: 100 }, // 95.5%
    './src/services/lessonProgressService.ts':       { statements: 85, branches: 70, functions: 100, lines: 90 }, // 81.5%
    './src/lessons/progressStore.ts':                { statements: 95, branches: 80, functions: 100, lines: 95 }, // 94.6%
    './src/lessons/units.ts':                        { statements: 95, branches: 90, functions: 100, lines: 100 }, // 90.0%
    './src/screens/onboarding/LoadingScreen.tsx':    { statements: 95, branches: 70, functions: 95, lines: 95 }, // 86.3%
    './src/screens/onboarding/SplashScreen.tsx':     { statements: 95, branches: 75, functions: 100, lines: 95 }, // 94.7%
    './src/screens/onboarding/AuthScreen.tsx':       { statements: 85, branches: 75, functions: 75, lines: 90 }, // 82.5%
  },
  moduleNameMapper: {
    // expo-superwall's package.json `exports` map declares only an `import`
    // condition. Metro copes; Jest's require-based resolver finds nothing and
    // fails. Point the bare name at its `main` file. setup.ts mocks it anyway.
    '^expo-superwall$': '<rootDir>/node_modules/expo-superwall/build/src/index.js',
  },
  // These transitively pull in RN/Expo ESM that must be transformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg|posthog-react-native|@testing-library/.*))',
  ],
};
