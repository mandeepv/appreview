// SPEC-17 R3 — OptionList interaction logic.
//
// The OptionList component pulls native deps (expo-haptics, AccessibilityInfo),
// so we test its decision logic where it lives as pure functions:
//  - single-select must advance exactly once even on a rapid double-tap (guard);
//  - multi-select "Continue may show / advance" validity is >=1 item;
//  - the answer-before-advance ordering is asserted via a small simulation of
//    what the component does on tap.

import {
  AUTO_ADVANCE_DELAY_MS,
  isMultiSelectValid,
  claimSingleAdvance,
} from '../optionListLogic';

describe('claimSingleAdvance — double-advance guard', () => {
  it('returns true the first time and false thereafter (single fire)', () => {
    const guard = { advanced: false };
    expect(claimSingleAdvance(guard)).toBe(true);
    expect(claimSingleAdvance(guard)).toBe(false);
    expect(claimSingleAdvance(guard)).toBe(false);
  });

  it('a fresh guard (next screen mount) advances again', () => {
    expect(claimSingleAdvance({ advanced: false })).toBe(true);
  });
});

describe('isMultiSelectValid', () => {
  it('is false with no selection', () => {
    expect(isMultiSelectValid([])).toBe(false);
  });

  it('is true with one or more selected', () => {
    expect(isMultiSelectValid(['a'])).toBe(true);
    expect(isMultiSelectValid(['a', 'b'])).toBe(true);
  });
});

describe('single-select tap ordering (answer written before advance)', () => {
  // Mirrors OptionList.handleSingleTap: claim the guard → write answer → advance.
  // Asserts the answer is in the store BEFORE onAdvance sees it, and that a
  // double-tap advances exactly once.
  it('writes the answer, then advances once with the tapped value', () => {
    const guard = { advanced: false };
    const events: string[] = [];
    let stored: string | null = null;

    const tap = (value: string) => {
      if (!claimSingleAdvance(guard)) return;
      stored = value; // onSelect
      events.push(`select:${value}`);
      // advance runs after a delay in the component; here we call it inline and
      // assert the store already holds the value.
      expect(stored).toBe(value);
      events.push(`advance:${value}`);
    };

    tap('mother');
    tap('mother'); // rapid double-tap → no-op

    expect(events).toEqual(['select:mother', 'advance:mother']);
    expect(stored).toBe('mother');
  });
});

describe('auto-advance delay', () => {
  it('is 350ms (DECISION 2, tuned on device — long enough to see the selection confirm)', () => {
    expect(AUTO_ADVANCE_DELAY_MS).toBe(350);
  });
});
