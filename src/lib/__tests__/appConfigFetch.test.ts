// SPEC-20 R6 / INVARIANTS #18 — fetchAppConfig always fails OPEN: a missing
// table, a bad row or a network error yields the defaults (no minimum), never
// a block. appConfig.test.ts covers the build comparison with the client
// stubbed out; this covers the read, against the global Supabase fake.

import { fetchAppConfig } from '../appConfig';
import { queryLog, resetSupabaseFake, setTableResult } from '../../test/supabase';

const DEFAULTS = { minSupportedIosBuild: 0, minSupportedAndroidBuild: 0 };

beforeEach(() => resetSupabaseFake());

describe('fetchAppConfig', () => {
  it('reads both minimums from app_config', async () => {
    setTableResult('app_config', {
      data: [
        { key: 'min_supported_ios_build', value: 12 },
        { key: 'min_supported_android_build', value: 3 },
      ],
      error: null,
    });
    await expect(fetchAppConfig()).resolves.toEqual({ minSupportedIosBuild: 12, minSupportedAndroidBuild: 3 });
    expect(queryLog).toContainEqual({
      table: 'app_config',
      op: 'in',
      args: ['key', ['min_supported_ios_build', 'min_supported_android_build']],
    });
  });

  it('a jsonb value stored as a string still parses', async () => {
    setTableResult('app_config', { data: [{ key: 'min_supported_ios_build', value: '11' }], error: null });
    await expect(fetchAppConfig()).resolves.toEqual({ ...DEFAULTS, minSupportedIosBuild: 11 });
  });

  it('a non-numeric value is ignored, not treated as a minimum', async () => {
    setTableResult('app_config', { data: [{ key: 'min_supported_ios_build', value: 'soon' }], error: null });
    await expect(fetchAppConfig()).resolves.toEqual(DEFAULTS);
  });

  it('a query error (e.g. the table is missing) → defaults', async () => {
    setTableResult('app_config', { data: null, error: { message: 'relation does not exist' } });
    await expect(fetchAppConfig()).resolves.toEqual(DEFAULTS);
  });

  it('a thrown error → defaults, never a rejection', async () => {
    setTableResult('app_config', () => {
      throw new Error('network down');
    });
    await expect(fetchAppConfig()).resolves.toEqual(DEFAULTS);
  });
});
