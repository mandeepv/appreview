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
