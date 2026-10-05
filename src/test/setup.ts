// Global Jest setup (SPEC-20 R2) — runs before every test file.
//
// 1. Fakes at the SDK boundary, for every file. A test that needs a
//    different shape jest.mocks the same module itself; its factory wins.
//    The module under test is never mocked here.
// 2. The PII guard (INVARIANTS #8): after every test, scan what reached
//    PostHog and Sentry, and fail the test on an email address or the
//    fixture name. This makes "no PII to analytics" a check on every test
//    that touches analytics, not just analytics.test.ts.

import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import * as mockAnalytics from './analytics';
import * as mockSupabase from './supabase';
import * as mockSuperwall from './superwall';
import { FIXTURE_NAME } from './factories';

// Factories may reference only `mock`-prefixed bindings (jest.mock is hoisted
// above the imports). They run lazily, on the first require of the mocked
// module — after this file's imports have finished — and they share this
// test file's module registry, so a test importing src/test/* gets the very
// same fake objects the app code sees.
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
// The library's own mock: insets of zero, no <SafeAreaProvider> needed.
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('../config/posthog', () => mockAnalytics.posthogModule);
jest.mock('../config/sentry', () => mockAnalytics.sentryModule);
jest.mock('@sentry/react-native', () => mockAnalytics.sentrySdk);
jest.mock('../lib/supabase', () => mockSupabase.supabaseModule);
jest.mock('expo-superwall', () => mockSuperwall.superwallModule);

// ── PII guard ───────────────────────────────────────────────────────────────

const PII_PATTERNS: { what: string; pattern: RegExp }[] = [
  { what: 'an email address', pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i },
  { what: 'the fixture name', pattern: new RegExp(FIXTURE_NAME.split(' ')[0], 'i') },
];

const WATCHED: { label: string; module: string; object?: string; methods: string[] }[] = [
  { label: 'posthog', module: '../config/posthog', object: 'posthog', methods: ['capture', 'identify', 'register', 'screen'] },
  { label: 'sentry', module: '../config/sentry', methods: ['reportError', 'setSentryUser', 'addGateBreadcrumb'] },
  { label: 'Sentry SDK', module: '@sentry/react-native', methods: ['setUser', 'captureException', 'captureMessage', 'addBreadcrumb'] },
];

function watchedMocks(): { label: string; fn: jest.Mock }[] {
  const found: { label: string; fn: jest.Mock }[] = [];
  for (const { label, module, object, methods } of WATCHED) {
    let target: Record<string, unknown> | undefined;
    try {
      const mod = jest.requireMock(module) as Record<string, unknown>;
      target = (object ? mod?.[object] : mod) as Record<string, unknown> | undefined;
    } catch {
      continue;
    }
    for (const method of methods) {
      const fn = target?.[method];
      if (jest.isMockFunction(fn)) found.push({ label: `${label}.${method}`, fn });
    }
  }
  return found;
}

// Errors stringify to "{}" — keep their message, where PII would hide.
function describeArgs(args: unknown[]): string {
  return JSON.stringify(args, (_key, value) =>
    value instanceof Error ? `${value.name}: ${value.message}` : value,
  ) ?? '';
}

// Only calls made DURING the test are scanned, so files that never clear
// their mocks don't re-report an earlier test's calls.
let callCountsAtStart = new Map<jest.Mock, number>();

beforeEach(() => {
  callCountsAtStart = new Map(watchedMocks().map(({ fn }) => [fn, fn.mock.calls.length]));
});

afterEach(() => {
  for (const { label, fn } of watchedMocks()) {
    const atStart = callCountsAtStart.get(fn) ?? 0;
    const from = fn.mock.calls.length < atStart ? 0 : atStart; // cleared mid-test → scan all
    for (const args of fn.mock.calls.slice(from)) {
      const text = describeArgs(args);
      for (const { what, pattern } of PII_PATTERNS) {
        if (pattern.test(text)) {
          throw new Error(
            `PII guard (INVARIANTS #8): ${label} was called with ${what}: ${text}`,
          );
        }
      }
    }
  }
});
