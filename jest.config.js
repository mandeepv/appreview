// Jest config for the SPEC-04 policy-kernel tests.
//
// Scope (deliberately narrow, per spec): pure decision-function tests only.
// No testing-library, no snapshots, no component rendering, no simulator. The
// jest-expo preset is used because our source imports RN/Expo modules
// (expo-constants, react-native) transitively; the preset provides the
// transform + module mocks that let those import under Node without a
// simulator.
//
// Mock boundary rule: individual tests mock `src/lib/supabase` and
// `posthog-react-native` at module level where the function under test imports
// them (via jest.mock in the test file). We never mock the function under
// test itself. Nothing global here forces those mocks — that keeps each test
// honest about what it stubs.

module.exports = {
  preset: 'jest-expo',
  // Only run the policy-kernel test files we own. Keeps the suite fast
  // (<30s) and prevents jest-expo from trying to sweep unrelated dirs.
  testMatch: ['**/__tests__/**/*.test.ts'],
  // These transitively pull in RN/Expo ESM that must be transformed.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg|posthog-react-native))',
  ],
};
