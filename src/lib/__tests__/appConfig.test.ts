// Control the running build number by mocking expo-application's
// nativeBuildVersion. Platform.OS is forced to 'ios' so the ios branch of
// getCurrentBuildNumber / isBelowMinimumBuild is exercised. We do NOT mock
// appConfig.ts (the module under test).

import * as fs from 'fs';
import * as path from 'path';

const appMock = { nativeBuildVersion: '10' as string | null };

// Expose nativeBuildVersion via a GETTER so `Application.nativeBuildVersion`
// re-reads the current value on every access. A plain property gets snapshot
// at first import under jest's `import *` interop, which silently made the
// per-test `appMock.nativeBuildVersion = ...` mutations invisible to the module
// under test (older assertions passed vacuously against the initial '10').
// SPEC-FIX-01 R4.1.
jest.mock('expo-application', () => ({
  get nativeBuildVersion() {
    return appMock.nativeBuildVersion;
  },
}));

// appConfig.ts imports the supabase client (for fetchAppConfig, which we don't
// test here). Stub it so we don't drag in AsyncStorage / native modules.
jest.mock('../supabase', () => ({ supabase: {} }));

// Force Platform.OS = 'ios' without replacing the rest of react-native.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

import { isBelowMinimumBuild } from '../appConfig';

// isBelowMinimumBuild takes the fetched config; the "config value" cases are
// just different arg shapes. minSupportedAndroidBuild is irrelevant on iOS.
const cfg = (iosMin: number) => ({ minSupportedIosBuild: iosMin, minSupportedAndroidBuild: 0 });

describe('isBelowMinimumBuild', () => {
  beforeEach(() => {
    appMock.nativeBuildVersion = '10'; // current build = 10 unless a test overrides
  });

  it('current below minimum → true (force update)', () => {
    appMock.nativeBuildVersion = '10';
    expect(isBelowMinimumBuild(cfg(12))).toBe(true);
  });

  it('current above minimum → false', () => {
    appMock.nativeBuildVersion = '10';
    expect(isBelowMinimumBuild(cfg(8))).toBe(false);
  });

  it('current equal to minimum → false', () => {
    appMock.nativeBuildVersion = '10';
    expect(isBelowMinimumBuild(cfg(10))).toBe(false);
  });

  it('minimum > MIN_SUPPORTED_BUILD_CAP (40) → ignored (false), never bricks fleet', () => {
    appMock.nativeBuildVersion = '10';
    expect(isBelowMinimumBuild(cfg(41))).toBe(false);
    expect(isBelowMinimumBuild(cfg(999999))).toBe(false);
  });

  it('minimum <= 0 → ignored (false, no minimum enforced)', () => {
    appMock.nativeBuildVersion = '10';
    expect(isBelowMinimumBuild(cfg(0))).toBe(false);
    expect(isBelowMinimumBuild(cfg(-5))).toBe(false);
  });

  it('dotted build ("1.1.0") does NOT force-update against a real minimum (SPEC-FIX-01 R4.1)', () => {
    // The case that ACTUALLY fails without the R4.1 fix: a minimum in the
    // sane 2–40 range. Old code: parseInt('1.1.0') === 1, and 1 < 39 → would
    // force-update (wrong — a malformed build string shouldn't be treated as a
    // low integer). Fixed code: getCurrentBuildNumber rejects the non-integer
    // and returns 0, so isBelowMinimumBuild refuses (build 0 never
    // force-updates). This is the meaningful assertion — the previous version
    // used minimum 1, where 1 < 1 is false anyway, so it passed even WITH the
    // bug (vacuous).
    appMock.nativeBuildVersion = '1.1.0';
    expect(isBelowMinimumBuild(cfg(39))).toBe(false);
  });

  it('current build parses to 0 (parse failure) → refuses to force-update', () => {
    appMock.nativeBuildVersion = 'abc'; // parseInt → NaN → 0
    expect(isBelowMinimumBuild(cfg(5))).toBe(false);
  });

  it('null nativeBuildVersion → 0 → refuses to force-update', () => {
    appMock.nativeBuildVersion = null;
    expect(isBelowMinimumBuild(cfg(5))).toBe(false);
  });

  // SPEC-20 R6. MIN_SUPPORTED_BUILD_CAP (40) protects against a typo'd
  // minimum bricking the fleet — but it also means that once the SHIPPING
  // build nears the cap, no minimum can force anyone off it: the kill switch
  // goes dead silently, with no error anywhere. At build 12 there's room; at
  // a weekly release cadence there won't be within a year. This fails while
  // there are still 5 builds of headroom — raise the cap then (and the
  // RELEASE_CHECKLIST kill-switch test value with it).
  it('the shipping build (app.json) still has headroom under the cap', () => {
    const appJson = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', '..', 'app.json'), 'utf8'),
    );
    const shipping = Number(appJson.expo.ios.buildNumber);
    appMock.nativeBuildVersion = String(shipping);
    expect(isBelowMinimumBuild(cfg(shipping + 5))).toBe(true);
  });
});
