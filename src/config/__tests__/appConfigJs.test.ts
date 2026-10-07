/**
 * @jest-environment node
 */

// SPEC-20 R6 — app.config.js's build-time guards. These run inside EAS, so
// until now the only test of them was a real build failing (or not):
//
//  - INVARIANTS #5: SKIP_PAYWALL=true never reaches a prod build.
//  - INVARIANTS #15: a prod build fails loudly on any missing env var.
//  - INVARIANTS #16: buildNumber is a bare integer and is never defaulted —
//    the kill switch compares against it.

import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.join(__dirname, '..', '..', '..');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const buildConfig = require(path.join(ROOT, 'app.config.js')) as (ctx: { config: Record<string, any> }) => Record<string, any>;
const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;

const PROD_URL = 'https://prodprojectref00000x.supabase.co';
const DEV_URL = 'https://devprojectref000000x.supabase.co';
const FULL_PROD_ENV = {
  SUPABASE_URL: PROD_URL,
  SUPABASE_ANON_KEY: 'anon-key',
  SUPERWALL_API_KEY: 'pk_superwall',
  POSTHOG_PROJECT_TOKEN: 'phc_token',
  SENTRY_DSN: 'https://dsn.example/1',
};
const ENV_KEYS = [...Object.keys(FULL_PROD_ENV), 'SKIP_PAYWALL'];

function withEnv(env: Record<string, string | undefined>, fn: () => unknown) {
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, env);
  try {
    return fn();
  } finally {
    for (const key of ENV_KEYS) delete process.env[key];
    for (const [key, value] of Object.entries(saved)) if (value !== undefined) process.env[key] = value;
  }
}

const build = (config = appJson) => buildConfig({ config });

describe('app.config.js build guards', () => {
  it('SKIP_PAYWALL=true with the prod database → the build refuses (INVARIANTS #5)', () => {
    expect(() => withEnv({ ...FULL_PROD_ENV, SKIP_PAYWALL: 'true' }, build)).toThrow(/SKIP_PAYWALL/);
  });

  it('SKIP_PAYWALL=true against dev → allowed (a dev convenience, __DEV__-gated at runtime)', () => {
    expect(() => withEnv({ SUPABASE_URL: DEV_URL, SKIP_PAYWALL: 'true' }, build)).not.toThrow();
  });

  it.each(Object.keys(FULL_PROD_ENV).filter((k) => k !== 'SUPABASE_URL'))(
    'a prod build missing %s → the build refuses, naming it (INVARIANTS #15)',
    (missing) => {
      const env = { ...FULL_PROD_ENV, [missing]: '' };
      expect(() => withEnv(env, build)).toThrow(new RegExp(missing));
    },
  );

  it('a complete prod env → builds', () => {
    const config = withEnv(FULL_PROD_ENV, build) as Record<string, any>;
    expect(config.extra.supabaseUrl).toBe(PROD_URL);
  });

  it('no ios.buildNumber → the build refuses rather than defaulting (INVARIANTS #16)', () => {
    const noBuildNumber = { ...appJson, ios: { ...appJson.ios, buildNumber: undefined } };
    expect(() => withEnv({ SUPABASE_URL: DEV_URL }, () => build(noBuildNumber))).toThrow(/buildNumber/);
  });

  it("app.json's buildNumber is a bare integer (INVARIANTS #16)", () => {
    expect(appJson.ios.buildNumber).toMatch(/^\d+$/);
  });
});

// SPEC-21: the purchase handoff's links must open the app. The custom scheme
// was never registered before — app.json's `scheme` is replaced by the
// explicit CFBundleURLTypes list, so the native build had only the bundle ID
// — and the simulator flows' kinderwell://k/<key> would have done nothing.
describe('the purchase handoff can open the app', () => {
  const prod = () => withEnv(FULL_PROD_ENV, build) as Record<string, any>;

  it('registers the kinderwell:// scheme (kinderwell://k/<key>, the simulator flows)', () => {
    const schemes = prod().ios.infoPlist.CFBundleURLTypes.flatMap(
      (type: { CFBundleURLSchemes: string[] }) => type.CFBundleURLSchemes,
    );
    expect(schemes).toEqual(expect.arrayContaining(['kinderwell', 'com.kinderwell.app']));
  });

  // Both domains: a universal link tapped on its own domain opens Safari, so
  // each domain's pages link to the other one.
  it('claims open.kinderwell.app AND kinderwell.app for universal links, alongside the Supabase host', () => {
    expect(prod().ios.associatedDomains).toEqual([
      'applinks:prodprojectref00000x.supabase.co',
      'applinks:open.kinderwell.app',
      'applinks:kinderwell.app',
    ]);
  });
});
