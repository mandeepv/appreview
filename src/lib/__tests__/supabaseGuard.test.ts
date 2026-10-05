// SPEC-20 R6 / INVARIANTS #17 — a __DEV__ build never talks to the prod
// database. lib/supabase.ts throws at import if the baked-in URL is prod's;
// the usual way to hit it is a `.env` overwritten with prod values.
//
// setup.ts replaces lib/supabase with a fake for every test, so these load
// the REAL module in isolation, with expo-constants serving a chosen URL.
// (__DEV__ is true under Jest, as in a development build.)

const PROD_URL = 'https://prodprojectref00000x.supabase.co';
const DEV_URL = 'https://devprojectref000000x.supabase.co';

function loadRealClientWith(extra: Record<string, unknown>) {
  let loaded: unknown;
  jest.isolateModules(() => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      default: { expoConfig: { extra, ios: { bundleIdentifier: 'com.kinderwell.test' } } },
    }));
    loaded = jest.requireActual('../supabase');
  });
  return loaded;
}

describe('lib/supabase import-time guards', () => {
  it('a development build pointed at PROD refuses to start', () => {
    expect(() => loadRealClientWith({ supabaseUrl: PROD_URL, supabaseAnonKey: 'anon' })).toThrow(
      /REFUSING to connect to PROD from a __DEV__ build/,
    );
  });

  it('a development build pointed at dev starts normally', () => {
    const mod = loadRealClientWith({ supabaseUrl: DEV_URL, supabaseAnonKey: 'anon' }) as {
      supabase: unknown;
    };
    expect(mod.supabase).toBeDefined();
  });

  it('missing URL or key → a loud configuration error', () => {
    expect(() => loadRealClientWith({ supabaseUrl: DEV_URL })).toThrow(/Missing Supabase configuration/);
  });
});
