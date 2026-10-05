import * as fs from 'fs';
import * as path from 'path';

// DevMenu jumps straight to Root — a developer shortcut past onboarding AND
// the paywall. That is safe only because the screen is registered under
// __DEV__, so it does not exist in a store build; eslint.config.js exempts
// DevMenuScreen from the Root rule (INVARIANTS #1) on exactly that basis
// (SPEC-20 R1). If a refactor drops the guard, every store build ships a
// paywall bypass — this is what should fail.

const navigator = fs.readFileSync(
  path.join(__dirname, '..', 'OnboardingNavigator.tsx'),
  'utf8',
);

describe('DevMenu exists only in development builds', () => {
  it('is registered exactly once, inside a __DEV__ guard', () => {
    expect(navigator.match(/<Stack\.Screen[^>]*name="DevMenu"/g) ?? []).toHaveLength(1);
    expect(navigator).toMatch(/\{__DEV__ && <Stack\.Screen name="DevMenu"/);
  });

  it('every other code reference to DevMenu is __DEV__-gated', () => {
    const codeLines = navigator
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => /DevMenu/.test(line))
      .filter((line) => !line.startsWith('//') && !line.startsWith('import '));
    expect(codeLines.length).toBeGreaterThan(0);
    for (const line of codeLines) {
      expect(line).toContain('__DEV__');
    }
  });
});
