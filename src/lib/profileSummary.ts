/**
 * The identity line on the You screen: "Mom to two children".
 *
 * Pure functions, no React and no network, so the phrasing rules are testable
 * without a simulator. The caller fetches the profile; this only formats it.
 *
 * WHAT THIS DELIBERATELY DOES NOT SAY
 *
 * Children's AGES. Onboarding stores age BANDS ('2-4', '5-7'), and assigns the
 * selected bands across the children cyclically — so band-to-child mapping is
 * approximate by construction. "a 4- and 7-year-old" is not derivable from it,
 * and printing a specific age we do not have would be a small lie in the one
 * place the app claims to know the family.
 *
 * The ROLE, when the user picked "Other / Guardian". They chose that option
 * precisely because they are not the mother or father — grandparent, step-parent,
 * foster carer. Calling them "Parent" overrides what they told us. They get the
 * count without a role instead: silence beats a wrong label.
 *
 * The NAME, when it is the literal 'Parent'. NameAgeScreen writes that as its
 * blank-field default (see onboardingService's note on the Apple-name clobber),
 * so it is a placeholder, not something anyone typed. Greeting someone as
 * "Parent" reads like a broken mail-merge.
 */

/** What the You screen needs from a fetched profile. Loosely typed on purpose:
 *  this is the shape of a Supabase row, which is nullable throughout. */
export interface ProfileSummaryInput {
  name?: string | null;
  userType?: string | null;
  childrenCount?: number | null;
}

/** Counts read as words at this size; digits look like form data. */
const COUNT_WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
] as const;

/** US spelling — the app ships on the US App Store. */
const ROLE_WORDS: Record<string, string> = {
  mother: 'Mom',
  father: 'Dad',
};

/**
 * The display name, or null when there isn't a real one.
 *
 * Null means "render no name line" — never a fallback string. See the note on
 * 'Parent' above.
 */
export function displayName(input: ProfileSummaryInput): string | null {
  const name = input.name?.trim();
  if (!name) return null;
  if (name.toLowerCase() === 'parent') return null;
  return name;
}

/**
 * The family line, or null when there isn't enough to say anything true.
 *
 *   mother + 2  ->  "Mom to two children"
 *   father + 1  ->  "Dad to one child"
 *   other  + 2  ->  "Two children"        (no role — see above)
 *   count 0 / missing -> null
 */
export function familyLine(input: ProfileSummaryInput): string | null {
  const count = input.childrenCount;
  if (typeof count !== 'number' || !Number.isFinite(count) || count < 1) return null;

  // Above the word list, fall back to digits rather than dropping the line —
  // a real family this size should still see itself.
  const countWord = COUNT_WORDS[count] ?? String(count);
  const noun = count === 1 ? 'child' : 'children';
  const role = input.userType ? ROLE_WORDS[input.userType] : undefined;

  if (!role) {
    // No role we can state honestly: lead with the count, sentence-cased.
    return `${countWord.charAt(0).toUpperCase()}${countWord.slice(1)} ${noun}`;
  }
  return `${role} to ${countWord} ${noun}`;
}

/**
 * Whether the personal header has anything worth rendering.
 *
 * Both lines absent means the block is skipped entirely rather than drawn
 * empty — which is also what a failed profile fetch looks like, deliberately:
 * one code path, no error state to design.
 */
export function hasIdentity(input: ProfileSummaryInput): boolean {
  return displayName(input) !== null || familyLine(input) !== null;
}
