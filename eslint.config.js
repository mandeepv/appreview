// ESLint flat config (ESLint 9+). Extends Expo's recommended config
// which bundles the React / React-Native / TypeScript rules Expo apps
// typically want. Kept intentionally minimal — the goal for now is to
// catch common bugs in CI, not to enforce style opinions. Rules can be
// tightened later once the lint job has proven quiet.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: [
      'node_modules/',
      'dist/',
      '.expo/',
      'ios/',
      'android/',
      'coverage/',
      'scripts/',
      // Supabase Edge Functions run on Deno with a different runtime;
      // their imports (e.g. `from "https://..."`) confuse Node-oriented
      // resolvers. Lint them separately once we take on a Deno lint job.
      'supabase/functions/',
    ],
  },
  {
    // Non-TS-specific overrides applied across all files.
    // The lesson-refactor (v1.2, tracked in BACKLOG.md) will clear most
    // of the warnings still surfaced below.
    rules: {
      // Pure JSX-text style noise (curly quote / apostrophe escaping).
      // Off by design — we ship literal user-facing copy in JSX.
      'react/no-unescaped-entities': 'off',
      // react-hooks/refs flags `useRef(new Animated.Value(x)).current`
      // pattern used across ~40 lesson screens. Real smell, mass fix
      // belongs in the lesson refactor.
      'react-hooks/refs': 'warn',
      // Mostly intentional stale-closure patterns in animation effects;
      // each needs a case-by-case look, not a mass rewrite.
      'react-hooks/exhaustive-deps': 'warn',
      // Legacy import ordering, cosmetic.
      'import/first': 'warn',
    },
  },
  {
    // TS-plugin rules must be scoped to files where the plugin is
    // registered (the Expo config scopes `@typescript-eslint` to
    // .ts/.tsx via a `files` filter).
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Downgraded — the noise is mostly destructured-but-unused
      // callback args in duplicated lesson screens.
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
