// ESLint flat config (ESLint 9+). Extends Expo's recommended config
// which bundles the React / React-Native / TypeScript rules Expo apps
// typically want. Kept intentionally minimal — the goal for now is to
// catch common bugs in CI, not to enforce style opinions. Rules can be
// tightened later once the lint job has proven quiet.
const expoConfig = require('eslint-config-expo/flat');

// Selectors for the invariant rules at the bottom of this file (SPEC-20 R1).
const ROOT_MESSAGE =
  'Only LoadingScreen may enter Root — every path in goes through the paywall gate (INVARIANTS #1).';
const ROOT_ENTRY = [
  {
    selector: "CallExpression[callee.property.name=/^(replace|navigate|push)$/][arguments.0.value='Root']",
    message: ROOT_MESSAGE,
  },
  {
    selector: "CallExpression[callee.property.name='reset'] Property[key.name='name'][value.value='Root']",
    message: ROOT_MESSAGE,
  },
];
const RAW_CAPTURE = [
  {
    selector: "CallExpression[callee.object.name='posthog'][callee.property.name='capture']",
    message: 'Send events through safeCapture (src/lib/analytics.ts), never a raw posthog.capture.',
  },
];
const STORAGE_MESSAGE =
  'AsyncStorage keys come from STORAGE_KEYS (src/constants/storageKeys.ts); a shipped key is never renamed without a migration (INVARIANTS #10).';
const LITERAL_STORAGE_KEYS = [
  {
    selector:
      "CallExpression[callee.object.name='AsyncStorage'][callee.property.name=/^(getItem|setItem|removeItem|mergeItem)$/][arguments.0.type=/^(Literal|TemplateLiteral)$/]",
    message: STORAGE_MESSAGE,
  },
  {
    selector:
      "CallExpression[callee.object.name='AsyncStorage'][callee.property.name=/^(multiGet|multiRemove)$/] > ArrayExpression > :matches(Literal, TemplateLiteral)",
    message: STORAGE_MESSAGE,
  },
];
const ENTITLEMENT_WRITES = [
  {
    selector:
      "CallExpression[callee.property.name=/^(insert|update|upsert|delete)$/][callee.object.callee.property.name='from'][callee.object.arguments.0.value='entitlements']",
    message:
      'The app never writes entitlements — only the Dodo webhook does, with the service role (INVARIANTS #24).',
  },
];

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
      // Frozen snapshots, not maintained code (CLAUDE.md: "Do not follow them;
      // do not 'fix' code to match them"). The archived 2026-08 app-transfer
      // scripts are Node CLI tools, so they trip no-undef on __dirname and the
      // expo env-var rule — 13 errors that turned the blocking CI lint gate red
      // on a branch that never touched them.
      'docs/archive/',
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
  // ── Invariants as lint errors (SPEC-20 R1) ─────────────────────────────
  // These used to live only in reviewers' memory ("grep for it in review").
  // They are ERRORS, so CI fails on them regardless of the warning baseline.
  // ESLint applies only the LAST matching config's options for a rule, so
  // each exempt file below re-lists every selector except the one it's
  // exempt from — add a new selector to every list it belongs in.
  {
    files: ['src/**/*.{ts,tsx}', 'App.tsx'],
    ignores: ['**/__tests__/**', 'src/test/**'],
    rules: {
      'no-restricted-syntax': ['error', ...ROOT_ENTRY, ...RAW_CAPTURE, ...LITERAL_STORAGE_KEYS, ...ENTITLEMENT_WRITES],
    },
  },
  {
    // The gate itself is the one legitimate way into Root. DevMenu jumps
    // straight to Root too, but it is registered only under __DEV__
    // (OnboardingNavigator), so it does not exist in a store build —
    // devMenuGuard.test fails if that registration ever loses its guard.
    files: ['src/screens/onboarding/LoadingScreen.tsx', 'src/screens/DevMenuScreen.tsx'],
    rules: {
      'no-restricted-syntax': ['error', ...RAW_CAPTURE, ...LITERAL_STORAGE_KEYS, ...ENTITLEMENT_WRITES],
    },
  },
  {
    // safeCapture's home — the one place a raw capture belongs.
    files: ['src/lib/analytics.ts'],
    rules: {
      'no-restricted-syntax': ['error', ...ROOT_ENTRY, ...LITERAL_STORAGE_KEYS, ...ENTITLEMENT_WRITES],
    },
  },
  {
    // UI layers never touch the database client; data access goes through
    // src/services/ (CLAUDE.md conventions).
    files: [
      'src/screens/**/*.{ts,tsx}',
      'src/components/**/*.{ts,tsx}',
      'src/lessons/**/*.{ts,tsx}',
      'src/navigation/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
    ],
    ignores: ['**/__tests__/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/lib/supabase', '@/lib/supabase'],
          message: 'Screens and UI never import the Supabase client — go through src/services/.',
        }],
      }],
    },
  },
];
