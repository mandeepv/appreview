/**
 * SPEC-17 — pure interaction logic for OptionList, extracted so R3 can test the
 * single-select auto-advance guard and the multi-select validity rule without a
 * component renderer (the repo has no react-testing-library; tests are pure).
 */

export const AUTO_ADVANCE_DELAY_MS = 250; // DECISION 2 — tune on device.

/** Multi-select is valid (Continue may show / advance may proceed) at ≥1 item. */
export function isMultiSelectValid(selected: readonly string[]): boolean {
  return selected.length >= 1;
}

/**
 * Single-select double-advance guard. The screen holds a mutable "advanced"
 * ref; a rapid double-tap must fire the advance exactly once. Returns true the
 * first time only, and flips the ref so subsequent calls no-op until reset (i.e.
 * until the next screen mounts fresh with its own ref).
 *
 * Kept pure (ref passed in) so the guard is unit-testable in isolation.
 */
export function claimSingleAdvance(guard: { advanced: boolean }): boolean {
  if (guard.advanced) return false;
  guard.advanced = true;
  return true;
}
