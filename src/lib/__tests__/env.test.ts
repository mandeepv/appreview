import { resolveEnv } from '../env';

// Pure ref → env mapping. The real project refs are the source of truth in
// env.ts; we assert the three outcomes the spec requires.
const PROD_REF = 'zqwzdyjfxytvedghujsd';
const DEV_REF = 'xbkkjqvbsnroenqlqkmi';

describe('resolveEnv', () => {
  it('dev ref → dev', () => {
    expect(resolveEnv(DEV_REF)).toBe('dev');
  });

  it('prod ref → prod', () => {
    expect(resolveEnv(PROD_REF)).toBe('prod');
  });

  it('unknown ref → unknown (not a throw)', () => {
    expect(resolveEnv('some-other-ref')).toBe('unknown');
  });

  it('undefined ref → unknown (not a throw)', () => {
    // Guards the "misconfigured / missing env" path — must collapse to
    // 'unknown', never throw.
    expect(() => resolveEnv(undefined)).not.toThrow();
    expect(resolveEnv(undefined)).toBe('unknown');
  });

  it('empty string → unknown', () => {
    expect(resolveEnv('')).toBe('unknown');
  });
});
